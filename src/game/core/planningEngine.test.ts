import { describe, expect, it } from 'vitest'
import { arrangeCats, resolvePlanning } from './planningEngine'
import { PLANNING_LEVEL_ONE as level, PLANNING_LEVEL_ONE_SOLUTION as solution } from '../data/planningLevelOne'
import { findDropMatches } from './dropEngine'

describe('first planning puzzle', () => {
  it('does not pull disconnected cats above or below a clear down the same column', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[0][0] = { id: 10, type: 'alone' }
    for (let y = 2; y <= 4; y++) board[y][0] = { id: y, type: 'white' }
    board[6][0] = { id: 11, type: 'blue' }
    const result = resolvePlanning(board)
    expect(result.frames[1].board[0][0]?.id).toBe(10)
    expect(result.frames[1].board[6][0]?.id).toBe(11)
  })

  it('drops the supported stack in order, stopping on an untouched floating cat', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[0][0] = { id: 10, type: 'alone' }
    board[1][0] = { id: 11, type: 'blue' }
    for (let y = 2; y <= 4; y++) board[y][0] = { id: y, type: 'white' }
    board[6][0] = { id: 12, type: 'orange' }
    const result = resolvePlanning(board)
    expect(result.frames[1].board[4][0]?.id).toBe(10)
    expect(result.frames[1].board[5][0]?.id).toBe(11)
    expect(result.frames[1].board[6][0]?.id).toBe(12)
    expect(board[0][0]?.id).toBe(10)
  })

  it('requires the level five black cat to touch the white support', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[1][7] = { id: 10, type: 'alone' }
    for (let y = 3; y <= 5; y++) board[y][7] = { id: y, type: 'white' }
    board[6][7] = { id: 11, type: 'alone' }
    board[7][7] = { id: 12, type: 'alone' }
    expect(resolvePlanning(board).remaining).toBe(3)
    board[2][7] = board[1][7]
    board[1][7] = null
    expect(resolvePlanning(board).remaining).toBe(0)
  })
  it('has a stable 8x8 board, three public cats and no initial matches', () => {
    expect(level.board).toHaveLength(8)
    expect(level.board.every(row => row.length === 8)).toBe(true)
    expect(level.cats).toHaveLength(3)
    expect(findDropMatches(level.board)).toEqual([])
  })
  it('places cats at exact cells and clears all nine cats in three waves', () => {
    const board = arrangeCats(level, solution)!
    expect(board.flat().filter(Boolean)).toHaveLength(9)
    expect(board[3][4]?.id).toBe(7)
    expect(board[2][4]?.id).toBe(8)
    expect(board[1][4]?.id).toBe(9)
    expect(findDropMatches(board)).toHaveLength(3)
    const result = resolvePlanning(board)
    expect(result.remaining).toBe(0)
    expect(result.waves).toBe(3)
    expect(result.frames.filter(frame => frame.clearing.length).map(frame => frame.clearing.length)).toEqual([3, 3, 3])
    expect(board.flat().filter(Boolean)).toHaveLength(9)
    expect(level.board.flat().filter(Boolean)).toHaveLength(6)
  })
  it('keeps the exact cells when placement order changes', () => {
    const board = arrangeCats(level, [solution[2], solution[0], solution[1]])!
    expect(board[3][4]?.id).toBe(7)
    expect(board[2][4]?.id).toBe(8)
    expect(board[1][4]?.id).toBe(9)
    expect(resolvePlanning(board).remaining).toBe(0)
  })
  it('serializes separate matches instead of clearing them simultaneously', () => {
    const board = arrangeCats(level, solution)!
    for (let x = 5; x < 8; x++) board[7][x] = { id: 20 + x, type: 'alone' }
    const result = resolvePlanning(board)
    expect(result.frames[0].clearing).toHaveLength(3)
    expect(result.frames[0].clearing).not.toContain(25)
    expect(result.waves).toBe(4)
    expect(result.remaining).toBe(0)
  })
  it('rejects duplicate, unknown, out of bounds and overflowing placements', () => {
    expect(arrangeCats(level, [solution[0], solution[0]])).toBeUndefined()
    expect(arrangeCats(level, [{ catId: 999, x: 2, y: 2 }])).toBeUndefined()
    expect(arrangeCats(level, [{ catId: 7, x: -1, y: 2 }])).toBeUndefined()
    expect(arrangeCats(level, [{ catId: 7, x: 8, y: 2 }])).toBeUndefined()
    expect(arrangeCats(level, [{ catId: 7, x: 2, y: 7 }])).toBeUndefined()
    const full = level.board.map(row => row.map(() => ({ id: 50, type: 'orange' })))
    expect(arrangeCats({ ...level, board: full }, [solution[0]])).toBeUndefined()
  })
  it('does not move another cat when a middle placement is removed', () => {
    const placements = [solution[0], solution[1], solution[2]]
    const board = arrangeCats(level, placements.filter(item => item.catId !== 8))!
    expect(board[3][4]?.id).toBe(7)
    expect(board[2][4]).toBeNull()
    expect(board[1][4]?.id).toBe(9)
  })

  it('uses the earliest placement order when two match groups are ready', () => {
    const empty = Array.from({ length: 8 }, () => Array(8).fill(null))
    const level = {
      id: 99,
      width: 8,
      height: 8,
      board: empty,
      cats: [
        { id: 1, type: 'blue' as const }, { id: 2, type: 'blue' as const }, { id: 3, type: 'blue' as const },
        { id: 4, type: 'orange' as const }, { id: 5, type: 'orange' as const }, { id: 6, type: 'orange' as const }
      ],
      solution: []
    }
    const board = arrangeCats(level, [
      { catId: 1, x: 5, y: 7 }, { catId: 2, x: 6, y: 7 }, { catId: 3, x: 7, y: 7 },
      { catId: 4, x: 0, y: 7 }, { catId: 5, x: 1, y: 7 }, { catId: 6, x: 2, y: 7 }
    ])!
    const result = resolvePlanning(board)
    expect(result.frames[0].clearing).toEqual([1, 2, 3])
    expect(result.frames[2].clearing).toEqual([4, 5, 6])
  })

  it('clears a gravity cascade before returning to another original group', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[4][0] = { id: 4, type: 'blue' }
    board[5][0] = { id: 1, type: 'orange', placementOrder: 1 }
    board[6][0] = { id: 2, type: 'orange', placementOrder: 2 }
    board[7][0] = { id: 3, type: 'orange', placementOrder: 3 }
    board[7][1] = { id: 5, type: 'blue' }
    board[7][2] = { id: 6, type: 'blue' }
    board[7][5] = { id: 7, type: 'orange', placementOrder: 4 }
    board[7][6] = { id: 8, type: 'orange', placementOrder: 5 }
    board[7][7] = { id: 9, type: 'orange', placementOrder: 6 }

    const result = resolvePlanning(board)

    expect(result.frames.filter(frame => frame.clearing.length).map(frame => frame.clearing)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])
  })

  it('clears a crossing shape as one connected group', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[2][3] = { id: 1, type: 'blue' }
    board[3][3] = { id: 2, type: 'blue' }
    board[4][3] = { id: 3, type: 'blue' }
    board[3][2] = { id: 4, type: 'blue' }
    board[3][4] = { id: 5, type: 'blue' }
    const result = resolvePlanning(board)
    expect(new Set(result.frames[0].clearing)).toEqual(new Set([1, 2, 3, 4, 5]))
    expect(result.waves).toBe(1)
  })

  it('uses top-to-bottom then left-to-right order for groups made only of fixed cats', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[1][0] = { id: 1, type: 'orange' }
    board[1][1] = { id: 2, type: 'orange' }
    board[1][2] = { id: 3, type: 'orange' }
    board[0][5] = { id: 4, type: 'blue' }
    board[0][6] = { id: 5, type: 'blue' }
    board[0][7] = { id: 6, type: 'blue' }
    const result = resolvePlanning(board)
    expect(result.frames[0].clearing).toEqual([4, 5, 6])
  })

  it('settles only columns touched by the cleared group', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    board[5][0] = { id: 1, type: 'orange', placementOrder: 1 }
    board[6][0] = { id: 2, type: 'orange', placementOrder: 2 }
    board[7][0] = { id: 3, type: 'orange', placementOrder: 3 }
    board[2][4] = { id: 4, type: 'blue' }
    const result = resolvePlanning(board)
    expect(result.frames[1].board[2][4]?.id).toBe(4)
    expect(result.remaining).toBe(1)
  })
})
