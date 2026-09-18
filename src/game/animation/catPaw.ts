export const CAT_LONG_PAW_PATH = '/assets/animations/cat-long-paw.png'
export const CAT_LONG_PAW_DURATION_MS = 2400

export const CAT_PAW_DIRECTIONS = ['top', 'right', 'bottom', 'left'] as const

export type CatPawDirection = (typeof CAT_PAW_DIRECTIONS)[number]

export function getRandomCatPawDirection(random: () => number = Math.random): CatPawDirection {
  const value = random()
  if (!Number.isFinite(value)) return 'top'

  const normalized = Math.min(1, Math.max(0, value))
  const index = Math.min(CAT_PAW_DIRECTIONS.length - 1, Math.floor(normalized * CAT_PAW_DIRECTIONS.length))
  return CAT_PAW_DIRECTIONS[index]
}
