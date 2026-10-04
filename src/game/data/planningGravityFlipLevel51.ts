import type { PlanningLevel } from '../core/planningEngine'

const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
const fixed = [
  [1, 5, 'orange'], [3, 5, 'orange'],
  [1, 0, 'blue'], [3, 0, 'blue'], [2, 3, 'blue'],
  [1, 1, 'white'], [3, 1, 'white']
] as const
fixed.forEach(([x, y, type], index) => { board[y][x] = { id: index + 1, type } })

// A local mechanic preview. The fixed middle blue cat makes the flip necessary.
export const GRAVITY_FLIP_LEVEL_51: PlanningLevel = {
  id: 51, width: 8, height: 8, board,
  gravityFlip: { switchCatIds: [1] },
  cats: [{ id: 5101, type: 'orange' }, { id: 5102, type: 'white' }],
  solution: [{ catId: 5101, x: 2, y: 5 }, { catId: 5102, x: 2, y: 4 }]
}
