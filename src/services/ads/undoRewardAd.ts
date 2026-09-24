import { Capacitor } from '@capacitor/core'
import { getNativeAdMobGateways } from './nativeAdMob'

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
const unavailableGateway = new UnavailableUndoRewardAdGateway()
const nativeGateways = getNativeAdMobGateways()
let gateway: UndoRewardAdGateway = nativeGateways?.rewarded ?? (Capacitor.isNativePlatform() ? unavailableGateway : demoGateway)

export function setUndoRewardAdGateway(nextGateway?: UndoRewardAdGateway): void {
  gateway = nextGateway ?? demoGateway
}

export function showUndoRewardAd(): Promise<UndoRewardAdResult> {
  return gateway.show()
}
