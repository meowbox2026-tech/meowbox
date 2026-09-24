import { PLANNING_LEVELS, MAX_PLANNING_LEVEL } from '../../game/data/planningLevels'
import { format, getLevelName, useLocale, useStrings } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'
import { ScreenTitle } from '../components/ScreenTitle'
import { GameImage } from '../components/GameImage'
import { TopBar } from '../components/TopBar'

interface LevelSelectScreenProps {
  onBack: () => void
  onSelectLevel: (levelId: number) => void
}

export function LevelSelectScreen({ onBack, onSelectLevel }: LevelSelectScreenProps) {
  const { player } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const currentLevel = Math.min(MAX_PLANNING_LEVEL, Math.max(1, player.currentLevel))

  return (
    <main className="screen screen--levels">
      <TopBar onBack={onBack} />
      <ScreenTitle title={strings.levels.title} />
      <section className="level-board" aria-label={strings.levels.board} tabIndex={0}>
        {PLANNING_LEVELS.map((level) => {
          const unlocked = level.id <= currentLevel
          const stars = player.stars[level.id] ?? 0
          return (
            <button
              className={`level-tile ${unlocked ? '' : 'level-tile--locked'} ${level.id === currentLevel ? 'level-tile--current' : ''}`}
              key={level.id}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelectLevel(level.id)}
              aria-label={format(strings.levels.levelAria, { id: level.id }) + (unlocked ? '' : strings.levels.lockedSuffix)}
              title={getLevelName(level.id, locale)}
            >
              <strong>{level.id}</strong>
              {unlocked
                ? <span className="level-tile__stars" aria-label={format(strings.topbar.starsAria, { stars })}>{[1, 2, 3].map((star) => <GameImage asset="stars" className={star <= stars ? 'is-earned' : ''} key={star} alt="" aria-hidden="true" />)}</span>
                : <span className="level-tile__lock"><GameImage asset="lock" alt="" aria-hidden="true" />{strings.levels.locked}</span>}
            </button>
          )
        })}
      </section>
    </main>
  )
}
