import type { PlanningLevel } from '../core/planningEngine'

const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
const fixed = [
  [0, 5, 'orange'], [2, 5, 'orange'],
  [2, 7, 'blue'], [3, 7, 'blue'], [4, 7, 'blue'],
  [2, 6, 'white'], [4, 6, 'white']
] as const
fixed.forEach(([x, y, type], index) => { board[y][x] = { id: index + 1, type } })

export const DIVIDER_LEVEL_51: PlanningLevel = {
  id: 51, width: 8, height: 8, board,
  divider: { splitAt: 4, keyCatIds: [1] },
  cats: [{ id: 5101, type: 'orange' }, { id: 5102, type: 'white' }],
  solution: [{ catId: 5101, x: 1, y: 5 }, { catId: 5102, x: 3, y: 6 }]
}
