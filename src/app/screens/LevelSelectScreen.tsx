import { DROP_LEVEL_MANIFEST } from '../../game/data/dropManifest'
import { format, useLocale, useStrings } from '../../i18n'
import { getLevelName } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'
import { useState } from 'react'
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
  const [selectedWorld, setSelectedWorld] = useState(() => Math.min(2, Math.floor((player.currentLevel - 1) / 30)))
  const worlds = [0, 1, 2].map((index) => ({
    name: format(strings.levels.world, { n: index + 1 }),
    sub: strings.levels.worldSubs[index] ?? '',
    unlocked: index < 3 && player.currentLevel >= index * 30 + 1
  }))
  const visibleLevels = DROP_LEVEL_MANIFEST.filter((level) => level.world === selectedWorld + 1)

  return (
    <main className="screen screen--levels">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title={strings.levels.title} subtitle={strings.levels.subtitle} />
      <div className="world-tabs" role="tablist" aria-label={strings.levels.worldTabs}>
        {worlds.map((world, index) => <button
          aria-selected={index === selectedWorld}
          className={index === selectedWorld ? 'is-active' : ''}
          disabled={!world.unlocked}
          key={world.name}
          role="tab"
          type="button"
          onClick={() => setSelectedWorld(index)}
        >{world.name}<small>{!world.unlocked && <GameImage asset="lock" className="world-tabs__lock-icon" alt="" aria-hidden="true" />}{world.sub}</small></button>)}
      </div>
      {!worlds[1].unlocked && <p className="world-tabs__hint" role="status">{strings.levels.worldLocked}</p>}
      <section className="level-board" aria-label={strings.levels.board} tabIndex={0}>
        {visibleLevels.map((level) => {
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
              {unlocked ? <span className="level-tile__stars" aria-label={format(strings.topbar.starsAria, { stars })}>{[1, 2, 3].map((star) => <GameImage asset="stars" className={star <= stars ? 'is-earned' : ''} key={star} alt="" aria-hidden="true" />)}</span> : <span className="level-tile__lock"><GameImage asset="lock" alt="" aria-hidden="true" />{strings.levels.locked}</span>}
            </button>
          )
        })}
      </section>
    </main>
  )
}
