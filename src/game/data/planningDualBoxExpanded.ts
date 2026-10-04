import type { CatAsset } from '../types'
import type { PlanningLevel } from '../core/planningEngine'
import { DUAL_BOX_WORLD_2 } from './planningDualBoxWorld2'

/** Wider boxes retain the support ladders and add a third, required cross-box route. */
function expandLevel(id: number): PlanningLevel {
  const index = (id - 51) % 20
  const columns = id <= 70 ? 5 : 6
  const source = DUAL_BOX_WORLD_2.get(id <= 70 ? 32 + Math.floor(index * 18 / 19) : 47 + Math.floor(index * 3 / 19))!
  const swap = Math.floor(index / 4) % 2 === 1
  const offsets = [index % (columns - 3), Math.floor(index / 2) % (columns - 3)]
  const mapX = (x: number) => {
    const side = Math.floor(x / 4)
    return ((side + Number(swap)) % 2) * columns + offsets[side] + x % 4
  }
  const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(columns * 2).fill(null))
  const remapId = (catId: number) => id * 1000 + catId % 100
  source.board.forEach((row, y) => row.forEach((cat, x) => {
    if (cat) board[y][mapX(x)] = { ...cat, id: remapId(cat.id) }
  }))
  const cats: PlanningLevel['cats'] = source.cats.map(cat => ({ ...cat, id: remapId(cat.id),
    homeBox: (swap ? cat.homeBox === 'left' ? 'right' : 'left' : cat.homeBox) as 'left' | 'right' }))
  const solution = source.solution.map(p => ({ ...p, catId: remapId(p.catId), x: mapX(p.x) }))
  const portals = source.dualBox!.portals!.map(p => ({ ...p,
    entry: { ...p.entry, x: mapX(p.entry.x) }, exit: { ...p.exit, x: mapX(p.exit.x) } }))
  const freeColumn = (originalSide: number) => {
    const column = offsets[originalSide] === 0 ? columns - 1 : 0
    return ((originalSide + Number(swap)) % 2) * columns + column
  }
  const fromSide = index % 2
  const from = freeColumn(fromSide)
  const to = freeColumn(1 - fromSide)
  const baseId = id * 1000 + 100
  board[4][from] = { id: baseId, type: 'sticky' }
  board[6][from] = { id: baseId + 1, type: 'sticky' }
  board[5][to] = { id: baseId + 2, type: 'sleeping' }
  board[6][to] = { id: baseId + 3, type: 'sleeping' }
  const thirdCats: PlanningLevel['cats'] = [
    { id: baseId + 4, type: 'sticky', homeBox: from < columns ? 'left' : 'right' },
    { id: baseId + 5, type: 'sleeping', homeBox: from < columns ? 'left' : 'right' }
  ]
  const thirdPlacements = [{ catId: baseId + 4, x: from, y: 5 }, { catId: baseId + 5, x: from, y: 3 }]
  // Insert the new route's cards at different points without changing the checked ladder order.
  const insertion = (index * 7 + 3) % (cats.length + 1)
  cats.splice(insertion, 0, ...thirdCats)
  solution.splice(insertion, 0, ...thirdPlacements)
  if (id >= 71) {
    const target = 26 + Math.floor(index * 4 / 19)
    const reserved = new Set([13, 14, 15, 16].map(number => id * 1000 + number))
    reserved.add(baseId + 2); reserved.add(baseId + 3)
    for (let y = 0; y < 8; y++) for (let x = 0; x < columns * 2; x++) {
      const cat = board[y][x]
      if (!cat || reserved.has(cat.id) || cats.length >= target) continue
      cats.push({ id: cat.id, type: cat.type as CatAsset, homeBox: x < columns ? 'left' : 'right' })
      solution.push({ catId: cat.id, x, y })
      board[y][x] = null
    }
  }
  portals.push({ id: 'C', entry: { x: from, y: 7 }, exit: { x: to, y: index % 5 } })
  return { id, width: columns * 2, height: 8, board, cats, solution,
    dualBox: { splitAt: columns, entry: portals[0].entry, exit: portals[0].exit, portals } }
}

export const EXPANDED_DUAL_BOX_LEVELS: ReadonlyMap<number, PlanningLevel> = new Map(
  Array.from({ length: 40 }, (_, index) => {
    const id = 51 + index
    return [id, expandLevel(id)]
  })
)
