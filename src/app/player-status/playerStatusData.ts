import { getSupabaseClient } from '../../services/supabase/supabaseClient'

export type RangeKey = '7d' | '30d' | '90d'
export type DashboardIconName = 'activity' | 'alert' | 'clock' | 'download' | 'filter' | 'layers' | 'refresh' | 'spark' | 'target' | 'users'

export const PLAYER_STATUS_RANGES: ReadonlyArray<{ key: RangeKey; label: string }> = [
  { key: '7d', label: '最近 7 天' },
  { key: '30d', label: '最近 30 天' },
  { key: '90d', label: '最近 90 天' },
]

export const PLAYER_STATUS_REQUIRED_EVENTS = [
  'session_started',
  'level_started',
  'level_completed',
  'level_failed',
  'clear_time_ms',
  'stars_earned',
  'hint_used',
  'session_ended',
] as const

export const PLAYER_STATUS_METRIC_DEFINITIONS = [
  { metric: '活躍玩家', definition: '期間內至少發生一次有效遊戲事件的去重 player_id。', source: '所有有效事件' },
  { metric: '關卡完成率', definition: '完成的去重 attempt_id ÷ 開始的去重 attempt_id。', source: 'level_started + level_completed' },
  { metric: '過關時間', definition: '完成事件送出的 clear_time_ms；遊戲計時器會在暫停與背景狀態停止。', source: 'level_completed.clear_time_ms' },
  { metric: '星星達成率', definition: '各星等的有效完成事件 ÷ 有效完成事件。', source: 'level_completed.stars_earned' },
  { metric: '離開率', definition: '開始後沒有完成的有效 attempt ÷ 開始的有效 attempt；不把缺失事件猜成離開。', source: 'level_started + level_completed' },
] as const

export interface PlayerStatusSummary {
  events: number
  activePlayers: number
  sessions: number
  attempts: number
  completedAttempts: number
  failures: number
  hints: number
  averageClearTimeMs: number | null
  medianClearTimeMs: number | null
  averageStars: number | null
}

export interface PlayerStatusLevel {
  levelId: number
  attempts: number
  completedAttempts: number
  failures: number
  hints: number
  averageClearTimeMs: number | null
  medianClearTimeMs: number | null
  averageStars: number | null
}

export interface PlayerStatusUnavailable {
  status: 'unavailable'
  source: 'not-configured' | 'query-error'
  range: RangeKey
  rangeLabel: string
  reason: string
  requiredEvents: ReadonlyArray<string>
}

export interface PlayerStatusWithMetrics {
  status: 'empty' | 'ready'
  source: 'supabase'
  range: RangeKey
  rangeLabel: string
  from: string
  to: string
  fetchedAt: string
  summary: PlayerStatusSummary
  levels: PlayerStatusLevel[]
}

export type PlayerStatusData = PlayerStatusUnavailable | PlayerStatusWithMetrics

function rangeLabelFor(range: RangeKey): string {
  return PLAYER_STATUS_RANGES.find((item) => item.key === range)?.label ?? '所選期間'
}

function rangeDays(range: RangeKey): number {
  return range === '7d' ? 7 : range === '30d' ? 30 : 90
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asRequiredCount(value: unknown): number | null {
  const number = asNumber(value)
  return number !== null && Number.isInteger(number) && number >= 0 ? number : null
}

function parseSummary(value: unknown): PlayerStatusSummary | null {
  if (!value || typeof value !== 'object') return null
  const summary = value as Record<string, unknown>
  const events = asRequiredCount(summary.events)
  const activePlayers = asRequiredCount(summary.active_players)
  const sessions = asRequiredCount(summary.sessions)
  const attempts = asRequiredCount(summary.attempts)
  const completedAttempts = asRequiredCount(summary.completed_attempts)
  const failures = asRequiredCount(summary.failures)
  const hints = asRequiredCount(summary.hints)
  if (events === null || activePlayers === null || sessions === null || attempts === null || completedAttempts === null || failures === null || hints === null) return null
  return {
    events,
    activePlayers,
    sessions,
    attempts,
    completedAttempts,
    failures,
    hints,
    averageClearTimeMs: asNumber(summary.average_clear_time_ms),
    medianClearTimeMs: asNumber(summary.median_clear_time_ms),
    averageStars: asNumber(summary.average_stars),
  }
}

function parseLevels(value: unknown): PlayerStatusLevel[] | null {
  if (!Array.isArray(value)) return null
  const levels: PlayerStatusLevel[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') return null
    const row = item as Record<string, unknown>
    const levelId = asRequiredCount(row.level_id)
    const attempts = asRequiredCount(row.attempts)
    const completedAttempts = asRequiredCount(row.completed_attempts)
    const failures = asRequiredCount(row.failures)
    const hints = asRequiredCount(row.hints)
    if (levelId === null || levelId < 1 || levelId > 90 || attempts === null || completedAttempts === null || failures === null || hints === null) return null
    levels.push({
      levelId,
      attempts,
      completedAttempts,
      failures,
      hints,
      averageClearTimeMs: asNumber(row.average_clear_time_ms),
      medianClearTimeMs: asNumber(row.median_clear_time_ms),
      averageStars: asNumber(row.average_stars),
    })
  }
  return levels
}

function unavailable(range: RangeKey, source: PlayerStatusUnavailable['source'], reason: string): PlayerStatusUnavailable {
  return {
    status: 'unavailable',
    source,
    range,
    rangeLabel: rangeLabelFor(range),
    reason,
    requiredEvents: [...PLAYER_STATUS_REQUIRED_EVENTS],
  }
}

export function getPlayerStatusData(range: RangeKey): PlayerStatusUnavailable {
  return unavailable(range, 'not-configured', '目前專案尚未設定中央事件資料來源；只有真實事件接入後才會顯示分析數字。')
}

export async function fetchPlayerStatusData(range: RangeKey): Promise<PlayerStatusData> {
  const client = getSupabaseClient()
  if (!client) return getPlayerStatusData(range)

  const to = new Date()
  const from = new Date(to.getTime() - rangeDays(range) * 24 * 60 * 60 * 1000)
  const { data, error } = await client.rpc('get_player_status_metrics', {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  })
  if (error || !data || typeof data !== 'object') {
    return unavailable(range, 'query-error', 'Supabase 已設定，但目前無法驗證報表查詢結果；頁面不會用估算數字補上。')
  }

  const payload = data as Record<string, unknown>
  const summary = parseSummary(payload.sample)
  const levels = parseLevels(payload.levels)
  if (!summary || !levels) {
    return unavailable(range, 'query-error', '收到的報表格式無法驗證；頁面不會把不完整資料當成真實數字。')
  }

  return {
    status: summary.events > 0 ? 'ready' : 'empty',
    source: 'supabase',
    range,
    rangeLabel: rangeLabelFor(range),
    from: from.toISOString(),
    to: to.toISOString(),
    fetchedAt: new Date().toISOString(),
    summary,
    levels,
  }
}
