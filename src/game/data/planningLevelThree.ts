import type { CatAsset } from '../types'
import { group, makeLevel, type MatchGroup } from './planningLevelTwo'

type Point = readonly [x: number, y: number]
interface Pattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }

const pattern = (cells: Pattern['cells'], placed: Pattern['placed'] = 1): Pattern => ({ cells, placed })
const horizontal = (start: number, y: number): Pattern => pattern([[start, y], [start + 1, y], [start + 2, y]] as Pattern['cells'])

const ROW_GROUPS: Pattern[] = Array.from({ length: 8 }, (_, row) => [horizontal(0, row), horizontal(4, row)]).flat()
const SAFE_VERTICALS: Pattern[] = [
  pattern([[3, 0], [3, 1], [3, 2]]),
  pattern([[7, 0], [7, 1], [7, 2]]),
  pattern([[7, 3], [7, 4], [7, 5]])
]

const LEFT_CHAIN: Pattern[] = [
  pattern([[0, 7], [1, 7], [2, 7]], 2),
  pattern([[3, 7], [4, 7], [2, 6]], 2),
  pattern([[5, 7], [6, 7], [4, 6]], 2)
]

function authoredLevel(id: number, patterns: Pattern[], catTypes: CatAsset[]) {
  if (patterns.length !== catTypes.length) throw new Error(`Planning level ${id} pattern/type count mismatch`)
  const groups: MatchGroup[] = patterns.map((item, index) => group(catTypes[index], item.cells, item.placed))
  return makeLevel(id, groups)
}

const types = (values: CatAsset[]): CatAsset[] => values
const ROW_TYPES: CatAsset[] = ['orange', 'blue', 'white', 'fishLover', 'orange', 'blue', 'white', 'fishLover', 'orange', 'blue', 'white', 'fishLover', 'orange', 'blue', 'white', 'fishLover']

// 16–20 are a bridge chapter. Rows are cleared from top to bottom first, so
// the player can read the next target before level 20 adds one short support
// chain. The amount grows, but several simultaneous branches do not.
export const PLANNING_LEVEL_SIXTEEN = authoredLevel(16, ROW_GROUPS.slice(0, 13), types(ROW_TYPES.slice(0, 13)))
export const PLANNING_LEVEL_SEVENTEEN = authoredLevel(17, ROW_GROUPS.slice(0, 14), types(ROW_TYPES.slice(0, 14)))
export const PLANNING_LEVEL_EIGHTEEN = authoredLevel(18, ROW_GROUPS.slice(0, 15), types(ROW_TYPES.slice(0, 15)))
export const PLANNING_LEVEL_NINETEEN = authoredLevel(19, ROW_GROUPS, types(ROW_TYPES))

export const PLANNING_LEVEL_TWENTY = authoredLevel(20,
  [...ROW_GROUPS.slice(0, 12), ...SAFE_VERTICALS, ...LEFT_CHAIN],
  types([
    ...ROW_TYPES.slice(0, 12),
    'blue', 'orange', 'white',
    'fishLover', 'orange', 'blue'
  ]))

export const PLANNING_LEVELS_THREE = [
  PLANNING_LEVEL_SIXTEEN,
  PLANNING_LEVEL_SEVENTEEN,
  PLANNING_LEVEL_EIGHTEEN,
  PLANNING_LEVEL_NINETEEN,
  PLANNING_LEVEL_TWENTY
] as const
