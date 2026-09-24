import { ArtworkButton } from '../components/ArtworkButton'
import { GameImage } from '../components/GameImage'
import { TopBar } from '../components/TopBar'
import { useStrings } from '../../i18n'

interface HomeScreenProps {
  onStart: () => void
  onNavigate: (screen: 'levels' | 'settings') => void
}

export function HomeScreen({ onStart, onNavigate }: HomeScreenProps) {
  const strings = useStrings()

  return (
    <main className="screen screen--home">
      <TopBar onSettings={() => onNavigate('settings')} />
      <section className="home-brand" aria-label={strings.home.brandAria}>
        <div className="home-brand__mark" aria-hidden="true">
          <GameImage asset="meowlogo" className="home-brand__logo" alt="" />
        </div>
        <p>{strings.home.brandSub}</p>
      </section>
      <ArtworkButton asset="start" className="home-start" onClick={onStart}>{strings.home.start}</ArtworkButton>
      <nav className="home-nav" aria-label={strings.home.mainNav}>
        <ArtworkButton asset="levelmap" className="home-nav__button" onClick={() => onNavigate('levels')}>{strings.home.levels}</ArtworkButton>
      </nav>
    </main>
  )
}
