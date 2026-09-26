import { getSupabaseClient } from '../supabase/supabaseClient'
import { getAnonymousUserId, resetAnonymousIdentityForTests } from '../supabase/anonymousIdentity'

export type PlayerEventName =
  | 'session_started'
  | 'level_started'
  | 'level_completed'
  | 'level_failed'
  | 'hint_used'
  | 'session_ended'

export interface PlayerEventInput {
  eventName: PlayerEventName
  levelId?: number
  attemptId?: string
  clearTimeMs?: number
  starsEarned?: number
}

export type AnalyticsResultReason =
  | 'inserted'
  | 'not-configured'
  | 'auth-error'
  | 'insert-error'
  | 'invalid-event'

export interface AnalyticsResult {
  recorded: boolean
  reason: AnalyticsResultReason
}

interface PendingPlayerEvent extends PlayerEventInput {
  eventId: string
  sessionId: string
}

const PENDING_EVENTS_KEY = 'meowbox.analytics.pending.v1'
const SESSION_ID_KEY = 'meowbox.analytics.session.v1'
const MAX_PENDING_EVENTS = 100
const MAX_LEVEL_ID = 90


function makeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function createAnalyticsId(): string {
  return makeUuid()
}

function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY)
    if (existing) return existing
    const created = makeUuid()
    window.sessionStorage.setItem(SESSION_ID_KEY, created)
    return created
  } catch {
    return makeUuid()
  }
}

function readPendingEvents(): PendingPlayerEvent[] {
  try {
    const raw = window.localStorage.getItem(PENDING_EVENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPendingPlayerEvent).slice(-MAX_PENDING_EVENTS)
  } catch {
    return []
  }
}

function writePendingEvents(events: PendingPlayerEvent[]): void {
  try {
    if (events.length === 0) window.localStorage.removeItem(PENDING_EVENTS_KEY)
    else window.localStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(events.slice(-MAX_PENDING_EVENTS)))
  } catch {
    // Analytics must never block or break the game when local storage is unavailable.
  }
}

function isPendingPlayerEvent(value: unknown): value is PendingPlayerEvent {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<PendingPlayerEvent>
  return typeof event.eventId === 'string'
    && typeof event.sessionId === 'string'
    && typeof event.eventName === 'string'
}

function isValidUuid(value: string | undefined): boolean {
  return value === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function validateEvent(input: PlayerEventInput): boolean {
  if (!input.eventName) return false
  if (input.levelId !== undefined && (!Number.isInteger(input.levelId) || input.levelId < 1 || input.levelId > MAX_LEVEL_ID)) return false
  if (input.clearTimeMs !== undefined && (!Number.isInteger(input.clearTimeMs) || input.clearTimeMs < 0 || input.clearTimeMs > 86_400_000)) return false
  if (input.starsEarned !== undefined && (!Number.isInteger(input.starsEarned) || input.starsEarned < 1 || input.starsEarned > 3)) return false
  return isValidUuid(input.attemptId)
}


function toInsertRow(event: PendingPlayerEvent, playerId: string) {
  return {
    event_id: event.eventId,
    player_id: playerId,
    session_id: event.sessionId,
    event_name: event.eventName,
    level_id: event.levelId,
    attempt_id: event.attemptId,
    clear_time_ms: event.clearTimeMs,
    stars_earned: event.starsEarned,
  }
}

function isDuplicateError(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

async function flushPendingEvents(playerId: string): Promise<AnalyticsResult> {
  const client = getSupabaseClient()
  if (!client) return { recorded: false, reason: 'not-configured' }
  const pending = readPendingEvents()
  if (pending.length === 0) return { recorded: true, reason: 'inserted' }

  const remaining: PendingPlayerEvent[] = []
  let insertedAny = false
  for (const event of pending) {
    const { error } = await client.from('player_events').insert([toInsertRow(event, playerId)])
    if (!error || isDuplicateError(error)) insertedAny = true
    else remaining.push(event)
  }
  writePendingEvents(remaining)
  return insertedAny && remaining.length === 0
    ? { recorded: true, reason: 'inserted' }
    : { recorded: false, reason: 'insert-error' }
}

export async function recordPlayerEvent(input: PlayerEventInput): Promise<AnalyticsResult> {
  if (!validateEvent(input)) return { recorded: false, reason: 'invalid-event' }
  const client = getSupabaseClient()
  if (!client) return { recorded: false, reason: 'not-configured' }

  const event: PendingPlayerEvent = {
    ...input,
    eventId: makeUuid(),
    sessionId: getSessionId(),
  }
  const pending = [...readPendingEvents(), event].slice(-MAX_PENDING_EVENTS)
  writePendingEvents(pending)

  const playerId = await getAnonymousUserId()
  if (!playerId) return { recorded: false, reason: 'auth-error' }
  return flushPendingEvents(playerId)
}

export function resetAnalyticsSessionForTests(): void {
  resetAnonymousIdentityForTests()
}
