import type { CatAsset } from '../types'
import { group, makeLevel, type MatchGroup } from './planningLevelTwo'

type Point = readonly [x: number, y: number]
interface Pattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }

const pattern = (cells: Pattern['cells'], placed: Pattern['placed'] = 1): Pattern => ({ cells, placed })
const horizontal = (start: number, y: number, placed: Pattern['placed'] = 1): Pattern => pattern([[start, y], [start + 1, y], [start + 2, y]] as Pattern['cells'], placed)
const vertical = (x: number, start: number, placed: Pattern['placed'] = 1): Pattern => pattern([[x, start], [x, start + 1], [x, start + 2]] as Pattern['cells'], placed)
const horizontalRows = (start: number, count = 8): Pattern[] => Array.from({ length: count }, (_, row) => horizontal(start, row))

const SHELF_LEFT = horizontalRows(0)
const SHELF_RIGHT = horizontalRows(4)
const ROW_GROUPS: Pattern[] = SHELF_LEFT.flatMap((left, row) => [left, SHELF_RIGHT[row]])
const CENTER_GROUPS: Pattern[] = [vertical(3, 0), vertical(4, 0), vertical(3, 5), vertical(4, 5)]
const LEVEL_SEVENTEEN_LEFT: Pattern[] = [
  vertical(0, 0, 0), vertical(1, 1), vertical(2, 2), vertical(0, 4), vertical(1, 5, 0)
]
const LEVEL_EIGHTEEN_LEFT: Pattern[] = [
  horizontal(0, 0), horizontal(0, 1), horizontal(0, 2), horizontal(0, 3, 2), horizontal(0, 4, 0), vertical(0, 5)
]
const LEVEL_NINETEEN_LEFT: Pattern[] = [
  vertical(0, 0, 0), vertical(1, 1), vertical(2, 2, 2), vertical(3, 0), horizontal(0, 5), horizontal(1, 6, 2)
]
const LEVEL_TWENTY_LEFT: Pattern[] = [
  vertical(0, 0), vertical(1, 0), vertical(2, 0, 2), horizontal(0, 3), vertical(0, 4), vertical(1, 4)
]
const SAFE_VERTICALS: Pattern[] = [vertical(3, 0), vertical(7, 0), vertical(7, 3)]
const LEFT_CHAIN: Pattern[] = [
  pattern([[0, 7], [1, 7], [2, 7]], 2),
  pattern([[3, 7], [4, 7], [2, 6]], 2),
  pattern([[5, 7], [6, 7], [4, 6]], 2)
]

function authoredLevel(id: number, patterns: Pattern[], catTypes: CatAsset[]): ReturnType<typeof makeLevel> {
  if (patterns.length !== catTypes.length) throw new Error(`Planning level ${id} pattern/type count mismatch`)
  const groups: MatchGroup[] = patterns.map((item, index) => group(catTypes[index], item.cells, item.placed))
  return makeLevel(id, groups)
}

const CHAPTER_TYPES: CatAsset[] = ['orange', 'blue', 'white', 'fishLover', 'orange', 'blue', 'white', 'fishLover', 'orange', 'blue', 'white', 'fishLover', 'orange', 'blue', 'white', 'fishLover', 'orange', 'blue']

// 16–20 are a bridge chapter with a visible mechanic per step. Each level
// keeps the same density targets but changes the left contour so the player
// must read the current board instead of memorising one repeated shelf.
export const PLANNING_LEVEL_SIXTEEN = authoredLevel(16, ROW_GROUPS.slice(0, 13), CHAPTER_TYPES.slice(0, 13))
export const PLANNING_LEVEL_SEVENTEEN = authoredLevel(17, [...LEVEL_SEVENTEEN_LEFT, ...CENTER_GROUPS, ...horizontalRows(5, 5)], CHAPTER_TYPES.slice(0, 14))
export const PLANNING_LEVEL_EIGHTEEN = authoredLevel(18, [...LEVEL_EIGHTEEN_LEFT, ...CENTER_GROUPS, ...horizontalRows(5, 5)], CHAPTER_TYPES.slice(0, 15))
export const PLANNING_LEVEL_NINETEEN = authoredLevel(19, [...LEVEL_NINETEEN_LEFT, vertical(4, 0), vertical(4, 5), ...horizontalRows(5)], CHAPTER_TYPES.slice(0, 16))

export const PLANNING_LEVEL_TWENTY = authoredLevel(20,
  [...LEVEL_TWENTY_LEFT, ...SHELF_RIGHT.slice(0, 6), ...SAFE_VERTICALS, ...LEFT_CHAIN],
  [...CHAPTER_TYPES.slice(0, 12), 'blue', 'orange', 'white', 'fishLover', 'orange', 'blue'])

export const PLANNING_LEVELS_THREE = [
  PLANNING_LEVEL_SIXTEEN,
  PLANNING_LEVEL_SEVENTEEN,
  PLANNING_LEVEL_EIGHTEEN,
  PLANNING_LEVEL_NINETEEN,
  PLANNING_LEVEL_TWENTY
] as const
