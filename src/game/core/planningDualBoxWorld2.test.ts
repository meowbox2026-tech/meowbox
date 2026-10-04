import { describe, expect, it } from 'vitest'
import { DUAL_BOX_WORLD_2 } from '../data/planningDualBoxWorld2'
import { arrangeCats, findPlanningMatchGroups, resolvePlanning } from './planningEngine'
import { getDualBoxPortals } from './planningDualBox'

describe('world two progressive tunnel puzzles', () => {
  it('increases authored chain depth and placement decisions across 32–50', () => {
    let waves = 6
    let placements = 8
    for (let id = 32; id <= 50; id++) {
      const level = DUAL_BOX_WORLD_2.get(id)!
      expect(findPlanningMatchGroups(level.board, level.dualBox), `opening ${id}`).toHaveLength(0)
      const board = arrangeCats(level, level.solution)
      expect(board, `valid route ${id}`).toBeDefined()
      const result = resolvePlanning(board!, level.dualBox)
      expect(result.remaining, `solved ${id}`).toBe(0)
      expect(result.waves, `depth ${id}`).toBeGreaterThanOrEqual(waves)
      expect(level.cats.length, `placements ${id}`).toBeGreaterThanOrEqual(placements)
      expect(result.waves > waves || level.cats.length > placements, `progression ${id}`).toBe(true)
      expect(result.frames.flatMap(f => f.transfers ?? []).length).toBe(result.waves - 2)
      waves = result.waves
      placements = level.cats.length
    }
    expect(waves).toBe(10)
    expect(placements).toBe(23)
  })
  it('varies tunnel coordinates and the first placement in every adjacent level', () => {
    let previousRoutes = ''
    let previousFirst = ''
    for (let id = 32; id <= 50; id++) {
      const level = DUAL_BOX_WORLD_2.get(id)!
      const routes = JSON.stringify(level.dualBox?.portals)
      expect(routes).not.toBe(previousRoutes)
      const first = `${level.solution[0].x},${level.solution[0].y}`
      expect(first).not.toBe(previousFirst)
      previousRoutes = routes
      previousFirst = first
    }
  })
  for (let id = 32; id <= 50; id++) {
    it(`requires both tunnels and enforces home boxes in level ${id}`, () => {
      const level = DUAL_BOX_WORLD_2.get(id)!
      const board = arrangeCats(level, level.solution)!
      for (const portal of getDualBoxPortals(level.dualBox!)) {
        const config = { ...level.dualBox!, portals: getDualBoxPortals(level.dualBox!).filter(p => p.id !== portal.id) }
        expect(resolvePlanning(board, config).remaining).toBeGreaterThan(0)
        for (const cell of [portal.entry, portal.exit]) {
          expect(level.board[cell.y][cell.x]).toBeNull()
          expect(arrangeCats(level, [{ catId: level.cats[0].id, ...cell }])).toBeUndefined()
        }
      }
      // Unique relay colors: two immovable destination anchors and one source-box tray cat.
      // With no horizontal movement, neither receiving pair can travel to the other tunnel.
      for (const relayId of [id * 100 + 3, id * 100 + 5]) {
        const relay = level.cats.find(cat => cat.id === relayId)!
        expect(level.cats.filter(cat => cat.type === relay.type)).toHaveLength(1)
        const anchors = level.board.flatMap((row, y) => row.flatMap((cat, x) =>
          cat?.type === relay.type ? [{ x, y }] : []))
        expect(anchors).toHaveLength(2)
        for (const anchor of anchors) {
          expect(anchor.x < 4).toBe(relay.homeBox !== 'left')
          expect(getDualBoxPortals(level.dualBox!).some(p => p.entry.x === anchor.x)).toBe(false)
        }
      }
      for (const placement of level.solution) {
        const x = (placement.x + 4) % 8
        expect(arrangeCats(level, [{ ...placement, x }])).toBeUndefined()
      }
    })
  }
})
