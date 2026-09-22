import { describe, expect, it } from 'vitest'
import {
  INSPECTOR_BASELINE,
  formatInspectorViewport,
  getInspectorViewportStatus,
  matchInspectorPreset,
} from './inspectorViewport'

describe('inspector SE viewport baseline', () => {
  it('pins the development baseline to iPhone SE 375x667 at 100%', () => {
    expect(INSPECTOR_BASELINE.width).toBe(375)
    expect(INSPECTOR_BASELINE.height).toBe(667)
  })

  it('reports an exact baseline match', () => {
    const status = getInspectorViewportStatus({ width: 375, height: 667 })
    expect(status.isBaseline).toBe(true)
    expect(status.hint).toContain('基準一致')
  })

  it('describes deltas for larger phones so they scale up from SE', () => {
    const status = getInspectorViewportStatus({ width: 390, height: 844 })
    expect(status.isBaseline).toBe(false)
    expect(status.widthDelta).toBe(15)
    expect(status.heightDelta).toBe(177)
    expect(status.hint).toContain('出血邊')
  })

  it('warns when the viewport is smaller than SE', () => {
    const status = getInspectorViewportStatus({ width: 360, height: 640 })
    expect(status.hint).toContain('裁切')
  })

  it('matches known device presets and formats viewport text', () => {
    expect(matchInspectorPreset({ width: 430, height: 932 })?.id).toBe('iphone-max')
    expect(matchInspectorPreset({ width: 500, height: 900 })).toBeNull()
    expect(formatInspectorViewport({ width: 390.4, height: 844.6 })).toBe('390 × 845')
  })
})
