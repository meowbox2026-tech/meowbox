import type { CatAsset } from '../types'
import type { Placement, PlanningLevel, PlanningCat } from '../core/planningEngine'
import { PLANNING_LEVEL_ONE, PLANNING_LEVEL_ONE_SOLUTION } from './planningLevelOne'

type Cell = [x: number, y: number, type: CatAsset]

function boardFrom(cells: Cell[]) {
  const board = Array.from({ length: 8 }, () => Array<null | { id: number; type: CatAsset }>(8).fill(null))
  cells.forEach(([x, y, type], index) => { board[y][x] = { id: index + 1, type } })
  return board
}

function catsFrom(types: CatAsset[], startId: number): PlanningCat[] {
  return types.map((type, index) => ({ id: startId + index, type }))
}

function makeLevel(id: number, cells: Cell[], catTypes: CatAsset[], solutionCells: Array<[number, number]>): PlanningLevel {
  const cats = catsFrom(catTypes, id * 100 + 1)
  const solution: Placement[] = cats.map((cat, index) => ({ catId: cat.id, x: solutionCells[index][0], y: solutionCells[index][1] }))
  return { id, width: 8, height: 8, board: boardFrom(cells), cats, solution }
}

export const PLANNING_LEVEL_TWO = makeLevel(2, [
  [1, 4, 'orange'], [1, 5, 'orange'], [1, 6, 'blue'], [1, 7, 'blue'],
  [4, 6, 'white'], [5, 6, 'white'], [4, 5, 'orange'], [5, 5, 'orange']
], ['orange', 'blue', 'white', 'orange'], [[1, 3], [1, 2], [6, 6], [6, 5]])

export const PLANNING_LEVEL_THREE = makeLevel(3, [
  [0, 4, 'orange'], [0, 5, 'orange'], [0, 6, 'blue'], [0, 7, 'blue'],
  [2, 6, 'white'], [3, 6, 'white'], [2, 5, 'orange'], [3, 5, 'orange'],
  [6, 2, 'blue'], [7, 2, 'blue']
], ['orange', 'blue', 'white', 'orange', 'blue'], [[0, 3], [0, 2], [4, 6], [4, 5], [5, 2]])

export const PLANNING_LEVEL_FOUR = makeLevel(4, [
  [0, 4, 'orange'], [0, 5, 'orange'], [0, 6, 'blue'], [0, 7, 'blue'],
  [2, 6, 'white'], [3, 6, 'white'], [2, 5, 'orange'], [3, 5, 'orange'],
  [5, 4, 'alone'], [6, 4, 'alone'], [5, 5, 'blue'], [6, 5, 'blue']
], ['orange', 'blue', 'white', 'orange', 'alone', 'blue'], [[0, 3], [0, 2], [4, 6], [4, 5], [7, 4], [7, 5]])

export const PLANNING_LEVEL_FIVE = makeLevel(5, [
  [0, 4, 'orange'], [0, 5, 'orange'], [0, 6, 'blue'], [0, 7, 'blue'],
  [7, 4, 'white'], [7, 5, 'white'], [7, 6, 'alone'], [7, 7, 'alone'],
  [2, 4, 'white'], [2, 5, 'white'], [4, 5, 'orange'], [4, 6, 'orange'],
  [5, 1, 'blue'], [5, 2, 'blue']
], ['orange', 'blue', 'white', 'alone', 'white', 'orange', 'blue'], [[0, 3], [0, 2], [7, 3], [7, 2], [2, 3], [4, 4], [5, 0]])

function makeStackLevel(id: number, columns: number[], supports: CatAsset[], bases: CatAsset[]): PlanningLevel {
  const cells: Cell[] = []
  const types: CatAsset[] = []
  const solutionCells: Array<[number, number]> = []
  columns.forEach((x, index) => {
    cells.push([x, 4, supports[index]], [x, 5, supports[index]], [x, 6, bases[index]], [x, 7, bases[index]])
    types.push(supports[index], bases[index])
    solutionCells.push([x, 3], [x, 2])
  })
  return makeLevel(id, cells, types, solutionCells)
}

// Levels 6–10 add one stack at a time. Every stack is two waves: clear its
// support pair, then let the placed base cat fall into the next match.
export const PLANNING_LEVEL_SIX = makeStackLevel(
  6, [0, 2, 4, 6],
  ['orange', 'white', 'orange', 'white'], ['blue', 'alone', 'blue', 'alone']
)

export const PLANNING_LEVEL_SEVEN = makeStackLevel(
  7, [0, 1, 2, 3, 4],
  ['orange', 'alone', 'white', 'orange', 'alone'], ['blue', 'orange', 'blue', 'white', 'blue']
)

export const PLANNING_LEVEL_EIGHT = makeStackLevel(
  8, [0, 1, 2, 3, 4, 5],
  ['orange', 'alone', 'white', 'orange', 'alone', 'white'], ['blue', 'orange', 'blue', 'white', 'blue', 'orange']
)

export const PLANNING_LEVEL_NINE = makeStackLevel(
  9, [0, 1, 2, 5, 6, 7],
  ['orange', 'alone', 'white', 'orange', 'alone', 'white'], ['blue', 'orange', 'blue', 'white', 'blue', 'orange']
)

export const PLANNING_LEVEL_TEN = makeStackLevel(
  10, [0, 1, 2, 3, 4, 5, 6],
  ['orange', 'alone', 'white', 'orange', 'alone', 'white', 'orange'], ['blue', 'orange', 'blue', 'white', 'blue', 'orange', 'blue']
)

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
  PLANNING_LEVEL_TEN
] as const

export function getPlanningLevel(id: number): PlanningLevel {
  return PLANNING_LEVELS.find(level => level.id === id) ?? PLANNING_LEVEL_ONE
}

export { PLANNING_LEVEL_ONE, PLANNING_LEVEL_ONE_SOLUTION }
