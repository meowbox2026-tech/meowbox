import { describe, expect, it } from 'vitest'
import { measurePlanningCascades } from '../core/planningCascadeMetrics'
import { PLANNING_LEVELS } from './planningLevels'

// These are data-design guarantees, not additional win conditions for players.
describe('world two reverse-drop progression', () => {
  it('requires increasingly long drop-created chains in each ten-level stage', () => {
    for (const level of PLANNING_LEVELS.slice(30, 60)) {
      const stage = Math.floor((level.id - 31) / 10)
      const report = measurePlanningCascades(level)
      expect(report.remaining, `level ${level.id} solvable`).toBe(0)
      expect(report.longestChain, `level ${level.id} chain`).toBeGreaterThanOrEqual(2 + stage)
      expect(report.dependentWaves, `level ${level.id} dependencies`).toBeGreaterThanOrEqual(4 + stage * 2)
      expect(report.delayedTrayCats, `level ${level.id} placed cats must wait for drops`).toBeGreaterThanOrEqual(3 + stage)
      expect(report.openingGroups, `level ${level.id} immediately visible groups`).toBeLessThanOrEqual(7 - stage)
    }
  })
})
