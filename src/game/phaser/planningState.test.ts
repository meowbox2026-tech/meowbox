import { describe, expect, it } from 'vitest'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { freshPlanning, planningReducer, type PlanningState } from './planningState'

const reduce = (state: PlanningState, action: Parameters<typeof planningReducer>[1]) => planningReducer(state, action, level)

function failedAttempt(): PlanningState {
  let state = freshPlanning(level)
  // The first cat at (0, 0) is already proven to make the puzzle unsolvable.
  return reduce(state, { type: 'place', x: 0, y: 0 })
}

describe('planning failure boundaries', () => {
  it('defers the whole attempt after an unknown result instead of blaming a later click', () => {
    let state = reduce(freshPlanning(level), { type: 'place-pending', x: 0, y: 0 })
    state = reduce(state, { type: 'placement-result', safe: true, deferred: true })
    state = reduce(state, { type: 'place', x: 1, y: 0 })
    state = reduce(state, { type: 'place', x: 2, y: 0 })
    expect(state.placements).toHaveLength(3)
    expect(state.lives).toBe(3)
    state = reduce(state, { type: 'start' })
    while (state.phase === 'running') state = reduce(state, { type: 'tick' })
    expect(state.lives).toBe(2)
    expect(state.failureReason).toBe('resolution')
    expect(state.validationDeferred).toBe(false)
  })
  it('always places cats in card order and only takes back the latest placement', () => {
    let state = freshPlanning(level)
    expect(state.selected).toBe(level.cats[0].id)
    expect(state.undoUses).toBe(1)
    expect(state.lives).toBe(3)

    const skipped = reduce(state, { type: 'select', id: level.cats[2].id })
    expect(skipped).toBe(state)
    state = reduce(state, { type: 'place', x: level.solution[0].x, y: level.solution[0].y })
    expect(state.placements[0].catId).toBe(level.cats[0].id)
    expect(state.selected).toBe(level.cats[1].id)
    expect(state.lives).toBe(3)
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

  it('spends one life immediately when a clicked placement is proven dead', () => {
    const failed = failedAttempt()

    expect(failed.phase).toBe('editing')
    expect(failed.lives).toBe(2)
    expect(failed.failures).toBe(1)
    expect(failed.result).toBeUndefined()
    expect(failed.placements).toEqual([])
    expect(failed.selected).toBe(level.cats[0].id)
    expect(failed.undoUses).toBe(1)
    expect(failed.puzzle.cats).toEqual(level.cats)
    expect(failed.completedWaves).toBe(0)
    expect(failed.failureReason).toBe('placement')
  })

  it('keeps the board locked until an off-thread placement result arrives', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'place-pending', x: level.solution[0].x, y: level.solution[0].y })
    expect(state.validatingPlacement).toEqual(level.solution[0])
    expect(state.placements).toEqual([])
    expect(reduce(state, { type: 'place', x: level.solution[1].x, y: level.solution[1].y })).toBe(state)

    state = reduce(state, { type: 'placement-result', safe: true })
    expect(state.validatingPlacement).toBeUndefined()
    expect(state.placements).toEqual([level.solution[0]])
    expect(state.selected).toBe(level.cats[1].id)
  })

  it('spends a life only after the async result proves a pending placement dead', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'place-pending', x: 0, y: 0 })
    expect(state.lives).toBe(3)
    state = reduce(state, { type: 'placement-result', safe: false })
    expect(state.lives).toBe(2)
    expect(state.placements).toEqual([])
    expect(state.failureReason).toBe('placement')
  })

  it('keeps hint search pending without consuming the hint twice', () => {
    let state = freshPlanning(level)
    state = reduce(state, { type: 'hint-pending' })
    expect(state.pendingHint).toBe(true)
    expect(reduce(state, { type: 'hint-pending' })).toBe(state)
    state = reduce(state, { type: 'hint-result', hintCell: level.solution[0] })
    expect(state.pendingHint).toBe(false)
    expect(state.hintUses).toBe(0)
    expect(state.hintCell).toEqual(level.solution[0])
  })

  it('only opens the terminal failure state after all three lives are spent', () => {
    let state = failedAttempt()
    expect(state.phase).toBe('editing')
    state = failedAttemptFrom(state)
    expect(state.phase).toBe('editing')
    state = failedAttemptFrom(state)
    expect(state.phase).toBe('failed')
    expect(state.lives).toBe(0)
    expect(state.failures).toBe(3)
    expect(state.placements).toEqual([])
    expect(state.result).toBeUndefined()
    expect(state.failureReason).toBe('placement')
    expect(reduce(state, { type: 'restart' })).toEqual(freshPlanning(level))
  })
})

function failedAttemptFrom(start: PlanningState): PlanningState {
  return reduce(start, { type: 'place', x: 0, y: 0 })
}
