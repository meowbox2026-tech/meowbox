import { describe, expect, it } from 'vitest'
import { createDropState, dropCat } from './dropEngine'

describe('mischievous cat patrol', () => {
  it('moves only after four successful drops and never on hold', () => {
    const state = createDropState({
      width: 4,
      height: 8,
      tileTypes: ['a', 'b', 'c'],
      current: 'a',
      next: 'b',
      queue: ['c', 'a', 'b', 'c', 'a'],
      patrol: { columns: [0, 2, 3], index: 0, dropsUntilMove: 4 }
    })

    let current = state
    for (let index = 0; index < 3; index += 1) current = dropCat(current, 1).state
    expect(current.patrol).toMatchObject({ index: 0, dropsUntilMove: 1 })

    const moved = dropCat(current, 1).state
    expect(moved.patrol).toMatchObject({ index: 1, dropsUntilMove: 4 })
  })
})
