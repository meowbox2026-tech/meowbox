import { describe, expect, it } from 'vitest'
import { arrangeCats, findPlanningMatchGroups, resolvePlanning } from './planningEngine'
import { DIVIDER_LEVEL_51 as level } from '../data/planningDividerLevel51'
import { findSafePlacement } from './planningSolvability'

describe('level 51 removable divider', () => {
  it('blocks cross-divider lines and opens only when the scissors cat clears', () => {
    expect(findPlanningMatchGroups(level.board, undefined, level.divider)).toHaveLength(0)
    expect(findPlanningMatchGroups(level.board)).toHaveLength(1)
    const board = arrangeCats(level, level.solution)!
    const opening = findPlanningMatchGroups(board, undefined, level.divider)
    expect(opening).toHaveLength(1)
    expect(opening[0].cells.every(cell => board[cell.y][cell.x]?.type === 'orange')).toBe(true)
    const result = resolvePlanning(board, undefined, undefined, level.divider)
    expect(result.remaining).toBe(0)
    expect(result.waves).toBe(3)
    expect(result.frames[0].dividerClosed).toBe(true)
    expect(result.frames[1].dividerClosed).toBe(false)
    expect(result.frames.filter(frame => frame.dividerOpened)).toHaveLength(1)
    const noKey = { ...level.divider!, keyCatIds: [] }
    expect(resolvePlanning(board, undefined, undefined, noKey).remaining).toBe(6)
  })
  it('returns legal hints under the divider rules', () => {
    expect(findSafePlacement(level, [])).toEqual(level.solution[0])
    expect(findSafePlacement(level, [level.solution[0]])).toEqual(level.solution[1])
  })
  it('prevents diagonal matches crossing the divider', () => {
    const board = level.board.map(row => row.map(() => null)) as typeof level.board
    board[0][2] = { id: 1, type: 'blue' }
    board[1][3] = { id: 2, type: 'blue' }
    board[2][4] = { id: 3, type: 'blue' }
    expect(findPlanningMatchGroups(board)).toHaveLength(1)
    expect(findPlanningMatchGroups(board, undefined, level.divider)).toHaveLength(0)
  })
})
