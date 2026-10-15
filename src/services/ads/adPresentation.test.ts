import { describe, expect, it } from 'vitest'
import { shouldRenderDemoAd } from './adPresentation'

describe('ad presentation platform policy', () => {
  it('uses the local demo surface only on web development builds without AdSense', () => {
    expect(shouldRenderDemoAd('web', true, false)).toBe(true)
  })

  it('never shows a fake ad to production web players or when AdSense runs', () => {
    expect(shouldRenderDemoAd('web', false, false)).toBe(false)
    expect(shouldRenderDemoAd('web', true, true)).toBe(false)
  })

  it('leaves native presentation to the AdMob SDK', () => {
    expect(shouldRenderDemoAd('ios', true, false)).toBe(false)
    expect(shouldRenderDemoAd('android', true, false)).toBe(false)
  })
})
