import type { CatAsset } from '../types'
import type { DropBoard, DropTile } from '../core/dropEngine'
import type { DropLevelDefinition } from './dropLevelTypes'

const names = [
  '初次相遇', '疊疊午茶', '斜斜的祕密', '一起回家', '小小整理師', '窗邊陽光',
  '小墨報到', '四色軟糖', '愛心接力', '小屋派對', '魚丸來訪', '魚乾時間',
  '軟墊小山', '雙重驚喜', '下午茶會', '陽陽花園', '左右都可愛', '草地接力',
  '大家集合', '花園野餐', '黏黏的朋友', '愛心滿滿', '雨天紙箱', '小小建築師',
  '彩虹小隊', '旅行第一站', '星光接力', '紙箱大搬家', '最後一塊軟墊', '箱長的派對'
]
const targets = [18, 21, 24, 24, 27, 30, 27, 30, 33, 36, 33, 36, 36, 39, 42, 39, 42, 45, 39, 45, 45, 48, 48, 51, 51, 54, 54, 57, 57, 60]
const times = [120, 120, 120, 115, 110, 105, 120, 115, 110, 105, 115, 110, 105, 105, 100, 115, 110, 105, 120, 115, 110, 105, 105, 100, 115, 110, 105, 105, 100, 100]
const sizes: Array<[number, number]> = [
  [3, 8], [3, 8], [3, 8], [3, 8], [4, 8], [4, 8], [4, 8], [4, 8], [4, 8], [4, 8],
  [5, 8], [5, 8], [5, 8], [5, 8], [5, 8], [6, 8], [6, 8], [6, 8], [6, 8], [6, 8],
  [7, 8], [7, 8], [7, 8], [7, 8], [7, 8], [8, 8], [8, 8], [8, 8], [8, 8], [8, 8]
]
const allCats: CatAsset[] = ['arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue', 'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky']

function assetsFor(id: number): CatAsset[] {
  if (id <= 4) return ['orange', 'blue', 'white', 'alone']
  const width = sizes[id - 1][0]
  const count = width + 1
  const start = (id - 5) % allCats.length
  return Array.from({ length: count }, (_, index) => allCats[(start + index) % allCats.length])
}

function emptyBoard(width: number): DropBoard {
  return Array.from({ length: 8 }, () => Array<DropTile | null>(width).fill(null))
}

function tutorialBoard(kind: 'horizontal' | 'vertical' | 'diagonal' | 'chain', first: CatAsset, second = first): DropBoard {
  const board = emptyBoard(3)
  if (kind === 'horizontal') {
    board[7][0] = { id: 1, type: 'orange' }; board[7][1] = { id: 2, type: 'orange' }
    board[6][0] = { id: 3, type: 'blue' }; board[6][1] = { id: 4, type: 'white' }
  } else if (kind === 'vertical') {
    board[7][2] = { id: 1, type: first }; board[6][2] = { id: 2, type: first }
    board[7][0] = { id: 3, type: 'blue' }; board[7][1] = { id: 4, type: 'white' }
  } else if (kind === 'diagonal') {
    board[6][1] = { id: 1, type: first }; board[7][2] = { id: 2, type: first }
    board[6][0] = { id: 3, type: 'white' }
  } else {
    board[7][1] = { id: 1, type: first }; board[7][2] = { id: 2, type: first }
    board[2][1] = { id: 3, type: second }; board[4][1] = { id: 4, type: second }; board[6][1] = { id: 5, type: second }
  }
  return board
}

function canPlace(board: DropBoard, x: number, y: number, type: string): boolean {
  const directions = [[1, 0], [0, -1], [1, -1], [-1, -1]]
  return directions.every(([dx, dy]) => board[y - dy]?.[x - dx]?.type !== type || board[y - dy * 2]?.[x - dx * 2]?.type !== type)
}

function createInitialBoard(width: number, height: number, assets: CatAsset[], rows: number, seed: number): DropBoard {
  const board: DropBoard = Array.from({ length: height }, () => Array<DropTile | null>(width).fill(null))
  let id = 1
  for (let y = height - 1; y >= Math.max(0, height - rows); y -= 1) for (let x = 0; x < width; x += 1) {
    for (let offset = 0; offset < assets.length; offset += 1) {
      const type = assets[(seed + id + offset) % assets.length]
      if (!canPlace(board, x, y, type)) continue
      board[y][x] = { id, type }; id += 1; break
    }
  }
  return board
}

function createLevel(id: number): DropLevelDefinition {
  const [width, height] = sizes[id - 1]
  const tileAssets = assetsFor(id)
  const rows = id <= 3 ? 2 : id <= 15 ? 3 : id <= 25 ? 4 : 5
  const seed = id * 17
  const initialBoard = id === 1
    ? tutorialBoard('horizontal', tileAssets[0])
    : id === 2
      ? tutorialBoard('vertical', tileAssets[0])
      : id === 3
        ? tutorialBoard('diagonal', tileAssets[0])
        : id === 4
          ? tutorialBoard('chain', tileAssets[0], tileAssets[1])
          : createInitialBoard(width, height, tileAssets, rows, seed)
  const queue = id <= 3 ? ['blue', 'white', 'white', 'orange', 'orange', 'orange', 'blue', 'white', 'blue'] as CatAsset[] : Array.from({ length: 12 }, (_, index) => tileAssets[(seed + index + 1) % tileAssets.length])
  const target = targets[id - 1]
  return {
    id, world: 1, name: names[id - 1], width, height, tileAssets, timeLimit: times[id - 1], target,
    initialRows: rows, initialCatCount: initialBoard.flat().filter(Boolean).length, seed,
    threeStarMoves: Math.max(12, Math.ceil(target * (id < 7 ? .92 : .98))), twoStarMoves: Math.max(12, Math.ceil(target * (id < 7 ? .92 : .98)) + 8),
    previewCount: 2, tutorial: id <= 3 ? `world-one-${id}` : undefined, initialBoard,
    initialCurrent: tileAssets[0], initialCurrentTrait: 'none', initialNext: tileAssets[1], initialNextTrait: 'none',
    initialQueue: queue, initialQueueTraits: queue.map(() => 'none'), scratchPosts: [], fishTreats: [], tunnels: [],
    goals: { rescued: target, scratchPosts: 0, fishTreats: 0 }, holdUses: 0, variant: 0, variantCount: 1,
    witness: []
  }
}

export const WORLD_ONE_LEVELS = Array.from({ length: 30 }, (_, index) => createLevel(index + 1))
