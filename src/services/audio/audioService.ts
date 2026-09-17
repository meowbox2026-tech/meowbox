export function playUiSound(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return
  if (!window.AudioContext) return
  const context = new window.AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(660, context.currentTime)
  gain.gain.setValueAtTime(0.05, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.08)
  oscillator.addEventListener('ended', () => void context.close())
}
