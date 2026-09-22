import type { DropState } from './dropEngine'
import { token, type CatToken } from './dropTypes'

export interface HoldResult {
  accepted: boolean
  state: DropState
}

function nextPreview(state: DropState): { current: CatToken; next: CatToken; queue: CatToken[] } {
  const queue = state.queue.map((type, index) => token(type, state.queueTraits[index] ?? 'none'))
  const current = token(state.next, state.nextTrait)
  const next = queue.shift() ?? token(state.tileTypes[0])
  return { current, next, queue }
}

/** Store or exchange a token without counting a move or advancing patrol. */
export function holdCurrent(state: DropState): HoldResult {
  if (state.phase !== 'playing' || state.holdUses <= 0 || state.holdLocked) return { accepted: false, state }
  const current = token(state.current, state.currentTrait)
  if (!state.holdToken) {
    const preview = nextPreview(state)
    return {
      accepted: true,
      state: {
        ...state,
        current: preview.current.type,
        currentTrait: preview.current.trait,
        next: preview.next.type,
        nextTrait: preview.next.trait,
        queue: preview.queue.map((item) => item.type),
        queueTraits: preview.queue.map((item) => item.trait),
        holdToken: current,
        holdUses: state.holdUses - 1,
        holdLocked: true
      }
    }
  }

  const stored = state.holdToken
  return {
    accepted: true,
    state: {
      ...state,
      current: stored.type,
      currentTrait: stored.trait,
      holdToken: current,
      holdUses: state.holdUses - 1,
      holdLocked: true
    }
  }
}
