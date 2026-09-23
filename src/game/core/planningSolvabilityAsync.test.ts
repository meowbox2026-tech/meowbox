import { afterEach, describe, expect, it, vi } from 'vitest'
import { PLANNING_LEVEL_ONE as level } from '../data/planningLevelOne'
import { findSafePlacementAsync, PLANNING_CHECK_TIMEOUT_MS } from './planningSolvability'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('bounded async hint search', () => {
  it('releases an unresponsive search without blocking the board', async () => {
    vi.useFakeTimers()
    const terminate = vi.fn()
    vi.stubGlobal('Worker', class {
      postMessage() {}
      terminate = terminate
    })
    const result = findSafePlacementAsync(level, [{ catId: level.cats[0].id, x: 0, y: 0 }])
    await vi.advanceTimersByTimeAsync(PLANNING_CHECK_TIMEOUT_MS)
    expect(await result).toBeUndefined()
    expect(terminate).toHaveBeenCalledOnce()
  })

  it('uses a verified stored completion without launching a worker', async () => {
    const worker = vi.fn()
    vi.stubGlobal('Worker', worker)
    expect(await findSafePlacementAsync(level, [])).toEqual(level.solution[0])
    expect(worker).not.toHaveBeenCalled()
  })
})
