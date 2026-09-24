import type { CatAsset } from '../types'
import type { Placement, PlanningLevel, PlanningCat } from '../core/planningEngine'
import { validateAuthoredPlanningLevel } from '../core/planningValidation'
import { PLANNING_LEVEL_ONE, PLANNING_LEVEL_ONE_SOLUTION } from './planningLevelOne'
import { PLANNING_LEVELS_TWO } from './planningLevelTwo'
import { PLANNING_LEVELS_THREE } from './planningLevelThree'
import { PLANNING_LEVELS_FOUR } from './planningLevelFour'
import { PLANNING_LEVELS_FIVE } from './planningLevelFive'

type Cell = [x: number, y: number, type: CatAsset]
type Point = [x: number, y: number]
interface MatchPattern { cells: [Point, Point, Point]; placed: 0 | 1 | 2 }

function boardFrom(cells: Cell[]) {
  const board = Array.from({ length: 8 }, () => Array<null | { id: number; type: CatAsset }>(8).fill(null))
  cells.forEach(([x, y, type], index) => {
    if (board[y][x]) throw new Error(`Planning layout overlaps at ${x}:${y}`)
    board[y][x] = { id: index + 1, type }
  })
  return board
}

function catsFrom(types: CatAsset[], startId: number): PlanningCat[] {
  return types.map((type, index) => ({ id: startId + index, type }))
}

function makeLevel(id: number, cells: Cell[], catTypes: CatAsset[], solutionCells: Array<[number, number]>): PlanningLevel {
  const cats = catsFrom(catTypes, id * 100 + 1)
  const solution: Placement[] = cats.map((cat, index) => ({ catId: cat.id, x: solutionCells[index][0], y: solutionCells[index][1] }))
  return validateAuthoredPlanningLevel({ id, width: 8, height: 8, board: boardFrom(cells), cats, solution })
}

const PATTERNS: MatchPattern[] = [
  { cells: [[0, 0], [1, 0], [2, 0]], placed: 1 },
  { cells: [[3, 0], [4, 0], [5, 0]], placed: 1 },
  { cells: [[6, 0], [6, 1], [6, 2]], placed: 0 },
  { cells: [[7, 0], [7, 1], [7, 2]], placed: 2 },
  { cells: [[0, 2], [1, 2], [2, 2]], placed: 1 },
  { cells: [[3, 2], [4, 2], [5, 2]], placed: 0 },
  { cells: [[0, 4], [1, 4], [2, 4]], placed: 2 },
  { cells: [[4, 4], [4, 5], [4, 6]], placed: 1 },
  { cells: [[5, 4], [6, 5], [7, 6]], placed: 1 },
  { cells: [[1, 7], [2, 6], [3, 5]], placed: 1 }
]

type PatternTransform = (point: Point) => Point

function transformPatterns(patterns: MatchPattern[], transform: PatternTransform): MatchPattern[] {
  return patterns.map(pattern => ({
    ...pattern,
    cells: pattern.cells.map(point => transform(point)) as MatchPattern['cells']
  }))
}

const PATTERN_VARIANTS = [
  PATTERNS,
  transformPatterns(PATTERNS, ([x, y]) => [7 - x, y]),
  transformPatterns(PATTERNS, ([x, y]) => [x, 7 - y]),
  transformPatterns(PATTERNS, ([x, y]) => [y, 7 - x]),
  transformPatterns(PATTERNS, ([x, y]) => [7 - x, 7 - y])
]

const FOUR_CATS: CatAsset[] = ['orange', 'blue', 'white', 'alone']

function makeMixedLevel(id: number, patternSet: number, patternOrder: number[]): PlanningLevel {
  const palette = id <= 3 ? FOUR_CATS.slice(0, 3) : FOUR_CATS
  const patterns = PATTERN_VARIANTS[patternSet]
  const cells: Cell[] = []
  const catTypes: CatAsset[] = []
  const solutionCells: Point[] = []
  patternOrder.forEach((patternIndex, index) => {
    const pattern = patterns[patternIndex]
    const type = palette[(index + id) % palette.length]
    pattern.cells.forEach(([x, y], cellIndex) => {
      if (cellIndex === pattern.placed) solutionCells.push([x, y])
      else cells.push([x, y, type])
    })
    catTypes.push(type)
  })
  return makeLevel(id, cells, catTypes, solutionCells)
}

// The first ready group deliberately rotates: horizontal, diagonal, then mixed.
// Later layouts reuse every direction with gaps and an uneven silhouette.
export const PLANNING_LEVEL_TWO = makeMixedLevel(2, 0, [0, 2, 8, 9])
export const PLANNING_LEVEL_THREE = makeMixedLevel(3, 1, [1, 3, 7, 5, 9])
export const PLANNING_LEVEL_FOUR = makeMixedLevel(4, 2, [2, 4, 0, 7, 8, 3])
export const PLANNING_LEVEL_FIVE = makeMixedLevel(5, 3, [8, 9, 6, 4, 1, 7, 0])
export const PLANNING_LEVEL_SIX = makeMixedLevel(6, 4, [3, 5, 2, 8, 0, 6, 9, 7])
export const PLANNING_LEVEL_SEVEN = makeMixedLevel(7, 0, [2, 8, 0, 9, 4, 7, 1, 5, 6])
export const PLANNING_LEVEL_EIGHT = makeMixedLevel(8, 2, [0, 2, 8, 1, 3, 9, 4, 7, 5, 6])
export const PLANNING_LEVEL_NINE = makeMixedLevel(9, 1, [8, 9, 2, 3, 0, 1, 7, 4, 6, 5])
export const PLANNING_LEVEL_TEN = makeMixedLevel(10, 4, [3, 1, 9, 6, 8, 2, 5, 0, 7, 4])

export const PLANNING_LEVELS = [
  PLANNING_LEVEL_ONE,
  PLANNING_LEVEL_TWO,
  PLANNING_LEVEL_THREE,
  PLANNING_LEVEL_FOUR,
  PLANNING_LEVEL_FIVE,
  PLANNING_LEVEL_SIX,
  PLANNING_LEVEL_SEVEN,
  PLANNING_LEVEL_EIGHT,
  PLANNING_LEVEL_NINE,
  PLANNING_LEVEL_TEN,
  ...PLANNING_LEVELS_TWO,
  ...PLANNING_LEVELS_THREE,
  ...PLANNING_LEVELS_FOUR,
  ...PLANNING_LEVELS_FIVE
] as const

export const MAX_PLANNING_LEVEL = PLANNING_LEVELS.length

export function getPlanningLevel(id: number): PlanningLevel {
  return PLANNING_LEVELS.find(level => level.id === id) ?? PLANNING_LEVEL_ONE
}

export { PLANNING_LEVEL_ONE, PLANNING_LEVEL_ONE_SOLUTION }
