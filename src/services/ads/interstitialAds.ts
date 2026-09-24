import { Capacitor } from '@capacitor/core'
import { getNativeAdMobGateways } from './nativeAdMob'

// Browser-only placeholder. Native AdMob interstitials use the provider's
// full-screen UI and dismissal callbacks; this timer is not a revenue signal.
export const DEMO_INTERSTITIAL_DURATION_MS = 30000

export interface InterstitialAdResult {
  shown: boolean
}

export interface InterstitialAdGateway {
  /** Resolve only after the ad provider reports dismissal or failure. */
  show: () => Promise<InterstitialAdResult>
}

class DemoInterstitialAdGateway implements InterstitialAdGateway {
  async show(): Promise<InterstitialAdResult> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, DEMO_INTERSTITIAL_DURATION_MS))
    return { shown: true }
  }
}

class UnavailableInterstitialAdGateway implements InterstitialAdGateway {
  async show(): Promise<InterstitialAdResult> {
    return { shown: false }
  }
}

const demoGateway = new DemoInterstitialAdGateway()
const unavailableGateway = new UnavailableInterstitialAdGateway()
const nativeGateways = getNativeAdMobGateways()
let gateway: InterstitialAdGateway = nativeGateways?.interstitial ?? (Capacitor.isNativePlatform() ? unavailableGateway : demoGateway)

export function setInterstitialAdGateway(nextGateway?: InterstitialAdGateway): void {
  gateway = nextGateway ?? demoGateway
}

export function showInterstitialAd(): Promise<InterstitialAdResult> {
  return gateway.show()
}
