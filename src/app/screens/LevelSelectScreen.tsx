import { DROP_LEVELS } from '../../game/data/dropLevels'
import { usePlayer } from '../../state/PlayerContext'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'

interface LevelSelectScreenProps {
  onBack: () => void
  onSelectLevel: (levelId: number) => void
}

export function LevelSelectScreen({ onBack, onSelectLevel }: LevelSelectScreenProps) {
  const { player } = usePlayer()

  return (
    <main className="screen screen--levels">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title="關卡選擇" subtitle="更多貓咪，更多幸福！" />
      <div className="world-tabs" role="tablist" aria-label="世界選擇">
        <button className="is-active" type="button">世界 1<small>溫馨小屋</small></button>
        <button type="button" disabled>世界 2<small>花園</small></button>
        <button type="button" disabled>世界 3<small>旅行</small></button>
      </div>
      <section className="level-board" aria-label="關卡清單" tabIndex={0}>
        {DROP_LEVELS.map((level) => {
          const unlocked = level.id <= player.currentLevel
          const stars = player.stars[level.id] ?? 0
          return (
            <button
              className={`level-tile ${unlocked ? '' : 'level-tile--locked'} ${level.id === player.currentLevel ? 'level-tile--current' : ''}`}
              key={level.id}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelectLevel(level.id)}
              aria-label={`第 ${level.id} 關${unlocked ? '' : '，尚未解鎖'}`}
            >
              <strong>{level.id}</strong>
              {unlocked ? <span>{[1, 2, 3].map((star) => <i className={star <= stars ? 'is-earned' : ''} key={star}>★</i>)}</span> : <span className="level-tile__lock">未解鎖</span>}
            </button>
          )
        })}
      </section>
    </main>
  )
}
