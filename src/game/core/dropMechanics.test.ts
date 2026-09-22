import { describe, expect, it } from 'vitest'
import { createDropState, dropCat, type DropBoard } from './dropEngine'

const board = (rows: string[]): DropBoard => rows.map((row, y) => [...row].map((cell, x) => cell === '.' ? null : { id: y * 10 + x + 1, type: cell }))

describe('drop mechanics', () => {
  it('damages nearby scratch posts once per wave and collects a treat below the matched cell', () => {
    const state = createDropState({
      board: board(['....', '....', '....', 'aa..', '....']),
      width: 4,
      height: 5,
      tileTypes: ['a', 'b', 'c'],
      current: 'a',
      currentTrait: 'scratch',
      next: 'b',
      queue: ['c'],
      scratchPosts: [{ id: 'post', x: 3, y: 3, hp: 2 }],
      fishTreats: [{ id: 'treat', x: 2, y: 4 }],
      goals: { rescued: 3, scratchPosts: 1, fishTreats: 1 }
    })

    const result = dropCat(state, 2)

    expect(result.waves[0].damagedScratchPostIds).toEqual(['post'])
    expect(result.waves[0].collectedFishTreatIds).toEqual(['treat'])
    expect(result.state.scratchPosts).toEqual([{ id: 'post', x: 3, y: 3, hp: 0 }])
    expect(result.state.progress).toMatchObject({ rescued: 3, scratchPosts: 1, fishTreats: 1 })
    expect(result.state.phase).toBe('completed')
  })

  it('lets hungry cats collect orthogonal treats without counting them as rescues', () => {
    const state = createDropState({
      board: board(['....', '....', 'aa..', '....', '....']),
      width: 4,
      height: 5,
      tileTypes: ['a', 'b', 'c'],
      current: 'a',
      currentTrait: 'hungry',
      next: 'b',
      queue: ['c'],
      fishTreats: [{ id: 'near', x: 2, y: 3 }, { id: 'diagonal', x: 3, y: 3 }],
      goals: { rescued: 3, scratchPosts: 0, fishTreats: 1 }
    })

    const result = dropCat(state, 2)

    expect(result.waves[0].collectedFishTreatIds).toEqual(['near'])
    expect(result.state.progress).toMatchObject({ rescued: 3, fishTreats: 1 })
  })

  it('counts ordinary adjacent damage once and gives scratch cats the stronger hit', () => {
    const ordinary = createDropState({
      board: board(['....', '....', '....', '....', 'aa..']), width: 4, height: 5,
      tileTypes: ['a', 'b', 'c'], current: 'a', next: 'b', scratchPosts: [{ id: 'post', x: 3, y: 4, hp: 2 }]
    })
    const ordinaryResult = dropCat(ordinary, 2)
    expect(ordinaryResult.state.scratchPosts[0].hp).toBe(1)

    const scratchResult = dropCat({ ...ordinary, currentTrait: 'scratch' }, 2)
    expect(scratchResult.state.scratchPosts[0].hp).toBe(0)
    expect(scratchResult.waves[0].traitEffects).toEqual([{ cell: { x: 2, y: 4 }, trait: 'scratch' }])
  })

  it('matches by cat type even when traits differ and ignores traits on different types', () => {
    const sameType = createDropState({
      board: [
        [null, null, null], [null, null, null], [null, null, null],
        [{ id: 1, type: 'a', trait: 'hungry' }, null, null],
        [{ id: 2, type: 'a', trait: 'none' }, null, null]
      ], width: 3, height: 5, tileTypes: ['a', 'b', 'c'], currentToken: { type: 'a', trait: 'scratch' }, next: 'b'
    })
    expect(dropCat(sameType, 0).waves).toHaveLength(1)

    const differentTypes = sameType.board.map((row) => row.map((tile) => tile && { ...tile, type: tile.type === 'a' ? 'b' : tile.type }))
    expect(dropCat({ ...sameType, board: differentTypes, current: 'a' }, 0).waves).toHaveLength(0)
  })

  it('does not collect a fish treat without a matching wave', () => {
    const state = createDropState({
      board: board(['....', '....', '....', '....', 'a...']), width: 4, height: 5,
      tileTypes: ['a', 'b', 'c'], current: 'b', next: 'c', fishTreats: [{ id: 'fish', x: 0, y: 4 }]
    })

    const result = dropCat(state, 2)
    expect(result.waves).toHaveLength(0)
    expect(result.state.fishTreats).toEqual([{ id: 'fish', x: 0, y: 4 }])
  })
})
