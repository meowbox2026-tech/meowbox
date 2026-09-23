import { getCatVisualSpec } from './catAssets'
import { getOccupancyMaskForShape } from '../core/shapes'
import type { CatAsset, CatDefinition, CatPlacement, CatSkin, LevelDefinition, LevelDifficulty, ObstacleKind } from '../types'

const DEFAULT_BOARD = { width: 4, height: 4, blockedCells: [] }
const LINE_SOLUTIONS: CatPlacement[] = [0, 1, 2, 3].map((y) => ({ origin: { x: 0, y }, rotation: 0 }))
const INTRO_CAT_SHOWCASE: Array<{ suffix: string; name: string; skin: CatSkin; asset: CatAsset }> = [
  { suffix: 'a', name: '傲嬌貓', skin: 'white', asset: 'arrogant' },
  { suffix: 'b', name: '太陽貓', skin: 'calico', asset: 'sunny' },
  { suffix: 'c', name: '愛魚貓', skin: 'orange', asset: 'fishLover' },
  { suffix: 'd', name: '普通橘色貓', skin: 'orange', asset: 'orange' },
  { suffix: 'e', name: '普通白貓', skin: 'white', asset: 'white' },
  { suffix: 'f', name: '普通藍貓', skin: 'gray', asset: 'blue' },
  { suffix: 'g', name: '獨處貓', skin: 'black', asset: 'alone' },
  { suffix: 'h', name: '睡覺貓', skin: 'gray', asset: 'sleeping' },
  { suffix: 'i', name: '紙箱貓', skin: 'orange', asset: 'box' }
]

function cat(
  id: string,
  skin: CatSkin,
  shape: CatDefinition['shape'] = 'line4',
  type: CatDefinition['type'] = 'normal',
  extra: Partial<CatDefinition> = {}
): CatDefinition {
  const visualSpec = getCatVisualSpec(extra.visualAsset)

  return {
    id,
    name: `${skin} cat`,
    skin,
    shape,
    type,
    ...extra,
    occupancyMask: extra.occupancyMask ?? getOccupancyMaskForShape(shape),
    anchor: extra.anchor ?? visualSpec.anchor,
    offset: extra.offset ?? visualSpec.offset,
    bleed: extra.bleed ?? visualSpec.bleed
  }
}

function createRowLevel(id: number, prefix: string, tutorial?: string): LevelDefinition {
  if (id === 1) return createIntroLevel(id, prefix, tutorial)

  const artwork: CatAsset[] = id === 2
    ? ['orange', 'white', 'blue', 'alone']
    : ['arrogant', 'sunny', 'fishLover', 'box']
  const cats = [
    cat(`${prefix}-row-a`, 'orange', 'line4', 'normal', { visualAsset: artwork[0] }),
    cat(`${prefix}-row-b`, 'gray', 'line4', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-row-c`, 'white', 'line4', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-row-d`, 'calico', 'line4', 'normal', { visualAsset: artwork[3] })
  ]

  return levelFromPairs(id, `溫馨紙箱 ${id}`, 'normal', DEFAULT_BOARD, cats, LINE_SOLUTIONS, tutorial, 0, 1)
}

function createIntroLevel(id: number, prefix: string, tutorial?: string): LevelDefinition {
  const board = {
    width: 8,
    height: 8,
    blockedCells: []
  }
  const cats = INTRO_CAT_SHOWCASE.map(({ suffix, name, skin, asset }) => cat(
    `${prefix}-row-${suffix}`,
    skin,
    'dot',
    'normal',
    { name, visualAsset: asset }
  ))
  const solutions = INTRO_CAT_SHOWCASE.map((_, index) => ({
    origin: { x: index % 3, y: Math.floor(index / 3) },
    rotation: 0
  }))

  return {
    ...levelFromPairs(id, `溫馨紙箱 ${id}`, 'normal', board, cats, solutions, tutorial ?? '交換相鄰貓咪，三隻相同花色即可消除。', 0, 1),
    match3: {
      tileAssets: ['alone', 'blue', 'fishLover', 'orange', 'white']
    }
  }
}

function createObstacleLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id === 4
    ? ['sticky', 'mischievous', 'boss', 'sleeping', 'fishLover']
    : id === 5
      ? ['alone', 'box', 'arrogant', 'sunny', 'orange']
      : ['white', 'blue', 'sticky', 'mischievous', 'boss']
  const obstacleKind: ObstacleKind = id === 4 ? 'tape' : id === 5 ? 'yarn' : 'toy'
  const cats = [
    cat(`${prefix}-top`, 'orange', 'line4', 'normal', { visualAsset: artwork[0] }),
    cat(`${prefix}-dot`, 'black', 'dot', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-split`, 'gray', 'line2', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-middle`, 'white', 'line4', 'normal', { visualAsset: artwork[3] }),
    cat(`${prefix}-bottom`, 'calico', 'line4', 'normal', { visualAsset: artwork[4] })
  ]
  const solutions = [
    { origin: { x: 0, y: 0 }, rotation: 0 },
    { origin: { x: 0, y: 1 }, rotation: 0 },
    { origin: { x: 2, y: 1 }, rotation: 0 },
    { origin: { x: 0, y: 2 }, rotation: 0 },
    { origin: { x: 0, y: 3 }, rotation: 0 }
  ]
  const board = {
    ...DEFAULT_BOARD,
    blockedCells: [{ x: 1, y: 1 }],
    obstacles: [{ cell: { x: 1, y: 1 }, kind: obstacleKind }]
  }
  return levelFromPairs(id, `避開障礙 ${id}`, 'normal', board, cats, solutions, '避開紙箱裡不能放貓咪的格子。', 0, 2)
}

function createSleepingLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id % 2 === 1
    ? ['sleeping', 'white', 'alone', 'sunny']
    : ['blue', 'sleeping', 'orange', 'arrogant']
  const cats = [
    cat(`${prefix}-orange`, 'orange', 'line4', 'sleeping', { visualAsset: artwork[0] }),
    cat(`${prefix}-gray`, 'gray', 'line4', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-white`, 'white', 'line4', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-calico`, 'calico', 'line4', 'normal', { visualAsset: artwork[3] })
  ]
  return levelFromPairs(id, `安睡貓咪 ${id}`, 'normal', DEFAULT_BOARD, cats, LINE_SOLUTIONS, '睡覺貓放下後會睡著，請先想好位置。', 0, 2)
}

function createStickyLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id % 2 === 1
    ? ['sticky', 'orange', 'fishLover', 'box', 'mischievous']
    : ['boss', 'alone', 'white', 'sunny', 'sticky']
  const cats = [
    cat(`${prefix}-left`, 'black', 'line2', 'sticky', { stickyGroup: `${prefix}-pair`, visualAsset: artwork[0] }),
    cat(`${prefix}-right`, 'orange', 'line2', 'sticky', { stickyGroup: `${prefix}-pair`, visualAsset: artwork[1] }),
    cat(`${prefix}-row-b`, 'gray', 'line4', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-row-c`, 'white', 'line4', 'normal', { visualAsset: artwork[3] }),
    cat(`${prefix}-row-d`, 'calico', 'line4', 'normal', { visualAsset: artwork[4] })
  ]
  const solutions = [
    { origin: { x: 0, y: 0 }, rotation: 0 },
    { origin: { x: 2, y: 0 }, rotation: 0 },
    { origin: { x: 0, y: 1 }, rotation: 0 },
    { origin: { x: 0, y: 2 }, rotation: 0 },
    { origin: { x: 0, y: 3 }, rotation: 0 }
  ]
  return levelFromPairs(id, `黏黏好朋友 ${id}`, 'normal', DEFAULT_BOARD, cats, solutions, '有愛心標記的貓咪必須相鄰。', 0, 3)
}

function createStretchLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id % 2 === 0
    ? ['mischievous', 'blue', 'sleeping', 'orange', 'boss']
    : ['sunny', 'arrogant', 'box', 'sticky', 'fishLover']
  const cats = [
    cat(`${prefix}-tabby`, 'orange', 'line2', 'stretch', { stretchLengths: [2, 3, 4], visualAsset: artwork[0] }),
    cat(`${prefix}-pair`, 'black', 'line2', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-row-b`, 'gray', 'line4', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-row-c`, 'white', 'line4', 'normal', { visualAsset: artwork[3] }),
    cat(`${prefix}-row-d`, 'calico', 'line4', 'normal', { visualAsset: artwork[4] })
  ]
  const solutions = [
    { origin: { x: 0, y: 0 }, rotation: 0, stretchLength: 2 },
    { origin: { x: 2, y: 0 }, rotation: 0 },
    { origin: { x: 0, y: 1 }, rotation: 0 },
    { origin: { x: 0, y: 2 }, rotation: 0 },
    { origin: { x: 0, y: 3 }, rotation: 0 }
  ]
  return levelFromPairs(id, `伸縮毛球 ${id}`, 'normal', DEFAULT_BOARD, cats, solutions, '點選伸縮貓按鈕，改變牠要佔的格數。', 0, 3)
}

function createLidLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id % 2 === 1
    ? ['orange', 'boss', 'blue', 'box']
    : ['fishLover', 'sticky', 'white', 'alone']
  const cats = [
    cat(`${prefix}-top-a`, 'orange', 'line4', 'normal', { visualAsset: artwork[0] }),
    cat(`${prefix}-top-b`, 'black', 'line4', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-bottom-a`, 'gray', 'line4', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-bottom-b`, 'white', 'line4', 'normal', { visualAsset: artwork[3] })
  ]
  const lidId = prefix === 'lid' ? 'top-lid' : `${prefix}-lid`
  const board = {
    ...DEFAULT_BOARD,
    lidZones: [{
      id: lidId,
      cells: Array.from({ length: 8 }, (_, index) => ({ x: index % 4, y: Math.floor(index / 4) }))
    }]
  }
  return levelFromPairs(id, `箱蓋練習 ${id}`, 'normal', board, cats, LINE_SOLUTIONS, '上方區域填滿時箱蓋會關上，裡面的貓將無法再移動。', 0, 4)
}

function levelFromPairs(
  id: number,
  name: string,
  type: LevelDefinition['type'],
  board: LevelDefinition['board'],
  cats: CatDefinition[],
  placements: CatPlacement[],
  tutorial?: string,
  moves = 0,
  difficulty: LevelDifficulty = 1
): LevelDefinition {
  return {
    id,
    name,
    type,
    difficulty,
    board,
    cats,
    moves,
    targetMoves: type === 'challenge' ? 12 : undefined,
    solution: Object.fromEntries(cats.map((currentCat, index) => [currentCat.id, placements[index]])),
    tutorial
  }
}

export const LEVELS: LevelDefinition[] = [
  createRowLevel(1, 'basic', '交換相鄰貓咪，三隻相同花色即可消除。'),
  createRowLevel(2, 'warm'),
  createRowLevel(3, 'cozy'),
  createObstacleLevel(4, 'obstacle'),
  createObstacleLevel(5, 'tape'),
  createObstacleLevel(6, 'yarn'),
  createSleepingLevel(7, 'sleepy'),
  createSleepingLevel(8, 'dream'),
  createSleepingLevel(9, 'nap'),
  createSleepingLevel(10, 'snooze'),
  createStickyLevel(11, 'sticky'),
  createStickyLevel(12, 'hug'),
  createStickyLevel(13, 'bond'),
  createStickyLevel(14, 'friend'),
  createStickyLevel(15, 'heart'),
  createStretchLevel(16, 'stretchy'),
  createStretchLevel(17, 'long'),
  createStretchLevel(18, 'elastic'),
  createStretchLevel(19, 'flex'),
  createStretchLevel(20, 'spring'),
  createLidLevel(21, 'lid'),
  createLidLevel(22, 'cover'),
  createLidLevel(23, 'close'),
  createLidLevel(24, 'fold'),
  createLidLevel(25, 'seal')
]

export function getLevelById(id: number): LevelDefinition {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0]
}
