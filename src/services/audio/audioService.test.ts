import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BACKGROUND_MUSIC_PATH,
  UI_SOUND_PATH,
  playUiSound,
  setBackgroundMusicEnabled,
  startBackgroundMusic,
  stopBackgroundMusic
} from './audioService'

describe('audio service', () => {
  afterEach(() => {
    setBackgroundMusicEnabled(true)
    stopBackgroundMusic()
    vi.unstubAllGlobals()
  })

  it('plays the supplied pop-click file for UI feedback', () => {
    const play = vi.fn(() => Promise.resolve())
    const AudioMock = vi.fn(() => ({ play, pause: vi.fn(), loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    playUiSound(true)

    expect(AudioMock).toHaveBeenCalledWith(UI_SOUND_PATH)
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('starts and stops only the configured looping background track', () => {
    const play = vi.fn(() => Promise.resolve())
    const pause = vi.fn()
    const AudioMock = vi.fn(() => ({ play, pause, loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    startBackgroundMusic(true)
    startBackgroundMusic(true)
    stopBackgroundMusic()

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(AudioMock).toHaveBeenCalledWith(BACKGROUND_MUSIC_PATH)
    expect(play).toHaveBeenCalledTimes(2)
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('does not start music while the music setting is disabled', () => {
    const AudioMock = vi.fn()
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    setBackgroundMusicEnabled(false)
    startBackgroundMusic(true)

    expect(AudioMock).not.toHaveBeenCalled()
  })
})
