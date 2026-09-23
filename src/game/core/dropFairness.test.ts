import { describe, expect, it } from 'vitest'
import { createDropState, type DropBoard } from './dropEngine'
import { evaluateDropAction, evaluateDropActions, findCompletionRoute } from './dropFairness'

const board = (rows: string[]): DropBoard => rows.map((row, y) => [...row].map((cell, x) => (
  cell === '.' ? null : { id: y * 10 + x + 1, type: cell }
)))

describe('drop fairness judgement', () => {
  it('calls a non-matching setup move safe when a complete visible route remains', () => {
    const state = createDropState({
      width: 3,
      height: 4,
      tileTypes: ['a', 'b', 'c'],
      board: board(['...', '...', 'a..', 'a..']),
      current: 'c',
      next: 'a',
      queue: ['a'],
      target: 3
    })

    const result = evaluateDropAction(state, 1, { maxDepth: 6, maxNodes: 500 })

    expect(result.accepted).toBe(true)
    expect(result.result.waves).toHaveLength(0)
    expect(result.safety).toBe('safe')
    expect(result.route).toEqual([1, 0])
  })

  it('marks an action dead only when the action itself produces a terminal failure', () => {
    const state = createDropState({
      width: 3,
      height: 3,
      tileTypes: ['a', 'b', 'c'],
      board: board(['...', 'a..', 'b..']),
      current: 'c',
      next: 'a',
      queue: ['b'],
      target: 99
    })

    const result = evaluateDropAction(state, 0)

    expect(result.accepted).toBe(true)
    expect(result.result.state.phase).toBe('failed')
    expect(result.safety).toBe('dead')
  })

  it('does not guess about a random future queue', () => {
    const state = createDropState({
      width: 3,
      height: 4,
      tileTypes: ['a', 'b', 'c'],
      board: board(['...', '...', '...', '...']),
      current: 'a',
      next: 'b',
      queue: [],
      target: 9
    })

    const result = evaluateDropAction(state, 0)

    expect(result.accepted).toBe(true)
    expect(result.result.state.phase).toBe('playing')
    expect(result.safety).toBe('uncertain')
    expect(findCompletionRoute(result.result.state).status).toBe('uncertain')
  })

  it('does not inspect a newly generated hidden bag as if the player saw it', () => {
    const state = createDropState({
      width: 3,
      height: 3,
      tileTypes: ['a', 'b', 'c'],
      board: board(['...', '...', 'a..']),
      current: 'b',
      next: 'c',
      queue: [],
      target: 99
    })

    const result = evaluateDropAction(state, 1, { maxDepth: 12, maxNodes: 10_000 }, () => 0)

    expect(result.result.state.queue.length).toBeGreaterThan(0)
    expect(result.safety).toBe('uncertain')
    expect(result.reason).toBe('unknown-future')
  })

  it('keeps all equally valid first actions instead of inventing a unique answer', () => {
    const state = createDropState({
      width: 3,
      height: 4,
      tileTypes: ['a', 'b', 'c'],
      board: board(['...', '...', 'a.a', 'a.a']),
      current: 'a',
      next: 'a',
      queue: ['a'],
      target: 6
    })

    const safe = evaluateDropActions(state, { maxDepth: 6, maxNodes: 1_000 })
      .filter(result => result.safety === 'safe')
      .map(result => result.column)

    expect(safe).toEqual(expect.arrayContaining([0, 2]))
    expect(safe.length).toBeGreaterThanOrEqual(2)
  })
})
