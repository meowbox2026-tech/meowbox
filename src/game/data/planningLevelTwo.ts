import type { Placement, PlanningCat, PlanningLevel } from '../core/planningEngine'
import type { CatAsset } from '../types'
import { validateAuthoredPlanningLevel } from '../core/planningValidation'

type Point = readonly [x: number, y: number]
type PlacedCell = 0 | 1 | 2

export interface MatchGroup {
  type: CatAsset
  cells: [Point, Point, Point]
  placed: PlacedCell
}

export const group = (type: CatAsset, cells: [Point, Point, Point], placed: PlacedCell): MatchGroup => ({ type, cells, placed })

export function makeLevel(id: number, groups: MatchGroup[]): PlanningLevel {
  const board = Array.from({ length: 8 }, () => Array<null | { id: number; type: CatAsset }>(8).fill(null))
  const cats: PlanningCat[] = groups.map((match, index) => ({ id: id * 100 + index + 1, type: match.type }))
  const solution: Placement[] = []
  const occupied = new Set<string>()
  let fixedId = 1

  groups.forEach((match, groupIndex) => {
    match.cells.forEach(([x, y], cellIndex) => {
      const key = `${x}:${y}`
      if (occupied.has(key)) throw new Error(`Planning level ${id} overlaps at ${key}`)
      occupied.add(key)
      if (cellIndex === match.placed) {
        solution.push({ catId: cats[groupIndex].id, x, y })
        return
      }
      board[y][x] = { id: fixedId, type: match.type }
      fixedId += 1
    })
  })

  return validateAuthoredPlanningLevel({ id, width: 8, height: 8, board, cats, solution })
}

const h = (type: MatchGroup['type'], x: number, y: number, placed: PlacedCell = 1): MatchGroup => group(type, [[x, y], [x + 1, y], [x + 2, y]], placed)
const v = (type: MatchGroup['type'], x: number, y: number, placed: PlacedCell = 1): MatchGroup => group(type, [[x, y], [x, y + 1], [x, y + 2]], placed)
const down = (type: MatchGroup['type'], x: number, y: number, placed: PlacedCell = 1): MatchGroup => group(type, [[x, y], [x + 1, y + 1], [x + 2, y + 2]], placed)
const up = (type: MatchGroup['type'], x: number, y: number, placed: PlacedCell = 1): MatchGroup => group(type, [[x + 2, y], [x + 1, y + 1], [x, y + 2]], placed)

// 11–15 deliberately change the silhouette every level: a tower, a frame,
// a zigzag, a diamond and a relay. The four colours stay constant so the
// new challenge is reading support and direction, not memorising new rules.
export const PLANNING_LEVEL_ELEVEN = makeLevel(11, [
  h('white', 0, 0), v('orange', 3, 0, 2), down('blue', 5, 0, 0), h('fishLover', 0, 2),
  v('white', 4, 4, 2), h('orange', 5, 3), up('blue', 0, 3, 0), h('fishLover', 0, 6, 2),
  down('white', 5, 5), v('orange', 3, 5, 0)
])

export const PLANNING_LEVEL_TWELVE = makeLevel(12, [
  h('white', 0, 0), h('orange', 5, 0, 2), v('blue', 3, 0), v('fishLover', 4, 0, 2),
  down('white', 0, 2, 0), h('orange', 5, 3), up('blue', 5, 4, 2), h('orange', 0, 6, 2),
  v('blue', 3, 5), h('orange', 5, 7, 0)
])

export const PLANNING_LEVEL_THIRTEEN = makeLevel(13, [
  down('white', 0, 0), h('orange', 4, 0), v('blue', 7, 0, 2), h('fishLover', 0, 3),
  down('white', 3, 3, 0), h('orange', 5, 3, 2), up('blue', 0, 4), v('fishLover', 3, 5, 2),
  h('white', 0, 7), h('orange', 5, 7, 0), v('blue', 7, 4, 1)
])

export const PLANNING_LEVEL_FOURTEEN = makeLevel(14, [
  h('orange', 0, 0), h('blue', 5, 0, 2), down('fishLover', 2, 1, 0), up('white', 5, 2),
  h('orange', 0, 3, 2), v('blue', 3, 3), h('fishLover', 5, 5, 0), up('white', 0, 5, 2),
  h('orange', 3, 7, 1), v('blue', 4, 4), h('orange', 0, 2, 0)
])

export const PLANNING_LEVEL_FIFTEEN = makeLevel(15, [
  down('white', 0, 0, 0), h('orange', 4, 0, 2), v('blue', 7, 0), h('fishLover', 0, 3, 0),
  down('orange', 3, 3, 2), h('orange', 5, 3, 1), up('blue', 0, 4, 1), v('fishLover', 3, 5, 0),
  h('white', 0, 7, 2), h('orange', 5, 7, 0), v('blue', 7, 4, 2), h('fishLover', 3, 1, 1)
])

export const PLANNING_LEVELS_TWO = [
  PLANNING_LEVEL_ELEVEN,
  PLANNING_LEVEL_TWELVE,
  PLANNING_LEVEL_THIRTEEN,
  PLANNING_LEVEL_FOURTEEN,
  PLANNING_LEVEL_FIFTEEN
] as const
