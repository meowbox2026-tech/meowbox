import { describe, expect, it } from 'vitest'
import { arrangeCats, type PlanningLevel } from '../core/planningEngine'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { canResumePlanning, freshPlanning, planningReducer, stoppedBoard, type PlanningState } from './planningState'

const reduce = (state: PlanningState, action: Parameters<typeof planningReducer>[1]) => planningReducer(state, action, level)
function play(state: PlanningState): PlanningState {
  state = reduce(state, { type: 'start' })
  while (state.phase === 'running') state = reduce(state, { type: 'tick' })
  return state
}
function interrupted() {
  let state = freshPlanning(level)
  // Orange clears, but the two other cats are separated from its support.
  for (const [x, y] of [[4, 3], [0, 0], [1, 0]]) state = reduce(state, { type: 'place', x, y })
  return play(state)
}

describe('planning checkpoint retries', () => {
  it('keeps cleared progress and allows only surviving player cats to move', () => {
    const failed = interrupted()
    expect(failed.result?.remaining).toBe(6)
    const edit = reduce(failed, { type: 'edit' })
    expect(edit.retries).toBe(1)
    expect(arrangeCats(edit.puzzle, edit.placements)).toEqual(stoppedBoard(failed).map(row => row.map(cat => cat && {
      ...cat, ...(cat.id === 8 ? { placementOrder: 1 } : cat.id === 9 ? { placementOrder: 2 } : {})
    })))
    expect(edit.puzzle.cats.map(cat => cat.id)).toEqual([8, 9])
    expect(reduce(edit, { type: 'remove', id: 1 })).toBe(edit)
    expect(reduce(edit, { type: 'select', id: 7 })).toBe(edit)
    const cleared = reduce(edit, { type: 'clear' })
    expect(arrangeCats(cleared.puzzle, cleared.placements)?.flat().filter(Boolean).map(cat => cat!.id).sort()).toEqual([1, 2, 5, 6])
    expect(cleared.retries).toBe(1)
  })

  it('finishes from the checkpoint without replaying or resurrecting earlier cats', () => {
    let state = reduce(interrupted(), { type: 'edit' })
    state = reduce(state, { type: 'clear' })
    state = reduce(state, { type: 'place', x: 4, y: 5 })
    state = reduce(state, { type: 'place', x: 4, y: 4 })
    state = play(state)
    expect(state.phase).toBe('completed')
    expect(state.result?.waves).toBe(2)
    expect(state.completedWaves + state.result!.waves).toBe(3)
    expect(state.failures).toBe(1)
  })

  it('spends exactly two free retries, then accepts one rewarded retry at a time', () => {
    let state = interrupted()
    expect(state.retries).toBe(2)
    expect(reduce(state, { type: 'ad-retry' })).toBe(state)
    for (const remaining of [1, 0]) {
      state = reduce(state, { type: 'edit' })
      expect(state.retries).toBe(remaining)
      expect(reduce(state, { type: 'edit' })).toBe(state)
      state = play(state)
      expect(state.phase).toBe('failed')
    }
    expect(reduce(state, { type: 'edit' })).toBe(state)
    const rewarded = reduce(state, { type: 'ad-retry' })
    expect(rewarded.phase).toBe('editing')
    expect(rewarded.retries).toBe(0)
    expect(reduce(rewarded, { type: 'ad-retry' })).toBe(rewarded)
    expect(reduce(play(rewarded), { type: 'restart' })).toEqual(freshPlanning(level))
  })

  it('retains the current coordinates of original cats after gravity', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[0][0] = { id: 1, type: 'blue' }
    board[2][0] = { id: 2, type: 'orange' }
    board[3][0] = { id: 3, type: 'orange' }
    const puzzle: PlanningLevel = { id: 99, width: 8, height: 8, board, cats: [{ id: 4, type: 'orange' }, { id: 5, type: 'white' }], solution: [] }
    let state = freshPlanning(puzzle)
    state = reduce(state, { type: 'place', x: 0, y: 1 })
    state = reduce(state, { type: 'place', x: 1, y: 0 })
    state = reduce(play(state), { type: 'edit' })
    expect(state.puzzle.board[7][0]?.id).toBe(1)
    expect(state.puzzle.board[0][0]).toBeNull()
    expect(reduce(state, { type: 'remove', id: 1 })).toBe(state)
  })

  it('does not sell or spend a retry when no placed cats survive', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[7][7] = { id: 20, type: 'white' }
    const puzzle: PlanningLevel = { id: 99, width: 8, height: 8, board,
      cats: [1, 2, 3].map(id => ({ id, type: 'orange' })), solution: [] }
    let state = freshPlanning(puzzle)
    for (let x = 0; x < 3; x++) state = reduce(state, { type: 'place', x, y: 7 })
    state = play(state)
    expect(canResumePlanning(state)).toBe(false)
    expect(reduce(state, { type: 'edit' })).toBe(state)
    expect(reduce({ ...state, retries: 0 }, { type: 'ad-retry' }).phase).toBe('failed')
  })
})
