import { describe, expect, it } from 'vitest'
import { createDropState } from './dropEngine'
import { recommendColumn } from './dropAssistance'

describe('drop assistance', () => {
  it('recommends the tutorial clear without changing the queue or board', () => {
    const state = createDropState()
    const before = JSON.stringify(state)
    expect(recommendColumn(state)).toBe(2)
    expect(JSON.stringify(state)).toBe(before)
    expect(recommendColumn({ ...state, phase: 'failed' })).toBeUndefined()
  })
})
