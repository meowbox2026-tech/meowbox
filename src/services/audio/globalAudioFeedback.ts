import { playUiSound, startBackgroundMusic } from './audioService'

export interface AudioPreferences {
  sound: boolean
  music: boolean
}

export function installGlobalAudioFeedback(
  getPreferences: () => AudioPreferences,
  eventTarget: Document = document
): () => void {
  let pointerTarget: HTMLElement | undefined
  let pointerAt = 0
  let musicGestureAt = 0

  const startMusicForGesture = () => {
    if (!getPreferences().music) return
    const now = Date.now()
    if (now - musicGestureAt < 500) return
    musicGestureAt = now
    startBackgroundMusic(true)
  }

  const playForControl = (control: HTMLElement) => {
    const preferences = getPreferences()
    if (preferences.sound) playUiSound(true)
    startMusicForGesture()
    pointerTarget = control
    pointerAt = Date.now()
  }

  const onPointerDown = (event: Event) => {
    const control = getInteractiveControl(event.target)
    if (control) playForControl(control)
    else startMusicForGesture()
  }

  const onClick = (event: Event) => {
    const control = getInteractiveControl(event.target)
    if (!control) {
      startMusicForGesture()
      return
    }
    if (control === pointerTarget && Date.now() - pointerAt < 500) return
    playForControl(control)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') startMusicForGesture()
  }

  eventTarget.addEventListener('pointerdown', onPointerDown, true)
  eventTarget.addEventListener('click', onClick, true)
  eventTarget.addEventListener('keydown', onKeyDown, true)

  return () => {
    eventTarget.removeEventListener('pointerdown', onPointerDown, true)
    eventTarget.removeEventListener('click', onClick, true)
    eventTarget.removeEventListener('keydown', onKeyDown, true)
  }
}

function getInteractiveControl(target: EventTarget | null): HTMLElement | undefined {
  if (!(target instanceof Element)) return undefined
  const control = target.closest<HTMLElement>('button, [role="button"]')
  if (!control || control.getAttribute('aria-disabled') === 'true') return undefined
  if (control instanceof HTMLButtonElement && control.disabled) return undefined
  return control
}
