import type { PlanningLevel } from '../core/planningEngine'

const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
board[6][0] = { id: 1, type: 'orange' }
board[6][2] = { id: 2, type: 'orange' }
board[4][1] = { id: 3, type: 'white' }
board[7][4] = { id: 4, type: 'blue' }
board[7][6] = { id: 5, type: 'blue' }
board[6][4] = { id: 6, type: 'white' }
board[6][6] = { id: 7, type: 'white' }

// Local preview only: do not include new mechanics in signed remote JSON.
export const DUAL_BOX_LEVEL_61: PlanningLevel = {
  id: 61, width: 8, height: 8, board,
  dualBox: { splitAt: 4, entry: { x: 1, y: 7 }, exit: { x: 5, y: 4 } },
  cats: [{ id: 6101, type: 'orange' }, { id: 6102, type: 'blue' }],
  solution: [{ catId: 6101, x: 1, y: 6 }, { catId: 6102, x: 1, y: 5 }]
}
