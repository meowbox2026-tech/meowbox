import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STAGE_HEIGHT, STAGE_SCALE_PROPERTY, STAGE_WIDTH, computeStageScale, useStageScale } from './useStageScale'

function Probe() {
  const scale = useStageScale()
  return <span data-testid="stage-scale">{scale}</span>
}

describe('fixed design stage scale', () => {
  it('pins the design truth to iPhone SE 375x667', () => {
    expect(STAGE_WIDTH).toBe(375)
    expect(STAGE_HEIGHT).toBe(667)
    expect(computeStageScale(375, 667)).toBe(1)
  })

  it('fits inside larger phones without cropping', () => {
    expect(computeStageScale(390, 844)).toBeCloseTo(390 / 375, 10)
    expect(computeStageScale(430, 932)).toBeCloseTo(430 / 375, 10)
  })

  it('is driven by the limiting axis, including landscape', () => {
    expect(computeStageScale(956, 440)).toBeCloseTo(440 / 667, 10)
  })

  it('falls back to 1 for unusable viewports', () => {
    expect(computeStageScale(0, 0)).toBe(1)
    expect(computeStageScale(-10, 500)).toBe(1)
    expect(computeStageScale(Number.NaN, 667)).toBe(1)
  })

  it('publishes the scale as a CSS property for the stage', () => {
    render(<Probe />)
    const expected = String(computeStageScale(window.innerWidth, window.innerHeight))
    expect(screen.getByTestId('stage-scale').textContent).toBe(expected)
    expect(document.documentElement.style.getPropertyValue(STAGE_SCALE_PROPERTY)).toBe(expected)
    document.documentElement.style.removeProperty(STAGE_SCALE_PROPERTY)
  })
})
