import { dropCat, type DropState } from './dropEngine'

/** Removal is assistance, not a scored match. Relative positions are preserved. */
export function clearBottomRow(state: DropState): DropState {
  const width = state.board[0].length
  return {
    ...state, phase: state.cleared >= state.target ? 'completed' : 'playing',
    board: [Array(width).fill(null), ...state.board.slice(0, -1).map(row => row.map(tile => tile && { ...tile }))]
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
