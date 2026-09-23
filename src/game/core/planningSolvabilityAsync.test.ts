import { afterEach, describe, expect, it, vi } from 'vitest'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { canCompletePlanningAsync, findSafePlacementAsync, PLANNING_CHECK_TIMEOUT_MS } from './planningSolvability'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('bounded interactive validation', () => {
  it('releases an unresponsive search without declaring the placement wrong', async () => {
    vi.useFakeTimers()
    const terminate = vi.fn()
    vi.stubGlobal('Worker', class {
      postMessage() {}
      terminate = terminate
    })
    const result = canCompletePlanningAsync(level, [{ catId: level.cats[0].id, x: 0, y: 0 }])
    await vi.advanceTimersByTimeAsync(PLANNING_CHECK_TIMEOUT_MS)
    expect(await result).toBeUndefined()
    expect(terminate).toHaveBeenCalledOnce()
  })

  it('uses a verified stored completion without launching a worker', async () => {
    const worker = vi.fn()
    vi.stubGlobal('Worker', worker)
    expect(await canCompletePlanningAsync(level, [level.solution[0]])).toBe(true)
    expect(await findSafePlacementAsync(level, [])).toEqual(level.solution[0])
    expect(worker).not.toHaveBeenCalled()
  })

  it('checks a full wrong arrangement directly without searching future moves', async () => {
    const worker = vi.fn()
    vi.stubGlobal('Worker', worker)
    const placements = level.cats.map((cat, x) => ({ catId: cat.id, x, y: 0 }))
    expect(await canCompletePlanningAsync(level, placements)).toBe(false)
    expect(worker).not.toHaveBeenCalled()
  })
})
