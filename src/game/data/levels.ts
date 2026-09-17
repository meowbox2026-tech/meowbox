import type { CatAsset, CatDefinition, CatPlacement, CatSkin, LevelDefinition, LevelDifficulty, ObstacleKind } from '../types'

const DEFAULT_BOARD = { width: 4, height: 4, blockedCells: [] }
const LINE_SOLUTIONS: CatPlacement[] = [0, 1, 2, 3].map((y) => ({ origin: { x: 0, y }, rotation: 0 }))

function cat(
  id: string,
  skin: CatSkin,
  shape: CatDefinition['shape'] = 'line4',
  type: CatDefinition['type'] = 'normal',
  extra: Partial<CatDefinition> = {}
): CatDefinition {
  return { id, name: `${skin} cat`, skin, shape, type, ...extra }
}

function createRowLevel(id: number, prefix: string, tutorial?: string): LevelDefinition {
  const artwork: CatAsset[] = id === 1
    ? ['orangeLounge', 'grayStretch', 'calicoStretch', 'tabbyLounge']
    : id === 2
      ? ['orangeLounge', 'brownCurl', 'grayCurl', 'whiteCurl']
      : ['tabbyLounge', 'calicoStretch', 'grayStretch', 'orangeLounge']
  const cats = [
    cat(`${prefix}-row-a`, 'orange', 'line4', 'normal', { visualAsset: artwork[0] }),
    cat(`${prefix}-row-b`, 'gray', 'line4', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-row-c`, 'white', 'line4', 'normal', { visualAsset: artwork[2] }),
    cat(`${prefix}-row-d`, 'calico', 'line4', 'normal', { visualAsset: artwork[3] })
  ]

  return levelFromPairs(id, `溫馨紙箱 ${id}`, 'normal', DEFAULT_BOARD, cats, LINE_SOLUTIONS, tutorial, 0, 1)
}

function createObstacleLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id === 4
    ? ['orangeLounge', 'amberSit', 'sphynxStretch', 'grayStretch', 'calicoStretch']
    : id === 5
      ? ['tabbyLounge', 'spottedSit', 'brownCurl', 'grayStretch', 'calicoStretch']
      : ['orangeLounge', 'ragdollSit', 'siameseStretch', 'grayCurl', 'tabbyLounge']
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
    ? ['whiteCurl', 'brownCurl', 'grayCurl', 'orangeLounge']
    : ['grayCurl', 'whiteCurl', 'orangeLounge', 'calicoStretch']
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
    ? ['blackPaws', 'whiteCurl', 'orangeLounge', 'tabbyLounge', 'calicoStretch']
    : ['brownCurl', 'grayCurl', 'grayStretch', 'orangeLounge', 'calicoStretch']
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
    ? ['sphynxStretch', 'siameseStretch', 'grayStretch', 'orangeLounge', 'tabbyLounge']
    : ['siameseStretch', 'sphynxStretch', 'tabbyLounge', 'calicoStretch', 'grayStretch']
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
    ? ['orangeLounge', 'calicoStretch', 'grayStretch', 'tabbyLounge']
    : ['orangeLounge', 'calicoStretch', 'whiteCurl', 'brownCurl']
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

function createChallengeLevel(id: number, prefix: string): LevelDefinition {
  const artwork: CatAsset[] = id % 2 === 0
    ? ['brownCurl', 'siameseStretch', 'sphynxStretch', 'blackPaws', 'whiteCurl', 'grayStretch', 'ragdollSit']
    : ['whiteCurl', 'amberSit', 'calicoStretch', 'grayCurl', 'orangeLounge', 'spottedSit', 'tabbyLounge']
  const cats = [
    cat(`${prefix}-sleeper`, 'orange', 'line4', 'sleeping', { visualAsset: artwork[0] }),
    cat(`${prefix}-vertical`, 'black', 'line4', 'normal', { visualAsset: artwork[1] }),
    cat(`${prefix}-stretch`, 'gray', 'line4', 'stretch', { stretchLengths: [2, 3, 4], visualAsset: artwork[2] }),
    cat(`${prefix}-sticky-a`, 'white', 'line2', 'sticky', { stickyGroup: `${prefix}-friends`, visualAsset: artwork[3] }),
    cat(`${prefix}-sticky-b`, 'calico', 'line2', 'sticky', { stickyGroup: `${prefix}-friends`, visualAsset: artwork[4] }),
    cat(`${prefix}-row-d`, 'siamese', 'line4', 'normal', { visualAsset: artwork[5] }),
    cat(`${prefix}-row-e`, 'ragdoll', 'line4', 'normal', { visualAsset: artwork[6] })
  ]
  const board = {
    width: 5,
    height: 5,
    blockedCells: [{ x: 4, y: 4 }],
    obstacles: [{ cell: { x: 4, y: 4 }, kind: 'divider' as const }],
    lidZones: [{
      id: `${prefix}-top-lid`,
      cells: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
      ]
    }]
  }
  const solutions = [
    { origin: { x: 0, y: 0 }, rotation: 0 },
    { origin: { x: 4, y: 0 }, rotation: 1 },
    { origin: { x: 0, y: 1 }, rotation: 0, stretchLength: 4 },
    { origin: { x: 0, y: 2 }, rotation: 0 },
    { origin: { x: 2, y: 2 }, rotation: 0 },
    { origin: { x: 0, y: 3 }, rotation: 0 },
    { origin: { x: 0, y: 4 }, rotation: 0 }
  ]
  return levelFromPairs(id, `挑戰紙箱 ${id}`, 'challenge', board, cats, solutions, '限步關卡：仔細安排貓咪與箱蓋的順序。', 14, 5)
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
  createRowLevel(1, 'basic', '把所有貓咪拖進紙箱，試著填滿每一列。'),
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
  createLidLevel(25, 'seal'),
  createChallengeLevel(26, 'challenge'),
  createChallengeLevel(27, 'challenge-two'),
  createChallengeLevel(28, 'challenge-three'),
  createChallengeLevel(29, 'challenge-four'),
  createChallengeLevel(30, 'challenge-five')
]

export function getLevelById(id: number): LevelDefinition {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0]
}
