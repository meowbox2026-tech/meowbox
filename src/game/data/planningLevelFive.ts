import type { DropBoard } from '../core/dropEngine'
import type { PlanningLevel } from '../core/planningEngine'
import { validateAuthoredPlanningLevel } from '../core/planningValidation'
import type { CatAsset } from '../types'

type Point = readonly [x: number, y: number]
interface Pattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }
type AuthoredPattern = readonly [Pattern, CatAsset]

const pattern = (cells: Pattern['cells'], placed: Pattern['placed']): Pattern => ({ cells, placed })
const authoredPattern = (type: CatAsset, cells: Pattern['cells'], placed: Pattern['placed']): AuthoredPattern => [pattern(cells, placed), type]

function overlapLevel(id: number, groups: readonly AuthoredPattern[]): PlanningLevel {
  const board: DropBoard = Array.from({ length: 8 }, () => Array<null | { id: number; type: CatAsset }>(8).fill(null))
  const cats = groups.map(([, type], index) => ({ id: id * 100 + index + 1, type }))
  const solution: PlanningLevel['solution'] = []
  let fixedId = 1

  groups.forEach(([item, type], groupIndex) => item.cells.forEach(([x, y], cellIndex) => {
    if (cellIndex === item.placed) {
      if (board[y][x]) throw new Error(`Planning level ${id} placed overlap at ${x}:${y}`)
      solution.push({ catId: cats[groupIndex].id, x, y })
      return
    }
    if (board[y][x] && board[y][x]!.type !== type) throw new Error(`Planning level ${id} type overlap at ${x}:${y}`)
    if (!board[y][x]) {
      board[y][x] = { id: fixedId, type }
      fixedId += 1
    }
  }))

  return validateAuthoredPlanningLevel({ id, width: 8, height: 8, board, cats, solution })
}

// 26: the long support column is placed left of center and is interrupted by
// short horizontal and diagonal shelves. The route is intentionally not a
// reflection of the three expert boards before it.
const LEVEL_TWENTY_SIX_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[2, 2], [3, 3], [4, 4]], 0), authoredPattern('blue', [[0, 0], [1, 0], [2, 0]], 1),
  authoredPattern('white', [[5, 0], [5, 1], [5, 2]], 0), authoredPattern('fishLover', [[7, 3], [6, 4], [5, 5]], 0),
  authoredPattern('orange', [[3, 4], [2, 5], [1, 6]], 0), authoredPattern('blue', [[4, 0], [4, 1], [4, 2]], 0),
  authoredPattern('white', [[4, 5], [5, 6], [6, 7]], 0), authoredPattern('fishLover', [[0, 3], [0, 4], [0, 5]], 2),
  authoredPattern('orange', [[0, 2], [1, 3], [2, 4]], 2), authoredPattern('blue', [[0, 7], [1, 7], [2, 7]], 2),
  authoredPattern('white', [[3, 5], [4, 6], [5, 7]], 1), authoredPattern('fishLover', [[3, 0], [3, 1], [3, 2]], 0),
  authoredPattern('orange', [[6, 1], [6, 2], [6, 3]], 1), authoredPattern('blue', [[4, 3], [5, 4], [6, 5]], 0),
  authoredPattern('white', [[7, 0], [7, 1], [7, 2]], 2), authoredPattern('fishLover', [[1, 5], [2, 6], [3, 7]], 0),
  authoredPattern('orange', [[7, 4], [7, 5], [7, 6]], 1)
]

// 27: two uneven vertical wells feed the centre at different heights. Only
// one controlled height-difference merge is required to solve the board.
const LEVEL_TWENTY_SEVEN_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[3, 1], [3, 2], [3, 3]], 1), authoredPattern('blue', [[1, 3], [2, 4], [3, 5]], 0),
  authoredPattern('white', [[5, 0], [6, 0], [7, 0]], 2), authoredPattern('fishLover', [[4, 4], [5, 4], [6, 4]], 1),
  authoredPattern('orange', [[0, 0], [1, 1], [2, 2]], 2), authoredPattern('blue', [[6, 1], [6, 2], [6, 3]], 2),
  authoredPattern('white', [[0, 1], [0, 2], [0, 3]], 0), authoredPattern('fishLover', [[7, 4], [6, 5], [5, 6]], 2),
  authoredPattern('orange', [[1, 0], [2, 0], [3, 0]], 1), authoredPattern('blue', [[4, 1], [4, 2], [4, 3]], 2),
  authoredPattern('white', [[5, 5], [4, 6], [3, 7]], 2), authoredPattern('fishLover', [[4, 5], [3, 6], [2, 7]], 0),
  authoredPattern('orange', [[4, 7], [5, 7], [6, 7]], 1), authoredPattern('blue', [[1, 5], [1, 6], [1, 7]], 2),
  authoredPattern('white', [[2, 1], [1, 2], [0, 3]], 1), authoredPattern('fishLover', [[5, 1], [5, 2], [5, 3]], 1),
  authoredPattern('orange', [[0, 5], [0, 6], [0, 7]], 1), authoredPattern('blue', [[7, 1], [7, 2], [7, 3]], 1)
]

// 28: the centre column is the waiting cross. A lower route starts the
// cascade; the visible upper route is intentionally resolved afterwards.
const LEVEL_TWENTY_EIGHT_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[6, 3], [5, 4], [4, 5]], 1), authoredPattern('blue', [[2, 5], [2, 6], [2, 7]], 1),
  authoredPattern('white', [[1, 4], [2, 4], [3, 4]], 1), authoredPattern('fishLover', [[0, 0], [0, 1], [0, 2]], 1),
  authoredPattern('orange', [[2, 1], [2, 2], [2, 3]], 1), authoredPattern('blue', [[6, 4], [6, 5], [6, 6]], 2),
  authoredPattern('white', [[7, 1], [7, 2], [7, 3]], 2), authoredPattern('fishLover', [[5, 0], [5, 1], [5, 2]], 1),
  authoredPattern('orange', [[5, 3], [4, 4], [3, 5]], 2), authoredPattern('blue', [[4, 0], [4, 1], [4, 2]], 2),
  authoredPattern('white', [[7, 4], [7, 5], [7, 6]], 1), authoredPattern('fishLover', [[3, 7], [4, 7], [5, 7]], 0),
  authoredPattern('orange', [[0, 3], [0, 4], [0, 5]], 0), authoredPattern('blue', [[1, 1], [1, 2], [1, 3]], 1),
  authoredPattern('white', [[3, 0], [3, 1], [3, 2]], 0), authoredPattern('fishLover', [[1, 5], [1, 6], [1, 7]], 0),
  authoredPattern('orange', [[6, 0], [6, 1], [6, 2]], 2), authoredPattern('blue', [[3, 6], [4, 6], [5, 6]], 0)
]

// 29: an open S-shaped route alternates the existing line directions while
// keeping the vertical drops shallow enough to act as a breathing level.
const LEVEL_TWENTY_NINE_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[2, 0], [3, 1], [4, 2]], 1), authoredPattern('blue', [[6, 4], [6, 5], [6, 6]], 1),
  authoredPattern('white', [[2, 4], [3, 4], [4, 4]], 2), authoredPattern('fishLover', [[2, 3], [3, 3], [4, 3]], 1),
  authoredPattern('orange', [[2, 6], [3, 6], [4, 6]], 0), authoredPattern('blue', [[5, 0], [6, 0], [7, 0]], 0),
  authoredPattern('white', [[0, 0], [1, 1], [2, 2]], 2), authoredPattern('fishLover', [[2, 7], [3, 7], [4, 7]], 1),
  authoredPattern('orange', [[5, 4], [5, 5], [5, 6]], 2), authoredPattern('blue', [[7, 1], [6, 2], [5, 3]], 0),
  authoredPattern('white', [[3, 0], [4, 1], [5, 2]], 0), authoredPattern('fishLover', [[5, 7], [6, 7], [7, 7]], 1),
  authoredPattern('orange', [[7, 2], [7, 3], [7, 4]], 0), authoredPattern('blue', [[0, 1], [0, 2], [0, 3]], 2),
  authoredPattern('white', [[1, 5], [2, 5], [3, 5]], 1), authoredPattern('fishLover', [[0, 5], [0, 6], [0, 7]], 2),
  authoredPattern('orange', [[1, 2], [1, 3], [1, 4]], 0), authoredPattern('blue', [[1, 0], [2, 1], [3, 2]], 2)
]

// 30: the final board combines a longer left route, a shorter right route,
// and one shifted centre where the two routes become an 8-way group.
const LEVEL_THIRTY_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[2, 0], [2, 1], [2, 2]], 2), authoredPattern('blue', [[4, 3], [5, 4], [6, 5]], 0),
  authoredPattern('white', [[4, 2], [5, 3], [6, 4]], 0), authoredPattern('fishLover', [[2, 3], [2, 4], [2, 5]], 1),
  authoredPattern('orange', [[5, 0], [5, 1], [5, 2]], 1), authoredPattern('blue', [[3, 3], [3, 4], [3, 5]], 0),
  authoredPattern('white', [[1, 1], [1, 2], [1, 3]], 1), authoredPattern('fishLover', [[5, 5], [6, 6], [7, 7]], 1),
  authoredPattern('orange', [[1, 7], [2, 7], [3, 7]], 0), authoredPattern('blue', [[4, 7], [5, 7], [6, 7]], 2),
  authoredPattern('white', [[7, 3], [7, 4], [7, 5]], 2), authoredPattern('fishLover', [[6, 0], [6, 1], [6, 2]], 2),
  authoredPattern('orange', [[2, 6], [3, 6], [4, 6]], 2), authoredPattern('blue', [[0, 2], [0, 3], [0, 4]], 0),
  authoredPattern('white', [[0, 5], [0, 6], [0, 7]], 0), authoredPattern('fishLover', [[7, 0], [7, 1], [7, 2]], 2),
  authoredPattern('orange', [[3, 0], [3, 1], [3, 2]], 1), authoredPattern('blue', [[1, 4], [1, 5], [1, 6]], 1)
]

export const PLANNING_LEVEL_TWENTY_SIX = overlapLevel(26, LEVEL_TWENTY_SIX_LAYOUT)
export const PLANNING_LEVEL_TWENTY_SEVEN = overlapLevel(27, LEVEL_TWENTY_SEVEN_LAYOUT)
export const PLANNING_LEVEL_TWENTY_EIGHT = overlapLevel(28, LEVEL_TWENTY_EIGHT_LAYOUT)
export const PLANNING_LEVEL_TWENTY_NINE = overlapLevel(29, LEVEL_TWENTY_NINE_LAYOUT)
export const PLANNING_LEVEL_THIRTY = overlapLevel(30, LEVEL_THIRTY_LAYOUT)

export const PLANNING_LEVELS_FIVE = [
  PLANNING_LEVEL_TWENTY_SIX,
  PLANNING_LEVEL_TWENTY_SEVEN,
  PLANNING_LEVEL_TWENTY_EIGHT,
  PLANNING_LEVEL_TWENTY_NINE,
  PLANNING_LEVEL_THIRTY
] as const
