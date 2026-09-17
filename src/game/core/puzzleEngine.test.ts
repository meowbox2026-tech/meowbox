import { describe, expect, it } from 'vitest'
import { getLevelById } from '../data/levels'
import {
  addChallengeMoves,
  autoPlaceCat,
  createPuzzleState,
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
    const outside = moveCat(initial, 'basic-row-a', { x: 2, y: 0 })
    const placed = moveCat(initial, 'basic-row-a', { x: 0, y: 0 }).state
    const occupied = moveCat(placed, 'basic-row-b', { x: 0, y: 0 })
    const unknown = moveCat(initial, 'not-a-cat', { x: 0, y: 0 })

    expect(outside.reason).toBe('outside')
    expect(occupied.reason).toBe('occupied')
    expect(unknown.reason).toBe('unknown-cat')
  })

  it('snaps a valid cat to its grid origin and consumes a challenge move', () => {
    const level = getLevelById(26)
    const state = createPuzzleState(level)

    const result = moveCat(state, 'challenge-sleeper', { x: 0, y: 0 })

    expect(result.accepted).toBe(true)
    expect(result.state.placements['challenge-sleeper']?.origin).toEqual({ x: 0, y: 0 })
    expect(result.state.movesRemaining).toBe(level.moves - 1)
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

  it('fails a challenge when the final allowed move does not solve the board', () => {
    const level = getLevelById(26)
    const state = { ...createPuzzleState(level), movesRemaining: 1 }
    const result = moveCat(state, 'challenge-sleeper', { x: 0, y: 0 })

    expect(result.state.phase).toBe('failed')
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

  it('adds three moves after a rewarded challenge rescue', () => {
    const level = getLevelById(26)
    const state = { ...createPuzzleState(level), movesRemaining: 0, phase: 'failed' as const }

    const rescued = addChallengeMoves(state, 3)

    expect(rescued.movesRemaining).toBe(3)
    expect(rescued.phase).toBe('playing')
  })
})
