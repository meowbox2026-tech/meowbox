import { describe, expect, it } from 'vitest'
import {
  getMatch3ClearDelay,
  getMatch3ClearWaveDuration,
  getMatch3ComboLabel,
  getMatch3FallPresentationDuration,
  getMatch3PresentationDuration
} from './match3Presentation'

describe('match-3 presentation timing', () => {
  it('labels each clear wave so a chain can count up on screen', () => {
    expect(getMatch3ComboLabel(0)).toBeUndefined()
    expect(getMatch3ComboLabel(1)).toBe('喵喵 ×1')
    expect(getMatch3ComboLabel(2)).toBe('喵喵 ×2')
    expect(getMatch3ComboLabel(3)).toBe('喵喵 ×3')
  })

  it('allocates one presentation window for each clear wave', () => {
    expect(getMatch3ClearDelay(1)).toBe(0)
    expect(getMatch3ClearDelay(2)).toBeGreaterThan(0)
    expect(getMatch3ClearDelay(3)).toBe(getMatch3ClearDelay(2) * 2)
    expect(getMatch3PresentationDuration(3)).toBe(getMatch3ClearWaveDuration() * 3)
    expect(getMatch3PresentationDuration(1)).toBe(getMatch3ClearWaveDuration())
  })

  it('keeps the falling animation alive through its travel and stagger', () => {
    expect(getMatch3FallPresentationDuration(8)).toBe(630)
    expect(getMatch3FallPresentationDuration(1)).toBeLessThanOrEqual(630)
  })
})
