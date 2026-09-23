import { afterEach, describe, expect, it } from 'vitest'
import { AD_PLAY_INTERVAL, recordPlay, resetPlayCadence } from './playCadence'

describe('play ad cadence', () => {
  afterEach(() => {
    resetPlayCadence()
  })

  it(`waits for ${AD_PLAY_INTERVAL} play actions before showing an ad`, () => {
    for (let play = 1; play < AD_PLAY_INTERVAL; play += 1) {
      expect(recordPlay()).toEqual({ playsSinceAd: play, shouldShowAd: false })
    }

    expect(recordPlay()).toEqual({ playsSinceAd: 0, shouldShowAd: true })
    expect(recordPlay()).toEqual({ playsSinceAd: 1, shouldShowAd: false })
  })

  it('stores the cadence in local storage so relaunching cannot reset it', () => {
    recordPlay()
    recordPlay()

    expect(window.localStorage.getItem('meow-box-ad-play-count')).toBe('2')
  })
})
