import type { CatAsset } from '../types'
import type { DropBoard, DropTile } from '../core/dropEngine'
import type { DropLevelDefinition } from './dropLevelTypes'
import { WORLD_ONE_ROWS } from './dropWorldOneData'
const allCats: CatAsset[] = ['arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue', 'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky']

function assetsFor(id: number): CatAsset[] {
  if (id <= 4) return ['orange', 'blue', 'white', 'alone']
  const width = WORLD_ONE_ROWS[id - 1].width
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
  const row = WORLD_ONE_ROWS[id - 1]
  const { width, height } = row
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
  return {
    id, world: 1, name: row.name, width, height, tileAssets, timeLimit: row.timeLimit, target: row.target,
    initialRows: rows, initialCatCount: initialBoard.flat().filter(Boolean).length, seed,
    threeStarMoves: Math.max(12, Math.ceil(row.target * (id < 7 ? .92 : .98))), twoStarMoves: Math.max(12, Math.ceil(row.target * (id < 7 ? .92 : .98)) + 8),
    previewCount: 2, tutorial: id <= 3 ? `world-one-${id}` : undefined, initialBoard,
    initialCurrent: tileAssets[0], initialCurrentTrait: 'none', initialNext: tileAssets[1], initialNextTrait: 'none',
    initialQueue: queue, initialQueueTraits: queue.map(() => 'none'), scratchPosts: [], fishTreats: [], tunnels: [],
    goals: { rescued: row.target, scratchPosts: 0, fishTreats: 0 }, holdUses: 0, variant: 0, variantCount: 1,
    witness: []
  }
}

export function getWorldOneLevel(id: number): DropLevelDefinition {
  const safeId = Math.min(WORLD_ONE_ROWS.length, Math.max(1, Math.floor(id)))
  return createLevel(safeId)
}

export { WORLD_ONE_ROWS } from './dropWorldOneData'
