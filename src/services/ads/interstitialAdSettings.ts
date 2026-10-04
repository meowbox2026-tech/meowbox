import { getSupabaseClient } from '../supabase/supabaseClient'
import { MAX_AD_PLAY_INTERVAL, MIN_AD_PLAY_INTERVAL } from './playCadence'

export interface InterstitialAdSettings {
  enabled: boolean
  playsPerAd: number
}

export const DEFAULT_INTERSTITIAL_AD_SETTINGS: InterstitialAdSettings = {
  enabled: false,
  playsPerAd: 5
}

const SETTINGS_ROW_ID = 1
const SETTINGS_TIMEOUT_MS = 5000

let pendingSettingsLoad: Promise<InterstitialAdSettings> | undefined

export function loadInterstitialAdSettings(): Promise<InterstitialAdSettings> {
  if (pendingSettingsLoad) return pendingSettingsLoad

  const request = readInterstitialAdSettings()
  const trackedRequest = request.finally(() => {
    if (pendingSettingsLoad === trackedRequest) pendingSettingsLoad = undefined
  })
  pendingSettingsLoad = trackedRequest
  return trackedRequest
}

async function readInterstitialAdSettings(): Promise<InterstitialAdSettings> {
  const client = getSupabaseClient()
  if (!client) return DEFAULT_INTERSTITIAL_AD_SETTINGS

  try {
    const { data, error } = await client
      .from('interstitial_ad_settings')
      .select('enabled, plays_per_ad')
      .eq('id', SETTINGS_ROW_ID)
      .abortSignal(AbortSignal.timeout(SETTINGS_TIMEOUT_MS))
      .maybeSingle()

    if (error) return DEFAULT_INTERSTITIAL_AD_SETTINGS
    return parseSettings(data) ?? DEFAULT_INTERSTITIAL_AD_SETTINGS
  } catch {
    return DEFAULT_INTERSTITIAL_AD_SETTINGS
  }
}

function parseSettings(value: unknown): InterstitialAdSettings | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const settings = value as { enabled?: unknown; plays_per_ad?: unknown }
  if (typeof settings.enabled !== 'boolean' || typeof settings.plays_per_ad !== 'number') return undefined
  if (!Number.isSafeInteger(settings.plays_per_ad)) return undefined
  if (settings.plays_per_ad < MIN_AD_PLAY_INTERVAL || settings.plays_per_ad > MAX_AD_PLAY_INTERVAL) return undefined
  return { enabled: settings.enabled, playsPerAd: settings.plays_per_ad }
}
