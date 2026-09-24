export const UI_SOUND_PATH = '/assets/audio/andressamd-pop-click-576326.mp3'

export const BACKGROUND_MUSIC_PATH = '/assets/audio/geoffharvey-excuse-me-cat-150613.mp3'

let backgroundMusic: HTMLAudioElement | undefined
let backgroundMusicPlaying = false
let uiSound: HTMLAudioElement | undefined
let lastUiSoundAt = 0
let backgroundMusicEnabled = true
let audioSuspended = false
const UI_SOUND_COOLDOWN_MS = 80

export function playUiSound(enabled: boolean): void {
  if (!enabled || audioSuspended || pageIsHidden() || typeof window === 'undefined') return
  const AudioConstructor = window.Audio
  if (typeof AudioConstructor !== 'function') return

  const now = Date.now()
  if (now - lastUiSoundAt < UI_SOUND_COOLDOWN_MS) return
  lastUiSoundAt = now
  if (!uiSound) {
    uiSound = new AudioConstructor(UI_SOUND_PATH)
    uiSound.volume = 0.34
  }
  uiSound.currentTime = 0
  safelyPlay(uiSound)
}

export function startBackgroundMusic(enabled: boolean): void {
  if (!enabled || !backgroundMusicEnabled || audioSuspended || pageIsHidden() || typeof window === 'undefined') return
  const AudioConstructor = window.Audio
  if (typeof AudioConstructor !== 'function') return

  if (!backgroundMusic) {
    backgroundMusic = new AudioConstructor(BACKGROUND_MUSIC_PATH)
    backgroundMusic.loop = true
    backgroundMusic.volume = 0.16
  }

  if (backgroundMusicPlaying) return
  backgroundMusicPlaying = true
  safelyPlay(backgroundMusic, () => { backgroundMusicPlaying = false })
}

/** Block media immediately while the native web view or browser page is backgrounded. */
export function setAudioSuspended(suspended: boolean): void {
  audioSuspended = suspended
  if (suspended) {
    pauseBackgroundMusic()
    uiSound?.pause()
  }
}

export function setBackgroundMusicEnabled(enabled: boolean): void {
  backgroundMusicEnabled = enabled
  if (!enabled) stopBackgroundMusic()
}

/** Temporarily pause the current track while preserving its playback position. */
export function pauseBackgroundMusic(): void {
  backgroundMusic?.pause()
  backgroundMusicPlaying = false
}

export function stopBackgroundMusic(): void {
  pauseBackgroundMusic()
  backgroundMusic = undefined
  uiSound = undefined
  lastUiSoundAt = 0
}

function safelyPlay(audio: HTMLAudioElement, onReject?: () => void): void {
  try {
    const promise = audio.play()
    if (promise) void promise.catch(() => { onReject?.() })
  } catch {
    onReject?.()
    // Browsers can reject media playback until the user has interacted once.
  }
}

function pageIsHidden(): boolean {
  return typeof document !== 'undefined' && (document.hidden || document.visibilityState === 'hidden')
}

installPageAudioLifecycle()

function installPageAudioLifecycle(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  const suspend = () => setAudioSuspended(true)
  const resume = () => { if (!pageIsHidden()) setAudioSuspended(false) }
  const syncVisibility = () => setAudioSuspended(pageIsHidden())

  syncVisibility()
  document.addEventListener('visibilitychange', syncVisibility)
  document.addEventListener('freeze', suspend)
  document.addEventListener('resume', resume)
  window.addEventListener('blur', suspend)
  window.addEventListener('focus', resume)
  window.addEventListener('pagehide', suspend)
  window.addEventListener('pageshow', resume)
}
