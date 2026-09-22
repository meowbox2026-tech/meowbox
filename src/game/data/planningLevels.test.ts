import { describe, expect, it } from 'vitest'
import { findDropMatches } from '../core/dropEngine'
import { arrangeCats, resolvePlanning } from '../core/planningEngine'
import { PLANNING_LEVELS } from './planningLevels'

describe('first ten planning levels', () => {
  it('keeps every board at 8x8 and increases the authored puzzle density', () => {
    expect(PLANNING_LEVELS).toHaveLength(10)
    expect(PLANNING_LEVELS.every(level => level.width === 8 && level.height === 8)).toBe(true)
    expect(PLANNING_LEVELS.map(level => level.board.flat().filter(Boolean).length)).toEqual([6, 8, 10, 12, 14, 16, 20, 24, 24, 28])
    expect(PLANNING_LEVELS.map(level => level.cats.length)).toEqual([3, 4, 5, 6, 7, 8, 10, 12, 12, 14])
  })

  it('starts without a free match and has a complete authored solution for each level', () => {
    PLANNING_LEVELS.forEach(level => {
      expect(findDropMatches(level.board), `level ${level.id} starts with a match`).toEqual([])
      const board = arrangeCats(level, level.solution)
      expect(board, `level ${level.id} solution could not be placed`).toBeDefined()
      const result = resolvePlanning(board!)
      expect(result.remaining, `level ${level.id} leaves cats behind`).toBe(0)
      expect(result.waves, `level ${level.id} has no elimination`).toBeGreaterThan(0)
    })
  })

  it('introduces a fourth cat type by level four and keeps it readable through level ten', () => {
    expect(new Set(PLANNING_LEVELS[0].cats.map(cat => cat.type)).size).toBe(3)
    expect(new Set(PLANNING_LEVELS[2].cats.map(cat => cat.type)).size).toBe(3)
    expect(PLANNING_LEVELS.slice(3).every(level => new Set(level.cats.map(cat => cat.type)).size === 4)).toBe(true)
  })

  it('moves cats only when their contiguous support stack was cleared in all ten solutions', () => {
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

  it('gives levels six through ten longer, distinct authored chains', () => {
    expect(PLANNING_LEVELS.slice(5).map(level => resolvePlanning(arrangeCats(level, level.solution)!).waves)).toEqual([8, 10, 12, 12, 13])
    const levelNine = PLANNING_LEVELS[8]
    const occupiedColumns = new Set(levelNine.board.flatMap(row => row.flatMap((cat, x) => cat ? [x] : [])))
    expect(occupiedColumns).toEqual(new Set([0, 1, 2, 5, 6, 7]))
    expect(PLANNING_LEVELS[9].cats.length).toBeGreaterThan(8)
  })
})
