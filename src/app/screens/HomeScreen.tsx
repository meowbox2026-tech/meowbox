import { ArtworkButton } from '../components/ArtworkButton'
import { GameImage } from '../components/GameImage'
import { TopBar } from '../components/TopBar'
import { ECONOMY_UI_ENABLED } from '../config'
import { format, useStrings } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'

interface HomeScreenProps {
  onStart: () => void
  onNavigate: (screen: 'levels' | 'settings') => void
}

export function HomeScreen({ onStart, onNavigate }: HomeScreenProps) {
  const { player } = usePlayer()
  const strings = useStrings()
  const completedStars = Object.values(player.stars).reduce((total, stars) => total + stars, 0)

  return (
    <main className="screen screen--home">
      <TopBar coins={player.pawCoins} onSettings={() => onNavigate('settings')} />
      {ECONOMY_UI_ENABLED && <div className="home-lives" aria-label="生命值 5，已滿">
        <GameImage asset="life" className="home-lives__art" alt="" aria-hidden="true" />
        <strong>5</strong><small>已滿</small>
      </div>}
      <section className="home-brand" aria-label={strings.home.brandAria}>
        <GameImage asset="meowlogo" className="home-brand__logo" alt="MEOW BOX" />
        <p>{strings.home.brandSub}</p>
      </section>
      <aside className="home-progress" aria-label={format(strings.home.progressAria, { level: player.currentLevel })}>
        <GameImage asset="schedule" className="home-progress__art" alt="" aria-hidden="true" />
        <span>{strings.home.progress}</span><strong>Lv. {player.currentLevel}</strong>
        <div className="home-progress__stars">{[1, 2, 3].map((star) => <GameImage asset="stars" key={star} className={star <= (player.stars[player.currentLevel] ?? 0) ? 'is-earned' : ''} alt="" aria-hidden="true" />)}</div>
        <small>{format(strings.home.collected, { count: completedStars })}</small>
      </aside>
      <ArtworkButton asset="start" className="home-start" onClick={onStart}>{strings.home.start}</ArtworkButton>
      <nav className="home-nav" aria-label={strings.home.mainNav}>
        <ArtworkButton asset="levelmap" className="home-nav__button" onClick={() => onNavigate('levels')}>{strings.home.levels}</ArtworkButton>
      </nav>
    </main>
  )
}
