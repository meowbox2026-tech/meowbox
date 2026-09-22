import { describe, expect, it } from 'vitest'
import { findDropMatches, type DropBoard } from '../core/dropEngine'
import { arrangeCats, resolvePlanning } from '../core/planningEngine'
import { PLANNING_LEVELS } from './planningLevels'

function boardDirections(board: DropBoard): Set<string> {
  const directions = new Set<string>()
  const vectors: Array<[number, number, string]> = [[1, 0, 'horizontal'], [0, 1, 'vertical'], [1, 1, 'diagonal'], [-1, 1, 'diagonal']]
  for (let y = 0; y < board.length; y += 1) for (let x = 0; x < board[0].length; x += 1) {
    const type = board[y][x]?.type
    if (!type) continue
    vectors.forEach(([dx, dy, name]) => {
      if (board[y + dy]?.[x + dx]?.type === type && board[y + dy * 2]?.[x + dx * 2]?.type === type) directions.add(name)
    })
  }
  return directions
}

describe('authored planning levels', () => {
  it('keeps every board at 8x8 and increases the authored puzzle density', () => {
    expect(PLANNING_LEVELS).toHaveLength(25)
    expect(PLANNING_LEVELS.every(level => level.width === 8 && level.height === 8)).toBe(true)
    expect(PLANNING_LEVELS.map(level => level.board.flat().filter(Boolean).length)).toEqual([6, 8, 10, 12, 14, 16, 18, 20, 20, 20, 20, 20, 22, 22, 24, 26, 28, 30, 32, 36, 37, 38, 38, 39, 39])
    expect(PLANNING_LEVELS.map(level => level.cats.length)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 11, 11, 12, 13, 14, 15, 16, 18, 19, 20, 20, 21, 21])
  })

  it('starts without a free match and has a complete authored solution for each level', () => {
    const outcomes = PLANNING_LEVELS.map(level => {
      expect(findDropMatches(level.board), `level ${level.id} starts with a match`).toEqual([])
      const board = arrangeCats(level, level.solution)
      expect(board, `level ${level.id} solution could not be placed`).toBeDefined()
      const result = resolvePlanning(board!)
      expect(result.waves, `level ${level.id} has no elimination`).toBeGreaterThan(0)
      return result.remaining
    })
    expect(outcomes).toEqual(Array(25).fill(0))
  })

  it('introduces a fourth cat type by level four and keeps it readable through level ten', () => {
    expect(new Set(PLANNING_LEVELS[0].cats.map(cat => cat.type)).size).toBe(3)
    expect(new Set(PLANNING_LEVELS[2].cats.map(cat => cat.type)).size).toBe(3)
    expect(PLANNING_LEVELS.slice(3).every(level => new Set(level.cats.map(cat => cat.type)).size === 4)).toBe(true)
  })

  it('moves cats only when their contiguous support stack was cleared in all authored solutions', () => {
    for (const level of PLANNING_LEVELS) {
      const { frames } = resolvePlanning(arrangeCats(level, level.solution)!)
      for (let i = 0; i < frames.length; i += 2) {
        const before = frames[i]
        const after = frames[i + 1].board
        before.board.forEach((row, y) => row.forEach((cat, x) => {
          if (!cat || before.clearing.includes(cat.id) || after[y][x]?.id === cat.id) return
          let support = y + 1
          while (support < 8 && before.board[support][x] && !before.clearing.includes(before.board[support][x]!.id)) support++
          expect(before.clearing, `level ${level.id}: cat ${cat.id} lost no support`).toContain(before.board[support]?.[x]?.id)
          const landing = after.findIndex(row => row[x]?.id === cat.id)
          expect(landing).toBeGreaterThan(y)
          expect(landing === 7 || after[landing + 1][x] !== null).toBe(true)
        }))
      }
    }
  })

  it('gives levels six through ten longer, distinct authored layouts', () => {
    expect(PLANNING_LEVELS.slice(5, 10).every(level => level.cats.length >= 7)).toBe(true)
    const signatures = PLANNING_LEVELS.slice(5, 10).map(level => JSON.stringify(level.board))
    expect(new Set(signatures)).toHaveLength(5)
    expect(PLANNING_LEVELS[9].cats.length).toBeGreaterThan(8)
  })

  it('adds a second chapter with four matching cats and fixed authored density', () => {
    const chapterTwo = PLANNING_LEVELS.slice(10, 20)
    expect(chapterTwo.map(level => level.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(chapterTwo.slice(0, 5).map(level => level.board.flat().filter(Boolean).length)).toEqual([20, 20, 22, 22, 24])
    expect(chapterTwo.slice(0, 5).map(level => level.cats.length)).toEqual([10, 10, 11, 11, 12])
    expect(chapterTwo.every(level => {
      const types = new Set(level.cats.map(cat => cat.type))
      return types.size === 4 && types.has('fishLover') && !types.has('alone')
    })).toBe(true)
  })

  it('keeps every second-chapter puzzle free of opening matches and fully solvable', () => {
    for (const level of PLANNING_LEVELS.slice(10, 20)) {
      expect(findDropMatches(level.board), `level ${level.id} starts with a match`).toEqual([])
      const solved = arrangeCats(level, level.solution)
      expect(solved, `level ${level.id} solution could not be placed`).toBeDefined()
      const result = resolvePlanning(solved!)
      expect(result.remaining, `level ${level.id} is not fully cleared`).toBe(0)
      expect(result.waves, `level ${level.id} has no elimination`).toBeGreaterThan(0)
    }
  })

  it('raises the third chapter to 18 tray cats without changing the four-color rules', () => {
    const chapterThree = PLANNING_LEVELS.slice(15, 20)
    expect(chapterThree.map(level => level.id)).toEqual([16, 17, 18, 19, 20])
    expect(chapterThree.map(level => level.cats.length)).toEqual([13, 14, 15, 16, 18])
    expect(chapterThree.map(level => level.board.flat().filter(Boolean).length)).toEqual([26, 28, 30, 32, 36])
    expect(chapterThree.every(level => new Set(level.cats.map(cat => cat.type)).size === 4)).toBe(true)
  })

  it('adds a fourth chapter up to the 8x8 capacity without adding a fifth cat type', () => {
    const chapterFour = PLANNING_LEVELS.slice(20)
    expect(chapterFour.map(level => level.id)).toEqual([21, 22, 23, 24, 25])
    expect(chapterFour.map(level => level.cats.length)).toEqual([19, 20, 20, 21, 21])
    expect(chapterFour.map(level => level.board.flat().filter(Boolean).length)).toEqual([37, 38, 38, 39, 39])
    expect(chapterFour.every(level => new Set(level.cats.map(cat => cat.type)).size === 4 && !level.cats.some(cat => cat.type === 'alone'))).toBe(true)
    expect(chapterFour.every(level => level.board.flat().filter(Boolean).length + level.cats.length <= 64)).toBe(true)
  })

  it('keeps fourth-chapter layouts directional, dense, and chainable', () => {
    const directions = new Set<string>()
    for (const level of PLANNING_LEVELS.slice(20)) {
      const solved = arrangeCats(level, level.solution)!
      const result = resolvePlanning(solved)
      boardDirections(solved).forEach(direction => directions.add(direction))
      expect(boardDirections(solved)).toContain('diagonal')
      expect(result.waves, `level ${level.id} waves`).toBeGreaterThanOrEqual(5)
      expect(result.frames.filter((frame, index) => index % 2 === 0 && frame.clearing.length > 0).length, `level ${level.id} clears`).toBeGreaterThanOrEqual(5)
    }
    expect(directions).toEqual(new Set(['horizontal', 'vertical', 'diagonal']))
  })

  it('uses all three directions and produces multi-step gravity in the third chapter', () => {
    const chapterDirections = new Set<string>()
    for (const level of PLANNING_LEVELS.slice(15, 20)) {
      const solved = arrangeCats(level, level.solution)!
      const result = resolvePlanning(solved)
      const authoredDirections = boardDirections(solved)
      authoredDirections.forEach(direction => chapterDirections.add(direction))
      expect(authoredDirections).toContain('diagonal')
      const directions = new Set<string>()
      let gravityFrames = 0
      for (let index = 0; index < result.frames.length; index += 2) {
        const frame = result.frames[index]
        const cells = frame.clearing.map(id => frame.board.flatMap((row, y) => row.map((cat, x) => cat?.id === id ? { x, y } : undefined)).find(Boolean)!)
        if (new Set(cells.map(cell => cell.y)).size === 1) directions.add('horizontal')
        if (new Set(cells.map(cell => cell.x)).size === 1) directions.add('vertical')
        if (new Set(cells.map(cell => cell.x - cell.y)).size === 1 || new Set(cells.map(cell => cell.x + cell.y)).size === 1) directions.add('diagonal')
        const after = result.frames[index + 1]?.board
        if (after && frame.board.some((row, y) => row.some((cat, x) => cat && after[y][x]?.id !== cat.id))) gravityFrames += 1
      }
      expect(directions.size, `level ${level.id} has no resolved match`).toBeGreaterThan(0)
      expect(gravityFrames, `level ${level.id} gravity`).toBeGreaterThanOrEqual(3)
    }
    expect(chapterDirections).toEqual(new Set(['horizontal', 'vertical', 'diagonal']))
  })

  it('teaches horizontal, vertical and diagonal clears on irregular opening boards', () => {
    const directions = new Set<string>()
    for (const level of PLANNING_LEVELS) {
      const occupiedRows = level.board.map(row => row.filter(Boolean).length)
      const occupiedColumns = Array.from({ length: 8 }, (_, x) => level.board.filter(row => row[x]).length)
      expect(new Set(occupiedRows).size, `level ${level.id} row shape`).toBeGreaterThan(1)
      expect(new Set(occupiedColumns).size, `level ${level.id} column shape`).toBeGreaterThan(1)
      const solved = arrangeCats(level, level.solution)!
      const firstFrame = resolvePlanning(solved).frames.find(frame => frame.clearing.length)
      expect(firstFrame).toBeDefined()
      const cells = firstFrame!.clearing.map(id => solved.flatMap((row, y) => row.map((cat, x) => cat?.id === id ? { x, y } : undefined)).find(Boolean)!)
      if (new Set(cells.map(cell => cell.y)).size === 1) directions.add('horizontal')
      if (new Set(cells.map(cell => cell.x)).size === 1) directions.add('vertical')
      if (new Set(cells.map(cell => cell.x - cell.y)).size === 1 || new Set(cells.map(cell => cell.x + cell.y)).size === 1) directions.add('diagonal')
    }
    expect(directions).toEqual(new Set(['horizontal', 'vertical', 'diagonal']))
  })
})
