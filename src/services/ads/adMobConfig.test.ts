import { describe, expect, it } from 'vitest'
import { getAdMobConfig, hasRequiredAdMobConfig } from './adMobConfig'

describe('AdMob configuration', () => {
  it('requires all native identifiers before enabling the provider', () => {
    const config = getAdMobConfig({
      VITE_ADMOB_APP_ID: 'ca-app-pub-example~app',
      VITE_ADMOB_INTERSTITIAL_ID: 'ca-app-pub-example/interstitial',
      VITE_ADMOB_REWARDED_ID: 'ca-app-pub-example/rewarded',
      VITE_ADMOB_TESTING: 'false'
    })

    expect(config).toEqual({
      appId: 'ca-app-pub-example~app',
      interstitialAdId: 'ca-app-pub-example/interstitial',
      rewardedAdId: 'ca-app-pub-example/rewarded',
      isTesting: false
    })
    expect(hasRequiredAdMobConfig(config)).toBe(true)
  })

  it('defaults to test mode and refuses incomplete identifiers', () => {
    const config = getAdMobConfig({ VITE_ADMOB_APP_ID: 'only-app-id' })

    expect(config.isTesting).toBe(true)
    expect(hasRequiredAdMobConfig(config)).toBe(false)
  })
})
