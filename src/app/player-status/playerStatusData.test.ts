import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPlayerStatusData, PLAYER_STATUS_REQUIRED_EVENTS } from './playerStatusData'

const getSupabaseClient = vi.hoisted(() => vi.fn())
const rpc = vi.hoisted(() => vi.fn())
vi.mock('../../services/supabase/supabaseClient', () => ({ getSupabaseClient }))

describe('player status data availability', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not fabricate a snapshot when no event source is configured', () => {
    const snapshot = getPlayerStatusData('30d')

    expect(snapshot).toMatchObject({
      status: 'unavailable',
      source: 'not-configured',
      range: '30d',
      rangeLabel: '最近 30 天'
    })
    expect(snapshot.requiredEvents).toEqual(PLAYER_STATUS_REQUIRED_EVENTS)
    expect(JSON.stringify(snapshot)).not.toContain('12,480')
  })

  it('requires the events needed to verify level timing and experience', () => {
    expect(PLAYER_STATUS_REQUIRED_EVENTS).toEqual(expect.arrayContaining([
      'level_started',
      'level_completed',
      'level_failed',
      'clear_time_ms',
      'stars_earned'
    ]))
  })

  it('renders only the aggregate values returned by Supabase', async () => {
    getSupabaseClient.mockReturnValue({ rpc })
    rpc.mockResolvedValue({
      data: {
        sample: {
          events: 12,
          active_players: 3,
          sessions: 4,
          attempts: 5,
          completed_attempts: 4,
          failures: 1,
          hints: 2,
          average_clear_time_ms: 8123,
          median_clear_time_ms: 7500,
          average_stars: 2.5,
        },
        levels: [{
          level_id: 1,
          attempts: 5,
          completed_attempts: 4,
          failures: 1,
          hints: 2,
          average_clear_time_ms: 8123,
          median_clear_time_ms: 7500,
          average_stars: 2.5,
        }],
      },
      error: null,
    })

    const { fetchPlayerStatusData } = await import('./playerStatusData')
    const result = await fetchPlayerStatusData('7d')

    expect(result.status).toBe('ready')
    if (result.status === 'ready') {
      expect(result.summary.activePlayers).toBe(3)
      expect(result.summary.averageClearTimeMs).toBe(8123)
      expect(result.levels[0].completedAttempts).toBe(4)
    }
    expect(rpc).toHaveBeenCalledWith('get_player_status_metrics', expect.objectContaining({ p_from: expect.any(String), p_to: expect.any(String) }))
  })

  it('keeps the dashboard unavailable when Supabase returns an invalid shape', async () => {
    getSupabaseClient.mockReturnValue({ rpc })
    rpc.mockResolvedValue({ data: { sample: { events: 'not-a-number' }, levels: [] }, error: null })

    const { fetchPlayerStatusData } = await import('./playerStatusData')
    const result = await fetchPlayerStatusData('7d')

    expect(result).toMatchObject({ status: 'unavailable', source: 'query-error' })
  })
})
