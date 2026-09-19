import { DROP_LEVELS } from '../../game/data/dropLevels'
import { format, useLocale, useStrings } from '../../i18n'
import { getLevelName } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'

interface LevelSelectScreenProps {
  onBack: () => void
  onSelectLevel: (levelId: number) => void
}

export function LevelSelectScreen({ onBack, onSelectLevel }: LevelSelectScreenProps) {
  const { player } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const worlds = [0, 1, 2].map((index) => ({
    name: format(strings.levels.world, { n: index + 1 }),
    sub: strings.levels.worldSubs[index] ?? ''
  }))

  return (
    <main className="screen screen--levels">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title={strings.levels.title} subtitle={strings.levels.subtitle} />
      <div className="world-tabs" role="tablist" aria-label={strings.levels.worldTabs}>
        {worlds.map((world, index) => <button className={index === 0 ? 'is-active' : ''} key={world.name} type="button" disabled={index !== 0}>{world.name}<small>{world.sub}</small></button>)}
      </div>
      <section className="level-board" aria-label={strings.levels.board} tabIndex={0}>
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
              aria-label={format(strings.levels.levelAria, { id: level.id }) + (unlocked ? '' : strings.levels.lockedSuffix)}
              title={getLevelName(level.id, locale)}
            >
              <strong>{level.id}</strong>
              {unlocked ? <span>{[1, 2, 3].map((star) => <i className={star <= stars ? 'is-earned' : ''} key={star}>★</i>)}</span> : <span className="level-tile__lock">{strings.levels.locked}</span>}
            </button>
          )
        })}
      </section>
    </main>
  )
}
