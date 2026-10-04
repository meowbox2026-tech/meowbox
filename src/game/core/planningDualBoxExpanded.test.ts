import { describe, expect, it } from 'vitest'
import { EXPANDED_DUAL_BOX_LEVELS } from '../data/planningDualBoxExpanded'
import { arrangeCats, findPlanningMatchGroups, resolvePlanning } from './planningEngine'

describe('expanded three-route boxes', () => {
  it('keeps the wider final chapter harder with more placement decisions', () => {
    const level70 = EXPANDED_DUAL_BOX_LEVELS.get(70)!
    const level71 = EXPANDED_DUAL_BOX_LEVELS.get(71)!
    expect(level71.cats.length).toBeGreaterThan(level70.cats.length)
    expect(EXPANDED_DUAL_BOX_LEVELS.get(90)!.cats).toHaveLength(30)
  })
  for (let id = 51; id <= 90; id++) {
    it(`solves level ${id} and requires A, B and C`, () => {
      const level = EXPANDED_DUAL_BOX_LEVELS.get(id)!
      expect(level.dualBox!.splitAt).toBe(id <= 70 ? 5 : 6)
      expect(level.width).toBe(level.dualBox!.splitAt * 2)
      expect(level.height).toBe(8)
      expect(findPlanningMatchGroups(level.board, level.dualBox)).toHaveLength(0)
      const board = arrangeCats(level, level.solution)
      expect(board).toBeDefined()
      const result = resolvePlanning(board!, level.dualBox)
      expect(result.remaining).toBe(0)
      expect(new Set(result.frames.flatMap(f => f.transfers ?? []).map(t => t.portalId))).toEqual(new Set(['A', 'B', 'C']))
      for (const portal of level.dualBox!.portals!) {
        const config = { ...level.dualBox!, portals: level.dualBox!.portals!.filter(p => p.id !== portal.id) }
        expect(resolvePlanning(board!, config).remaining).toBeGreaterThan(0)
        for (const cell of [portal.entry, portal.exit]) expect(level.board[cell.y][cell.x]).toBeNull()
      }
    })
  }
})
