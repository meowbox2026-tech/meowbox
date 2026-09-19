import type { CatAsset } from '../types'
import type { DropBoard, DropTile } from '../core/dropEngine'

export interface DropLevelDefinition {
  id: number
  name: string
  width: number
  height: number
  tileAssets: CatAsset[]
  timeLimit: number
  target: number
  initialRows: number
  seed: number
  threeStarMoves: number
  tutorial?: string
  initialBoard: DropBoard
  initialCurrent: CatAsset
  initialNext: CatAsset
  initialQueue: CatAsset[]
}

const names = [
  '初次相遇', '疊疊午茶', '斜斜的祕密', '一起回家', '小小整理師', '窗邊陽光',
  '小墨報到', '四色軟糖', '愛心接力', '小屋派對', '魚丸來訪', '魚乾時間',
  '軟墊小山', '雙重驚喜', '下午茶會', '陽陽花園', '左右都可愛', '草地接力',
  '大家集合', '花園野餐', '黏黏的朋友', '愛心滿滿', '雨天紙箱', '小小建築師',
  '彩虹小隊', '旅行第一站', '星光接力', '紙箱大搬家', '最後一塊軟墊', '箱長的派對'
] as const

const targets = [18, 21, 24, 24, 27, 30, 27, 30, 33, 36, 33, 36, 36, 39, 42, 39, 42, 45, 39, 45, 45, 48, 48, 51, 51, 54, 54, 57, 57, 60]
const times = [120, 120, 120, 115, 110, 105, 120, 115, 110, 105, 115, 110, 105, 105, 100, 115, 110, 105, 120, 115, 110, 105, 105, 100, 115, 110, 105, 105, 100, 100]
const sizes = [
  [3, 8], [3, 8], [3, 8], [3, 8],
  [4, 8], [4, 8], [4, 8], [4, 8], [4, 8], [4, 8],
  [5, 8], [5, 8], [5, 8], [5, 8], [5, 8],
  [6, 8], [6, 8], [6, 8], [6, 8], [6, 8],
  [7, 8], [7, 8], [7, 8], [7, 8], [7, 8],
  [8, 8], [8, 8], [8, 8], [8, 8], [8, 8]
] as const

const threeStarMoves = targets.map((target, index) => Math.max(12, Math.ceil(target * (index < 6 ? .92 : .98))))
const guidance = [
  '先點第 3 欄，讓三隻橘子相遇！', '把同款貓咪疊在一起，試試直線消除。',
  '階梯上的貓咪可以組成兩種斜線。', '先消除眼前的線，看看重力會帶來什麼。',
  '看好 NEXT，提前替下一隻留一個位置。', '欄位高低不同時，先處理最高的地方。',
  '小墨加入了，記住黑色耳朵的樣子。', '四種貓咪一起來，分欄整理更輕鬆。',
  '讓一次落下帶來兩次喵喵聲。', '小屋派對開始，穩穩累積消除數。',
  '魚丸來訪，留意牠的藍色小魚。', '保持左右空間，魚丸會找到朋友。',
  '軟墊小山很高，先替下一隻留落點。', '連鎖會讓分數快速長大。',
  '下午茶前，先把最高欄位整理好。', '陽陽把花園的陽光帶進紙箱。',
  '左右兩邊都能成線，沒有唯一答案。', '寬一點的箱子可以放心分散貓咪。',
  '第五種貓咪報到，先確認顏色再落下。', '花園野餐需要慢慢看 NEXT。',
  '黏黏在箱子旁邊替你加油。', '愛心連鎖越多，分數越漂亮。',
  '箱子變高了，記得觀察頂端警戒線。', '先整理高欄，再把貓咪送回家。',
  '彩虹小隊要在不同欄位保持平衡。', '旅行開始，沿用你最順手的策略。',
  '星光會在連鎖時亮起來。', '搬家前先留出至少一排空間。',
  '最後一塊軟墊，速度與高度都要顧好。', '箱長的派對，帶 60 隻貓咪回家！'
]

const ALL_DROP_CATS: CatAsset[] = [
  'orange', 'blue', 'white', 'alone', 'arrogant', 'sunny',
  'fishLover', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'
]

function assetsFor(id: number): CatAsset[] {
  if (id <= 4) return ['orange', 'blue', 'white', 'alone']
  const width = sizes[id - 1][0]
  const count = width + 1
  const start = (id - 5) % ALL_DROP_CATS.length
  return Array.from({ length: count }, (_, index) => ALL_DROP_CATS[(start + index) % ALL_DROP_CATS.length])
}

function createTutorialBoard(): DropBoard {
  const board: DropBoard = Array.from({ length: 8 }, () => Array<DropTile | null>(3).fill(null))
  board[7][0] = { id: 1, type: 'orange' }
  board[7][1] = { id: 2, type: 'orange' }
  board[6][0] = { id: 3, type: 'blue' }
  board[6][1] = { id: 4, type: 'white' }
  return board
}

function createVerticalTutorialBoard(type: CatAsset): DropBoard {
  const board = Array.from({ length: 8 }, () => Array<DropTile | null>(3).fill(null))
  board[7][2] = { id: 1, type }
  board[6][2] = { id: 2, type }
  board[7][0] = { id: 3, type: 'blue' }
  board[7][1] = { id: 4, type: 'white' }
  return board
}

function createDiagonalTutorialBoard(type: CatAsset): DropBoard {
  const board = Array.from({ length: 8 }, () => Array<DropTile | null>(3).fill(null))
  board[6][1] = { id: 1, type }
  board[7][2] = { id: 2, type }
  board[6][0] = { id: 3, type: 'white' }
  return board
}

function createChainTutorialBoard(first: CatAsset, second: CatAsset): DropBoard {
  const board = Array.from({ length: 8 }, () => Array<DropTile | null>(3).fill(null))
  board[7][1] = { id: 1, type: first }
  board[7][2] = { id: 2, type: first }
  // Keep the teaching chain low enough that the opening board is not already
  // flashing the ceiling warning. After the orange row clears, gravity still
  // gathers these three blue cats into the second wave.
  board[2][1] = { id: 3, type: second }
  board[4][1] = { id: 4, type: second }
  board[6][1] = { id: 5, type: second }
  return board
}

function canPlace(board: DropBoard, x: number, y: number, type: string): boolean {
  const directions = [[1, 0], [0, -1], [1, -1], [-1, -1]]
  return directions.every(([dx, dy]) => {
    const first = board[y - dy]?.[x - dx]?.type === type
    const second = board[y - dy * 2]?.[x - dx * 2]?.type === type
    return !(first && second)
  })
}

function createInitialBoard(width: number, height: number, assets: CatAsset[], rows: number, seed: number): DropBoard {
  const board: DropBoard = Array.from({ length: height }, () => Array<DropTile | null>(width).fill(null))
  let id = 1
  for (let y = height - 1; y >= Math.max(0, height - rows); y -= 1) {
    for (let x = 0; x < width; x += 1) {
      for (let offset = 0; offset < assets.length; offset += 1) {
        const type = assets[(seed + id + offset) % assets.length]
        if (canPlace(board, x, y, type)) {
          board[y][x] = { id, type }
          id += 1
          break
        }
      }
    }
  }
  return board
}

function createQueue(assets: CatAsset[], seed: number): CatAsset[] {
  return Array.from({ length: 12 }, (_, index) => assets[(seed + index + 1) % assets.length])
}

function createLevel(id: number): DropLevelDefinition {
  const [width, height] = sizes[id - 1]
  const tileAssets = assetsFor(id)
  const tutorial = id <= 3
  const initialRows = id <= 3 ? 2 : id <= 15 ? 3 : id <= 22 ? 3 : 4
  const seed = id * 17
  return {
    id, name: names[id - 1], width, height, tileAssets,
    timeLimit: times[id - 1], target: targets[id - 1], initialRows, seed,
    threeStarMoves: Math.max(12, Math.ceil(targets[id - 1] * (id < 7 ? .92 : .98))),
    tutorial: guidance[id - 1],
    initialBoard: id === 1 ? createTutorialBoard() : id === 2 ? createVerticalTutorialBoard(tileAssets[0]) : id === 3 ? createDiagonalTutorialBoard(tileAssets[0]) : id === 4 ? createChainTutorialBoard(tileAssets[0], tileAssets[1]) : createInitialBoard(width, height, tileAssets, initialRows, seed),
    initialCurrent: tileAssets[0], initialNext: tileAssets[1],
    initialQueue: tutorial ? ['blue', 'white', 'white', 'orange', 'orange', 'orange', 'blue', 'white', 'blue'] : createQueue(tileAssets, seed)
  }
}

export const DROP_LEVELS: DropLevelDefinition[] = Array.from({ length: 30 }, (_, index) => createLevel(index + 1))

export function getDropLevelById(id: number): DropLevelDefinition {
  return DROP_LEVELS.find(level => level.id === id) ?? DROP_LEVELS[0]
}
