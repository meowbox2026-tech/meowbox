import { Capacitor, registerPlugin } from '@capacitor/core'
import type { PlayerEventInput } from './analytics'

export interface FirebaseEvent {
  name: string
  params: Record<string, string | number>
}

type LogEvent = (event: FirebaseEvent) => Promise<void>

// Maps internal player events to GA4 recommended game events so Google Ads can import them as conversions.
export function toFirebaseEvent(input: PlayerEventInput): FirebaseEvent | null {
  const level = input.levelId
  switch (input.eventName) {
    case 'level_started':
      return level ? { name: 'level_start', params: { level_name: `level_${level}` } } : null
    case 'level_completed':
      return level ? { name: 'level_end', params: { level_name: `level_${level}`, success: 1 } } : null
    case 'level_failed':
      return level ? { name: 'level_end', params: { level_name: `level_${level}`, success: 0 } } : null
    case 'hint_used':
      return { name: 'hint_used', params: level ? { level_name: `level_${level}` } : {} }
    default:
      return null
  }
}

// Milestone conversions: one-off events that signal an engaged player for ad optimisation.
export function milestoneEvent(input: PlayerEventInput): FirebaseEvent | null {
  if (input.eventName !== 'level_completed' || !input.levelId) return null
  return { name: 'level_up', params: { level: input.levelId, character: 'meow' } }
}

interface NativeFirebaseAnalytics {
  logEvent(options: FirebaseEvent): Promise<void>
}

// Native-only bridge to @capacitor-firebase/analytics; avoids bundling the Firebase web SDK.
const FirebaseAnalytics = registerPlugin<NativeFirebaseAnalytics>('FirebaseAnalytics')

async function nativeLogEvent(event: FirebaseEvent): Promise<void> {
  await FirebaseAnalytics.logEvent(event)
}

export async function mirrorToFirebase(
  input: PlayerEventInput,
  logEvent: LogEvent = nativeLogEvent,
  isNative: boolean = Capacitor.isNativePlatform(),
): Promise<void> {
  if (!isNative) return
  const events = [toFirebaseEvent(input), milestoneEvent(input)].filter((event): event is FirebaseEvent => event !== null)
  for (const event of events) {
    try {
      await logEvent(event)
    } catch (error) {
      console.warn('[analytics] Firebase event failed', event.name, error)
    }
  }
}
