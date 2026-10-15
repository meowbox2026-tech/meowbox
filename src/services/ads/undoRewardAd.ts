import { Capacitor } from '@capacitor/core'
import { getNativeAdMobGateways } from './nativeAdMob'
import { getWebAdSenseGateways } from './webAdSense'

export const DEMO_UNDO_AD_DURATION_MS = 5000

export interface UndoRewardAdResult {
  completed: boolean
}

export interface UndoRewardAdGateway {
  /** Resolve only after the provider reports completion, dismissal, or failure. */
  show: () => Promise<UndoRewardAdResult>
}

class DemoUndoRewardAdGateway implements UndoRewardAdGateway {
  async show(): Promise<UndoRewardAdResult> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, DEMO_UNDO_AD_DURATION_MS))
    return { completed: true }
  }
}

class UnavailableUndoRewardAdGateway implements UndoRewardAdGateway {
  async show(): Promise<UndoRewardAdResult> {
    return { completed: false }
  }
}

const demoGateway = new DemoUndoRewardAdGateway()
// Web without an ad network: never make players wait on a fake ad, never lock undo.
const grantWithoutAdGateway: UndoRewardAdGateway = { show: async () => ({ completed: true }) }
const unavailableGateway = new UnavailableUndoRewardAdGateway()
const nativeGateways = getNativeAdMobGateways()
// Web: real AdSense when configured, the timed demo only in local dev, otherwise none.
const webGateway = getWebAdSenseGateways()?.rewarded ?? (import.meta.env.DEV ? demoGateway : grantWithoutAdGateway)
let gateway: UndoRewardAdGateway = nativeGateways?.rewarded ?? (Capacitor.isNativePlatform() ? unavailableGateway : webGateway)

export function setUndoRewardAdGateway(nextGateway?: UndoRewardAdGateway): void {
  gateway = nextGateway ?? demoGateway
}

export function showUndoRewardAd(): Promise<UndoRewardAdResult> {
  return gateway.show()
}
