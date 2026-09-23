import { describe, expect, it } from 'vitest'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { freshPlanning, planningReducer, type PlanningState } from './planningState'

const reduce = (state: PlanningState, action: Parameters<typeof planningReducer>[1]) => planningReducer(state, action, level)

describe('planning failure boundaries', () => {
  it('keeps arbitrary placements editable instead of spending a life', () => {
    const state = reduce(freshPlanning(level), { type: 'place', x: 0, y: 0 })
    expect(state.placements).toHaveLength(1)
    expect(state.failures).toBe(0)
  })

  it('resets a failed complete arrangement without a life system', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'place', x: 0, y: 0 })
    state = reduce(state, { type: 'place', x: 1, y: 0 })
    state = reduce(state, { type: 'place', x: 2, y: 0 })
    state = reduce(state, { type: 'start' })
    while (state.phase === 'running') state = reduce(state, { type: 'tick' })
    expect(state.phase).toBe('editing')
    expect(state.failures).toBe(1)
    expect(state.placements).toEqual([])
    expect(state.failureReason).toBe('resolution')
  })
  it('always places cats in card order and only takes back the latest placement', () => {
    let state = freshPlanning(level)
    expect(state.selected).toBe(level.cats[0].id)
    expect(state.undoUses).toBe(1)
    const skipped = reduce(state, { type: 'select', id: level.cats[2].id })
    expect(skipped).toBe(state)
    state = reduce(state, { type: 'place', x: level.solution[0].x, y: level.solution[0].y })
    expect(state.placements[0].catId).toBe(level.cats[0].id)
    expect(state.selected).toBe(level.cats[1].id)
    state = reduce(state, { type: 'place', x: level.solution[1].x, y: level.solution[1].y })

    expect(reduce(state, { type: 'remove', id: level.cats[0].id })).toBe(state)
    const recalled = reduce(state, { type: 'remove', id: level.cats[1].id })
    expect(recalled.placements.map(item => item.catId)).toEqual([level.cats[0].id])
    expect(recalled.selected).toBe(level.cats[1].id)
    expect(recalled.undoUses).toBe(0)
    expect(reduce(recalled, { type: 'remove', id: level.cats[0].id })).toBe(recalled)
  })

  it('allows one undo per configuration attempt without a failure-recovery ad action', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'place', x: level.solution[0].x, y: level.solution[0].y })
    const undone = reduce(state, { type: 'undo' })
    expect(undone.placements).toEqual([])
    expect(undone.selected).toBe(level.cats[0].id)
    expect(undone.undoUses).toBe(0)
    expect(reduce(undone, { type: 'undo' })).toBe(undone)
    expect(reduce(undone, { type: 'remove', id: level.cats[0].id })).toBe(undone)
  })

  it('auto-places the next cat at the authored solution cell once and resets on restart', () => {
    let state = freshPlanning(level)
    expect(state.hintUses).toBe(1)
    expect(state.hintCell).toBeUndefined()
    const hinted = reduce(state, { type: 'hint' })
    expect(hinted.hintUses).toBe(0)
    expect(hinted.placements).toEqual([level.solution[0]])
    expect(hinted.selected).toBe(level.cats[1].id)
    expect(hinted.hintCell).toEqual(level.solution[0])
    expect(reduce(hinted, { type: 'hint' })).toBe(hinted)
    const placed = reduce(hinted, { type: 'place', x: level.solution[0].x, y: level.solution[0].y })
    expect(placed).toBe(hinted)
    expect(reduce(placed, { type: 'restart' }).hintUses).toBe(1)
  })

  it('keeps hint search pending without consuming the hint twice', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'hint-pending' })
    expect(state.pendingHint).toBe(true)
    expect(reduce(state, { type: 'hint-pending' })).toBe(state)
    state = reduce(state, { type: 'hint-result', hintCell: level.solution[0] })
    expect(state.pendingHint).toBe(false)
    expect(state.hintUses).toBe(0)
    expect(state.placements).toEqual([level.solution[0]])
    expect(state.selected).toBe(level.cats[1].id)
    expect(state.hintCell).toEqual(level.solution[0])
  })

  it('keeps the level retryable after repeated failed arrangements', () => {
    let state = freshPlanning(level)
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      state = failedAttemptFrom(state)
      expect(state.phase).toBe('editing')
      expect(state.failures).toBe(attempt)
      expect(state.placements).toEqual([])
    }
    expect(state.result).toBeUndefined()
    expect(reduce(state, { type: 'restart' })).toEqual(freshPlanning(level))
  })
})

function failedAttemptFrom(start: PlanningState): PlanningState {
  let state = reduce(start, { type: 'place', x: 0, y: 0 })
  state = reduce(state, { type: 'place', x: 1, y: 0 })
  state = reduce(state, { type: 'place', x: 2, y: 0 })
  state = reduce(state, { type: 'start' })
  while (state.phase === 'running') state = reduce(state, { type: 'tick' })
  return state
}
