import { describe, expect, it } from 'vitest'
import { validateAuthoredPlanningLevel } from './planningValidation'
import { PLANNING_LEVELS } from '../data/planningLevels'

describe('planning level validation', () => {
  it('accepts all authored levels only when the opening board is quiet and the solution clears', () => {
    PLANNING_LEVELS.forEach(level => expect(validateAuthoredPlanningLevel(level)).toBe(level))
  })

  it('rejects an accidental opening match before the level can be shipped', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[7][0] = { id: 1, type: 'blue' as const }
    board[7][1] = { id: 2, type: 'blue' as const }
    board[7][2] = { id: 3, type: 'blue' as const }
    const level = { id: 99, width: 8, height: 8, board, cats: [], solution: [] }

    expect(() => validateAuthoredPlanningLevel(level)).toThrow('opening match')
  })
})
