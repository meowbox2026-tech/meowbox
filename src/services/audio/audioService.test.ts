import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CAT_SOUND_PATHS,
  playCatSound,
  playMatch3Sound,
  startBackgroundMusic,
  stopBackgroundMusic
} from './audioService'

describe('match-3 audio feedback', () => {
  afterEach(() => {
    stopBackgroundMusic()
    vi.unstubAllGlobals()
  })

  it('does not create an audio context when sound is disabled', () => {
    const AudioContextMock = vi.fn()
    vi.stubGlobal('AudioContext', AudioContextMock)

    playMatch3Sound(false, 3)

    expect(AudioContextMock).not.toHaveBeenCalled()
  })

  it('starts a short audio cue for a cleared match', () => {
    const oscillator = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn()
    }
    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      connect: vi.fn().mockReturnThis()
    }
    const AudioContextMock = vi.fn(() => ({
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain)
    }))
    vi.stubGlobal('AudioContext', AudioContextMock)

    playMatch3Sound(true, 1)

    expect(AudioContextMock).toHaveBeenCalledTimes(1)
    expect(oscillator.start).toHaveBeenCalled()
    expect(oscillator.stop).toHaveBeenCalled()
  })

  it('keeps only non-meow cat sounds and plays them only when sound is enabled', () => {
    const play = vi.fn(() => Promise.resolve())
    const AudioMock = vi.fn(() => ({ play, pause: vi.fn(), loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    playCatSound('purr', true)

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(AudioMock).toHaveBeenCalledWith(CAT_SOUND_PATHS.purr)
    expect(CAT_SOUND_PATHS).not.toHaveProperty('meow')
    expect(CAT_SOUND_PATHS).not.toHaveProperty('paw')
    expect(CAT_SOUND_PATHS.rustle).toBe('/assets/audio/box-rustle.mp3')
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('starts and stops the looping MeowBox theme after a user gesture', () => {
    const play = vi.fn(() => Promise.resolve())
    const pause = vi.fn()
    const AudioMock = vi.fn(() => ({ play, pause, loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    startBackgroundMusic(true)
    startBackgroundMusic(true)
    stopBackgroundMusic()

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(2)
    expect(pause).toHaveBeenCalledTimes(1)
  })
})
