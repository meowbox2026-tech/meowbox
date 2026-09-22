import { describe, expect, it } from 'vitest'
import { findDropMatches } from '../core/dropEngine'
import { arrangeCats, resolvePlanning } from '../core/planningEngine'
import { PLANNING_LEVELS } from './planningLevels'

describe('authored planning levels', () => {
  it('keeps every board at 8x8 and increases the authored puzzle density', () => {
    expect(PLANNING_LEVELS).toHaveLength(15)
    expect(PLANNING_LEVELS.every(level => level.width === 8 && level.height === 8)).toBe(true)
    expect(PLANNING_LEVELS.map(level => level.board.flat().filter(Boolean).length)).toEqual([6, 8, 10, 12, 14, 16, 18, 20, 20, 20, 20, 20, 22, 22, 24])
    expect(PLANNING_LEVELS.map(level => level.cats.length)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 11, 11, 12])
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
    expect(outcomes).toEqual(Array(15).fill(0))
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
    const chapterTwo = PLANNING_LEVELS.slice(10)
    expect(chapterTwo.map(level => level.id)).toEqual([11, 12, 13, 14, 15])
    expect(chapterTwo.map(level => level.board.flat().filter(Boolean).length)).toEqual([20, 20, 22, 22, 24])
    expect(chapterTwo.map(level => level.cats.length)).toEqual([10, 10, 11, 11, 12])
    expect(chapterTwo.every(level => {
      const types = new Set(level.cats.map(cat => cat.type))
      return types.size === 4 && types.has('fishLover') && !types.has('alone')
    })).toBe(true)
  })

  it('keeps every second-chapter puzzle free of opening matches and fully solvable', () => {
    for (const level of PLANNING_LEVELS.slice(10)) {
      expect(findDropMatches(level.board), `level ${level.id} starts with a match`).toEqual([])
      const solved = arrangeCats(level, level.solution)
      expect(solved, `level ${level.id} solution could not be placed`).toBeDefined()
      const result = resolvePlanning(solved!)
      expect(result.remaining, `level ${level.id} is not fully cleared`).toBe(0)
      expect(result.waves, `level ${level.id} has no elimination`).toBeGreaterThan(0)
    }
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
