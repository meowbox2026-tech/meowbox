import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DropBoard } from '../../game/core/dropEngine'
import { PlanningBoardEffects, type PlanningBoardEffect } from './PlanningBoardEffects'

const board: DropBoard = Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => (
  x === 2 && y === 3 ? { id: 9, type: 'orange' } : null
)))

const renderEffects = (effect?: PlanningBoardEffect, clearingIds: number[] = [], wave = 0) => render(
  <PlanningBoardEffects
    board={board}
    clearingIds={clearingIds}
    effect={effect}
    frame={wave}
    wave={wave}
    clearLabel="CLEAR!"
    comboLabel={(count) => `COMBO ×${count}`}
  />
)

describe('PlanningBoardEffects', () => {
  it('places a lightweight ripple at the requested board cell', () => {
    const { container } = renderEffects({ id: 4, kind: 'place', x: 2, y: 3 })
    const ripple = container.querySelector('.planning-effect--place')

    expect(ripple).toBeInTheDocument()
    expect(ripple?.getAttribute('style')).toContain('--effect-x: 31.25%')
    expect(ripple?.getAttribute('style')).toContain('--effect-y: 43.75%')
  })

  it('renders one clear ripple per cleared cat and labels a combo wave', () => {
    const { container, getByText } = renderEffects(undefined, [9], 2)

    expect(container.querySelectorAll('.planning-effect--clear')).toHaveLength(1)
    expect(getByText('COMBO ×2')).toHaveClass('planning-combo__label')
  })

  it('uses the clear label before the second wave', () => {
    const { getByText } = renderEffects(undefined, [9], 1)

    expect(getByText('CLEAR!')).toHaveClass('planning-combo__label')
  })

  it('renders no transient effects when the board is idle', () => {
    const { container } = renderEffects()

    expect(container.querySelector('.planning-effects-layer')).toBeInTheDocument()
    expect(container.querySelector('.planning-effect')).toBeNull()
    expect(container.querySelector('.planning-combo')).toBeNull()
  })
})
