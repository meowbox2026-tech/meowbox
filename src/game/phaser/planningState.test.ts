import { describe, expect, it } from 'vitest'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { freshPlanning, planningReducer, type PlanningState } from './planningState'

const reduce = (state: PlanningState, action: Parameters<typeof planningReducer>[1]) => planningReducer(state, action, level)

function play(state: PlanningState): PlanningState {
  state = reduce(state, { type: 'start' })
  while (state.phase === 'running') state = reduce(state, { type: 'tick' })
  return state
}

function failedAttempt(): PlanningState {
  let state = freshPlanning(level)
  // Orange clears, but the two other cats are separated from its support.
  for (const [x, y] of [[4, 3], [0, 0], [1, 0]]) state = reduce(state, { type: 'place', x, y })
  return play(state)
}

describe('planning failure boundaries', () => {
  it('always places cats in card order and only takes back the latest placement', () => {
    let state = freshPlanning(level)
    expect(state.selected).toBe(level.cats[0].id)
    expect(state.undoUses).toBe(1)

    const skipped = reduce(state, { type: 'select', id: level.cats[2].id })
    expect(skipped).toBe(state)
    state = reduce(state, { type: 'place', x: 0, y: 0 })
    expect(state.placements[0].catId).toBe(level.cats[0].id)
    expect(state.selected).toBe(level.cats[1].id)
    state = reduce(state, { type: 'place', x: 1, y: 0 })

    expect(reduce(state, { type: 'remove', id: level.cats[0].id })).toBe(state)
    const recalled = reduce(state, { type: 'remove', id: level.cats[1].id })
    expect(recalled.placements.map(item => item.catId)).toEqual([level.cats[0].id])
    expect(recalled.selected).toBe(level.cats[1].id)
    expect(recalled.undoUses).toBe(0)
    expect(reduce(recalled, { type: 'remove', id: level.cats[0].id })).toBe(recalled)
  })

  it('allows one undo per level attempt and no failure-recovery ad action', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'place', x: 0, y: 0 })
    const undone = reduce(state, { type: 'undo' })
    expect(undone.placements).toEqual([])
    expect(undone.selected).toBe(level.cats[0].id)
    expect(undone.undoUses).toBe(0)
    expect(reduce(undone, { type: 'undo' })).toBe(undone)
    expect(reduce(undone, { type: 'remove', id: level.cats[0].id })).toBe(undone)
    const rewarded = reduce(undone, { type: 'ad-undo' })
    expect(rewarded.undoUses).toBe(1)
    expect(reduce(rewarded, { type: 'ad-undo' }).undoUses).toBe(2)
  })

  it('reveals the next authored solution cell once and resets on restart', () => {
    let state = freshPlanning(level)
    expect(state.hintUses).toBe(1)
    expect(state.hintCell).toBeUndefined()
    const hinted = reduce(state, { type: 'hint' })
    expect(hinted.hintUses).toBe(0)
    expect(hinted.hintCell).toEqual(level.solution[0])
    expect(reduce(hinted, { type: 'hint' })).toBe(hinted)
    const placed = reduce(hinted, { type: 'place', x: level.solution[0].x, y: level.solution[0].y })
    expect(placed.hintCell).toBeUndefined()
    expect(reduce(placed, { type: 'restart' }).hintUses).toBe(1)
  })

  it('does not resume from a half-cleared chain after failure', () => {
    const failed = failedAttempt()

    expect(failed.phase).toBe('failed')
    expect(failed.result?.remaining).toBe(6)
    expect(failed.placements).toHaveLength(level.cats.length)
    expect(failed.puzzle.cats).toEqual(level.cats)
    expect(failed.completedWaves).toBe(0)
    expect(reduce(failed, { type: 'restart' })).toEqual(freshPlanning(level))
  })
})
