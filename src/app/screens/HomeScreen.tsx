import { ArtworkButton } from '../components/ArtworkButton'
import { GameImage } from '../components/GameImage'
import { TopBar } from '../components/TopBar'
import { ECONOMY_UI_ENABLED } from '../config'
import { usePlayer } from '../../state/PlayerContext'

interface HomeScreenProps {
  onStart: () => void
  onNavigate: (screen: 'levels' | 'collection' | 'shop' | 'settings') => void
  onDailyReward: () => void
}

export function HomeScreen({ onStart, onNavigate, onDailyReward }: HomeScreenProps) {
  const { player } = usePlayer()
  const completedStars = Object.values(player.stars).reduce((total, stars) => total + stars, 0)

  return (
    <main className="screen screen--home">
      <TopBar coins={player.pawCoins} onSettings={() => onNavigate('settings')} />
      {ECONOMY_UI_ENABLED && <div className="home-lives" aria-label="生命值 5，已滿">
        <GameImage asset="life" className="home-lives__art" alt="" aria-hidden="true" />
        <strong>5</strong><small>已滿</small>
      </div>}
      <section className="home-brand" aria-label="Meow Box 貓咪裝箱拼圖">
        <GameImage asset="meowlogo" className="home-brand__logo" alt="MEOW BOX" />
        <p>貓咪裝箱拼圖</p>
      </section>
      <aside className="home-progress" aria-label={`目前進度，第 ${player.currentLevel} 關`}>
        <GameImage asset="schedule" className="home-progress__art" alt="" aria-hidden="true" />
        <span>目前進度</span><strong>Lv. {player.currentLevel}</strong>
        <div className="home-progress__stars">{[1, 2, 3].map((star) => <GameImage asset="stars" key={star} className={star <= (player.stars[player.currentLevel] ?? 0) ? 'is-earned' : ''} alt="" aria-hidden="true" />)}</div>
        <small>已蒐集 {completedStars} 顆星星</small>
      </aside>
      <ArtworkButton asset="start" className="home-start" onClick={onStart}>開始遊戲</ArtworkButton>
      <nav className="home-nav" aria-label="主選單">
        <ArtworkButton asset="levelmap" className="home-nav__button" onClick={() => onNavigate('levels')}>關卡</ArtworkButton>
        <ArtworkButton asset="collect" className="home-nav__button home-nav__button--dark" onClick={() => onNavigate('collection')}>收藏</ArtworkButton>
        <ArtworkButton asset="dailyrewards" className="home-nav__button" badge="!" onClick={onDailyReward}>每日獎勵</ArtworkButton>
        <ArtworkButton asset="store" className="home-nav__button" onClick={() => onNavigate('shop')}>商店</ArtworkButton>
      </nav>
    </main>
  )
}
