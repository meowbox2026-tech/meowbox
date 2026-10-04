export const AD_PLAY_INTERVAL = 5
export const MIN_AD_PLAY_INTERVAL = 1
export const MAX_AD_PLAY_INTERVAL = 100
const STORAGE_KEY = 'meow-box-ad-play-count'

export interface PlayAdDecision {
  playsSinceAd: number
  shouldShowAd: boolean
}

let cachedPlayCount: number | undefined
let cachedPlayInterval: number | undefined

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

function normalizePlayInterval(value: number): number {
  return Number.isSafeInteger(value) && value >= MIN_AD_PLAY_INTERVAL && value <= MAX_AD_PLAY_INTERVAL
    ? value
    : AD_PLAY_INTERVAL
}

function readPlayCount(interval: number): number {
  const raw = getStorage()?.getItem(STORAGE_KEY)
  const count = raw === null || raw === undefined ? 0 : Number(raw)
  return Number.isInteger(count) && count >= 0 && count < interval ? count : 0
}

function writePlayCount(count: number): void {
  try {
    getStorage()?.setItem(STORAGE_KEY, String(count))
  } catch {
    // Ads should never make the game unusable when storage is unavailable.
  }
}

export function recordPlay(playsPerAd: number = AD_PLAY_INTERVAL): PlayAdDecision {
  const interval = normalizePlayInterval(playsPerAd)
  if (cachedPlayCount === undefined || cachedPlayInterval !== interval) {
    cachedPlayCount = readPlayCount(interval)
    cachedPlayInterval = interval
  }

  const nextCount = cachedPlayCount + 1
  if (nextCount >= interval) {
    cachedPlayCount = 0
    writePlayCount(0)
    return { playsSinceAd: 0, shouldShowAd: true }
  }

  cachedPlayCount = nextCount
  writePlayCount(nextCount)
  return { playsSinceAd: nextCount, shouldShowAd: false }
}

/** Reset the local cadence when remote interstitial ads are disabled. */
export function resetPlayCadence(): void {
  cachedPlayCount = 0
  cachedPlayInterval = undefined
  try {
    getStorage()?.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}
