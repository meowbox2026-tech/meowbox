import { describe, expect, it } from 'vitest'
import { getCatDropScale, getCatDisplayAngle } from './catMotion'

describe('cat placement motion', () => {
  it('squashes horizontally on impact and returns to a neutral scale', () => {
    const falling = getCatDropScale(0)
    const impact = getCatDropScale(.5)
    const settled = getCatDropScale(1)

    expect(falling.x).toBeCloseTo(.92)
    expect(impact.x).toBeGreaterThan(1)
    expect(impact.y).toBeLessThan(1)
    expect(settled).toEqual({ x: 1, y: 1 })
  })

  it('adds a bounded tilt only while a cat is being dragged', () => {
    expect(getCatDisplayAngle(1, 9, true)).toBe(99)
    expect(getCatDisplayAngle(1, 30, true)).toBe(102)
    expect(getCatDisplayAngle(1, 30, false)).toBe(90)
  })
})
