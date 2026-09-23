import type { DropState } from './dropEngine'
import { evaluateDropActions } from './dropFairness'

export function recommendColumn(state: DropState): number | undefined {
  if (state.phase !== 'playing') return undefined
  const evaluations = evaluateDropActions(state, { maxDepth: 5, maxNodes: 240 })
  let best: { column: number; score: number } | undefined
  for (const evaluation of evaluations) {
    if (!evaluation.accepted || evaluation.safety === 'dead') continue
    const result = evaluation.result
    const heights = result.state.board[0].map((_, x) => result.state.board.filter(row => row[x]).length)
    const safetyBonus = evaluation.safety === 'safe' ? 1_000 : 0
    const routeBonus = evaluation.safety === 'safe' ? Math.max(0, 20 - evaluation.route.length) : 0
    const score = safetyBonus + routeBonus + (result.state.cleared - state.cleared) * 100
      - Math.max(...heights) * 15 - heights.reduce((sum, h) => sum + h * h, 0)
    if (!best || score > best.score) best = { column: evaluation.column, score }
  }
  return best?.column
}
