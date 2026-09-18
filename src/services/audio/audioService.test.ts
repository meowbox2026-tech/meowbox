import { afterEach, describe, expect, it, vi } from 'vitest'
import { playMatch3Sound } from './audioService'

describe('match-3 audio feedback', () => {
  afterEach(() => {
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
})
