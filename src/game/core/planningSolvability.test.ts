import { describe, expect, it } from 'vitest'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { PLANNING_LEVELS } from '../data/planningLevels'
import { canCompletePlanning, findSafePlacement, shouldValidatePlacementImmediately } from './planningSolvability'

describe('planning placement solvability', () => {
  it('accepts the authored route and rejects a proven dead first placement', () => {
    expect(canCompletePlanning(level, [level.solution[0]])).toBe(true)
    expect(canCompletePlanning(level, [{ catId: level.cats[0].id, x: 0, y: 0 }])).toBe(false)
  })

  it('finds a safe placement without requiring the authored cell to be unique', () => {
    expect(findSafePlacement(level, [])).toEqual(level.solution[0])
  })

  it('accepts a valid alternative route instead of only the authored solution', () => {
    const empty = Array.from({ length: 8 }, () => Array(8).fill(null))
    const multiple = {
      id: 1,
      width: 8,
      height: 8,
      board: empty,
      cats: [{ id: 1, type: 'blue' as const }, { id: 2, type: 'blue' as const }, { id: 3, type: 'blue' as const }],
      solution: [{ catId: 1, x: 5, y: 7 }, { catId: 2, x: 6, y: 7 }, { catId: 3, x: 7, y: 7 }]
    }
    expect(canCompletePlanning(multiple, [{ catId: 1, x: 0, y: 0 }])).toBe(true)
  })

  it('limits immediate validation to levels 1 through 20', () => {
    expect(shouldValidatePlacementImmediately({ ...level, id: 20 })).toBe(true)
    expect(shouldValidatePlacementImmediately({ ...level, id: 21 })).toBe(false)
  })

  it('recognizes every authored prefix through level twenty', () => {
    PLANNING_LEVELS.filter(item => item.id <= 20).forEach(item => {
      for (let length = 0; length <= item.solution.length; length += 1) {
        expect(canCompletePlanning(item, item.solution.slice(0, length)), `level ${item.id} prefix ${length}`).toBe(true)
      }
    })
  })

  it('can prove a dead first click on the dense bridge level', () => {
    const dense = PLANNING_LEVELS.find(item => item.id === 20)!
    expect(canCompletePlanning(dense, [{ catId: dense.cats[0].id, x: 0, y: 0 }])).toBe(false)
  }, 20_000)

  it('finds a safe hint on the dense bridge level', () => {
    const dense = PLANNING_LEVELS.find(item => item.id === 20)!
    expect(findSafePlacement(dense, [])).toBeDefined()
  }, 20_000)
})
