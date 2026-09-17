import { describe, expect, it } from 'vitest'
import { LEVELS, getLevelById } from './levels'

describe('level artwork progression', () => {
  it('assigns one of the supplied cat artworks to every playable cat', () => {
    const cats = LEVELS.flatMap((level) => level.cats)

    expect(cats).not.toHaveLength(0)
    expect(cats.every((cat) => cat.visualAsset)).toBe(true)
  })

  it('raises the puzzle rules in five readable difficulty bands', () => {
    expect(getLevelById(1).difficulty).toBe(1)
    expect(getLevelById(4).difficulty).toBe(2)
    expect(getLevelById(11).difficulty).toBe(3)
    expect(getLevelById(21).difficulty).toBe(4)
    expect(getLevelById(26).difficulty).toBe(5)
    expect(LEVELS.every((level) => level.difficulty >= 1 && level.difficulty <= 5)).toBe(true)
  })

  it('gives obstacle stages a visible 3D-style obstacle descriptor without changing collision cells', () => {
    const level = getLevelById(4)

    expect(level.board.obstacles).toEqual([{ cell: { x: 1, y: 1 }, kind: 'tape' }])
    expect(level.board.blockedCells).toContainEqual({ x: 1, y: 1 })
  })
})
