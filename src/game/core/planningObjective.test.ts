import { describe, expect, it } from 'vitest'
import { getPlanningObjective, summarizePlanningObjective } from './planningObjective'
import { PLANNING_LEVELS } from '../data/planningLevels'

describe('planning objectives', () => {
  it('counts unique clearing cells rather than counting intersecting lines twice', () => {
    const level = PLANNING_LEVELS[0]
    const objective = summarizePlanningObjective(level)

    expect(objective.groups).toBe(3)
    expect(objective.totalClearingCells).toBe(9)
    expect(objective.largestGroup).toBe(3)
    expect(Object.values(objective.lineCounts).reduce((sum, count) => sum + count, 0)).toBe(3)
  })

  it('reports the authored gravity waves and caches the same level summary', () => {
    const level = PLANNING_LEVELS[0]
    const first = getPlanningObjective(level)
    const second = getPlanningObjective(level)

    expect(first.gravityWaves).toBeGreaterThan(0)
    expect(second).toBe(first)
  })

  it('counts a crossing as one five-cell group, not two three-cell lines', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    ;[[3, 2], [3, 3], [3, 4], [2, 3], [4, 3]].forEach(([x, y], index) => {
      board[y][x] = { id: index + 1, type: 'blue' as const }
    })
    const objective = summarizePlanningObjective({ id: 98, width: 8, height: 8, board, cats: [], solution: [] })

    expect(objective.groups).toBe(1)
    expect(objective.totalClearingCells).toBe(5)
    expect(objective.largestGroup).toBe(5)
    expect(objective.lineCounts).toEqual({ horizontal: 1, vertical: 1, diagonal: 0 })
  })

  it('exposes a valid condition summary for every authored level', () => {
    PLANNING_LEVELS.forEach(level => {
      const objective = getPlanningObjective(level)
      expect(objective.groups, `level ${level.id} groups`).toBeGreaterThan(0)
      expect(objective.totalClearingCells, `level ${level.id} clear count`).toBe(level.board.flat().filter(Boolean).length + level.cats.length)
      expect(objective.largestGroup, `level ${level.id} group size`).toBeGreaterThanOrEqual(3)
    })
  })
})
