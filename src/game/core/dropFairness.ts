import { dropCat, type DropResult, type DropState } from './dropEngine'

export type DropActionSafety = 'safe' | 'dead' | 'uncertain'
export type CompletionStatus = 'solvable' | 'dead' | 'uncertain'

export interface DropSearchOptions {
  maxDepth?: number
  maxNodes?: number
}

export interface CompletionRoute {
  status: CompletionStatus
  route: number[]
  nodes: number
}

export interface DropActionEvaluation {
  column: number
  accepted: boolean
  safety: DropActionSafety
  result: DropResult
  route: number[]
  reason?: 'illegal' | 'terminal-failure' | 'search-limit' | 'unknown-future'
}

const DEFAULT_MAX_DEPTH = 6
const DEFAULT_MAX_NODES = 600

function stateSignature(state: DropState): string {
  const board = state.board.map(row => row.map(tile => tile ? `${tile.type}:${tile.trait ?? 'none'}` : '.').join('')).join('/')
  const posts = state.scratchPosts.map(post => `${post.x},${post.y},${post.hp}`).join(';')
  const treats = state.fishTreats.map(treat => `${treat.x},${treat.y}`).join(';')
  const patrol = state.patrol ? `${state.patrol.index}:${state.patrol.dropsUntilMove}:${state.patrol.columns.join(',')}` : '-'
  return [
    board, state.current, state.currentTrait, state.next, state.nextTrait,
    state.queue.join(','), state.queueTraits.join(','), state.moves, state.cleared,
    state.score, state.bestCombo, state.phase, posts, treats, patrol,
    state.progress.rescued, state.progress.scratchPosts, state.progress.fishTreats,
    state.holdToken?.type ?? '-', state.holdToken?.trait ?? '-', state.holdUses,
    state.holdLocked ? '1' : '0'
  ].join('|')
}

function normalizeOptions(options: DropSearchOptions): Required<DropSearchOptions> {
  return {
    maxDepth: Math.max(1, Math.min(12, Math.floor(options.maxDepth ?? DEFAULT_MAX_DEPTH))),
    maxNodes: Math.max(1, Math.min(10_000, Math.floor(options.maxNodes ?? DEFAULT_MAX_NODES)))
  }
}

interface SearchContext {
  options: Required<DropSearchOptions>
  nodes: number
  memo: Map<string, CompletionRoute>
}

function uncertain(context: SearchContext, route: number[] = []): CompletionRoute {
  return { status: 'uncertain', route, nodes: context.nodes }
}

function search(state: DropState, depth: number, context: SearchContext): CompletionRoute {
  if (state.phase === 'completed') return { status: 'solvable', route: [], nodes: context.nodes }
  if (state.phase === 'failed') return { status: 'dead', route: [], nodes: context.nodes }
  if (context.nodes >= context.options.maxNodes || depth >= context.options.maxDepth) return uncertain(context)

  const key = `${depth}:${stateSignature(state)}`
  const cached = context.memo.get(key)
  if (cached) return cached

  // An empty queue means the next refill is random. We may inspect the current
  // visible cat once, but never claim a route through an unknown bag.
  const unknownAfterThisMove = state.queue.length === 0
  let foundUncertain = false
  let hasLegalMove = false
  for (let column = 0; column < state.width; column += 1) {
    context.nodes += 1
    if (context.nodes > context.options.maxNodes) {
      const result = uncertain(context)
      context.memo.set(key, result)
      return result
    }
    const result = dropCat(state, column, () => 0.5)
    if (!result.accepted) continue
    hasLegalMove = true
    if (result.state.phase === 'completed') {
      const solved = { status: 'solvable' as const, route: [column], nodes: context.nodes }
      context.memo.set(key, solved)
      return solved
    }
    if (result.state.phase === 'failed') continue
    if (unknownAfterThisMove) {
      foundUncertain = true
      continue
    }
    const next = search(result.state, depth + 1, context)
    if (next.status === 'solvable') {
      const solved = { status: 'solvable' as const, route: [column, ...next.route], nodes: context.nodes }
      context.memo.set(key, solved)
      return solved
    }
    if (next.status === 'uncertain') foundUncertain = true
  }

  const status: CompletionStatus = !hasLegalMove || !foundUncertain ? 'dead' : 'uncertain'
  const result = { status, route: [], nodes: context.nodes }
  context.memo.set(key, result)
  return result
}

/** Search only the information already visible to the player. */
export function findCompletionRoute(state: DropState, options: DropSearchOptions = {}): CompletionRoute {
  return search(state, 0, { options: normalizeOptions(options), nodes: 0, memo: new Map() })
}

/**
 * Evaluate one click after all waves have settled. A search limit or a random
 * future is deliberately uncertain: it is never converted into an immediate failure.
 */
export function evaluateDropAction(
  state: DropState,
  column: number,
  options: DropSearchOptions = {},
  random: () => number = Math.random
): DropActionEvaluation {
  const futureWasUnknown = state.queue.length === 0
  const result = dropCat(state, column, random)
  if (!result.accepted) return { column, accepted: false, safety: 'uncertain', result, route: [], reason: 'illegal' }
  if (result.state.phase === 'completed') return { column, accepted: true, safety: 'safe', result, route: [column] }
  if (result.state.phase === 'failed') return { column, accepted: true, safety: 'dead', result, route: [], reason: 'terminal-failure' }
  if (futureWasUnknown) {
    return { column, accepted: true, safety: 'uncertain', result, route: [column], reason: 'unknown-future' }
  }

  const route = findCompletionRoute(result.state, options)
  return {
    column,
    accepted: true,
    safety: route.status === 'solvable' ? 'safe' : route.status === 'dead' ? 'dead' : 'uncertain',
    result,
    route: [column, ...route.route],
    reason: route.status === 'uncertain'
      ? result.state.queue.length === 0 ? 'unknown-future' : 'search-limit'
      : undefined
  }
}

export function evaluateDropActions(state: DropState, options: DropSearchOptions = {}): DropActionEvaluation[] {
  return Array.from({ length: state.width }, (_, column) => evaluateDropAction(state, column, options, () => 0.5))
}
