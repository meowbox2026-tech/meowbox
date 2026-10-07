import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'
import { useLocale } from '../../i18n'
import { setGameBannerVisible } from '../../services/ads/bannerAds'

export function GameBannerAd({ visible }: { visible: boolean }) {
  const locale = useLocale()
  const preview = !Capacitor.isNativePlatform() && import.meta.env.DEV
  const label = { 'zh-TW': '廣告預覽', en: 'Ad preview', ja: '広告プレビュー' }[locale]
  useEffect(() => {
    void setGameBannerVisible(visible)
    return () => { void setGameBannerVisible(false) }
  }, [visible])
  return <div className="game-banner-slot" aria-hidden={!preview || !visible}>
    {preview && visible && <div className="game-banner-preview" aria-label={label}>
      <span>{label}</span><small>320 × 50</small>
    </div>}
  </div>
}
