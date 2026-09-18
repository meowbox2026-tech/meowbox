import { describe, expect, it } from 'vitest'
import {
  CAT_LONG_PAW_DURATION_MS,
  CAT_LONG_PAW_PATH,
  CAT_PAW_DIRECTIONS,
  getRandomCatPawDirection
} from './catPaw'

describe('long cat paw animation asset', () => {
  it('uses one vertical transparent paw asset for every direction', () => {
    expect(CAT_LONG_PAW_PATH).toBe('/assets/animations/cat-long-paw.png')
    expect(CAT_PAW_DIRECTIONS).toEqual(['top', 'right', 'bottom', 'left'])
    expect(CAT_LONG_PAW_DURATION_MS).toBeGreaterThan(2000)
  })

  it('chooses each edge from a normalized random value', () => {
    expect(getRandomCatPawDirection(() => 0)).toBe('top')
    expect(getRandomCatPawDirection(() => 0.249)).toBe('top')
    expect(getRandomCatPawDirection(() => 0.25)).toBe('right')
    expect(getRandomCatPawDirection(() => 0.5)).toBe('bottom')
    expect(getRandomCatPawDirection(() => 0.75)).toBe('left')
    expect(getRandomCatPawDirection(() => 1)).toBe('left')
  })

  it('clamps invalid random values instead of producing an invalid direction', () => {
    expect(getRandomCatPawDirection(() => -1)).toBe('top')
    expect(getRandomCatPawDirection(() => Number.NaN)).toBe('top')
    expect(getRandomCatPawDirection(() => Number.POSITIVE_INFINITY)).toBe('top')
  })
})
