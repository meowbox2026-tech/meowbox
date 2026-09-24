import type { DropBoard } from '../core/dropEngine'
import type { PlanningLevel } from '../core/planningEngine'
import { validateAuthoredPlanningLevel } from '../core/planningValidation'
import type { CatAsset } from '../types'

type Point = readonly [x: number, y: number]
interface Pattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }

const pattern = (cells: Pattern['cells'], placed: Pattern['placed']): Pattern => ({ cells, placed })

// The fourth chapter keeps the level-20 chain and adds overlapping branch
// groups. Shared fixed cats make the board denser without exceeding 64 cells.
const BASE_PATTERNS: Pattern[] = [
  pattern([[0, 7], [1, 7], [2, 7]], 2), pattern([[3, 7], [4, 7], [2, 6]], 2), pattern([[5, 7], [6, 7], [4, 6]], 2),
  pattern([[7, 5], [7, 6], [7, 7]], 2), pattern([[7, 2], [7, 3], [7, 4]], 2), pattern([[3, 3], [3, 4], [3, 5]], 2),
  pattern([[3, 0], [3, 1], [3, 2]], 2), pattern([[0, 0], [1, 0], [2, 0]], 1), pattern([[4, 0], [5, 0], [6, 0]], 1),
  pattern([[0, 1], [1, 1], [2, 1]], 1), pattern([[4, 1], [5, 1], [6, 1]], 1), pattern([[0, 2], [1, 2], [2, 2]], 1),
  pattern([[4, 2], [5, 2], [6, 2]], 1), pattern([[0, 3], [0, 4], [0, 5]], 1), pattern([[6, 3], [6, 4], [6, 5]], 1),
  pattern([[1, 4], [2, 5], [3, 6]], 1), pattern([[4, 4], [5, 5], [6, 6]], 1), pattern([[0, 6], [1, 5], [2, 4]], 1)
]
const BASE_TYPES: CatAsset[] = ['fishLover', 'blue', 'orange', 'white', 'fishLover', 'white', 'blue', 'white', 'white', 'white', 'fishLover', 'blue', 'blue', 'blue', 'blue', 'fishLover', 'fishLover', 'blue']

const RIGHT_BRANCH = pattern([[7, 0], [7, 1], [7, 2]], 1)
const RIGHT_BRANCH_TYPE: CatAsset = 'fishLover'
const HORIZONTAL_BRANCH = pattern([[4, 3], [5, 3], [6, 3]], 1)
const HORIZONTAL_BRANCH_TYPE: CatAsset = 'blue'

type AuthoredPattern = readonly [Pattern, CatAsset]

const authoredPattern = (type: CatAsset, cells: Pattern['cells'], placed: Pattern['placed']): AuthoredPattern => [pattern(cells, placed), type]

function authoredChapterLevel(id: number, groups: readonly AuthoredPattern[]): PlanningLevel {
  return overlapLevel(id, groups.map(([item]) => item), groups.map(([, type]) => type))
}

type Transform = (point: Point) => Point

function transformPattern(item: Pattern, transform: Transform): Pattern {
  return { ...item, cells: item.cells.map(point => transform(point)) as Pattern['cells'] }
}

function transformPatterns(items: Pattern[], transform: Transform): Pattern[] {
  return items.map(item => transformPattern(item, transform))
}

function overlapLevel(id: number, patterns: Pattern[], types: CatAsset[]): PlanningLevel {
  const board: DropBoard = Array.from({ length: 8 }, () => Array<null | { id: number; type: CatAsset }>(8).fill(null))
  const cats = patterns.map((_, index) => ({ id: id * 100 + index + 1, type: types[index] }))
  const solution: PlanningLevel['solution'] = []
  let fixedId = 1
  patterns.forEach((item, groupIndex) => item.cells.forEach(([x, y], cellIndex) => {
    const type = types[groupIndex]
    if (cellIndex === item.placed) {
      if (board[y][x]) throw new Error(`Planning level ${id} placed overlap at ${x}:${y}`)
      solution.push({ catId: cats[groupIndex].id, x, y })
      return
    }
    if (board[y][x] && board[y][x]!.type !== type) throw new Error(`Planning level ${id} type overlap at ${x}:${y}`)
    if (!board[y][x]) { board[y][x] = { id: fixedId, type }; fixedId += 1 }
  }))
  return validateAuthoredPlanningLevel({ id, width: 8, height: 8, board, cats, solution })
}

function chapterLevel(id: number, transform: Transform, baseCount: number, extras: Array<[Pattern, CatAsset]>): PlanningLevel {
  const patterns = [...transformPatterns(BASE_PATTERNS, transform).slice(0, baseCount), ...extras.map(([item]) => transformPattern(item, transform))]
  return overlapLevel(id, patterns, [...BASE_TYPES.slice(0, baseCount), ...extras.map(([, type]) => type)])
}

const IDENTITY: Transform = ([x, y]) => [x, y]
const FLIP_X: Transform = ([x, y]) => [7 - x, y]
// 21–22 introduce the expert chapter with the older branch lesson. Levels
// 23–25 are authored separately so the final three boards have different
// focal routes instead of being reflections of one another.
export const PLANNING_LEVEL_TWENTY_ONE = chapterLevel(21, IDENTITY, 15, [[RIGHT_BRANCH, RIGHT_BRANCH_TYPE]])
export const PLANNING_LEVEL_TWENTY_TWO = chapterLevel(22, FLIP_X, 15, [[RIGHT_BRANCH, RIGHT_BRANCH_TYPE], [HORIZONTAL_BRANCH, HORIZONTAL_BRANCH_TYPE]])

// 23: a left rail feeds two descending diagonals into a staggered bottom
// shelf. The first solution is not at the top-left, forcing the player to
// read the route rather than sweep the board in row order.
const LEVEL_TWENTY_THREE_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[3, 0], [4, 0], [5, 0]], 0), authoredPattern('blue', [[5, 4], [4, 5], [3, 6]], 1),
  authoredPattern('white', [[5, 2], [4, 3], [3, 4]], 1), authoredPattern('fishLover', [[5, 5], [4, 6], [3, 7]], 2),
  authoredPattern('orange', [[0, 5], [1, 5], [2, 5]], 1), authoredPattern('blue', [[5, 3], [4, 4], [3, 5]], 1),
  authoredPattern('white', [[0, 1], [1, 1], [2, 1]], 1), authoredPattern('fishLover', [[7, 4], [7, 5], [7, 6]], 0),
  authoredPattern('orange', [[5, 1], [6, 1], [7, 1]], 1), authoredPattern('blue', [[5, 7], [6, 7], [7, 7]], 0),
  authoredPattern('white', [[2, 2], [2, 3], [2, 4]], 0), authoredPattern('fishLover', [[0, 6], [1, 6], [2, 6]], 0),
  authoredPattern('orange', [[0, 0], [1, 0], [2, 0]], 2), authoredPattern('blue', [[0, 2], [0, 3], [0, 4]], 1),
  authoredPattern('white', [[6, 3], [6, 4], [6, 5]], 0), authoredPattern('fishLover', [[3, 1], [3, 2], [3, 3]], 1),
  authoredPattern('orange', [[0, 7], [1, 7], [2, 7]], 1), authoredPattern('blue', [[1, 2], [1, 3], [1, 4]], 0)
]

// 24: a central fan crosses a vertical spine and a short bottom shelf. It
// deliberately moves the first choices into the middle of the board.
const LEVEL_TWENTY_FOUR_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[5, 2], [6, 2], [7, 2]], 2), authoredPattern('blue', [[2, 1], [3, 2], [4, 3]], 2),
  authoredPattern('white', [[4, 4], [5, 5], [6, 6]], 0), authoredPattern('fishLover', [[2, 3], [2, 4], [2, 5]], 0),
  authoredPattern('orange', [[0, 0], [0, 1], [0, 2]], 2), authoredPattern('blue', [[2, 0], [3, 1], [4, 2]], 1),
  authoredPattern('white', [[4, 5], [4, 6], [4, 7]], 0), authoredPattern('fishLover', [[0, 5], [0, 6], [0, 7]], 2),
  authoredPattern('orange', [[5, 7], [6, 7], [7, 7]], 2), authoredPattern('blue', [[3, 4], [3, 5], [3, 6]], 1),
  authoredPattern('white', [[1, 7], [2, 7], [3, 7]], 2), authoredPattern('fishLover', [[1, 2], [1, 3], [1, 4]], 0),
  authoredPattern('orange', [[4, 1], [5, 1], [6, 1]], 2), authoredPattern('blue', [[7, 3], [7, 4], [7, 5]], 1),
  authoredPattern('white', [[0, 4], [1, 5], [2, 6]], 0), authoredPattern('fishLover', [[4, 0], [5, 0], [6, 0]], 2),
  authoredPattern('orange', [[1, 1], [2, 2], [3, 3]], 0), authoredPattern('blue', [[6, 3], [6, 4], [6, 5]], 0)
]

// 25: a left-to-right zigzag is interrupted by two outer vertical gates. The
// route is intentionally asymmetric in both density and direction changes.
const LEVEL_TWENTY_FIVE_LAYOUT: AuthoredPattern[] = [
  authoredPattern('orange', [[3, 2], [4, 2], [5, 2]], 0), authoredPattern('blue', [[0, 0], [0, 1], [0, 2]], 2),
  authoredPattern('white', [[3, 3], [2, 4], [1, 5]], 2), authoredPattern('fishLover', [[5, 4], [6, 5], [7, 6]], 1),
  authoredPattern('orange', [[0, 6], [1, 6], [2, 6]], 1), authoredPattern('blue', [[1, 2], [2, 3], [3, 4]], 0),
  authoredPattern('white', [[1, 1], [2, 1], [3, 1]], 1), authoredPattern('fishLover', [[6, 0], [6, 1], [6, 2]], 2),
  authoredPattern('orange', [[4, 3], [5, 3], [6, 3]], 2), authoredPattern('blue', [[0, 7], [1, 7], [2, 7]], 1),
  authoredPattern('white', [[3, 5], [3, 6], [3, 7]], 0), authoredPattern('fishLover', [[0, 3], [1, 4], [2, 5]], 0),
  authoredPattern('orange', [[5, 5], [5, 6], [5, 7]], 1), authoredPattern('blue', [[7, 0], [7, 1], [7, 2]], 1),
  authoredPattern('white', [[1, 0], [2, 0], [3, 0]], 1), authoredPattern('fishLover', [[4, 4], [4, 5], [4, 6]], 2),
  authoredPattern('orange', [[2, 2], [1, 3], [0, 4]], 2), authoredPattern('blue', [[7, 3], [7, 4], [7, 5]], 1)
]

export const PLANNING_LEVEL_TWENTY_THREE = authoredChapterLevel(23, LEVEL_TWENTY_THREE_LAYOUT)
export const PLANNING_LEVEL_TWENTY_FOUR = authoredChapterLevel(24, LEVEL_TWENTY_FOUR_LAYOUT)
export const PLANNING_LEVEL_TWENTY_FIVE = authoredChapterLevel(25, LEVEL_TWENTY_FIVE_LAYOUT)

export const PLANNING_LEVELS_FOUR = [
  PLANNING_LEVEL_TWENTY_ONE,
  PLANNING_LEVEL_TWENTY_TWO,
  PLANNING_LEVEL_TWENTY_THREE,
  PLANNING_LEVEL_TWENTY_FOUR,
  PLANNING_LEVEL_TWENTY_FIVE
] as const
