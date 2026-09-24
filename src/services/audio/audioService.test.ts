import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BACKGROUND_MUSIC_PATH,
  UI_SOUND_PATH,
  pauseBackgroundMusic,
  playUiSound,
  setAudioSuspended,
  setBackgroundMusicEnabled,
  startBackgroundMusic,
  stopBackgroundMusic
} from './audioService'

describe('audio service', () => {
  afterEach(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    setAudioSuspended(false)
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
    expect(play).toHaveBeenCalledTimes(1)
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('pauses and resumes the same background track without restarting its source', () => {
    const play = vi.fn(() => Promise.resolve())
    const pause = vi.fn()
    const AudioMock = vi.fn(() => ({ play, pause, loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    startBackgroundMusic(true)
    pauseBackgroundMusic()
    startBackgroundMusic(true)

    expect(AudioMock).toHaveBeenCalledTimes(1)
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

  it('pauses existing music and blocks all audio while the page is suspended', () => {
    const play = vi.fn(() => Promise.resolve())
    const pause = vi.fn()
    const AudioMock = vi.fn(() => ({ play, pause, loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    startBackgroundMusic(true)
    playUiSound(true)
    setAudioSuspended(true)
    playUiSound(true)
    startBackgroundMusic(true)

    expect(AudioMock).toHaveBeenCalledTimes(2)
    expect(play).toHaveBeenCalledTimes(2)
    expect(pause).toHaveBeenCalledTimes(2)

    setAudioSuspended(false)
    startBackgroundMusic(true)

    expect(AudioMock).toHaveBeenCalledTimes(2)
    expect(play).toHaveBeenCalledTimes(3)
  })

  it('suspends and releases audio on mobile visibility changes', () => {
    const play = vi.fn(() => Promise.resolve())
    const pause = vi.fn()
    const AudioMock = vi.fn(() => ({ play, pause, loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    startBackgroundMusic(true)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    playUiSound(true)
    startBackgroundMusic(true)

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(pause).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledTimes(1)

    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
    startBackgroundMusic(true)

    expect(play).toHaveBeenCalledTimes(2)
  })
})
