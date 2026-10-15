import { Capacitor } from '@capacitor/core'
import { useEffect, useRef } from 'react'
import { useLocale } from '../../i18n'
import { setGameBannerVisible } from '../../services/ads/bannerAds'
import { getWebAdSenseConfig, isWebAdSenseActive, loadAdSenseScript, pushAdSenseSlot } from '../../services/ads/webAdSense'

const webAdSense = getWebAdSenseConfig()

/** Fixed 320x50 AdSense unit so the board layout matches the native banner. */
function WebAdSenseBanner() {
  const pushed = useRef(false)
  useEffect(() => {
    if (pushed.current || !loadAdSenseScript(webAdSense)) return
    pushed.current = true
    try { pushAdSenseSlot() } catch { /* An empty slot must never break the game. */ }
  }, [])
  return <ins
    className="adsbygoogle game-banner-web"
    style={{ display: 'inline-block', width: 320, height: 50 }}
    data-ad-client={webAdSense.client}
    data-ad-slot={webAdSense.bannerSlot}
    data-adtest={webAdSense.isTesting ? 'on' : undefined}
  />
}

export function GameBannerAd({ visible }: { visible: boolean }) {
  const locale = useLocale()
  const native = Capacitor.isNativePlatform()
  const webAd = !native && isWebAdSenseActive() && Boolean(webAdSense.bannerSlot)
  const preview = !native && !webAd && import.meta.env.DEV
  const label = { 'zh-TW': '廣告預覽', en: 'Ad preview', ja: '広告プレビュー' }[locale]
  useEffect(() => {
    void setGameBannerVisible(visible)
    return () => { void setGameBannerVisible(false) }
  }, [visible])
  // The web unit stays mounted (hidden) so pausing does not request a new ad.
  return <div className={`game-banner-slot${webAd ? ' game-banner-slot--web' : ''}`} aria-hidden={!(preview || webAd) || !visible}>
    {webAd && <div className="game-banner-web-frame" hidden={!visible}><WebAdSenseBanner /></div>}
    {preview && visible && <div className="game-banner-preview" aria-label={label}>
      <span>{label}</span><small>320 × 50</small>
    </div>}
  </div>
}
