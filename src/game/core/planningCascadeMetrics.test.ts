import { describe, expect, it } from 'vitest'
import { measurePlanningCascades } from './planningCascadeMetrics'
import type { PlanningLevel } from './planningEngine'

function dropPuzzle(): PlanningLevel {
  const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
  board[6][0] = { id: 1, type: 'orange' }
  board[6][1] = { id: 2, type: 'orange' }
  board[7][1] = { id: 3, type: 'blue' }
  board[7][2] = { id: 4, type: 'blue' }
  return { id: 1, width: 8, height: 8, board,
    cats: [{ id: 5, type: 'orange' }, { id: 6, type: 'blue' }],
    solution: [{ catId: 5, x: 2, y: 6 }, { catId: 6, x: 0, y: 5 }] }
}

describe('drop-created cascade metrics', () => {
  it('counts a placed cat that must fall before joining a new line', () => {
    expect(measurePlanningCascades(dropPuzzle())).toEqual({ remaining: 0, waves: 2,
      openingGroups: 1, dependentWaves: 1, longestChain: 1, delayedTrayCats: 1 })
  })
  it('does not count an already completed waiting line as a dependency', () => {
    const level = dropPuzzle()
    level.solution[1] = { catId: 6, x: 0, y: 7 }
    expect(measurePlanningCascades(level)).toEqual({ remaining: 0, waves: 2,
      openingGroups: 2, dependentWaves: 0, longestChain: 0, delayedTrayCats: 0 })
  })
  it('rejects an invalid witness rather than producing misleading design metrics', () => {
    const level = dropPuzzle()
    level.solution[0].x = -1
    expect(() => measurePlanningCascades(level)).toThrow('solution does not fit')
  })
})
