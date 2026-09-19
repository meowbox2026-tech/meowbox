import { describe, expect, it } from 'vitest'
import { createDropState } from './dropEngine'
import { clearBottomRow, recommendColumn } from './dropAssistance'

describe('drop assistance', () => {
  it('recommends the tutorial clear without changing the queue or board', () => {
    const state = createDropState()
    const before = JSON.stringify(state)
    expect(recommendColumn(state)).toBe(2)
    expect(JSON.stringify(state)).toBe(before)
    expect(recommendColumn({ ...state, phase: 'failed' })).toBeUndefined()
  })
  it('removes only the bottom row without scoring and moves survivors down', () => {
    const state = createDropState()
    const next = clearBottomRow({ ...state, phase: 'failed' })
    expect(next.board[7][0]?.type).toBe('blue')
    expect(next.board[7][1]?.type).toBe('white')
    expect(next.board.flat().filter(Boolean)).toHaveLength(2)
    expect(next.cleared).toBe(0)
    expect(next.score).toBe(0)
    expect(next.current).toBe(state.current)
    expect(next.phase).toBe('playing')
    expect(state.board[7][0]?.type).toBe('orange')
    expect(clearBottomRow({ ...state, cleared: 18 }).phase).toBe('completed')
  })
})
