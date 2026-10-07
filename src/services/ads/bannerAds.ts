import { Capacitor } from '@capacitor/core'
import { AdMob, BannerAdPosition, BannerAdSize, type BannerAdOptions } from '@capacitor-community/admob'
import { getAdMobConfig } from './adMobConfig'
import { initializeNativeAdMob } from './nativeAdMob'

interface BannerDependencies {
  platform: string
  isTesting: boolean
  adId: string
  initialize: () => Promise<boolean>
  client: { showBanner: (options: BannerAdOptions) => Promise<void>; removeBanner: () => Promise<void> }
}

/** Serialize native mutations so navigation cannot leave a late-loading banner behind. */
export function createBannerController(dependencies: BannerDependencies) {
  let queue = Promise.resolve()
  let revision = 0
  let shown = false
  const enqueue = (operation: () => Promise<void>) => {
    queue = queue.then(operation).catch(() => undefined)
    return queue
  }
  return {
    setVisible(visible: boolean) {
      const request = ++revision
      return enqueue(async () => {
        if (request !== revision || dependencies.platform === 'web') return
        if (!visible) {
          if (shown) await dependencies.client.removeBanner()
          shown = false
          return
        }
        if (shown || (!dependencies.isTesting && !dependencies.adId)) return
        if (!await dependencies.initialize() || request !== revision) return
        const testId = dependencies.platform === 'ios'
          ? 'ca-app-pub-3940256099942544/2934735716'
          : 'ca-app-pub-3940256099942544/6300978111'
        // Fixed 320x50 leaves the SE board and controls at their original sizes.
        shown = true
        try {
          await dependencies.client.showBanner({
            adId: dependencies.isTesting ? testId : dependencies.adId,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: dependencies.isTesting
          })
        } catch {
          await dependencies.client.removeBanner()
          shown = false
        }
      })
    }
  }
}

const banner = createBannerController({
  platform: Capacitor.getPlatform(),
  isTesting: getAdMobConfig().isTesting,
  adId: import.meta.env.VITE_ADMOB_BANNER_ID?.trim() ?? '',
  initialize: initializeNativeAdMob,
  client: AdMob
})
export const setGameBannerVisible = (visible: boolean) => banner.setVisible(visible)
