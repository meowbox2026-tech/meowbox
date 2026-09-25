import { describe, expect, it } from 'vitest'
import { shouldRenderDemoAd } from './adPresentation'

describe('ad presentation platform policy', () => {
  it('uses the local demo surface only on the web platform', () => {
    expect(shouldRenderDemoAd('web')).toBe(true)
  })

  it('leaves native presentation to the AdMob SDK', () => {
    expect(shouldRenderDemoAd('ios')).toBe(false)
    expect(shouldRenderDemoAd('android')).toBe(false)
  })
})
