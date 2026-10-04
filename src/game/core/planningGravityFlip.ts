import type { DropBoard, DropCell } from './dropEngine'
import { clearPlanningSupport } from './planningGravity'

export interface PlanningGravityFlip { switchCatIds: number[] }
export type PlanningGravityDirection = 'down' | 'up'

/** A switch changes gravity for the whole box; all remaining stacks settle upward. */
export function settlePlanningUp(board: DropBoard): DropBoard {
  const next: DropBoard = board.map(row => row.map(() => null))
  for (let x = 0; x < board[0].length; x++) {
    const cats = board.flatMap(row => row[x] ? [{ ...row[x]! }] : [])
    cats.forEach((cat, y) => { next[y][x] = cat })
  }
  return next
}

export function clearPlanningUp(board: DropBoard, matches: DropCell[]): DropBoard {
  const height = board.length
  const reversed = [...board].reverse()
  const cleared = clearPlanningSupport(reversed, matches.map(cell => ({ ...cell, y: height - 1 - cell.y })))
  return cleared.reverse()
}
