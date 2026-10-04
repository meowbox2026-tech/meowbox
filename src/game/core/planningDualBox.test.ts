import { describe, expect, it } from 'vitest'
import { arrangeCats, findPlanningMatchGroups, resolvePlanning } from './planningEngine'
import { transferDualBoxCats } from './planningDualBox'
import { DUAL_BOX_LEVEL_61 } from '../data/planningDualBoxLevel'
import { canCompletePlanning } from './planningSolvability'

const puzzle = DUAL_BOX_LEVEL_61

describe('dual box preview', () => {
  it('clears level 61 with a left clear, two transfers, and two right clears', () => {
    const board = arrangeCats(puzzle, puzzle.solution)!
    expect(findPlanningMatchGroups(puzzle.board, puzzle.dualBox)).toEqual([])
    const result = resolvePlanning(board, puzzle.dualBox)
    expect(result.remaining).toBe(0)
    expect(result.waves).toBe(3)
    expect(result.frames.flatMap(frame => frame.transfers ?? []).map(event => event.catId)).toEqual([6102, 3])
    expect(resolvePlanning(board).remaining).toBeGreaterThan(0)
    expect(canCompletePlanning(puzzle, puzzle.solution)).toBe(true)
  })
  it('rejects placement directly in a portal', () => {
    expect(arrangeCats(puzzle, [{ catId: 6101, x: 1, y: 7 }])).toBeUndefined()
    expect(arrangeCats(puzzle, [{ catId: 6101, x: 5, y: 4 }])).toBeUndefined()
  })
  it('never matches across the wall between boxes', () => {
    const board = puzzle.board.map(row => row.map(() => null)) as typeof puzzle.board
    for (const x of [2, 3, 4]) board[0][x] = { id: x + 1, type: 'orange' }
    expect(findPlanningMatchGroups(board, puzzle.dualBox)).toEqual([])
    expect(findPlanningMatchGroups(board)).toHaveLength(1)
  })
  it('waits when the outlet is occupied without losing or duplicating cats', () => {
    const board = puzzle.board.map(row => row.map(() => null)) as typeof puzzle.board
    board[7][1] = { id: 10, type: 'blue' }
    board[4][5] = { id: 11, type: 'white' }
    const blocked = transferDualBoxCats(board, puzzle.dualBox!)
    expect(blocked.transfers).toEqual([])
    expect(blocked.board[7][1]?.id).toBe(10)
    blocked.board[4][5] = null
    const open = transferDualBoxCats(blocked.board, puzzle.dualBox!)
    expect(open.board[7][5]?.id).toBe(10)
    expect(open.board.flat().filter(Boolean)).toHaveLength(1)
    expect(board[7][1]?.id).toBe(10)
  })
})
