export const AD_PLAY_INTERVAL = 5
const STORAGE_KEY = 'meow-box-ad-play-count'

export interface PlayAdDecision {
  playsSinceAd: number
  shouldShowAd: boolean
}

let cachedPlayCount: number | undefined

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

function readPlayCount(): number {
  const raw = getStorage()?.getItem(STORAGE_KEY)
  const count = raw === null || raw === undefined ? 0 : Number(raw)
  return Number.isInteger(count) && count >= 0 && count < AD_PLAY_INTERVAL ? count : 0
}

function writePlayCount(count: number): void {
  try {
    getStorage()?.setItem(STORAGE_KEY, String(count))
  } catch {
    // Ads should never make the game unusable when storage is unavailable.
  }
}

export function recordPlay(): PlayAdDecision {
  const nextCount = (cachedPlayCount ??= readPlayCount()) + 1
  if (nextCount >= AD_PLAY_INTERVAL) {
    cachedPlayCount = 0
    writePlayCount(0)
    return { playsSinceAd: 0, shouldShowAd: true }
  }

  cachedPlayCount = nextCount
  writePlayCount(nextCount)
  return { playsSinceAd: nextCount, shouldShowAd: false }
}

/** Reset only used by tests and local development tools. */
export function resetPlayCadence(): void {
  cachedPlayCount = 0
  try {
    getStorage()?.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}
