import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BACKGROUND_MUSIC_PATH,
  UI_SOUND_PATH,
  stopBackgroundMusic
} from './audioService'
import { installGlobalAudioFeedback } from './globalAudioFeedback'

describe('global audio feedback', () => {
  afterEach(() => {
    stopBackgroundMusic()
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('plays the supplied click sound once for a button pointer interaction and starts music', () => {
    const play = vi.fn(() => Promise.resolve())
    const AudioMock = vi.fn((source: string) => ({ source, play, pause: vi.fn(), loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    const button = document.createElement('button')
    const icon = document.createElement('img')
    button.append(icon)
    document.body.append(button)
    const cleanup = installGlobalAudioFeedback(() => ({ sound: true, music: true }))

    icon.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(AudioMock).toHaveBeenCalledTimes(2)
    expect(AudioMock.mock.calls.map(([source]) => source)).toEqual([UI_SOUND_PATH, BACKGROUND_MUSIC_PATH])
    expect(play).toHaveBeenCalledTimes(2)
    cleanup()
  })

  it('plays the same click sound when a cat tile is clicked with the keyboard', () => {
    const play = vi.fn(() => Promise.resolve())
    const AudioMock = vi.fn((source: string) => ({ source, play, pause: vi.fn(), loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    const catTile = document.createElement('button')
    catTile.dataset.tileType = 'orange'
    document.body.append(catTile)
    const cleanup = installGlobalAudioFeedback(() => ({ sound: true, music: false }))

    catTile.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(AudioMock).toHaveBeenCalledWith(UI_SOUND_PATH)
    expect(play).toHaveBeenCalledTimes(1)
    cleanup()
  })

  it('starts music from a blank-area pointer gesture without playing a click sound', () => {
    const play = vi.fn(() => Promise.resolve())
    const AudioMock = vi.fn((source: string) => ({ source, play, pause: vi.fn(), loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    const blankArea = document.createElement('main')
    document.body.append(blankArea)
    const cleanup = installGlobalAudioFeedback(() => ({ sound: true, music: true }))

    blankArea.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(AudioMock).toHaveBeenCalledWith(BACKGROUND_MUSIC_PATH)
    expect(play).toHaveBeenCalledTimes(1)
    cleanup()
  })

  it('starts music from a blank-area click when pointer events are unavailable', () => {
    const play = vi.fn(() => Promise.resolve())
    const AudioMock = vi.fn((source: string) => ({ source, play, pause: vi.fn(), loop: false, volume: 1 }))
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    const blankArea = document.createElement('main')
    document.body.append(blankArea)
    const cleanup = installGlobalAudioFeedback(() => ({ sound: true, music: true }))

    blankArea.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(AudioMock).toHaveBeenCalledTimes(1)
    expect(AudioMock).toHaveBeenCalledWith(BACKGROUND_MUSIC_PATH)
    expect(play).toHaveBeenCalledTimes(1)
    cleanup()
  })

  it('ignores disabled controls and respects both audio settings', () => {
    const AudioMock = vi.fn()
    vi.stubGlobal('Audio', AudioMock)
    Object.defineProperty(window, 'Audio', { configurable: true, value: AudioMock })

    const disabledButton = document.createElement('button')
    disabledButton.disabled = true
    document.body.append(disabledButton)
    const cleanup = installGlobalAudioFeedback(() => ({ sound: false, music: false }))

    disabledButton.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    disabledButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(AudioMock).not.toHaveBeenCalled()
    cleanup()
  })
})
