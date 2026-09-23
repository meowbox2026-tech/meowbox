import { describe, expect, it } from 'vitest'
import { getLevelById } from '../data/levels'
import {
  autoPlaceCat,
  createPuzzleState,
  getCatRuleTargetCells,
  getHint,
  moveCat,
  moveCatOnLevel,
  restartPuzzle,
  toggleStretchLength,
  undoLastAction,
  wakeSleepingCat
} from './puzzleEngine'
import type { LevelDefinition } from '../types'

describe('puzzle engine', () => {
  it('computes orthogonal target cells for a special-cell placement rule', () => {
    const source = getLevelById(1)
    const level: LevelDefinition = {
      ...source,
      board: {
        ...source.board,
        specialCells: [{ cell: { x: 1, y: 1 }, kind: 'food' }]
      },
      cats: source.cats.map((cat, index) => index === 0
        ? { ...cat, rule: { kind: 'adjacent-to-special', specialCellKind: 'food' } }
        : cat)
    }
    const state = createPuzzleState(level)

    expect(getCatRuleTargetCells(level, level.cats[0])).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 1 }
    ])

    const onFood = moveCatOnLevel(level, state, 'basic-row-a', { x: 1, y: 1 })
    const besideFood = moveCatOnLevel(level, state, 'basic-row-a', { x: 0, y: 1 })

    expect(onFood.accepted).toBe(false)
    expect(onFood.reason).toBe('preferred-cell')
    expect(besideFood.accepted).toBe(true)
  })

  it('keeps completion semantics independent of the first-level visual preview roster', () => {
    const source = getLevelById(1)
    const cats = source.cats.slice(0, 4)
    const level: LevelDefinition = {
      ...source,
      cats,
      solution: Object.fromEntries(cats.map((cat, index) => [cat.id, {
        origin: { x: index % 3, y: Math.floor(index / 3) },
        rotation: 0
      }]))
    }
    const first = moveCatOnLevel(level, createPuzzleState(level), 'basic-row-a', { x: 0, y: 0 }).state
    const second = moveCatOnLevel(level, first, 'basic-row-b', { x: 1, y: 0 }).state
    const third = moveCatOnLevel(level, second, 'basic-row-c', { x: 2, y: 0 }).state
    const completed = moveCatOnLevel(level, third, 'basic-row-d', { x: 0, y: 1 }).state

    expect(completed.phase).toBe('completed')
    expect(Object.keys(completed.placements)).toHaveLength(4)
  })

  it('lets the nine first-level cats use any distinct cells without extra placement rules', () => {
    const level = getLevelById(1)
    const cells = Array.from({ length: 9 }, (_, index) => ({
      x: index % 3,
      y: Math.floor(index / 3)
    }))
    let state = createPuzzleState(level)

    level.cats.forEach((cat, index) => {
      const result = moveCatOnLevel(level, state, cat.id, cells[(index + 3) % cells.length])
      expect(result.accepted).toBe(true)
      state = result.state
    })

    expect(state.phase).toBe('completed')
    expect(Object.keys(state.placements)).toHaveLength(9)
  })

  it('rejects a cat placed over an obstacle without changing the state', () => {
    const level = getLevelById(4)
    const state = createPuzzleState(level)

    const result = moveCat(state, 'obstacle-dot', { x: 1, y: 1 })

    expect(result.accepted).toBe(false)
    expect(result.reason).toBe('blocked')
    expect(result.state.placements).toEqual({})
  })

  it('treats a described obstacle as blocked even when its legacy cell list is empty', () => {
    const source = getLevelById(4)
    const level: LevelDefinition = {
      ...source,
      board: { ...source.board, blockedCells: [], obstacles: [{ cell: { x: 1, y: 1 }, kind: 'tape' }] }
    }
    const state = createPuzzleState(level)

    const result = moveCatOnLevel(level, state, 'obstacle-dot', { x: 1, y: 1 })

    expect(result.accepted).toBe(false)
    expect(result.reason).toBe('blocked')
  })

  it('reports outside, occupied, and unknown placements distinctly', () => {
    const level = getLevelById(1)
    const initial = createPuzzleState(level)
    const outside = moveCat(initial, 'basic-row-a', { x: 8, y: 0 })
    const placed = moveCat(initial, 'basic-row-a', { x: 0, y: 1 }).state
    const occupied = moveCat(placed, 'basic-row-b', { x: 0, y: 1 })
    const unknown = moveCat(initial, 'not-a-cat', { x: 0, y: 0 })

    expect(outside.reason).toBe('outside')
    expect(occupied.reason).toBe('occupied')
    expect(unknown.reason).toBe('unknown-cat')
  })

  it('keeps a sleeping cat immovable until a wake reward is applied', () => {
    const level = getLevelById(7)
    const placed = moveCat(createPuzzleState(level), 'sleepy-orange', { x: 0, y: 0 }).state
    const rejectedMove = moveCat(placed, 'sleepy-orange', { x: 0, y: 1 })
    const awakened = wakeSleepingCat(placed, 'sleepy-orange')
    const moved = moveCat(awakened, 'sleepy-orange', { x: 0, y: 1 })

    expect(rejectedMove.reason).toBe('sleeping')
    expect(moved.accepted).toBe(true)
  })

  it('allows an unplaced stretch cat to cycle through its declared lengths', () => {
    const level = getLevelById(16)
    const state = createPuzzleState(level)
    const stretched = toggleStretchLength(state, 'stretchy-tabby')

    expect(stretched.stretchLengths['stretchy-tabby']).toBe(3)
  })

  it('does not change a stretch length after that cat has been placed', () => {
    const level = getLevelById(16)
    const placed = moveCat(createPuzzleState(level), 'stretchy-tabby', { x: 0, y: 0 }).state

    expect(toggleStretchLength(placed, 'stretchy-tabby')).toBe(placed)
  })

  it('locks a completed lid zone and protects its cats from movement', () => {
    const level = getLevelById(21)
    const first = moveCat(createPuzzleState(level), 'lid-top-a', { x: 0, y: 0 }).state
    const covered = moveCat(first, 'lid-top-b', { x: 0, y: 1 }).state
    const attemptedMove = moveCat(covered, 'lid-top-a', { x: 0, y: 2 })

    expect(covered.closedLids).toContain('top-lid')
    expect(attemptedMove.reason).toBe('lid-closed')
  })

  it('restores a valid action with undo and clears all placements on restart', () => {
    const level = getLevelById(1)
    const placed = moveCat(createPuzzleState(level), 'basic-row-a', { x: 0, y: 0 }).state
    const undone = undoLastAction(placed)
    const restarted = restartPuzzle(placed)

    expect(undone.placements).toEqual({})
    expect(restarted.placements).toEqual({})
    expect(restarted.history).toHaveLength(0)
  })

  it('returns a data-driven hint and auto-places that cat at the solution position', () => {
    const level = getLevelById(1)
    const state = createPuzzleState(level)
    const hint = getHint(state)
    const result = autoPlaceCat(state)

    expect(hint).toMatchObject({ catId: 'basic-row-a', origin: { x: 0, y: 0 } })
    expect(result.accepted).toBe(true)
    expect(result.state.placements['basic-row-a']).toMatchObject({ origin: { x: 0, y: 0 } })
  })

})
