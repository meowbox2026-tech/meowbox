import { describe, expect, it } from 'vitest'
import { CAT_ASSET_PATHS } from './catAssets'
import { LEVELS, getLevelById } from './levels'

describe('level artwork progression', () => {
  it('contains no authored level after the active twenty-five-level mainline', () => {
    expect(LEVELS).toHaveLength(25)
    expect(LEVELS.at(-1)?.id).toBe(25)
    expect(getLevelById(26).id).toBe(1)
  })

  it('assigns one of the supplied cat artworks to every playable cat', () => {
    const cats = LEVELS.flatMap((level) => level.cats)

    expect(cats).not.toHaveLength(0)
    expect(cats.every((cat) => cat.visualAsset && cat.visualAsset in CAT_ASSET_PATHS)).toBe(true)
    expect(new Set(cats.map((cat) => cat.visualAsset))).toEqual(new Set([
      'arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue',
      'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'
    ]))
  })

  it('gives every cat an explicit logical mask and visual placement contract', () => {
    const cats = LEVELS.flatMap((level) => level.cats)

    expect(cats.every((cat) => cat.occupancyMask.some((row) => row.some(Boolean)))).toBe(true)
    expect(cats.every((cat) => cat.anchor.x >= 0 && cat.anchor.x <= 1 && cat.anchor.y >= 0 && cat.anchor.y <= 1)).toBe(true)
    expect(cats.every((cat) => cat.bleed.top >= 0 && cat.bleed.right >= 0 && cat.bleed.bottom >= 0 && cat.bleed.left >= 0)).toBe(true)
  })

  it('uses the first nine supplied cat artworks in the first playable level', () => {
    expect(getLevelById(1).cats.map((cat) => cat.visualAsset)).toEqual([
      'arrogant',
      'sunny',
      'fishLover',
      'orange',
      'white',
      'blue',
      'alone',
      'sleeping',
      'box'
    ])
  })

  it('defines the first level as an 8x8 match-3 test board with five tile artworks', () => {
    const level = getLevelById(1)

    expect(level.board).toMatchObject({
      width: 8,
      height: 8
    })
    expect(level.match3?.tileAssets).toEqual(['alone', 'blue', 'fishLover', 'orange', 'white'])
    expect(level.board.specialCells).toBeUndefined()
    expect(level.cats).toHaveLength(9)
    expect(level.cats.every((cat) => cat.shape === 'dot')).toBe(true)
    expect(level.cats.map((cat) => cat.name)).toEqual([
      '傲嬌貓', '太陽貓', '愛魚貓', '普通橘色貓', '普通白貓', '普通藍貓',
      '獨處貓', '睡覺貓', '躲貓'
    ])
    expect(level.cats.every((cat) => cat.type === 'normal')).toBe(true)
    expect(level.cats.every((cat) => !cat.rule)).toBe(true)
    expect(level.solution['basic-row-a']).toMatchObject({ origin: { x: 0, y: 0 } })
    expect(Object.values(level.solution).map(({ origin }) => origin)).toEqual([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
    ])
  })

  it('raises the puzzle rules in five readable difficulty bands', () => {
    expect(getLevelById(1).difficulty).toBe(1)
    expect(getLevelById(4).difficulty).toBe(2)
    expect(getLevelById(11).difficulty).toBe(3)
    expect(getLevelById(21).difficulty).toBe(4)
    expect(LEVELS.every((level) => level.difficulty >= 1 && level.difficulty <= 4)).toBe(true)
  })

  it('gives obstacle stages a visible 3D-style obstacle descriptor without changing collision cells', () => {
    const level = getLevelById(4)

    expect(level.board.obstacles).toEqual([{ cell: { x: 1, y: 1 }, kind: 'tape' }])
    expect(level.board.blockedCells).toContainEqual({ x: 1, y: 1 })
  })
})
