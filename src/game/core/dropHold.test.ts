import { describe, expect, it } from 'vitest'
import { createDropState } from './dropEngine'
import { holdCurrent } from './dropHold'

describe('drop hold', () => {
  it('stores the current cat and advances the preview without consuming a use', () => {
    const state = createDropState({ current: 'a', next: 'b', queue: ['c'], holdUses: 2 })
    const result = holdCurrent(state)

    expect(result.accepted).toBe(true)
    expect(result.state.holdToken).toEqual({ type: 'a', trait: 'none' })
    expect(result.state.current).toBe('b')
    expect(result.state.next).toBe('c')
    expect(result.state.holdUses).toBe(1)
    expect(result.state.moves).toBe(0)
  })

  it('swaps with a stored cat and locks hold until the next successful drop', () => {
    const state = createDropState({ current: 'a', next: 'b', queue: ['c'], holdUses: 2, holdToken: { type: 'z', trait: 'hungry' } })
    const result = holdCurrent(state)

    expect(result.state.current).toBe('z')
    expect(result.state.currentTrait).toBe('hungry')
    expect(result.state.holdToken).toEqual({ type: 'a', trait: 'none' })
    expect(result.state.holdLocked).toBe(true)
    expect(result.state.holdUses).toBe(1)
    expect(holdCurrent(result.state).accepted).toBe(false)
  })
})
