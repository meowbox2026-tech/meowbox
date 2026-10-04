import { describe, expect, it } from 'vitest'
import { arrangeCats, findPlanningMatchGroups, resolvePlanning } from './planningEngine'
import { GRAVITY_FLIP_LEVEL_51 as level } from '../data/planningGravityFlipLevel51'
import { findSafePlacement } from './planningSolvability'
import { settlePlanningUp, clearPlanningUp } from './planningGravityFlip'

describe('level 51 gravity flip', () => {
  it('flips upward after clearing the switch, then chains blue and white at the ceiling', () => {
    expect(findPlanningMatchGroups(level.board)).toHaveLength(0)
    const board = arrangeCats(level, level.solution)!
    const result = resolvePlanning(board, undefined, level.gravityFlip)
    expect(result.remaining).toBe(0)
    expect(result.waves).toBe(3)
    expect(result.frames.filter(frame => frame.flipped)).toHaveLength(1)
    expect(result.frames[0].gravity).toBe('down')
    expect(result.frames[1].gravity).toBe('up')
    expect(result.frames[1].board[0].slice(1, 4).map(cat => cat?.type)).toEqual(['blue', 'blue', 'blue'])
    expect(resolvePlanning(board).remaining).toBeGreaterThan(0)
  })
  it('keeps stack order upward and uses the ceiling as the support', () => {
    const settled = settlePlanningUp(arrangeCats(level, level.solution)!)
    expect(settled[0][2]?.type).toBe('blue')
    expect(settled[1][2]?.type).toBe('white')
    const next = clearPlanningUp(settled, [{ x: 2, y: 0 }])
    expect(next[0][2]?.type).toBe('white')
    expect(next[1][2]?.type).toBe('orange')
  })
  it('provides hints that use the flip rules', () => {
    expect(findSafePlacement(level, [])).toEqual(level.solution[0])
    expect(findSafePlacement(level, [level.solution[0]])).toEqual(level.solution[1])
  })
})
