import type { CatAsset } from '../types'
import type { PlanningLevel } from '../core/planningEngine'
import { DUAL_BOX_LEVEL_31 } from './planningDualBoxLevel31'

interface AuthoredCat { x: number; y: number; type: CatAsset; tray?: boolean; anchor?: boolean }
const stages = [
  [0, 0], [0, 0], [0, 0],
  [1, 0], [0, 1], [1, 0], [0, 1],
  [1, 1], [2, 0], [0, 2], [1, 1],
  [2, 1], [1, 2], [2, 1], [1, 2],
  [2, 2], [2, 2], [2, 2], [2, 2]
] as const
// Validated card orders, recorded once rather than running a search in the app.
const cardOrders = [
  [8,0,3,4,6,7,5,2,1],
  [1,7,3,9,10,6,0,4,5,2],
  [3,10,5,7,1,11,4,2,0,6,16],
  [2,5,11,18,16,3,6,1,0,7,4],
  [2,1,6,18,17,3,16,7,0,5,4,19],
  [2,19,8,4,7,3,0,17,20,1,6,5,18],
  [0,9,2,6,3,1,4,7,8,10,5,19,18,20],
  [1,18,5,4,8,0,3,21,20,6,23,2,7,22],
  [21,3,1,4,22,9,7,0,5,10,2,8,18,23,6],
  [1,5,6,4,7,9,3,11,0,18,21,2,16,23,8,10],
  [1,18,9,5,2,17,19,0,16,21,3,4,7,6,10,8,11],
  [4,8,0,26,16,21,9,7,6,5,2,3,10,11,1,24,18],
  [0,4,2,6,7,18,1,10,21,19,5,24,8,11,16,17,3,9],
  [6,22,2,5,0,16,19,10,21,11,20,3,17,18,4,24,9,1,7],
  [0,2,4,17,16,3,10,11,6,5,24,22,18,1,20,19,25,21,7,23],
  [10,3,5,17,2,9,1,16,27,11,21,18,19,20,7,0,24,6,22,4],
  [1,20,23,7,3,11,2,21,24,4,0,25,5,10,17,6,18,22,27,16,19],
  [5,16,1,17,2,24,27,20,3,18,7,22,26,0,6,11,21,19,25,23,28,4],
  [1,5,18,16,3,19,0,20,4,26,21,29,27,22,28,6,7,17,25,2,8,23,24],
]
const palette: CatAsset[] = ['boss', 'blue', 'white', 'fishLover', 'orange', 'sunny', 'alone', 'arrogant', 'mischievous']

/** Authored support ladders. Every relay color has two receiving cats and one source cat. */
function createLevel(id: number, index: number): PlanningLevel {
  const [outwardLayers, returnLayers] = stages[index]
  const authored: AuthoredCat[] = []
  const add = (x: number, y: number, type: CatAsset, options: Partial<AuthoredCat> = {}) => authored.push({ x, y, type, ...options })
  // Both support triggers need a placed cat; final card orders vary the start priority.
  add(0, 5, 'boss', { tray: true })
  add(7, 5, 'fishLover', { tray: true })
  add(0, 3, 'blue', { tray: true }); add(0, 2, 'white', { tray: true })
  add(7, 3, 'orange', { tray: true }); add(7, 2, 'white', { tray: true })
  add(4, 6, 'white', { tray: true }); add(1, 6, 'white', { tray: true })
  add(0, 4, 'boss'); add(0, 6, 'boss')
  add(7, 4, 'fishLover'); add(7, 6, 'fishLover')
  // These fixed pairs cannot reach the opposite inlet. A and B are both necessary.
  add(4, 7, 'blue', { anchor: true }); add(6, 7, 'blue', { anchor: true })
  add(1, 7, 'orange', { anchor: true }); add(3, 7, 'orange', { anchor: true })
  add(6, 6, 'white'); add(3, 6, 'white')
  for (let layer = 0; layer < outwardLayers; layer++) {
    const type = palette[5 + layer]
    add(0, 1 - layer, type, { tray: true })
    add(4, 5 - layer, type); add(6, 5 - layer, type)
  }
  for (let layer = 0; layer < returnLayers; layer++) {
    const type = palette[7 + layer]
    add(7, 1 - layer, type, { tray: true })
    add(1, 5 - layer, type); add(3, 5 - layer, type)
  }
  const trayTarget = 9 + index - Math.floor((index + 1) / 4)
  // Later puzzles expose more support/receiving positions while preserving both fixed anchors.
  const candidates = authored.filter(cat => !cat.tray && !cat.anchor)
  const offset = index % Math.max(1, candidates.length)
  const ordered = [...candidates.slice(offset), ...candidates.slice(0, offset)]
  for (const cat of ordered) {
    if (authored.filter(item => item.tray).length >= trayTarget) break
    cat.tray = true
  }
  const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
  const cats: PlanningLevel['cats'] = []
  const solution: PlanningLevel['solution'] = []
  // Mirrors change columns and route positions; color rotations preserve the support dependencies.
  const mapX = (x: number) => {
    const side = Math.floor(x / 4)
    const mirror = side === 0 ? index % 2 : Math.floor(index / 2) % 2
    const column = mirror ? 3 - x % 4 : x % 4
    return ((side + Math.floor(index / 4) % 2) % 2) * 4 + column
  }
  const mapType = (type: CatAsset) => palette[(palette.indexOf(type) + index) % palette.length]
  for (const [catIndex, cat] of authored.entries()) {
    const catId = id * 100 + catIndex + 1
    const x = mapX(cat.x)
    const type = mapType(cat.type)
    if (cat.tray) {
      cats.push({ id: catId, type, homeBox: x < 4 ? 'left' : 'right' })
      solution.push({ catId, x, y: cat.y })
    } else board[cat.y][x] = { id: catId, type }
  }
  const portals = [
    { id: 'A', entry: { x: mapX(0), y: 7 }, exit: { x: mapX(5), y: Math.floor(index / 4) % 5 } },
    { id: 'B', entry: { x: mapX(7), y: 7 }, exit: { x: mapX(2), y: (index + 2) % 5 } }
  ]
  const level: PlanningLevel = { id, width: 8, height: 8, board, cats, solution,
    dualBox: { splitAt: 4, entry: portals[0].entry, exit: portals[0].exit, portals } }
  const order = cardOrders[index].map(catIndex => id * 100 + catIndex + 1)
  return { ...level,
    cats: order.map(catId => cats.find(cat => cat.id === catId)!),
    solution: order.map(catId => solution.find(placement => placement.catId === catId)!) }

}

export const DUAL_BOX_WORLD_2: ReadonlyMap<number, PlanningLevel> = new Map([
  [31, DUAL_BOX_LEVEL_31],
  ...stages.map((_, index): [number, PlanningLevel] => [32 + index, createLevel(32 + index, index)])
])
