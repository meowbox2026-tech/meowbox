import { describe, expect, it } from 'vitest'
import { createDropState, dropCat, findDropMatches, type DropState } from '../core/dropEngine'
import { DROP_LEVELS, advanceDropVariant, getDropLevelById, getDropLevelVariants, getStoredDropVariant } from './dropLevels'
import { WORLD_TWO_TABLE } from './dropWorldTwo'
import { WORLD_THREE_TABLE } from './dropWorldThree'

function stateFor(level: typeof DROP_LEVELS[number], withoutTraits = false): DropState {
  return createDropState({
    width: level.width, height: level.height, tileTypes: level.tileAssets, board: level.initialBoard,
    current: level.initialCurrent, currentTrait: withoutTraits ? 'none' : level.initialCurrentTrait,
    next: level.initialNext, nextTrait: withoutTraits ? 'none' : level.initialNextTrait,
    queue: level.initialQueue, queueTraits: withoutTraits ? level.initialQueue.map(() => 'none') : level.initialQueueTraits, target: level.target,
    scratchPosts: level.scratchPosts, fishTreats: level.fishTreats, tunnels: level.tunnels, patrol: level.patrol,
    goals: level.goals, holdUses: level.holdUses, previewCount: level.previewCount, variant: level.variant
  })
}

function replayWitness(level: typeof DROP_LEVELS[number], withoutTraits = false): DropState {
  let state = stateFor(level, withoutTraits)
  for (const column of level.witness) {
    const result = dropCat(state, column, () => .5)
    if (!result.accepted) break
    state = result.state
    if (state.phase !== 'playing') break
  }
  return state
}

describe('drop level catalogue', () => {
  it('contains 90 sequential levels with three worlds and exact 31–90 table values', () => {
    expect(DROP_LEVELS).toHaveLength(90)
    expect(DROP_LEVELS.map((level) => level.id)).toEqual(Array.from({ length: 90 }, (_, index) => index + 1))
    expect(DROP_LEVELS.filter((level) => level.world === 1)).toHaveLength(30)
    expect(DROP_LEVELS.filter((level) => level.world === 2)).toHaveLength(30)
    expect(DROP_LEVELS.filter((level) => level.world === 3)).toHaveLength(30)
    for (const row of [...WORLD_TWO_TABLE, ...WORLD_THREE_TABLE]) {
      const level = DROP_LEVELS[row.id - 1]
      expect(level).toMatchObject({ id: row.id, timeLimit: row.seconds, width: row.width, height: row.height, target: row.rescued })
      expect(level.tileAssets).toHaveLength(row.kinds)
      expect(level.initialCatCount).toBe(row.initialCats)
      expect(level.scratchPosts.filter((post) => post.hp === 1)).toHaveLength(row.scratchSingle)
      expect(level.scratchPosts.filter((post) => post.hp === 2)).toHaveLength(row.scratchDouble)
      expect(level.fishTreats).toHaveLength(row.fish)
      expect(level.tunnels).toHaveLength(row.tunnels)
      expect(level.patrol ? 1 : 0).toBe(row.patrol)
      expect(level.previewCount).toBe(level.id >= 76 ? 4 : 3)
      expect(level.holdUses).toBe(level.id >= 41 ? 2 : 0)
    }
    expect(DROP_LEVELS[45].initialCurrentTrait).toBe('scratch')
    expect(DROP_LEVELS[60].initialCurrentTrait).toBe('hungry')
    expect(DROP_LEVELS[44].initialCurrentTrait).toBe('none')
  })

  it('starts every variant without a free match and with exact initial counts', () => {
    for (const level of DROP_LEVELS) {
      expect(findDropMatches(level.initialBoard), `level ${level.id}`).toEqual([])
      expect(level.initialBoard.flat().filter(Boolean)).toHaveLength(level.initialCatCount)
      expect(level.initialBoard).toHaveLength(level.height)
      expect(level.initialBoard[0]).toHaveLength(level.width)
      for (const post of level.scratchPosts) expect(level.initialBoard[post.y][post.x]).toBeNull()
      for (const treat of level.fishTreats) expect(level.initialBoard[treat.y][treat.x]).toBeNull()
      expect(level.variantCount).toBe(level.id >= 31 ? 3 : 1)
    }
    for (const level of [31, 46, 61, 76, 90]) {
      for (const variant of getDropLevelVariants(level)) {
        expect(findDropMatches(variant.initialBoard), `variant ${level}:${variant.variant}`).toEqual([])
        expect(variant.initialCatCount).toBe(DROP_LEVELS[level - 1].initialCatCount)
      }
    }
  })

  it('keeps the first three tutorials and legacy 1–30 behaviour', () => {
    expect(DROP_LEVELS[0].initialBoard[7][0]?.type).toBe('orange')
    expect(DROP_LEVELS[0].initialBoard[7][1]?.type).toBe('orange')
    for (const [levelIndex, column] of [[0, 2], [1, 2], [2, 0]] as const) {
      const result = dropCat(stateFor(DROP_LEVELS[levelIndex]), column)
      expect(result.waves.length, `level ${levelIndex + 1}`).toBeGreaterThanOrEqual(1)
    }
    const chain = dropCat(stateFor(DROP_LEVELS[3]), 0)
    expect(chain.waves.length).toBeGreaterThanOrEqual(2)
  })

  it('provides deterministic, non-identical variants and safe fallback lookup', () => {
    const variants = getDropLevelVariants(51)
    expect(variants).toHaveLength(3)
    expect(new Set(variants.map((level) => JSON.stringify({ board: level.initialBoard, tunnels: level.tunnels, queue: level.initialQueue })))).toHaveLength(3)
    expect(getDropLevelById(0).id).toBe(1)
    expect(getDropLevelById(999).id).toBe(1)
    expect(getDropLevelById(51, 2).variant).toBe(2)
    expect(getDropLevelById(51, 2)).toBe(getDropLevelById(51, 2))
  })

  it('rotates variants without repeating until the session cycle wraps', () => {
    window.sessionStorage.clear()
    expect(getStoredDropVariant(51)).toBe(0)
    expect([advanceDropVariant(51), advanceDropVariant(51), advanceDropVariant(51)]).toEqual([1, 2, 0])
    expect(getStoredDropVariant(51)).toBe(0)
    expect(advanceDropVariant(1)).toBe(0)
  })

  it('uses the authored cat pool instead of a fixed three-cat loop', () => {
    for (const level of DROP_LEVELS.filter((candidate) => candidate.id >= 31)) {
      const firstTokens = [level.initialCurrent, level.initialNext, ...level.initialQueue].slice(0, level.tileAssets.length * 2)
      expect(new Set(firstTokens).size, `level ${level.id}`).toBe(level.tileAssets.length)
      expect(firstTokens.slice(1).some((type, index) => type !== firstTokens[index]), `level ${level.id}`).toBe(true)
    }
  })

  it('keeps all three variants structurally different', () => {
    for (const level of DROP_LEVELS.filter((candidate) => candidate.id >= 31)) {
      const signatures = getDropLevelVariants(level.id).map((variant) => JSON.stringify({
        board: variant.initialBoard,
        fish: variant.fishTreats,
        tunnels: variant.tunnels,
        patrol: variant.patrol,
        queue: variant.initialQueue
      }))
      expect(new Set(signatures), `level ${level.id}`).toHaveLength(3)
    }
  })

  it('accepts at least one legal first action for every level and replays stored witnesses', () => {
    for (const level of DROP_LEVELS) {
      const initial = stateFor(level)
      const first = Array.from({ length: level.width }, (_, column) => dropCat(initial, column)).find((result) => result.accepted)
      expect(first?.accepted, `level ${level.id}`).toBe(true)
    }
    for (const levelId of [31, 36, 41, 46, 51, 61, 71, 76, 90]) {
      const level = getDropLevelById(levelId)
      const state = replayWitness(level)
      expect(state.phase, `witness ${levelId} should complete`).toBe('completed')
    }
  })

  it('replays every authored variant with ordinary cats, without tools or traits', () => {
    for (const base of DROP_LEVELS) {
      if (base.id < 31) continue
      for (const level of getDropLevelVariants(base.id)) {
        expect(replayWitness(level).phase, `variant ${base.id}:${level.variant}`).toBe('completed')
        expect(replayWitness(level, true).phase, `none-trait ${base.id}:${level.variant}`).toBe('completed')
      }
    }
  })

})
