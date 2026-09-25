import { describe, expect, it, vi } from 'vitest'
import { RewardAdPluginEvents, type AdMobPlugin } from '@capacitor-community/admob'
import { createNativeAdMobGateways } from './nativeAdMob'

function createFakeClient(consentInfo: { canRequestAds: boolean; isConsentFormAvailable?: boolean } = { canRequestAds: true }) {
  const listeners = new Map<string, (payload?: { amount: number; type: string }) => void>()
  const remove = vi.fn().mockResolvedValue(undefined)
  const client = {
    initialize: vi.fn().mockResolvedValue(undefined),
    trackingAuthorizationStatus: vi.fn().mockResolvedValue({ status: 'authorized' }),
    requestTrackingAuthorization: vi.fn().mockResolvedValue(undefined),
    requestConsentInfo: vi.fn().mockResolvedValue(consentInfo),
    showConsentForm: vi.fn(),
    prepareInterstitial: vi.fn().mockResolvedValue({ adUnitId: 'interstitial' }),
    showInterstitial: vi.fn().mockImplementation(async () => {
      listeners.get('interstitialAdDismissed')?.()
    }),
    prepareRewardVideoAd: vi.fn().mockResolvedValue({ adUnitId: 'rewarded' }),
    showRewardVideoAd: vi.fn().mockImplementation(async () => {
      const reward = { amount: 5, type: 'undo' }
      listeners.get(RewardAdPluginEvents.Rewarded)?.(reward)
      return reward
    }),
    addListener: vi.fn().mockImplementation(async (event: string, callback: (payload?: { amount: number; type: string }) => void) => {
      listeners.set(event, callback)
      return { remove }
    })
  }
  return { client: client as unknown as AdMobPlugin, remove }
}

const config = {
  appId: 'ca-app-pub-example~app',
  interstitialAdId: 'interstitial',
  rewardedAdId: 'rewarded',
  isTesting: true
}

describe('native AdMob gateways', () => {
  it('does not enable native ads without a native platform or complete IDs', () => {
    expect(createNativeAdMobGateways({ client: {} as AdMobPlugin, platform: 'web', config })).toBeUndefined()
    expect(createNativeAdMobGateways({ client: {} as AdMobPlugin, platform: 'ios', config: { ...config, rewardedAdId: '' } })).toBeUndefined()
  })

  it('waits for provider callbacks and only rewards a completed ad', async () => {
    const { client, remove } = createFakeClient()
    const gateways = createNativeAdMobGateways({ client, platform: 'ios', config })

    await expect(gateways?.interstitial.show()).resolves.toEqual({ shown: true })
    await expect(gateways?.rewarded.show()).resolves.toEqual({ completed: true })
    expect(client.initialize).toHaveBeenCalledOnce()
    expect(remove).toHaveBeenCalledTimes(5)
  })

  it('keeps test ads available when UMP cannot request ads yet', async () => {
    const { client } = createFakeClient({ canRequestAds: false, isConsentFormAvailable: false })
    const gateways = createNativeAdMobGateways({ client, platform: 'ios', config })

    await expect(gateways?.interstitial.show()).resolves.toEqual({ shown: true })
    expect(client.prepareInterstitial).toHaveBeenCalledOnce()
  })

  it('keeps test ads available when UMP rejects', async () => {
    const { client } = createFakeClient()
    client.requestConsentInfo = vi.fn().mockRejectedValue(new Error('consent unavailable'))
    const gateways = createNativeAdMobGateways({ client, platform: 'ios', config })

    await expect(gateways?.interstitial.show()).resolves.toEqual({ shown: true })
    expect(client.prepareInterstitial).toHaveBeenCalledOnce()
  })

  it('keeps production ads gated by UMP consent', async () => {
    const { client } = createFakeClient({ canRequestAds: false, isConsentFormAvailable: false })
    const gateways = createNativeAdMobGateways({ client, platform: 'ios', config: { ...config, isTesting: false } })

    await expect(gateways?.interstitial.show()).resolves.toEqual({ shown: false })
    expect(client.prepareInterstitial).not.toHaveBeenCalled()
  })
})
