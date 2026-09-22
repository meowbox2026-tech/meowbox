import type { PlanningLevel } from '../core/planningEngine'
import type { DropBoard } from '../core/dropEngine'

const board: DropBoard = Array.from({ length: 8 }, () => Array(8).fill(null))
board[7][2] = { id: 1, type: 'white' }
board[7][3] = { id: 2, type: 'white' }
board[7][4] = { id: 5, type: 'blue' }
board[6][4] = { id: 6, type: 'blue' }
board[5][4] = { id: 3, type: 'orange' }
board[4][4] = { id: 4, type: 'orange' }

// The player clicks these exact cells. Gravity only changes them after a clear.
export const PLANNING_LEVEL_ONE_SOLUTION = [
  { catId: 7, x: 4, y: 3 }, { catId: 8, x: 4, y: 2 }, { catId: 9, x: 4, y: 1 }
]

export const PLANNING_LEVEL_ONE: PlanningLevel = {
  id: 1,
  width: 8,
  height: 8,
  board,
  cats: [{ id: 7, type: 'orange' }, { id: 8, type: 'blue' }, { id: 9, type: 'white' }],
  solution: PLANNING_LEVEL_ONE_SOLUTION
}
