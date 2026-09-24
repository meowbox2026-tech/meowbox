import type { CSSProperties } from 'react'
import type { DropBoard } from '../../game/core/dropEngine'

export type PlanningBoardEffectKind = 'place' | 'remove' | 'start'

export interface PlanningBoardEffect {
  id: number
  kind: PlanningBoardEffectKind
  x?: number
  y?: number
}

interface PlanningBoardEffectsProps {
  board: DropBoard
  clearingIds: number[]
  effect?: PlanningBoardEffect
  frame: number
  wave: number
  clearLabel: string
  comboLabel: (count: number) => string
}

function cellStyle(x: number, y: number): CSSProperties {
  return {
    '--effect-x': `${(x + 0.5) * 12.5}%`,
    '--effect-y': `${(y + 0.5) * 12.5}%`
  } as CSSProperties
}

export function PlanningBoardEffects({ board, clearingIds, effect, frame, wave, clearLabel, comboLabel }: PlanningBoardEffectsProps) {
  const clearing = new Set(clearingIds)
  const clearingCells = board.flatMap((row, y) => row.flatMap((cat, x) => (
    cat && clearing.has(cat.id) ? [{ id: cat.id, x, y }] : []
  )))

  return (
    <div className="planning-effects-layer">
      {effect && <span
        aria-hidden="true"
        key={`effect-${effect.id}`}
        className={`planning-effect planning-effect--${effect.kind}`}
        style={effect.x !== undefined && effect.y !== undefined ? cellStyle(effect.x, effect.y) : undefined}
      />}
      {clearingCells.map(({ id, x, y }) => <span
        aria-hidden="true"
        key={`clear-${frame}-${id}`}
        className="planning-effect planning-effect--clear"
        style={cellStyle(x, y)}
      />)}
      {clearingCells.length > 0 && wave > 0 && <div
        key={`combo-${frame}-${wave}`}
        className={`planning-combo planning-combo--${Math.min(wave, 4)}`}
        role="status"
        aria-live="polite"
        aria-label={wave > 1 ? comboLabel(wave) : clearLabel}
      >
        <span className="planning-combo__label">{wave > 1 ? comboLabel(wave) : clearLabel}</span>
      </div>}
    </div>
  )
}
