import type { CatAsset } from '../types'
import { group, makeLevel, type MatchGroup } from './planningLevelTwo'

type Point = readonly [x: number, y: number]
interface Pattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }

const pattern = (cells: Pattern['cells'], placed: Pattern['placed'] = 1): Pattern => ({ cells, placed })

const LEFT_CHAIN: Pattern[] = [
  pattern([[0, 7], [1, 7], [2, 7]], 2),
  pattern([[3, 7], [4, 7], [2, 6]], 2),
  pattern([[5, 7], [6, 7], [4, 6]], 2)
]

const RIGHT_CHAIN: Pattern[] = [
  pattern([[5, 7], [6, 7], [7, 7]], 2),
  pattern([[3, 7], [4, 7], [5, 6]], 2),
  pattern([[1, 7], [2, 7], [3, 6]], 2)
]

const RIGHT_VERTICAL_CHAIN: Pattern[] = [
  pattern([[7, 5], [7, 6], [7, 7]], 2),
  pattern([[7, 2], [7, 3], [7, 4]], 2)
]

const LEFT_VERTICAL_CHAIN: Pattern[] = [
  pattern([[0, 5], [0, 6], [0, 7]], 2),
  pattern([[0, 2], [0, 3], [0, 4]], 2)
]

const CENTER_VERTICAL_CHAIN: Pattern[] = [
  pattern([[3, 3], [3, 4], [3, 5]], 2),
  pattern([[3, 0], [3, 1], [3, 2]], 2)
]

function authoredLevel(id: number, patterns: Pattern[], types: CatAsset[]) {
  if (patterns.length !== types.length) throw new Error(`Planning level ${id} pattern/type count mismatch`)
  const groups: MatchGroup[] = patterns.map((item, index) => group(types[index], item.cells, item.placed))
  return makeLevel(id, groups)
}

// Chapter three raises density while changing the first clear's direction
// and location. The authored chains zig-zag through the box rather than
// presenting one reusable top-to-bottom sweep.
export const PLANNING_LEVEL_SIXTEEN = authoredLevel(16, [
  ...LEFT_CHAIN,
  pattern([[0, 0], [1, 1], [2, 2]]),
  pattern([[3, 0], [3, 1], [3, 2]]),
  pattern([[5, 1], [6, 1], [7, 1]]),
  pattern([[0, 3], [1, 4], [2, 5]]),
  pattern([[4, 3], [5, 3], [6, 3]]),
  pattern([[7, 3], [7, 4], [7, 5]]),
  pattern([[3, 5], [4, 5], [5, 5]]),
  pattern([[0, 1], [1, 2], [2, 3]]),
  pattern([[4, 0], [4, 1], [4, 2]]),
  pattern([[5, 4], [6, 5], [7, 6]])
], ['fishLover', 'fishLover', 'blue', 'orange', 'orange', 'white', 'fishLover', 'orange', 'white', 'white', 'fishLover', 'white', 'white'])

export const PLANNING_LEVEL_SEVENTEEN = authoredLevel(17, [
  ...RIGHT_CHAIN,
  pattern([[0, 0], [1, 0], [2, 0]]),
  pattern([[3, 0], [3, 1], [3, 2]]),
  pattern([[5, 1], [6, 1], [7, 1]]),
  pattern([[1, 3], [2, 4], [3, 5]]),
  pattern([[4, 3], [5, 3], [6, 3]]),
  ...LEFT_VERTICAL_CHAIN,
  pattern([[5, 4], [6, 5], [7, 6]]),
  pattern([[4, 0], [4, 1], [4, 2]]),
  pattern([[1, 1], [2, 2], [3, 3]]),
  pattern([[1, 6], [2, 5], [3, 4]])
], ['fishLover', 'white', 'blue', 'white', 'blue', 'orange', 'fishLover', 'fishLover', 'fishLover', 'blue', 'fishLover', 'white', 'white', 'fishLover'])

export const PLANNING_LEVEL_EIGHTEEN = authoredLevel(18, [
  ...LEFT_CHAIN,
  ...RIGHT_VERTICAL_CHAIN,
  pattern([[0, 0], [1, 0], [2, 0]]),
  pattern([[3, 0], [3, 1], [3, 2]]),
  pattern([[5, 0], [6, 0], [7, 0]]),
  pattern([[0, 2], [1, 2], [2, 2]]),
  pattern([[4, 2], [5, 2], [6, 2]]),
  pattern([[0, 3], [1, 4], [2, 5]]),
  pattern([[3, 3], [4, 3], [5, 3]]),
  pattern([[0, 4], [0, 5], [0, 6]]),
  pattern([[3, 4], [4, 5], [5, 6]]),
  pattern([[4, 4], [5, 5], [6, 6]])
], ['blue', 'blue', 'orange', 'white', 'blue', 'orange', 'orange', 'fishLover', 'blue', 'blue', 'blue', 'blue', 'fishLover', 'blue', 'white'])

export const PLANNING_LEVEL_NINETEEN = authoredLevel(19, [
  ...RIGHT_CHAIN,
  ...LEFT_VERTICAL_CHAIN,
  pattern([[1, 0], [2, 0], [3, 0]]),
  pattern([[4, 0], [4, 1], [4, 2]]),
  pattern([[7, 0], [7, 1], [7, 2]]),
  pattern([[1, 1], [2, 1], [3, 1]]),
  pattern([[3, 2], [4, 3], [5, 4]]),
  pattern([[1, 3], [2, 3], [3, 3]]),
  pattern([[4, 4], [5, 5], [6, 6]]),
  pattern([[1, 5], [2, 5], [3, 5]]),
  pattern([[1, 4], [2, 4], [3, 4]]),
  pattern([[5, 3], [6, 4], [7, 5]]),
  pattern([[5, 0], [5, 1], [5, 2]])
], ['blue', 'orange', 'white', 'white', 'blue', 'white', 'orange', 'orange', 'blue', 'fishLover', 'blue', 'blue', 'white', 'white', 'orange', 'orange'])

export const PLANNING_LEVEL_TWENTY = authoredLevel(20, [
  ...LEFT_CHAIN,
  ...RIGHT_VERTICAL_CHAIN,
  ...CENTER_VERTICAL_CHAIN,
  pattern([[0, 0], [1, 0], [2, 0]]),
  pattern([[4, 0], [5, 0], [6, 0]]),
  pattern([[0, 1], [1, 1], [2, 1]]),
  pattern([[4, 1], [5, 1], [6, 1]]),
  pattern([[0, 2], [1, 2], [2, 2]]),
  pattern([[4, 2], [5, 2], [6, 2]]),
  pattern([[0, 3], [0, 4], [0, 5]]),
  pattern([[6, 3], [6, 4], [6, 5]]),
  pattern([[1, 4], [2, 5], [3, 6]]),
  pattern([[4, 4], [5, 5], [6, 6]]),
  pattern([[0, 6], [1, 5], [2, 4]])
], ['fishLover', 'blue', 'orange', 'white', 'fishLover', 'white', 'blue', 'white', 'white', 'white', 'fishLover', 'blue', 'blue', 'blue', 'blue', 'fishLover', 'fishLover', 'blue'])

export const PLANNING_LEVELS_THREE = [
  PLANNING_LEVEL_SIXTEEN,
  PLANNING_LEVEL_SEVENTEEN,
  PLANNING_LEVEL_EIGHTEEN,
  PLANNING_LEVEL_NINETEEN,
  PLANNING_LEVEL_TWENTY
] as const
