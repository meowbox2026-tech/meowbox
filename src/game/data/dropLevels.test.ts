import { describe, expect, it } from 'vitest'
import { createDropState, dropCat, findDropMatches, landingRow } from '../core/dropEngine'
import { recommendColumn } from '../core/dropAssistance'
import { DROP_LEVELS, getDropLevelById } from './dropLevels'

describe('drop level catalogue', () => {
  it('contains two balanced worlds with sequential levels and usable timed goals', () => {
    expect(DROP_LEVELS).toHaveLength(60)
    expect(DROP_LEVELS.map(level => level.id)).toEqual(Array.from({ length: 60 }, (_, index) => index + 1))
    expect(DROP_LEVELS.map(level => `${level.width}x${level.height}`)).toEqual([
      '3x8', '3x8', '3x8', '3x8',
      '4x8', '4x8', '4x8', '4x8', '4x8', '4x8',
      '5x8', '5x8', '5x8', '5x8', '5x8',
      '6x8', '6x8', '6x8', '6x8', '6x8',
      '7x8', '7x8', '7x8', '7x8', '7x8',
      '8x8', '8x8', '8x8', '8x8', '8x8',
      '6x8', '6x8', '6x8', '6x8', '6x8',
      '7x8', '7x8', '7x8', '7x8', '7x8',
      '8x8', '8x8', '8x8', '8x8', '8x8',
      '8x8', '8x8', '8x8', '8x8', '8x8',
      '8x8', '8x8', '8x8', '8x8', '8x8',
      '8x8', '8x8', '8x8', '8x8', '8x8'
    ])
    for (const level of DROP_LEVELS) {
      expect(level.width).toBeGreaterThanOrEqual(3)
      expect(level.height).toBeGreaterThanOrEqual(8)
      expect(level.width).toBeLessThanOrEqual(8)
      expect(level.tileAssets.length).toBeGreaterThanOrEqual(3)
      expect(level.timeLimit).toBeGreaterThan(0)
      expect(level.target).toBeGreaterThan(0)
      expect(level.initialQueue.length).toBeGreaterThan(0)
      expect(level.initialBoard).toHaveLength(level.height)
      expect(level.initialBoard[0]).toHaveLength(level.width)
      expect(level.previewCount).toBe(level.id <= 30 ? 2 : 3)
      expect(level.world).toBe(level.id <= 30 ? 1 : 2)
      expect(level.width).toBeLessThan(level.tileAssets.length)
    }
    const allDropCats = new Set(['arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue', 'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'])
    for (const level of DROP_LEVELS.slice(4, 30)) {
      expect(level.tileAssets).toHaveLength(level.width + 1)
      expect(new Set(level.tileAssets).size).toBe(level.width + 1)
      expect(level.initialQueue).toHaveLength(12)
      const initialTypes = new Set(level.initialBoard.flat().filter(Boolean).map(tile => tile!.type))
      expect(initialTypes.size).toBe(level.tileAssets.length)
      expect([...initialTypes].every(type => level.tileAssets.includes(type as typeof level.tileAssets[number]))).toBe(true)
    }
    for (const level of DROP_LEVELS.slice(30)) {
      expect(level.tileAssets).toHaveLength(level.width + 2)
      expect(new Set(level.tileAssets).size).toBe(level.width + 2)
      expect(level.initialQueue).toHaveLength(Math.ceil(level.target / 3) * 3 - 2)
      expect(level.target).toBeGreaterThan(DROP_LEVELS[29].target)
      const initialTypes = new Set(level.initialBoard.flat().filter(Boolean).map(tile => tile!.type))
      expect(initialTypes.size).toBe(level.tileAssets.length)
      expect([...initialTypes].every(type => level.tileAssets.includes(type as typeof level.tileAssets[number]))).toBe(true)
    }
    expect(new Set(DROP_LEVELS.slice(4).flatMap(level => level.tileAssets))).toEqual(allDropCats)
  })
  it('starts every level without a free match and keeps the tutorial layout', () => {
    expect(findDropMatches(DROP_LEVELS[0].initialBoard)).toEqual([])
    for (const level of DROP_LEVELS.slice(1)) expect(findDropMatches(level.initialBoard)).toEqual([])
    expect(DROP_LEVELS[0].initialBoard[7][0]?.type).toBe('orange')
    expect(DROP_LEVELS[0].initialBoard[7][1]?.type).toBe('orange')
    const chainLevel = DROP_LEVELS[3]
    const chain = dropCat(createDropState({
      width: chainLevel.width,
      height: chainLevel.height,
      tileTypes: chainLevel.tileAssets,
      board: chainLevel.initialBoard,
      current: chainLevel.initialCurrent,
      next: chainLevel.initialNext,
      queue: chainLevel.initialQueue,
      target: chainLevel.target
    }), 0)
    expect(chain.waves.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps the first three tutorial layouts playable', () => {
    for (const [levelIndex, column] of [[0, 2], [1, 2], [2, 0]] as const) {
      const level = DROP_LEVELS[levelIndex]
      const state = createDropState({
        width: level.width,
        height: level.height,
        tileTypes: level.tileAssets,
        board: level.initialBoard,
        current: level.initialCurrent,
        next: level.initialNext,
        queue: level.initialQueue,
        target: level.target
      })
      expect(dropCat(state, column).waves.length, `level ${level.id} should teach a clear`).toBeGreaterThanOrEqual(1)
    }
    expect(DROP_LEVELS[3].initialBoard[1].some(Boolean)).toBe(false)
  })
  it('falls back safely for invalid level ids', () => {
    expect(getDropLevelById(0).id).toBe(1)
    expect(getDropLevelById(999).id).toBe(1)
  })
  it('accepts the first player action on every level-sized initial board', () => {
    for (const level of DROP_LEVELS) {
      const state = createDropState({
        width: level.width,
        height: level.height,
        tileTypes: level.tileAssets,
        board: level.initialBoard,
        current: level.initialCurrent,
        next: level.initialNext,
        queue: level.initialQueue,
        target: level.target
      })
      const result = dropCat(state, level.width - 1)
      expect(result.accepted, `level ${level.id} should accept an empty-column drop`).toBe(true)
      expect(result.state.board).toHaveLength(level.height)
      expect(result.state.board[0]).toHaveLength(level.width)
    }
  })

  it('keeps world 2 preview data useful after every drop', () => {
    for (const level of DROP_LEVELS.slice(30)) {
      const state = createDropState({
        width: level.width,
        height: level.height,
        tileTypes: level.tileAssets,
        board: level.initialBoard,
        current: level.initialCurrent,
        next: level.initialNext,
        queue: level.initialQueue,
        target: level.target
      })
      expect([state.current, state.next, state.queue[0]]).toHaveLength(3)
      const result = dropCat(state, level.width - 1, () => .5)
      expect(result.accepted).toBe(true)
      expect([result.state.current, result.state.next, result.state.queue[0]]).toHaveLength(3)
    }
  })

  it('gives the assistance path enough room to clear every world 2 goal', () => {
    for (const level of DROP_LEVELS.slice(30)) {
      let randomState = level.seed + 1
      const random = () => {
        randomState = (randomState * 1664525 + 1013904223) % 4294967296
        return randomState / 4294967296
      }
      let state = createDropState({
        width: level.width,
        height: level.height,
        tileTypes: level.tileAssets,
        board: level.initialBoard,
        current: level.initialCurrent,
        next: level.initialNext,
        queue: level.initialQueue,
        target: level.target
      })
      let plannedType: string | undefined
      let plannedColumn: number | undefined
      let plannedDrops = 0
      for (let move = 0; move < 240 && state.phase === 'playing'; move += 1) {
        const safeColumns = state.board[0].map((_, index) => index)
          .filter((index) => landingRow(state.board, index) >= 2)
          .sort((first, second) => landingRow(state.board, second) - landingRow(state.board, first))
        if (plannedDrops === 0 && state.current === state.next) {
          plannedType = state.current
          plannedColumn = safeColumns[0]
          plannedDrops = 3
        }
        const column = plannedDrops > 0 && state.current === plannedType
          ? plannedColumn
          : recommendColumn(state)
        if (column === undefined) break
        if (plannedDrops > 0 && state.current === plannedType) plannedDrops -= 1
        state = dropCat(state, column, random).state
      }
      expect(state.phase, `level ${level.id} should remain completable (cleared ${state.cleared}/${state.target} in ${state.moves} moves)`).toBe('completed')
    }
  })
})
