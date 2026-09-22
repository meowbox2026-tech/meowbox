import type { Placement, PlanningCat, PlanningLevel } from '../core/planningEngine'
import type { CatAsset } from '../types'

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

  return { id, width: 8, height: 8, board, cats, solution }
}

// The first three groups form a supported hand-off: clearing the lower row
// drops the next placed cat into the following horizontal group.
const CHAIN_LEFT: MatchGroup[] = [
  group('orange', [[0, 7], [1, 7], [2, 7]], 2),
  group('blue', [[3, 7], [4, 7], [2, 6]], 2),
  group('fishLover', [[5, 7], [6, 7], [4, 6]], 2)
]

const CHAIN_RIGHT: MatchGroup[] = [
  group('orange', [[5, 7], [6, 7], [7, 7]], 2),
  group('blue', [[3, 7], [4, 7], [5, 6]], 2),
  group('fishLover', [[1, 7], [2, 7], [3, 6]], 2)
]

export const PLANNING_LEVEL_ELEVEN = makeLevel(11, [
  group('white', [[0, 0], [1, 0], [2, 0]], 1),
  group('orange', [[5, 0], [6, 0], [7, 0]], 1),
  group('fishLover', [[2, 1], [3, 2], [4, 3]], 1),
  group('blue', [[0, 2], [1, 2], [2, 2]], 1),
  group('blue', [[3, 0], [4, 1], [5, 2]], 1),
  group('white', [[0, 4], [1, 4], [2, 4]], 2),
  group('orange', [[5, 4], [6, 4], [7, 4]], 2),
  ...CHAIN_LEFT
])

export const PLANNING_LEVEL_TWELVE = makeLevel(12, [
  group('white', [[0, 0], [1, 0], [2, 0]], 1),
  group('orange', [[5, 0], [6, 0], [7, 0]], 1),
  group('fishLover', [[2, 1], [3, 2], [4, 3]], 1),
  group('blue', [[0, 2], [1, 2], [2, 2]], 1),
  group('blue', [[3, 0], [4, 1], [5, 2]], 1),
  group('white', [[0, 4], [1, 4], [2, 4]], 2),
  group('orange', [[5, 4], [6, 4], [7, 4]], 2),
  ...CHAIN_RIGHT
])

export const PLANNING_LEVEL_THIRTEEN = makeLevel(13, [
  group('white', [[0, 0], [1, 0], [2, 0]], 1),
  group('orange', [[5, 0], [6, 0], [7, 0]], 1),
  group('blue', [[3, 0], [3, 1], [3, 2]], 1),
  group('white', [[4, 0], [4, 1], [4, 2]], 1),
  group('blue', [[0, 2], [1, 2], [2, 2]], 1),
  group('fishLover', [[5, 2], [6, 2], [7, 2]], 1),
  group('white', [[0, 4], [1, 4], [2, 4]], 2),
  group('orange', [[5, 4], [6, 4], [7, 4]], 2),
  ...CHAIN_LEFT
])

export const PLANNING_LEVEL_FOURTEEN = makeLevel(14, [
  group('orange', [[0, 7], [1, 7], [2, 7]], 2),
  group('blue', [[5, 7], [6, 7], [7, 7]], 1),
  group('fishLover', [[3, 5], [3, 6], [3, 7]], 0),
  group('white', [[0, 4], [1, 4], [2, 4]], 2),
  group('orange', [[5, 4], [6, 4], [7, 4]], 2),
  group('blue', [[0, 2], [1, 2], [2, 2]], 1),
  group('fishLover', [[5, 2], [6, 2], [7, 2]], 1),
  group('white', [[0, 0], [1, 0], [2, 0]], 1),
  group('orange', [[5, 0], [6, 0], [7, 0]], 1),
  group('blue', [[3, 0], [3, 1], [3, 2]], 1),
  group('fishLover', [[4, 2], [4, 3], [4, 4]], 1)
])

export const PLANNING_LEVEL_FIFTEEN = makeLevel(15, [
  group('white', [[5, 0], [6, 0], [7, 0]], 1),
  group('orange', [[3, 0], [3, 1], [3, 2]], 1),
  group('blue', [[4, 0], [4, 1], [4, 2]], 1),
  group('white', [[0, 1], [1, 1], [2, 1]], 1),
  group('blue', [[0, 2], [1, 2], [2, 2]], 1),
  group('fishLover', [[5, 2], [6, 2], [7, 2]], 1),
  group('fishLover', [[2, 3], [3, 4], [4, 5]], 1),
  group('white', [[0, 4], [1, 4], [2, 4]], 2),
  group('orange', [[5, 4], [6, 4], [7, 4]], 2),
  ...CHAIN_LEFT
])

export const PLANNING_LEVELS_TWO = [
  PLANNING_LEVEL_ELEVEN,
  PLANNING_LEVEL_TWELVE,
  PLANNING_LEVEL_THIRTEEN,
  PLANNING_LEVEL_FOURTEEN,
  PLANNING_LEVEL_FIFTEEN
] as const
