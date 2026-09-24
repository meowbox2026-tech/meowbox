import { describe, expect, it } from 'vitest'
import {
  formatLevelTime,
  getLevelTimeTargets,
  getStarsForTime,
  type LevelTimeTargets
} from './levelTiming'

describe('level timing', () => {
  it('gives later levels a generous multi-minute three-star window', () => {
    const early = getLevelTimeTargets(1, 3)
    const late = getLevelTimeTargets(24, 18)

    expect(early.threeStarMs).toBe(150_000)
    expect(late.threeStarMs).toBe(369_000)
    expect(late.twoStarMs).toBe(554_000)
    expect(late.twoStarMs).toBeGreaterThan(late.threeStarMs)
    expect(getStarsForTime(late.threeStarMs, late)).toBe(3)
    expect(getStarsForTime(late.threeStarMs + 1, late)).toBe(2)
    expect(getStarsForTime(late.twoStarMs, late)).toBe(2)
    expect(getStarsForTime(late.twoStarMs + 1, late)).toBe(1)
  })

  it('awards three, two, or one star at the exact target boundaries', () => {
    const targets: LevelTimeTargets = { threeStarMs: 10_000, twoStarMs: 20_000 }

    expect(getStarsForTime(10_000, targets)).toBe(3)
    expect(getStarsForTime(10_001, targets)).toBe(2)
    expect(getStarsForTime(20_000, targets)).toBe(2)
    expect(getStarsForTime(20_001, targets)).toBe(1)
    expect(getStarsForTime(-1, targets)).toBe(3)
  })

  it('formats elapsed time as a stable timer label', () => {
    expect(formatLevelTime(0)).toBe('00:00.0')
    expect(formatLevelTime(12_340)).toBe('00:12.3')
    expect(formatLevelTime(65_990)).toBe('01:05.9')
    expect(formatLevelTime(12_340, false)).toBe('00:12')
  })
})
