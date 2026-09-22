import type { DropBoard } from '../core/dropEngine'
import type { PlanningLevel } from '../core/planningEngine'
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
const CENTER_BRANCH = pattern([[3, 3], [4, 3], [5, 3]], 2)
const CENTER_BRANCH_TYPE: CatAsset = 'white'
const DIAGONAL_BRANCH = pattern([[5, 4], [4, 5], [3, 6]], 1)
const DIAGONAL_BRANCH_TYPE: CatAsset = 'fishLover'

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
  return { id, width: 8, height: 8, board, cats, solution }
}

function chapterLevel(id: number, extras: Array<[Pattern, CatAsset]>): PlanningLevel {
  return overlapLevel(id, [...BASE_PATTERNS, ...extras.map(([item]) => item)], [...BASE_TYPES, ...extras.map(([, type]) => type)])
}

export const PLANNING_LEVEL_TWENTY_ONE = chapterLevel(21, [[RIGHT_BRANCH, RIGHT_BRANCH_TYPE]])
export const PLANNING_LEVEL_TWENTY_TWO = chapterLevel(22, [[RIGHT_BRANCH, RIGHT_BRANCH_TYPE], [HORIZONTAL_BRANCH, HORIZONTAL_BRANCH_TYPE]])
export const PLANNING_LEVEL_TWENTY_THREE = chapterLevel(23, [[CENTER_BRANCH, CENTER_BRANCH_TYPE], [DIAGONAL_BRANCH, DIAGONAL_BRANCH_TYPE]])
export const PLANNING_LEVEL_TWENTY_FOUR = chapterLevel(24, [[CENTER_BRANCH, CENTER_BRANCH_TYPE], [RIGHT_BRANCH, RIGHT_BRANCH_TYPE], [pattern([[5, 4], [4, 5], [3, 6]], 0), DIAGONAL_BRANCH_TYPE]])
export const PLANNING_LEVEL_TWENTY_FIVE = chapterLevel(25, [[CENTER_BRANCH, CENTER_BRANCH_TYPE], [RIGHT_BRANCH, RIGHT_BRANCH_TYPE], [DIAGONAL_BRANCH, DIAGONAL_BRANCH_TYPE]])

export const PLANNING_LEVELS_FOUR = [
  PLANNING_LEVEL_TWENTY_ONE,
  PLANNING_LEVEL_TWENTY_TWO,
  PLANNING_LEVEL_TWENTY_THREE,
  PLANNING_LEVEL_TWENTY_FOUR,
  PLANNING_LEVEL_TWENTY_FIVE
] as const
