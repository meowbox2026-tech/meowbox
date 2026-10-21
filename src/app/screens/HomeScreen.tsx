import { Capacitor } from '@capacitor/core'
import { ArtworkButton } from '../components/ArtworkButton'
import { GameImage } from '../components/GameImage'
import { TopBar } from '../components/TopBar'
import { useLocale, useStrings } from '../../i18n'
import { HomeSocial } from '../leaderboard/HomeSocial'

// Static zh-TW pages in public/; plain links give crawlers and visitors a way in from the game shell.
const SITE_LINKS = [['/about', '遊戲介紹'], ['/guide', '玩法與攻略'], ['/privacy', '隱私權政策'], ['/terms', '服務條款'], ['/support', '客服支援']] as const
const SITE_NAV_LABEL = { 'zh-TW': '網站資訊', en: 'Site information', ja: 'サイト情報' }

interface HomeScreenProps {
  onStart: () => void
  onNavigate: (screen: 'levels' | 'settings' | 'profile' | 'leaderboard') => void
}

export function HomeScreen({ onStart, onNavigate }: HomeScreenProps) {
  const strings = useStrings()
  const locale = useLocale()

  return (
    <main className="screen screen--home">
      <TopBar onSettings={() => onNavigate('settings')} />
      <HomeSocial onNavigate={onNavigate} />
      <section className="home-brand" aria-label={strings.home.brandAria}>
        <div className="home-brand__mark" aria-hidden="true">
          <GameImage asset="meowlogo" className="home-brand__logo" alt="" />
        </div>
      </section>
      <ArtworkButton asset="start" className="home-start" onClick={onStart}>{strings.home.start}</ArtworkButton>
      <nav className="home-nav" aria-label={strings.home.mainNav}>
        <ArtworkButton asset="levelmap" className="home-nav__button" onClick={() => onNavigate('levels')}>{strings.home.levels}</ArtworkButton>
      </nav>
      {!Capacitor.isNativePlatform() && <nav className="home-site-links" aria-label={SITE_NAV_LABEL[locale]}>
        {SITE_LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
      </nav>}
    </main>
  )
}
