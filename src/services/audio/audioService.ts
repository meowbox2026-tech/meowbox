export const UI_SOUND_PATH = '/assets/audio/andressamd-pop-click-576326.mp3'

export const BACKGROUND_MUSIC_PATH = '/assets/audio/geoffharvey-excuse-me-cat-150613.mp3'

let backgroundMusic: HTMLAudioElement | undefined
let backgroundMusicEnabled = true

export function playUiSound(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return
  const AudioConstructor = window.Audio
  if (typeof AudioConstructor !== 'function') return

  const audio = new AudioConstructor(UI_SOUND_PATH)
  audio.volume = 0.34
  safelyPlay(audio)
}

export function startBackgroundMusic(enabled: boolean): void {
  if (!enabled || !backgroundMusicEnabled || typeof window === 'undefined') return
  const AudioConstructor = window.Audio
  if (typeof AudioConstructor !== 'function') return

  if (!backgroundMusic) {
    backgroundMusic = new AudioConstructor(BACKGROUND_MUSIC_PATH)
    backgroundMusic.loop = true
    backgroundMusic.volume = 0.16
  }

  safelyPlay(backgroundMusic)
}

export function setBackgroundMusicEnabled(enabled: boolean): void {
  backgroundMusicEnabled = enabled
  if (!enabled) stopBackgroundMusic()
}

export function stopBackgroundMusic(): void {
  backgroundMusic?.pause()
  backgroundMusic = undefined
}

function safelyPlay(audio: HTMLAudioElement): void {
  try {
    const promise = audio.play()
    if (promise) void promise.catch(() => undefined)
  } catch {
    // Browsers can reject media playback until the user has interacted once.
  }
}
