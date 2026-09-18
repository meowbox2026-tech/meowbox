import { describe, expect, it } from 'vitest'
import {
  createMatch3State,
  findMatchCells,
  swapMatch3Tiles,
  type Match3Board,
  type Match3TileType
} from './match3Engine'

const TYPES: Match3TileType[] = ['alone', 'blue', 'fishLover', 'orange', 'white']

function boardFromRows(rows: string[]): Match3Board {
  let nextId = 1
  return rows.map((row) => row.split('').map((type) => ({ id: nextId++, type })))
}

describe('match-3 engine', () => {
  it('counts two groups made by one swap separately before dropping cats', () => {
    const state = createMatch3State({
      width: 6, height: 3, tileTypes: ['a', 'b', 'c', 'd', 'e'],
      board: boardFromRows(['aababb', 'bcdbcd', 'cdecde'])
    })
    const result = swapMatch3Tiles(state, { x: 2, y: 0 }, { x: 3, y: 0 }, () => .7)
    expect(result.accepted).toBe(true)
    expect(result.clearEvents.slice(0, 2).map(event => [event.cascade, event.cells.length])).toEqual([[1, 3], [2, 3]])
    expect(result.resolutionSteps[0].nextBoard[0].slice(0, 3)).toEqual([null, null, null])
    expect(result.resolutionSteps[1].board[0].slice(3).map(tile => tile?.type)).toEqual(['b', 'b', 'b'])
    expect(result.resolutionSteps[1].nextBoard.flat()).not.toContain(null)
  })

  it('creates an 8 by 8 board without an automatic opening match', () => {
    const state = createMatch3State({ width: 8, height: 8, tileTypes: TYPES, random: () => 0.37 })

    expect(state.board).toHaveLength(8)
    expect(state.board.every((row) => row.length === 8)).toBe(true)
    expect(findMatchCells(state.board)).toHaveLength(0)
  })

  it('finds horizontal and vertical runs of at least three equal tiles', () => {
    const board = boardFromRows([
      'abcde',
      'bcade',
      'caaaa',
      'deaba',
      'eabcd'
    ])

    expect(findMatchCells(board)).toEqual(expect.arrayContaining([
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }
    ]))
    expect(findMatchCells(board)).toEqual(expect.arrayContaining([
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }
    ]))
  })

  it('only accepts an adjacent swap that creates a match, then refills every cleared cell', () => {
    const board = boardFromRows([
      'abcd',
      'bcab',
      'caac',
      'aabc'
    ])
    const state = createMatch3State({ width: 4, height: 4, tileTypes: TYPES, board })

    const result = swapMatch3Tiles(state, { x: 2, y: 2 }, { x: 2, y: 3 }, () => 0.8)

    expect(result.accepted).toBe(true)
    expect(result.clearedCount).toBeGreaterThanOrEqual(3)
    expect(result.clearEvents).toHaveLength(result.cascades)
    expect(result.clearEvents[0]).toMatchObject({
      cascade: 1,
      cells: expect.arrayContaining([
        { x: 0, y: 3, type: 'a' },
        { x: 1, y: 3, type: 'a' },
        { x: 2, y: 3, type: 'a' }
      ])
    })
    expect(result.state.moves).toBe(1)
    expect(result.state.cleared).toBe(result.clearedCount)
    expect(result.state.board.flat()).not.toContain(null)
    expect(findMatchCells(result.state.board)).toHaveLength(0)
  })

  it('rejects a non-adjacent swap and a swap that does not make a match', () => {
    const board = boardFromRows([
      'abcde',
      'bcdea',
      'cdeab',
      'deabc',
      'eabcd'
    ])
    const state = createMatch3State({ width: 5, height: 5, tileTypes: TYPES, board })

    expect(swapMatch3Tiles(state, { x: 0, y: 0 }, { x: 2, y: 0 })).toMatchObject({
      accepted: false,
      reason: 'not-adjacent',
      clearEvents: []
    })
    expect(swapMatch3Tiles(state, { x: 0, y: 0 }, { x: 1, y: 0 })).toMatchObject({
      accepted: false,
      reason: 'no-match',
      clearEvents: []
    })
    expect(state.moves).toBe(0)
  })

  it('records each clear wave so a three-step chain can be animated in order', () => {
    const board = boardFromRows([
      'addab',
      'adaea',
      'eccac',
      'ecaee',
      'aeceb'
    ])
    const refillValues = [
      0.03242476633749902,
      0.07025589840486646,
      0.9353603331837803,
      0.8946607047691941,
      0.3456739156972617,
      0.11059395736083388,
      0.6429440148640424,
      0.6224095430225134,
      0.48066752194426954
    ]
    const state = createMatch3State({ width: 5, height: 5, tileTypes: ['a', 'b', 'c', 'd', 'e'], board })

    const result = swapMatch3Tiles(state, { x: 3, y: 2 }, { x: 4, y: 2 }, () => refillValues.shift() ?? 0.5)

    expect(result.cascades).toBe(3)
    expect(result.clearEvents.map((event) => event.cascade)).toEqual([1, 2, 3])
    expect(result.clearEvents.map((event) => event.cells.length)).toEqual([3, 3, 3])
    expect(result.resolutionSteps).toHaveLength(3)
    result.resolutionSteps.forEach((step, index) => {
      expect(step.clearEvent).toEqual(result.clearEvents[index])
      step.clearEvent.cells.forEach((cell) => {
        expect(step.board[cell.y][cell.x]).toMatchObject({ type: cell.type })
      })
      expect(step.nextBoard.flat()).not.toContain(null)
      if (index > 0) expect(step.board).toEqual(result.resolutionSteps[index - 1].nextBoard)
    })
    expect(result.state.board).toEqual(result.resolutionSteps[2].nextBoard)
  })
})
