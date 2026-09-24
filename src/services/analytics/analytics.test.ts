import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getSupabaseClient = vi.hoisted(() => vi.fn())
const getSession = vi.hoisted(() => vi.fn())
const signInAnonymously = vi.hoisted(() => vi.fn())
const insert = vi.hoisted(() => vi.fn())
const from = vi.hoisted(() => vi.fn(() => ({ insert })))

vi.mock('../supabase/supabaseClient', () => ({ getSupabaseClient }))

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('player analytics', () => {
  let analytics: typeof import('./analytics')

  beforeEach(async () => {
    vi.resetModules()
    getSupabaseClient.mockReturnValue({
      auth: { getSession, signInAnonymously },
      from,
    })
    getSession.mockResolvedValue({ data: { session: null }, error: null })
    signInAnonymously.mockResolvedValue({ data: { user: { id: 'player-1' } }, error: null })
    insert.mockResolvedValue({ error: null })
    analytics = await import('./analytics')
  })

  it('creates an anonymous identity and records a validated event', async () => {
    const result = await analytics.recordPlayerEvent({
      eventName: 'level_completed',
      levelId: 4,
      attemptId: '11111111-1111-4111-8111-111111111111',
      clearTimeMs: 8123,
      starsEarned: 3,
    })

    expect(result).toEqual({ recorded: true, reason: 'inserted' })
    expect(signInAnonymously).toHaveBeenCalledOnce()
    expect(from).toHaveBeenCalledWith('player_events')
    expect(insert).toHaveBeenCalledWith([expect.objectContaining({
      player_id: 'player-1',
      event_name: 'level_completed',
      level_id: 4,
      attempt_id: '11111111-1111-4111-8111-111111111111',
      clear_time_ms: 8123,
      stars_earned: 3,
    })])
  })

  it('reuses an existing session instead of creating a second user', async () => {
    getSession.mockResolvedValue({ data: { session: { user: { id: 'existing-player' } } }, error: null })

    const result = await analytics.recordPlayerEvent({ eventName: 'session_started' })

    expect(result.recorded).toBe(true)
    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(insert).toHaveBeenCalledWith([expect.objectContaining({ player_id: 'existing-player' })])
  })

  it('rejects malformed gameplay values before they reach Supabase', async () => {
    const result = await analytics.recordPlayerEvent({
      eventName: 'level_completed',
      levelId: 31,
      clearTimeMs: -1,
      starsEarned: 9,
    })

    expect(result).toEqual({ recorded: false, reason: 'invalid-event' })
    expect(getSession).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it('does not report fake success when the network insert fails', async () => {
    insert.mockResolvedValue({ error: { code: 'network' } })

    const result = await analytics.recordPlayerEvent({ eventName: 'hint_used', levelId: 2 })

    expect(result).toEqual({ recorded: false, reason: 'insert-error' })
    expect(JSON.parse(localStorage.getItem('meowbox.analytics.pending.v1') ?? '[]')).toHaveLength(1)
  })

  it('can be disabled without making a request when the project is not configured', async () => {
    getSupabaseClient.mockReturnValue(null)

    const result = await analytics.recordPlayerEvent({ eventName: 'session_started' })

    expect(result).toEqual({ recorded: false, reason: 'not-configured' })
    expect(getSession).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })
})
