import { Capacitor } from '@capacitor/core'
import { hasWebAdSense } from './webAdSense'

/**
 * The local timing surface is a development stand-in only. Native builds use
 * the AdMob SDK and production web uses AdSense's own full-screen UI.
 */
export function shouldRenderDemoAd(
  platform: string = Capacitor.getPlatform(),
  isDev: boolean = import.meta.env.DEV,
  adSenseConfigured: boolean = hasWebAdSense()
): boolean {
  return platform === 'web' && isDev && !adSenseConfigured
}
