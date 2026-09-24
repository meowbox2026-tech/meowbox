export interface AdMobConfig {
  appId: string
  interstitialAdId: string
  rewardedAdId: string
  isTesting: boolean
}

type AdMobEnvironment = Record<string, string | undefined>

const clean = (value: string | undefined): string => value?.trim() ?? ''

export function getAdMobConfig(environment: AdMobEnvironment = import.meta.env): AdMobConfig {
  return {
    appId: clean(environment.VITE_ADMOB_APP_ID),
    interstitialAdId: clean(environment.VITE_ADMOB_INTERSTITIAL_ID),
    rewardedAdId: clean(environment.VITE_ADMOB_REWARDED_ID),
    // Test mode is the safe default. Production builds must opt out explicitly.
    isTesting: environment.VITE_ADMOB_TESTING !== 'false'
  }
}

export function hasRequiredAdMobConfig(config: AdMobConfig): boolean {
  return Boolean(config.appId && config.interstitialAdId && config.rewardedAdId)
}
