import { dropCat, getDropBlockers, landingRow, type DropBoard, type DropState } from './dropEngine'
import { hasCompletedDropObjectives } from './dropObjectives'
import { isDropRouteBlocked, resolveDropColumn } from './dropRouting'

function clearLegacyBottomRow(board: DropBoard): DropBoard {
  const width = board[0].length
  return [Array(width).fill(null), ...board.slice(0, -1).map(row => row.map(tile => tile && { ...tile }))]
}

/**
 * Remove only cats below the last live physical mechanic in each column.
 * A mechanic is fixed scenery, so cats above it must not fall through it.
 */
function clearBottomRowAroundBlockers(board: DropBoard, state: DropState): DropBoard {
  const next = board.map(row => row.map(tile => tile && { ...tile }))
  const blockers = getDropBlockers(state.scratchPosts, state.fishTreats)
  const blockersByColumn = new Map<number, number[]>()
  blockers.forEach((blocker) => {
    blockersByColumn.set(blocker.x, [...(blockersByColumn.get(blocker.x) ?? []), blocker.y].sort((a, b) => a - b))
  })

  for (let x = 0; x < state.width; x += 1) {
    // A mechanic occupying the bottom cell leaves no cat to clear in this column.
    if (blockers.some((blocker) => blocker.x === x && blocker.y === state.height - 1)) continue
    if (!board[state.height - 1][x]) continue
    const lastBlocker = blockersByColumn.get(x)?.at(-1) ?? -1
    const start = lastBlocker + 1
    for (let y = start; y < state.height; y += 1) next[y][x] = null
    const survivors = board.slice(start, state.height - 1)
      .map(row => row[x])
      .filter((tile): tile is NonNullable<typeof tile> => tile !== null)
    const destination = state.height - survivors.length
    survivors.forEach((tile, index) => { next[destination + index][x] = tile && { ...tile } })
  }
  return next
}

function hasLegalDrop(state: DropState, board: DropBoard): boolean {
  return Array.from({ length: state.width }, (_, requestedColumn) => {
    const resolvedColumn = resolveDropColumn(state, requestedColumn)
    return resolvedColumn !== undefined
      && !isDropRouteBlocked(state, requestedColumn, resolvedColumn)
      && landingRow(board, resolvedColumn, getDropBlockers(state.scratchPosts, state.fishTreats)) >= 0
  }).some(Boolean)
}

/** Whether the ceiling revive can leave a playable state without consuming the ad. */
export function canReviveFromCeiling(state: DropState): boolean {
  if (state.phase !== 'failed') return false
  const board = getDropBlockers(state.scratchPosts, state.fishTreats).length
    ? clearBottomRowAroundBlockers(state.board, state)
    : clearLegacyBottomRow(state.board)
  return !board[0].some(Boolean) && hasLegalDrop(state, board)
}

/** Removal is assistance, not a scored match. Fixed posts and fish stay in place. */
export function clearBottomRow(state: DropState): DropState {
  const board = getDropBlockers(state.scratchPosts, state.fishTreats).length
    ? clearBottomRowAroundBlockers(state.board, state)
    : clearLegacyBottomRow(state.board)
  const recoverable = !board[0].some(Boolean) && hasLegalDrop(state, board)
  const objectivesComplete = hasCompletedDropObjectives(state.goals, state.progress)
    || (state.cleared >= state.goals.rescued
      && state.progress.scratchPosts >= state.goals.scratchPosts
      && state.progress.fishTreats >= state.goals.fishTreats)
  return {
    ...state,
    phase: objectivesComplete ? 'completed' : recoverable ? 'playing' : 'failed',
    board
  }
}

export function recommendColumn(state: DropState): number | undefined {
  if (state.phase !== 'playing') return undefined
  let best: { column: number; score: number } | undefined
  for (let column = 0; column < state.board[0].length; column++) {
    // A private deterministic source never consumes the real game's future queue.
    const result = dropCat(state, column, () => .5)
    if (!result.accepted || result.state.phase === 'failed') continue
    const heights = result.state.board[0].map((_, x) => result.state.board.filter(row => row[x]).length)
    const score = (result.state.cleared - state.cleared) * 100 - Math.max(...heights) * 15 - heights.reduce((sum, h) => sum + h * h, 0)
    if (!best || score > best.score) best = { column, score }
  }
  return best?.column
}
