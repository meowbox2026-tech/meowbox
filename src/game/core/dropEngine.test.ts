import { describe, expect, it } from 'vitest'
import { createDropState, dropCat, findDropMatches, landingRow, type DropBoard } from './dropEngine'
const board = (rows: string[]): DropBoard => rows.map((r, y) => [...r].map((c, x) => c === '.' ? null : { id: y * 10 + x + 1, type: c }))
describe('drop rules', () => {
  it('stops above the first cat instead of passing through to a gap below', () => {
    const state = createDropState({ board: board(['...', '...', '.b.', '...', '.a.']), current: 'c' })
    expect(landingRow(state.board, 1)).toBe(1)
    const result = dropCat(state, 1)
    expect(result.accepted).toBe(true)
    expect(result.landed[1][1]?.type).toBe('c')
    expect(result.landed[2][1]?.type).toBe('b')
    expect(result.landed[3][1]).toBeNull()
  })
  it('rejects a blocked entrance even if there are empty cells below it', () => {
    const state = createDropState({ board: board(['.b.', '...', '.a.']) })
    expect(landingRow(state.board, 1)).toBe(-1)
    expect(dropCat(state, 1).accepted).toBe(false)
    expect(dropCat(state, 1).state).toBe(state)
  })
  it('lands above a live fish treat instead of sharing its cell', () => {
    const state = createDropState({
      board: board(['...', '...', '...']), width: 3, height: 3,
      tileTypes: ['a', 'b', 'c'], current: 'a', next: 'b',
      fishTreats: [{ id: 'fish', x: 1, y: 2 }]
    })

    const result = dropCat(state, 1)

    expect(result.accepted).toBe(true)
    expect(result.landed[1][1]?.type).toBe('a')
    expect(result.landed[2][1]).toBeNull()
  })
  it('drops to the lowest available row without refilling', () => {
    const state = createDropState({ board: board(['...', '...', 'b..']), current: 'a' })
    const result = dropCat(state, 0, () => 0)
    expect(result.state.board[1][0]?.type).toBe('a')
    expect(result.state.board.flat().filter(Boolean)).toHaveLength(2)
    expect(state.board[1][0]).toBeNull()
  })
  it.each([['aaa'], ['a..', 'a..', 'a..'], ['a..', '.a.', '..a'], ['..a', '.a.', 'a..'], ['aaaa']])('matches all four directions: %j', (...rows) => {
    expect(findDropMatches(board(rows))).toHaveLength(rows.length === 1 ? rows[0].length : 3)
  })
  it('deduplicates intersecting lines', () => {
    expect(findDropMatches(board(['.a.', 'aaa', '.a.']))).toHaveLength(5)
  })
  it('clears simultaneous matches in one wave and then applies gravity', () => {
    const state = createDropState({ board: board(['....', 'b...', 'b...', 'baa.']), current: 'a' })
    const result = dropCat(state, 3)
    expect(result.waves).toHaveLength(1)
    expect(result.waves[0].cells).toHaveLength(6)
    expect(result.state.cleared).toBe(6)
  })
  it('settles only columns touched by a clear and preserves pre-existing gaps', () => {
    const state = createDropState({
      board: board([
        '.....',
        '.....',
        'aa...',
        'b.b..',
        '.....'
      ]),
      current: 'a'
    })
    const result = dropCat(state, 2)
    expect(result.waves).toHaveLength(1)
    // The cat in column 0 is below the clear wave but above a pre-existing
    // gap. It is an authored shelf, so it must not be globally compacted.
    expect(result.state.board[3][0]?.type).toBe('b')
    expect(result.state.board[4][0]).toBeNull()
    // An unrelated floating cat in column 4 keeps its authored position too.
    const unrelated = createDropState({
      board: board(['....b', '.....', 'aa...', '..b..', '.....']),
      current: 'a'
    })
    const unrelatedResult = dropCat(unrelated, 2)
    expect(unrelatedResult.state.board[0][4]?.type).toBe('b')
  })
  it('lets an affected stack fall through empty rows when no lower cat anchors it', () => {
    const state = createDropState({
      board: board([
        '.....',
        'b....',
        'aa...',
        '..b..',
        '.....'
      ]),
      current: 'a'
    })
    const result = dropCat(state, 2)
    expect(result.state.board[4][0]?.type).toBe('b')
    expect(result.state.board[1][0]).toBeNull()
  })
  it('chains after gravity, counting a combo per wave', () => {
    const state = createDropState({ board: board(['....', 'bb..', 'aa.b']), current: 'a' })
    const result = dropCat(state, 2)
    // bottom becomes b b . b: no bridge, so only the orange line clears
    expect(result.waves).toHaveLength(1)
    const chain = dropCat(createDropState({ board: board(['....', '....', 'bac.', 'abb.']), current: 'a' }), 2)
    expect(chain.waves.length).toBeGreaterThan(1)
  })
  it('rejects bad columns and terminal actions without consuming the queue', () => {
    const state = createDropState()
    for (const x of [-1, 6, NaN, 1.5]) expect(dropCat(state, x).state).toBe(state)
    expect(dropCat({ ...state, phase: 'failed' }, 0).accepted).toBe(false)
  })
  it('fails at the ceiling only after matches have resolved', () => {
    const state = createDropState({ board: board(['...', 'b..', 'a..']), current: 'c' })
    expect(dropCat(state, 0).state.phase).toBe('failed')
    const rescue = createDropState({ board: board(['...', 'a..', 'a..']), current: 'a' })
    expect(dropCat(rescue, 0).state.phase).toBe('playing')
  })
  it('completes the target and preserves unique IDs after clearing', () => {
    const state = createDropState({ board: board(['...', '...', 'aa.']), current: 'a', target: 3 })
    const result = dropCat(state, 2)
    expect(result.state.phase).toBe('completed')
    expect(result.state.score).toBe(30)
    expect(result.state.nextId).toBeGreaterThan(state.nextId)
  })
  it('replenishes a balanced bag and bounds an invalid random source', () => {
    const state = { ...createDropState(), queue: [] }
    for (const random of [() => NaN, () => -2, () => 2, () => .5]) {
      const result = dropCat(state, 5, random)
      const bag = [result.state.next, ...result.state.queue]
      for (const cat of ['orange', 'blue', 'white']) expect(bag.filter(t => t === cat)).toHaveLength(3)
    }
  })
  it('rejects full columns, malformed boards, and prioritizes overflow over the target', () => {
    expect(() => createDropState({ board: [] })).toThrow()
    expect(() => createDropState({ board: [[], [null]] })).toThrow()
    const state = createDropState({ board: board(['b..', 'a..', 'b..']) })
    expect(dropCat(state, 0).accepted).toBe(false)
    const both = createDropState({ board: board(['...b.', '...c.', 'aaad.']), current: 'c', target: 3 })
    expect(dropCat(both, 4).state.phase).toBe('failed')
  })
  it('supports level-sized boards and any configured cat artwork', () => {
    const state = createDropState({
      width: 7,
      height: 9,
      tileTypes: ['sunny', 'fishLover', 'alone', 'white'],
      current: 'sunny',
      next: 'fishLover',
      queue: ['alone', 'white'],
      target: 30
    })
    const result = dropCat(state, 6)
    expect(result.accepted).toBe(true)
    expect(result.state.width).toBe(7)
    expect(result.state.height).toBe(9)
    expect(result.state.board).toHaveLength(9)
    expect(result.state.current).toBe('fishLover')
    expect(result.state.next).toBe('alone')
  })

})
