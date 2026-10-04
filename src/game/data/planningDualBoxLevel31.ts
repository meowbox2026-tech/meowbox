import type { PlanningLevel } from '../core/planningEngine'

const board: PlanningLevel['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
const fixed = [
  [0, 5, 'orange'], [2, 5, 'orange'],
  [4, 7, 'blue'], [4, 6, 'white'],
  [7, 4, 'fishLover'], [7, 6, 'fishLover'], [7, 3, 'orange'],
  [1, 7, 'orange'], [1, 6, 'white'], [3, 6, 'white']
] as const
fixed.forEach(([x, y, type], index) => { board[y][x] = { id: index + 1, type } })
const cats = ['orange', 'blue', 'blue', 'white', 'orange', 'fishLover', 'white', 'white'] as const
const homeBoxes = ['left', 'left', 'right', 'right', 'left', 'right', 'left', 'right'] as const
export const DUAL_BOX_LEVEL_31: PlanningLevel = {
  id: 31, width: 8, height: 8, board,
  dualBox: {
    splitAt: 4, entry: { x: 0, y: 7 }, exit: { x: 5, y: 4 },
    portals: [
      { id: 'A', entry: { x: 0, y: 7 }, exit: { x: 5, y: 4 } },
      { id: 'B', entry: { x: 7, y: 7 }, exit: { x: 2, y: 3 } }
    ]
  },
  cats: cats.map((type, index) => ({ id: 3101 + index, type, homeBox: homeBoxes[index] })),
  solution: [[1, 5], [0, 4], [6, 7], [6, 6], [3, 7], [7, 5], [0, 3], [7, 2]].map(([x, y], index) => ({ catId: 3101 + index, x, y }))
}
