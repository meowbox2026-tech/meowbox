import { describe, expect, it } from 'vitest'
import {
  getMatch3ClearDelay,
  getMatch3ClearWaveDuration,
  getMatch3CatSpectacle,
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
    expect(getMatch3FallPresentationDuration(8)).toBe(440)
    expect(getMatch3FallPresentationDuration(1)).toBeLessThanOrEqual(440)
  })

  it('assigns paw, rare run, and peek spectacles to combo thresholds', () => {
    expect(getMatch3CatSpectacle(1)).toBeUndefined()
    expect(getMatch3CatSpectacle(2)).toBe('paw')
    expect(getMatch3CatSpectacle(3)).toBe('combo')
    expect(getMatch3CatSpectacle(4)).toBe('paw')
    expect(getMatch3CatSpectacle(5)).toBe('combo')
    expect(getMatch3CatSpectacle(6)).toBe('run')
    expect(getMatch3CatSpectacle(7)).toBe('run')
    expect(getMatch3CatSpectacle(8)).toBe('run')
  })
})
