import { ArtworkButton } from '../components/ArtworkButton'
import { GameImage } from '../components/GameImage'
import { TopBar } from '../components/TopBar'
import { format, useStrings } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'

interface HomeScreenProps {
  onStart: () => void
  onNavigate: (screen: 'levels' | 'settings') => void
}

export function HomeScreen({ onStart, onNavigate }: HomeScreenProps) {
  const { player } = usePlayer()
  const strings = useStrings()

  return (
    <main className="screen screen--home">
      <TopBar coins={player.pawCoins} onSettings={() => onNavigate('settings')} />
      <section className="home-brand" aria-label={strings.home.brandAria}>
        <GameImage asset="meowlogo" className="home-brand__logo" alt="MEOW BOX" />
        <p>{strings.home.brandSub}</p>
      </section>
      <aside className="home-progress" aria-label={format(strings.home.progressAria, { level: player.currentLevel })}>
        <GameImage asset="schedule" className="home-progress__art" alt="" aria-hidden="true" />
        <span>{strings.home.progress}</span><strong>Lv. {player.currentLevel}</strong>
      </aside>
      <ArtworkButton asset="start" className="home-start" onClick={onStart}>{strings.home.start}</ArtworkButton>
      <nav className="home-nav" aria-label={strings.home.mainNav}>
        <ArtworkButton asset="levelmap" className="home-nav__button" onClick={() => onNavigate('levels')}>{strings.home.levels}</ArtworkButton>
      </nav>
    </main>
  )
}
