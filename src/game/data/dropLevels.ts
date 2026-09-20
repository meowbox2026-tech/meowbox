import type { CatAsset } from '../types'
import { findDropMatches, type DropBoard, type DropTile } from '../core/dropEngine'

export interface DropLevelDefinition {
  id: number
  world: 1 | 2
  name: string
  width: number
  height: number
  tileAssets: CatAsset[]
  timeLimit: number
  target: number
  initialRows: number
  seed: number
  threeStarMoves: number
  previewCount: 2 | 3
  tutorial?: string
  initialBoard: DropBoard
  initialCurrent: CatAsset
  initialNext: CatAsset
  initialQueue: CatAsset[]
}

const worldOneNames = [
  '初次相遇', '疊疊午茶', '斜斜的祕密', '一起回家', '小小整理師', '窗邊陽光',
  '小墨報到', '四色軟糖', '愛心接力', '小屋派對', '魚丸來訪', '魚乾時間',
  '軟墊小山', '雙重驚喜', '下午茶會', '陽陽花園', '左右都可愛', '草地接力',
  '大家集合', '花園野餐', '黏黏的朋友', '愛心滿滿', '雨天紙箱', '小小建築師',
  '彩虹小隊', '旅行第一站', '星光接力', '紙箱大搬家', '最後一塊軟墊', '箱長的派對'
] as const

const worldTwoNames = [
  '花園初見', '露珠排隊', '風鈴小徑', '葉影藏貓', '午後花圃', '蜜蜂來信',
  '草葉迷宮', '小徑轉彎', '藤蔓接力', '花園派對', '雨後彩虹', '水窪倒影',
  '蘑菇小屋', '露營時間', '風箏追逐', '星夜花園', '月光階梯', '螢火蟲晚會',
  '夜色紙箱', '花影滿箱', '春日大整理', '四季輪轉', '落葉迷陣', '果實豐收',
  '小徑大集合', '花園守護者', '彩燈連鎖', '祕密溫室', '最後的花瓣', '花園箱長'
] as const

const names = [...worldOneNames, ...worldTwoNames]
const targets = [
  18, 21, 24, 24, 27, 30, 27, 30, 33, 36, 33, 36, 36, 39, 42, 39, 42, 45, 39, 45, 45, 48, 48, 51, 51, 54, 54, 57, 57, 60,
  66, 68, 70, 72, 74, 70, 72, 74, 76, 78, 74, 76, 78, 80, 82, 78, 80, 82, 84, 86, 82, 84, 86, 88, 90, 86, 88, 90, 92, 94
]
const times = [
  120, 120, 120, 115, 110, 105, 120, 115, 110, 105, 115, 110, 105, 105, 100, 115, 110, 105, 120, 115, 110, 105, 105, 100, 115, 110, 105, 105, 100, 100,
  120, 118, 116, 114, 112, 116, 114, 112, 110, 108, 112, 110, 108, 106, 104, 108, 106, 104, 102, 100, 104, 102, 100, 98, 96, 100, 98, 96, 94, 92
]
const sizes = [
  [3, 8], [3, 8], [3, 8], [3, 8],
  [4, 8], [4, 8], [4, 8], [4, 8], [4, 8], [4, 8],
  [5, 8], [5, 8], [5, 8], [5, 8], [5, 8],
  [6, 8], [6, 8], [6, 8], [6, 8], [6, 8],
  [7, 8], [7, 8], [7, 8], [7, 8], [7, 8],
  [8, 8], [8, 8], [8, 8], [8, 8], [8, 8],
  [6, 8], [6, 8], [6, 8], [6, 8], [6, 8],
  [7, 8], [7, 8], [7, 8], [7, 8], [7, 8],
  [8, 8], [8, 8], [8, 8], [8, 8], [8, 8],
  [8, 8], [8, 8], [8, 8], [8, 8], [8, 8],
  [8, 8], [8, 8], [8, 8], [8, 8], [8, 8],
  [8, 8], [8, 8], [8, 8], [8, 8], [8, 8]
] as const

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
  '最後一塊軟墊，速度與高度都要顧好。', '箱長的派對，帶 60 隻貓咪回家！',
  '花園世界開始，現在會同時看見三隻提示。', '露珠排隊，先替下一隻留一條安全路。',
  '風鈴會讓節奏變快，記得看第三隻貓。', '葉影裡的貓咪顏色很接近，慢慢確認。',
  '午後花圃要兼顧高欄與連鎖，不要只看眼前。', '蜜蜂來信：把同色貓咪分到相鄰欄位。',
  '草葉迷宮裡，三隻提示能幫你預留轉彎位置。', '小徑轉彎，先放低最高的那一欄。',
  '藤蔓接力需要連續安排，別把好位置塞滿。', '花園派對，三步預判比盲目連消更穩。',
  '雨後彩虹有更多顏色，先辨認提示邊框。', '水窪倒影會讓欄高變化，保持左右平衡。',
  '蘑菇小屋的空間更緊，優先清除最高的連線。', '露營時間有限，看到三連線就果斷落下。',
  '風箏追逐，第三隻提示是安排連鎖的關鍵。', '星夜花園開始提高密度，至少留一欄呼吸。',
  '月光階梯要控制落點高度，避免連續堆同一欄。', '螢火蟲晚會，善用顏色提示找出下一組。',
  '夜色紙箱的貓咪更多，先整理兩側再處理中央。', '花影滿箱，連鎖與空間要一起顧好。',
  '春日大整理，先消高欄再追求漂亮 Combo。', '四季輪轉會考驗記憶，三隻提示都要看完。',
  '落葉迷陣，保留低處空間才能接住好牌。', '果實豐收，目標提高但每次連鎖都很重要。',
  '小徑大集合，讓不同顏色分層落下比較穩。', '花園守護者，預留兩步空間再開始大連鎖。',
  '彩燈連鎖是後段挑戰，先穩住高度再加速。', '祕密溫室的顏色很多，依提示邊框確認貓咪。',
  '最後的花瓣，時間與高度都不能放鬆。', '花園箱長，帶回 94 隻貓咪完成世界 2！'
]

const ALL_DROP_CATS: CatAsset[] = [
  'orange', 'blue', 'white', 'alone', 'arrogant', 'sunny',
  'fishLover', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'
]

function assetsFor(id: number): CatAsset[] {
  if (id <= 4) return ['orange', 'blue', 'white', 'alone']
  const width = sizes[id - 1][0]
  const count = width + (id > 30 ? 2 : 1)
  const start = (id > 30 ? id * 3 : id - 5) % ALL_DROP_CATS.length
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

function createQueue(assets: CatAsset[], seed: number, length = 12): CatAsset[] {
  return Array.from({ length }, (_, index) => assets[(seed + index + 1) % assets.length])
}

function createWorldTwoBoard(width: number, height: number, assets: CatAsset[], rows: number, seed: number, openingType: CatAsset): DropBoard {
  const pairRow = Math.max(0, height - rows - 1)
  for (let attempt = 0; attempt < assets.length * 4; attempt += 1) {
    const board = createInitialBoard(width, height, assets, rows, seed + attempt)
    board[pairRow][0] = { id: 9000 + attempt * 2, type: openingType }
    board[pairRow][1] = { id: 9001 + attempt * 2, type: openingType }
    if (!findDropMatches(board).length) return board
  }
  return createInitialBoard(width, height, assets, rows, seed)
}

function createWorldTwoPreview(tileAssets: CatAsset[], seed: number, target: number): CatAsset[] {
  const groupCount = Math.ceil(target / 3)
  const order = Array.from({ length: groupCount }, (_, index) => tileAssets[(seed + index) % tileAssets.length])
  return order.flatMap((type) => [type, type, type])
}

function createLevel(id: number): DropLevelDefinition {
  const [width, height] = sizes[id - 1]
  const world = id <= 30 ? 1 : 2
  const tileAssets = assetsFor(id)
  const tutorial = id <= 3
  const initialRows = id <= 3 ? 2 : id <= 15 ? 3 : id <= 30 ? 4 : id <= 40 ? 3 : id <= 50 ? 4 : 5
  const seed = id * 17
  const worldTwoPreview = world === 2 ? createWorldTwoPreview(tileAssets, seed, targets[id - 1]) : undefined
  const openingType = worldTwoPreview?.[0] ?? tileAssets[0]
  return {
    id, world, name: names[id - 1], width, height, tileAssets,
    timeLimit: times[id - 1], target: targets[id - 1], initialRows, seed,
    threeStarMoves: Math.max(12, Math.ceil(targets[id - 1] * (world === 2 ? .94 : id < 7 ? .92 : .98))),
    previewCount: world === 2 ? 3 : 2,
    tutorial: guidance[id - 1],
    initialBoard: id === 1 ? createTutorialBoard() : id === 2 ? createVerticalTutorialBoard(tileAssets[0]) : id === 3 ? createDiagonalTutorialBoard(tileAssets[0]) : id === 4 ? createChainTutorialBoard(tileAssets[0], tileAssets[1]) : world === 2 ? createWorldTwoBoard(width, height, tileAssets, initialRows, seed, openingType) : createInitialBoard(width, height, tileAssets, initialRows, seed),
    initialCurrent: worldTwoPreview?.[0] ?? tileAssets[0], initialNext: worldTwoPreview?.[1] ?? tileAssets[1],
    initialQueue: tutorial ? ['blue', 'white', 'white', 'orange', 'orange', 'orange', 'blue', 'white', 'blue'] : worldTwoPreview?.slice(2) ?? createQueue(tileAssets, seed)
  }
}

export const DROP_LEVELS: DropLevelDefinition[] = Array.from({ length: 60 }, (_, index) => createLevel(index + 1))

export function getDropLevelById(id: number): DropLevelDefinition {
  return DROP_LEVELS.find(level => level.id === id) ?? DROP_LEVELS[0]
}
