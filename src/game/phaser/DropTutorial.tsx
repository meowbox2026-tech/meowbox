import { useState } from 'react'
import { format, useLocalizedLevel, useStrings } from '../../i18n'
import { AppButton } from '../../app/components/AppButton'
import { Modal } from '../../app/components/Modal'
import type { DropLevelDefinition } from '../data/dropLevelTypes'

interface Demo {
  key: string
  cats: string
  object: string
  effect: string
}

export function DropTutorial({ level, open, onClose }: { level: DropLevelDefinition; open: boolean; onClose: () => void }) {
  const strings = useStrings()
  const localized = useLocalizedLevel(level.id)
  const [active, setActive] = useState(false)
  if (!level.tutorial) return null
  const demo = getDemo(level.id, strings.game.traitScratch, strings.game.traitHungry, strings.game.tutorialScratchEffect,
    strings.game.tutorialFishEffect, strings.game.tutorialHoldEffect, strings.game.tutorialTunnelEffect,
    strings.game.tutorialHungryEffect, strings.game.tutorialPatrolEffect)
  return <Modal open={open} ariaLabel={strings.game.tutorialTitle} className="drop-tutorial">
    <h2>🐾 {strings.game.tutorialTitle}</h2>
    <p>{format(strings.game.tutorialIntro, { name: localized.name })}</p>
    <div className={`drop-tutorial__demo${active ? ' is-active' : ''}`} data-tutorial={demo.key}>
      <span className="drop-tutorial__cats">{demo.cats}</span>
      <span className="drop-tutorial__object">{demo.object}</span>
      <b className="drop-tutorial__effect">{demo.effect}</b>
    </div>
    <p className="drop-tutorial__hint">{localized.guidance}</p>
    <button className="drop-tutorial__demo-button" type="button" onClick={() => setActive((value) => !value)}>
      {active ? '♡' : '✦'} {strings.game.tutorialDemo}
    </button>
    <AppButton onClick={onClose}>{strings.game.tutorialCta}</AppButton>
  </Modal>
}

function getDemo(levelId: number, scratch: string, hungry: string, scratchEffect: string, fishEffect: string, holdEffect: string,
  tunnelEffect: string, hungryEffect: string, patrolEffect: string): Demo {
  if (levelId === 31) return { key: 'scratch-post', cats: '😺  😺  😺', object: '🪵', effect: scratchEffect }
  if (levelId === 36) return { key: 'fish-treat', cats: '😺  ✦  😺', object: '🐟', effect: fishEffect }
  if (levelId === 41) return { key: 'cat-hold', cats: '😺  ↔  📦', object: '🪄', effect: holdEffect }
  if (levelId === 46) return { key: 'scratch-trait', cats: `😺  ${scratch}`, object: '🪵', effect: scratchEffect }
  if (levelId === 51 || levelId === 71) return { key: 'tunnel', cats: '😺  ↘  ↗', object: '🌀', effect: tunnelEffect }
  if (levelId === 61) return { key: 'hungry-trait', cats: `😺  ${hungry}`, object: '🐟', effect: hungryEffect }
  return { key: 'patrol', cats: '😺  🐾  😺', object: '📦', effect: patrolEffect }
}
