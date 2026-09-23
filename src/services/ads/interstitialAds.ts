export const DEMO_INTERSTITIAL_DURATION_MS = 5000

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

const demoGateway = new DemoInterstitialAdGateway()
let gateway: InterstitialAdGateway = demoGateway

export function setInterstitialAdGateway(nextGateway?: InterstitialAdGateway): void {
  gateway = nextGateway ?? demoGateway
}

export function showInterstitialAd(): Promise<InterstitialAdResult> {
  return gateway.show()
}
