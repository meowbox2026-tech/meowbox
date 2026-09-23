import type { CatAsset } from '../types'
import { group, makeLevel, type MatchGroup } from './planningLevelTwo'

type Point = readonly [x: number, y: number]
interface Pattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }

const pattern = (cells: Pattern['cells'], placed: Pattern['placed'] = 1): Pattern => ({ cells, placed })
const horizontal = (start: number, y: number, placed: Pattern['placed'] = 1): Pattern => pattern([[start, y], [start + 1, y], [start + 2, y]] as Pattern['cells'], placed)
const vertical = (x: number, start: number, placed: Pattern['placed'] = 1): Pattern => pattern([[x, start], [x, start + 1], [x, start + 2]] as Pattern['cells'], placed)

const ROW_GROUPS: Pattern[] = Array.from({ length: 8 }, (_, row) => [horizontal(0, row), horizontal(4, row)]).flat()
const MOSAIC_ROWS: Pattern[] = Array.from({ length: 8 }, (_, row) => [horizontal(0, row), horizontal(5, row)]).flat()
const CENTER_GROUPS: Pattern[] = [vertical(3, 0), vertical(4, 0), vertical(3, 5), vertical(4, 5)]
const MOSAIC_GROUPS: Pattern[] = [
  MOSAIC_ROWS[0], CENTER_GROUPS[0], MOSAIC_ROWS[1], MOSAIC_ROWS[2], CENTER_GROUPS[1],
  MOSAIC_ROWS[3], MOSAIC_ROWS[4], CENTER_GROUPS[2], MOSAIC_ROWS[5], MOSAIC_ROWS[6],
  CENTER_GROUPS[3], MOSAIC_ROWS[7], MOSAIC_ROWS[8], MOSAIC_ROWS[9], MOSAIC_ROWS[10], MOSAIC_ROWS[11]
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

// 16–19 are a bridge chapter with a visible mechanic per step: shelves, a
// small centre mosaic, a wider mosaic, then a fuller mosaic. Level 20 adds
// the deliberate support chain.
export const PLANNING_LEVEL_SIXTEEN = authoredLevel(16, ROW_GROUPS.slice(0, 13), CHAPTER_TYPES.slice(0, 13))
export const PLANNING_LEVEL_SEVENTEEN = authoredLevel(17, MOSAIC_GROUPS.slice(0, 14), CHAPTER_TYPES.slice(0, 14))
export const PLANNING_LEVEL_EIGHTEEN = authoredLevel(18, MOSAIC_GROUPS.slice(0, 15), CHAPTER_TYPES.slice(0, 15))
export const PLANNING_LEVEL_NINETEEN = authoredLevel(19, MOSAIC_GROUPS, CHAPTER_TYPES.slice(0, 16))

export const PLANNING_LEVEL_TWENTY = authoredLevel(20,
  [...ROW_GROUPS.slice(0, 12), ...SAFE_VERTICALS, ...LEFT_CHAIN],
  [...CHAPTER_TYPES.slice(0, 12), 'blue', 'orange', 'white', 'fishLover', 'orange', 'blue'])

export const PLANNING_LEVELS_THREE = [
  PLANNING_LEVEL_SIXTEEN,
  PLANNING_LEVEL_SEVENTEEN,
  PLANNING_LEVEL_EIGHTEEN,
  PLANNING_LEVEL_NINETEEN,
  PLANNING_LEVEL_TWENTY
] as const
