import { Capacitor } from '@capacitor/core'
import {
  AdMob,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  type AdMobPlugin,
  type AdMobRewardItem
} from '@capacitor-community/admob'
import type { InterstitialAdGateway } from './interstitialAds'
import type { UndoRewardAdGateway } from './undoRewardAd'
import { getAdMobConfig, hasRequiredAdMobConfig, type AdMobConfig } from './adMobConfig'

type ListenerHandle = { remove: () => Promise<void> }
type AdMobClient = Pick<AdMobPlugin, 'initialize' | 'trackingAuthorizationStatus' | 'requestTrackingAuthorization' | 'requestConsentInfo' | 'showConsentForm' | 'showPrivacyOptionsForm' | 'prepareInterstitial' | 'showInterstitial' | 'prepareRewardVideoAd' | 'showRewardVideoAd' | 'addListener'>

export interface NativeAdMobGateways {
  initialize: () => Promise<boolean>
  showPrivacyOptions: () => Promise<boolean>
  interstitial: InterstitialAdGateway
  rewarded: UndoRewardAdGateway
}

interface NativeAdMobDependencies {
  client: AdMobClient
  platform: string
  config: AdMobConfig
}

const removeListeners = async (handles: ListenerHandle[]): Promise<void> => {
  await Promise.all(handles.map((handle) => handle.remove().catch(() => undefined)))
}

const getFulfilledHandles = (results: PromiseSettledResult<ListenerHandle>[]): ListenerHandle[] => results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])

const settleWithin = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T | undefined> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<undefined>((resolve) => {
    timeoutId = setTimeout(() => resolve(undefined), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

class NativeAdMobProvider {
  private initializePromise?: Promise<boolean>

  constructor(private readonly dependencies: NativeAdMobDependencies) {}

  ensureReady(): Promise<boolean> {
    if (!this.initializePromise) {
      const initialization = this.initialize()
      this.initializePromise = initialization.then((ready) => {
        if (!ready) this.initializePromise = undefined
        return ready
      })
    }
    return this.initializePromise
  }

  private async initialize(): Promise<boolean> {
    try {
      const { client, config, platform } = this.dependencies
      await client.initialize({ initializeForTesting: config.isTesting })

      if (platform === 'ios') {
        const tracking = await client.trackingAuthorizationStatus()
        if (tracking.status === 'notDetermined') await client.requestTrackingAuthorization()
      }

      let consent = await client.requestConsentInfo()
      if (!consent.canRequestAds && consent.isConsentFormAvailable) consent = await client.showConsentForm()
      return consent.canRequestAds
    } catch {
      return false
    }
  }

  async showPrivacyOptions(): Promise<boolean> {
    if (!await this.ensureReady()) return false

    try {
      await this.dependencies.client.showPrivacyOptionsForm()
      return true
    } catch {
      return false
    }
  }

  async showInterstitial(): Promise<{ shown: boolean }> {
    if (!await this.ensureReady()) return { shown: false }

    const { client, config } = this.dependencies
    try {
      await client.prepareInterstitial({ adId: config.interstitialAdId, isTesting: config.isTesting })
    } catch {
      return { shown: false }
    }

    let resolveCompletion: (shown: boolean) => void = () => undefined
    const completion = new Promise<boolean>((resolve) => { resolveCompletion = resolve })
    const listeners = await Promise.allSettled([
      client.addListener(InterstitialAdPluginEvents.Dismissed, () => resolveCompletion(true)),
      client.addListener(InterstitialAdPluginEvents.FailedToShow, () => resolveCompletion(false))
    ])
    const handles = getFulfilledHandles(listeners)
    if (listeners.some((result) => result.status === 'rejected')) {
      await removeListeners(handles)
      return { shown: false }
    }

    try {
      await client.showInterstitial()
      return { shown: await completion }
    } catch {
      return { shown: false }
    } finally {
      await removeListeners(handles)
    }
  }

  async showRewarded(): Promise<{ completed: boolean }> {
    if (!await this.ensureReady()) return { completed: false }

    const { client, config } = this.dependencies
    try {
      await client.prepareRewardVideoAd({ adId: config.rewardedAdId, isTesting: config.isTesting })
    } catch {
      return { completed: false }
    }

    let resolveCompletion: (completed: boolean) => void = () => undefined
    let settled = false
    const completion = new Promise<boolean>((resolve) => {
      resolveCompletion = (completed) => {
        if (settled) return
        settled = true
        resolve(completed)
      }
    })
    const rewardCallback = (reward: AdMobRewardItem) => resolveCompletion(reward.amount > 0)
    const listeners = await Promise.allSettled([
      client.addListener(RewardAdPluginEvents.Rewarded, rewardCallback),
      client.addListener(RewardAdPluginEvents.Dismissed, () => resolveCompletion(false)),
      client.addListener(RewardAdPluginEvents.FailedToShow, () => resolveCompletion(false))
    ])
    const handles = getFulfilledHandles(listeners)
    if (listeners.some((result) => result.status === 'rejected')) {
      await removeListeners(handles)
      return { completed: false }
    }

    try {
      void client.showRewardVideoAd()
        .then((reward) => resolveCompletion(reward.amount > 0))
        .catch(() => resolveCompletion(false))
      return { completed: await completion }
    } finally {
      await removeListeners(handles)
    }
  }
}

export function createNativeAdMobGateways(dependencies: NativeAdMobDependencies): NativeAdMobGateways | undefined {
  if (dependencies.platform === 'web' || !hasRequiredAdMobConfig(dependencies.config)) return undefined

  const provider = new NativeAdMobProvider(dependencies)
  return {
    initialize: () => provider.ensureReady(),
    showPrivacyOptions: () => provider.showPrivacyOptions(),
    interstitial: { show: () => provider.showInterstitial() },
    rewarded: { show: () => provider.showRewarded() }
  }
}

let cachedNativeGateways: NativeAdMobGateways | null | undefined

export function getNativeAdMobGateways(): NativeAdMobGateways | undefined {
  if (cachedNativeGateways !== undefined) return cachedNativeGateways ?? undefined

  cachedNativeGateways = createNativeAdMobGateways({
    client: AdMob,
    platform: Capacitor.getPlatform(),
    config: getAdMobConfig()
  })
  return cachedNativeGateways ?? undefined
}

export function initializeNativeAdMob(): Promise<boolean> {
  return getNativeAdMobGateways()?.initialize() ?? Promise.resolve(false)
}

export function showNativePrivacyOptions(): Promise<boolean> {
  return getNativeAdMobGateways()?.showPrivacyOptions() ?? Promise.resolve(false)
}
