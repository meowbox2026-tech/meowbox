export interface LevelTimeTargets {
  threeStarMs: number
  twoStarMs: number
}

const MS_PER_SECOND = 1000
const BASE_THREE_STAR_SECONDS = 120
const SECONDS_PER_CAT = 10
const LEVEL_DIFFICULTY_BONUS_SECONDS = 3
const TWO_STAR_MULTIPLIER = 1.5

/**
 * Time targets are intentionally generous: arranging a large board is the
 * challenge, so the timer should reward a smooth clear without turning later
 * levels into a speed-run requirement. Later levels also get more breathing
 * room for their extra waves and direction changes.
 */
export function getLevelTimeTargets(levelId: number, catCount: number): LevelTimeTargets {
  const safeLevelId = Math.max(1, Math.floor(levelId))
  const safeCatCount = Math.max(1, Math.floor(catCount))
  const threeStarSeconds = Math.round(
    BASE_THREE_STAR_SECONDS + safeCatCount * SECONDS_PER_CAT + (safeLevelId - 1) * LEVEL_DIFFICULTY_BONUS_SECONDS
  )
  const twoStarSeconds = Math.round(threeStarSeconds * TWO_STAR_MULTIPLIER)

  return {
    threeStarMs: threeStarSeconds * MS_PER_SECOND,
    twoStarMs: twoStarSeconds * MS_PER_SECOND
  }
}

export function getStarsForTime(elapsedMs: number, targets: LevelTimeTargets): 1 | 2 | 3 {
  const safeElapsedMs = Math.max(0, elapsedMs)
  if (safeElapsedMs <= targets.threeStarMs) return 3
  if (safeElapsedMs <= targets.twoStarMs) return 2
  return 1
}

export function formatLevelTime(elapsedMs: number, includeTenths = true): string {
  const safeElapsedMs = Math.max(0, Math.floor(elapsedMs))
  const totalSeconds = Math.floor(safeElapsedMs / MS_PER_SECOND)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const base = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  if (!includeTenths) return base
  return `${base}.${Math.floor((safeElapsedMs % MS_PER_SECOND) / 100)}`
}
