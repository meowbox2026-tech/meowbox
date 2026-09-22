import { describe, expect, it } from 'vitest'
import { createDropState, landingRow } from './dropEngine'
import { resolveDropColumn } from './dropRouting'

describe('drop routing', () => {
  it('routes a tunnel entry to its visible exit and rejects recursive routes', () => {
    const state = createDropState({
      width: 5,
      height: 8,
      tileTypes: ['a', 'b', 'c'],
      tunnels: [{ id: 'left-to-right', entryColumn: 0, exitColumn: 4 }]
    })

    expect(resolveDropColumn(state, 0)).toBe(4)
    expect(resolveDropColumn({ ...state, tunnels: [
      { id: 'one', entryColumn: 0, exitColumn: 2 },
      { id: 'two', entryColumn: 2, exitColumn: 4 }
    ] }, 0)).toBe(2)
  })

  it('treats scratch posts as fixed blocked cells when finding a landing row', () => {
    const state = createDropState({
      board: Array.from({ length: 5 }, () => Array(4).fill(null)),
      width: 4,
      height: 5,
      tileTypes: ['a', 'b', 'c'],
      scratchPosts: [{ id: 'post', x: 1, y: 4, hp: 1 }]
    })

    expect(landingRow(state.board, 1, state.scratchPosts)).toBe(3)
  })
})
