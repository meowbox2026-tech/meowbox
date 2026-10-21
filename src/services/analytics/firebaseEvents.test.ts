import { describe, expect, it, vi } from 'vitest'
import { milestoneEvent, mirrorToFirebase, toFirebaseEvent } from './firebaseEvents'

describe('firebase event mapping', () => {
  it('maps completions and failures to GA4 level_end', () => {
    expect(toFirebaseEvent({ eventName: 'level_completed', levelId: 2 })).toEqual({ name: 'level_end', params: { level_name: 'level_2', success: 1 } })
    expect(toFirebaseEvent({ eventName: 'level_failed', levelId: 2 })).toEqual({ name: 'level_end', params: { level_name: 'level_2', success: 0 } })
    expect(toFirebaseEvent({ eventName: 'level_started', levelId: 5 })).toEqual({ name: 'level_start', params: { level_name: 'level_5' } })
  })

  it('skips session events that Firebase already collects automatically', () => {
    expect(toFirebaseEvent({ eventName: 'session_started' })).toBeNull()
    expect(toFirebaseEvent({ eventName: 'session_ended' })).toBeNull()
  })

  it('emits level_up only for completed levels', () => {
    expect(milestoneEvent({ eventName: 'level_completed', levelId: 10 })).toEqual({ name: 'level_up', params: { level: 10, character: 'meow' } })
    expect(milestoneEvent({ eventName: 'level_failed', levelId: 10 })).toBeNull()
  })

  it('logs mapped events only on native platforms and survives logging errors', async () => {
    const logEvent = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue(undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    await mirrorToFirebase({ eventName: 'level_completed', levelId: 3 }, logEvent, true)
    expect(logEvent).toHaveBeenCalledTimes(2)

    const webLog = vi.fn()
    await mirrorToFirebase({ eventName: 'level_completed', levelId: 3 }, webLog, false)
    expect(webLog).not.toHaveBeenCalled()
  })
})
