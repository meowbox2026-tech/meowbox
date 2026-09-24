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
type AdMobClient = Pick<AdMobPlugin, 'initialize' | 'trackingAuthorizationStatus' | 'requestTrackingAuthorization' | 'requestConsentInfo' | 'showConsentForm' | 'prepareInterstitial' | 'showInterstitial' | 'prepareRewardVideoAd' | 'showRewardVideoAd' | 'addListener'>

export interface NativeAdMobGateways {
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

class NativeAdMobProvider {
  private initializePromise?: Promise<boolean>

  constructor(private readonly dependencies: NativeAdMobDependencies) {}

  private ensureReady(): Promise<boolean> {
    this.initializePromise ??= this.initialize()
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
    interstitial: { show: () => provider.showInterstitial() },
    rewarded: { show: () => provider.showRewarded() }
  }
}

export function getNativeAdMobGateways(): NativeAdMobGateways | undefined {
  return createNativeAdMobGateways({
    client: AdMob,
    platform: Capacitor.getPlatform(),
    config: getAdMobConfig()
  })
}
