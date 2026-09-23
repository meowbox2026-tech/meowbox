import { cleanup, act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDropGame } from './useDropGame'
import { getDropLevelById } from '../data/dropLevels'
afterEach(() => { cleanup(); vi.useRealTimers() })
const advance = (time: number) => act(() => vi.advanceTimersByTime(time))
describe('drop presentation lifecycle', () => {
  it('rolls back proven dead drops, spends three lives, and then fails', () => {
    vi.useFakeTimers()
    const deadLevel = {
      ...getDropLevelById(1),
      width: 3,
      height: 3,
      tileAssets: ['orange', 'blue', 'white'] as ['orange', 'blue', 'white'],
      initialBoard: [
        [null, null, null],
        [{ id: 1, type: 'orange' }, null, null],
        [{ id: 2, type: 'blue' }, null, null]
      ],
      initialCurrent: 'white' as const,
      initialCurrentTrait: 'none' as const,
      initialNext: 'orange' as const,
      initialNextTrait: 'none' as const,
      initialQueue: ['blue'] as ['blue'],
      initialQueueTraits: ['none'] as ['none'],
      target: 99,
      goals: { rescued: 99, scratchPosts: 0, fishTreats: 0 },
      scratchPosts: [], fishTreats: [], tunnels: [], patrol: undefined
    }
    const { result } = renderHook(() => useDropGame(false, vi.fn(), deadLevel))
    const before = JSON.stringify(result.current.state.board)

    act(() => result.current.drop(0))
    expect(result.current.lives).toBe(2)
    expect(result.current.state.phase).toBe('playing')
    expect(result.current.state.moves).toBe(0)
    expect(JSON.stringify(result.current.state.board)).toBe(before)
    expect(result.current.deadNotice).toBe(true)

    act(() => result.current.drop(0))
    expect(result.current.lives).toBe(1)
    act(() => result.current.drop(0))
    expect(result.current.lives).toBe(0)
    expect(result.current.failure).toBe('lives')
    expect(result.current.state.phase).toBe('failed')
    expect(JSON.stringify(result.current.state.board)).toBe(before)
  })

  it('accepts rapid taps and commits each logical drop immediately', () => {
    vi.useFakeTimers()
    const feedback = vi.fn()
    const { result } = renderHook(() => useDropGame(false, feedback))
    act(() => { result.current.drop(2); result.current.drop(2) })
    expect(result.current.busy).toBe(true)
    expect(result.current.state.moves).toBe(2)
    expect(result.current.state.current).toBe('blue')
    expect(result.current.state.next).toBe('white')
    advance(300)
    expect(result.current.state.moves).toBe(2)
    expect(result.current.state.cleared).toBe(3)
    expect(result.current.busy).toBe(false)
    expect(feedback.mock.calls.map(call => call[0])).toEqual([0, 1, 0])
  })
  it('freezes while paused and resumes without consuming another cat', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ paused }) => useDropGame(paused, vi.fn()), { initialProps: { paused: false } })
    act(() => result.current.drop(2))
    rerender({ paused: true }); advance(5000)
    expect(result.current.state.moves).toBe(1)
    act(() => result.current.drop(0))
    rerender({ paused: false }); advance(420); advance(580); advance(420)
    expect(result.current.state.moves).toBe(1)
  })
  it('freezes input and animation when the browser window loses focus', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDropGame(false, vi.fn()))
    act(() => window.dispatchEvent(new Event('blur')))
    act(() => result.current.drop(0))
    advance(5000)
    expect(result.current.hidden).toBe(true)
    expect(result.current.state.moves).toBe(0)

    act(() => window.dispatchEvent(new Event('focus')))
    act(() => result.current.drop(0))
    expect(result.current.hidden).toBe(false)
    expect(result.current.state.moves).toBe(1)
  })
  it('cancels pending resolution on restart and unmount', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useDropGame(false, vi.fn()))
    act(() => result.current.drop(2)); advance(420)
    act(() => result.current.reset()); advance(5000)
    expect(result.current.state.moves).toBe(0)
    expect(result.current.display.wave).toBeUndefined()
    expect(result.current.busy).toBe(false)
    act(() => result.current.drop(0)); unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('ignores invalid drops and animates a move without a match', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDropGame(false, vi.fn()))
    act(() => result.current.drop(-1))
    expect(result.current.busy).toBe(false)
    act(() => result.current.drop(0)); advance(300)
    expect(result.current.state.moves).toBe(1)
    expect(result.current.state.cleared).toBe(0)
  })
  it('starts the clock on first drop, keeps counting through animation, and has no failure revive', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ paused }) => useDropGame(paused, vi.fn()), { initialProps: { paused: false } })
    advance(150000)
    expect(result.current.secondsLeft).toBe(120)
    act(() => result.current.drop(0)); advance(300)
    advance(1200)
    expect(result.current.secondsLeft).toBeLessThan(120)
    rerender({ paused: true }); advance(20000)
    const pausedAt = result.current.secondsLeft
    expect(pausedAt).toBeLessThan(120)
    expect(result.current.state.moves).toBe(1)
    act(() => result.current.drop(2))
    expect(result.current.state.moves).toBe(1)
    rerender({ paused: false }); advance(120000)
    expect(result.current.failure).toBe('time')
    expect(result.current.state.phase).toBe('failed')
    act(() => result.current.drop(0))
    expect(result.current.state.phase).toBe('failed')
    act(() => result.current.reset())
    expect(result.current.secondsLeft).toBe(120)
    expect(result.current.lives).toBe(3)
  })

  it('holds a completed result until its final presentation frame settles', () => {
    vi.useFakeTimers()
    const level = { ...getDropLevelById(1), target: 3 }
    const { result } = renderHook(() => useDropGame(false, vi.fn(), level))
    act(() => result.current.drop(2))
    expect(result.current.state.phase).toBe('completed')
    expect(result.current.busy).toBe(true)
    advance(979)
    expect(result.current.busy).toBe(true)
    advance(380)
    expect(result.current.busy).toBe(true)
    advance(300)
    expect(result.current.busy).toBe(false)
  })

  it('pauses the world 2 clock and input while mechanic feedback is animating', () => {
    vi.useFakeTimers()
    const level = getDropLevelById(31)
    const { result } = renderHook(() => useDropGame(false, vi.fn(), level))

    act(() => result.current.drop(0))
    expect(result.current.busy).toBe(true)
    expect(result.current.state.moves).toBe(1)
    act(() => result.current.drop(1))
    expect(result.current.state.moves).toBe(1)
    advance(100)
    expect(result.current.secondsLeft).toBe(level.timeLimit)
    advance(200)
    expect(result.current.busy).toBe(false)
    advance(1100)
    expect(result.current.secondsLeft).toBeLessThan(level.timeLimit)
  })

  it('settles a world 2 drop without a long input dead time', () => {
    vi.useFakeTimers()
    const level = getDropLevelById(31)
    const { result } = renderHook(() => useDropGame(false, vi.fn(), level))

    act(() => result.current.drop(0))
    advance(179)
    expect(result.current.busy).toBe(true)
    advance(1)
    expect(result.current.busy).toBe(false)
  })

  it('starts the clock with hold, preserves traits, and unlocks after one successful drop', () => {
    vi.useFakeTimers()
    const level = getDropLevelById(41)
    const { result } = renderHook(() => useDropGame(false, vi.fn(), level))
    const current = result.current.state.current

    act(() => result.current.hold())
    expect(result.current.state.moves).toBe(0)
    expect(result.current.state.holdToken).toEqual({ type: current, trait: 'none' })
    expect(result.current.state.holdLocked).toBe(true)
    expect(result.current.state.holdUses).toBe(1)
    advance(1200)
    expect(result.current.secondsLeft).toBeLessThan(level.timeLimit)
    act(() => result.current.hold())
    expect(result.current.state.holdUses).toBe(1)
    act(() => result.current.drop(0))
    expect(result.current.state.holdLocked).toBe(false)
  })
})
