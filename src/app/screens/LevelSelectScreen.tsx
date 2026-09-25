import { useState } from 'react'
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

const LEVELS_PER_WORLD = 30

interface LevelWorld {
  id: number
  start: number
  end: number
}

function createWorlds(): LevelWorld[] {
  const worldCount = Math.ceil(MAX_PLANNING_LEVEL / LEVELS_PER_WORLD)
  return Array.from({ length: worldCount }, (_, index) => ({
    id: index + 1,
    start: index * LEVELS_PER_WORLD + 1,
    end: Math.min(MAX_PLANNING_LEVEL, (index + 1) * LEVELS_PER_WORLD)
  }))
}

function getWorldIdForLevel(levelId: number): number {
  return Math.floor((levelId - 1) / LEVELS_PER_WORLD) + 1
}

export function LevelSelectScreen({ onBack, onSelectLevel }: LevelSelectScreenProps) {
  const { player } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const currentLevel = Math.min(MAX_PLANNING_LEVEL, Math.max(1, player.currentLevel))
  const worlds = createWorlds()
  const [selectedWorldId, setSelectedWorldId] = useState(() => Math.min(worlds.length, getWorldIdForLevel(currentLevel)))
  const selectedWorld = worlds.find((world) => world.id === selectedWorldId) ?? worlds[0]
  const visibleLevels = PLANNING_LEVELS.filter((level) => level.id >= selectedWorld.start && level.id <= selectedWorld.end)

  return (
    <main className="screen screen--levels">
      <TopBar onBack={onBack} />
      <ScreenTitle title={strings.levels.title} />
      <nav className="world-tabs" aria-label={strings.levels.worldsLabel} role="tablist">
        {worlds.map((world) => {
          const unlocked = world.start <= currentLevel
          const active = world.id === selectedWorld.id
          const worldName = format(strings.levels.worldLabel, { world: world.id })
          const range = format(strings.levels.worldRange, { start: world.start, end: world.end })
          return (
            <button
              aria-controls={`world-${world.id}-levels`}
              aria-label={`${format(strings.levels.worldAria, { world: world.id, start: world.start, end: world.end })}${unlocked ? '' : ` ${strings.levels.worldLocked}`}`}
              aria-selected={active}
              className={active ? 'is-active' : ''}
              disabled={!unlocked}
              id={`world-${world.id}-tab`}
              key={world.id}
              onClick={() => setSelectedWorldId(world.id)}
              role="tab"
              type="button"
            >
              <span>{worldName}</span>
              <small>
                {range}
                {!unlocked && <GameImage asset="lock" className="world-tabs__lock-icon" alt="" aria-hidden="true" />}
              </small>
            </button>
          )
        })}
      </nav>
      <p className="world-tabs__hint" aria-live="polite">{format(strings.levels.worldHint, { world: selectedWorld.id, start: selectedWorld.start, end: selectedWorld.end })}</p>
      <section className="level-board" id={`world-${selectedWorld.id}-levels`} aria-label={strings.levels.board} tabIndex={0}>
        {visibleLevels.map((level) => {
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
