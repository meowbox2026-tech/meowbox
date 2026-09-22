import { describe, expect, it } from 'vitest'
import { createDropState, dropCat } from './dropEngine'
import { canReviveFromCeiling, clearBottomRow, recommendColumn } from './dropAssistance'

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

  it('keeps fixed scratch posts and cats above them in place during a revive', () => {
    const state = createDropState({
      width: 3,
      height: 4,
      board: [
        [null, null, null],
        [null, { id: 1, type: 'orange' }, null],
        [null, null, null],
        [{ id: 2, type: 'blue' }, null, null]
      ],
      scratchPosts: [{ id: 'post', x: 1, y: 2, hp: 2 }],
      target: 9
    })

    const next = clearBottomRow({ ...state, phase: 'failed' })

    expect(next.board[1][1]?.type).toBe('orange')
    expect(next.board[2][1]).toBeNull()
    expect(next.board[3][0]).toBeNull()
    expect(next.scratchPosts).toEqual([{ id: 'post', x: 1, y: 2, hp: 2 }])
    expect(next.phase).toBe('playing')
  })

  it('does not let a destroyed post block a later drop', () => {
    const state = createDropState({
      width: 3,
      height: 4,
      board: Array.from({ length: 4 }, () => Array(3).fill(null)),
      current: 'orange',
      next: 'blue',
      scratchPosts: [{ id: 'broken', x: 1, y: 3, hp: 0 }]
    })

    const result = dropCat(state, 1)
    expect(result.accepted).toBe(true)
    expect(result.landed[3][1]?.type).toBe('orange')
  })

  it('hides an unsafe ceiling revive when no route can be recovered', () => {
    const state = createDropState({
      width: 3,
      height: 3,
      board: [
        [null, null, null],
        [{ id: 1, type: 'orange' }, { id: 2, type: 'blue' }, { id: 3, type: 'white' }],
        [{ id: 4, type: 'orange' }, { id: 5, type: 'blue' }, { id: 6, type: 'white' }]
      ],
      target: 99,
      scratchPosts: [0, 1, 2].map((x) => ({ id: `post-${x}`, x, y: 0, hp: 1 }))
    })
    const failed = { ...state, phase: 'failed' as const }

    expect(canReviveFromCeiling(failed)).toBe(false)
    expect(clearBottomRow(failed).phase).toBe('failed')
  })
})
