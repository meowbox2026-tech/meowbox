import { afterEach, describe, expect, it, vi } from 'vitest'
import { setInterstitialAdGateway, showInterstitialAd, type InterstitialAdGateway } from './interstitialAds'

describe('interstitial ads', () => {
  afterEach(() => {
    setInterstitialAdGateway(undefined)
  })

  it('returns the provider result instead of inventing a reward locally', async () => {
    const gateway: InterstitialAdGateway = { show: vi.fn().mockResolvedValue({ shown: true }) }
    setInterstitialAdGateway(gateway)

    await expect(showInterstitialAd()).resolves.toEqual({ shown: true })
    expect(gateway.show).toHaveBeenCalledOnce()
  })

  it('propagates provider failures so the app can unblock without granting a reward', async () => {
    const gateway: InterstitialAdGateway = { show: vi.fn().mockRejectedValue(new Error('no fill')) }
    setInterstitialAdGateway(gateway)

    await expect(showInterstitialAd()).rejects.toThrow('no fill')
  })
})
