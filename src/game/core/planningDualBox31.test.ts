import { describe, expect, it } from 'vitest'
import { arrangeCats, resolvePlanning, findPlanningMatchGroups } from './planningEngine'
import { DUAL_BOX_LEVEL_31 as level } from '../data/planningDualBoxLevel31'
import { getDualBoxPortals } from './planningDualBox'

describe('world two twin tunnels', () => {
  it('uses two opposing tunnels to connect six waves and four transferred cats', () => {
    expect(findPlanningMatchGroups(level.board, level.dualBox)).toHaveLength(0)
    expect(level.cats).toHaveLength(8)
    const result = resolvePlanning(arrangeCats(level, level.solution)!, level.dualBox)
    expect(result.remaining).toBe(0)
    expect(result.waves).toBe(6)
    expect(result.frames.flatMap(frame => frame.transfers ?? []).map(event => event.portalId)).toEqual(['A', 'A', 'B', 'B'])
  })
  it('rejects placing the left-box relay cat straight into the right box', () => {
    expect(arrangeCats(level, [{ catId: 3102, x: 5, y: 7 }])).toBeUndefined()
    expect(arrangeCats(level, [{ catId: 3106, x: 1, y: 4 }])).toBeUndefined()
  })
  it('cannot finish the authored route with either tunnel disabled', () => {
    for (const id of ['A', 'B']) {
      const config = { ...level.dualBox!, portals: level.dualBox!.portals!.filter(p => p.id !== id) }
      expect(resolvePlanning(arrangeCats(level, level.solution)!, config).remaining).toBeGreaterThan(0)
    }
  })
  it('reserves every inlet and outlet and rejects a broken relay', () => {
    for (const portal of getDualBoxPortals(level.dualBox!)) {
      for (const cell of [portal.entry, portal.exit]) {
        expect(arrangeCats(level, [{ catId: level.cats[0].id, ...cell }])).toBeUndefined()
      }
    }
    const wrong = level.solution.map(p => ({ ...p }))
    wrong[1] = { ...wrong[1], x: 2, y: 4 }
    expect(resolvePlanning(arrangeCats(level, wrong)!, level.dualBox).remaining).toBeGreaterThan(0)
  })
})
