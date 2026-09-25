import { Capacitor } from '@capacitor/core'

/**
 * Browser builds use the local timing surface because AdMob only presents
 * full-screen ads through the native SDK.
 */
export function shouldRenderDemoAd(platform: string = Capacitor.getPlatform()): boolean {
  return platform === 'web'
}
