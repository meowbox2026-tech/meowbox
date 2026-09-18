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

export function playMatch3Sound(enabled: boolean, cascades: number): void {
  if (!enabled || typeof window === 'undefined') return
  if (!window.AudioContext) return

  const context = new window.AudioContext()
  const chain = Math.max(1, Math.floor(cascades))
  const frequencies = chain > 1
    ? [520, 680, Math.min(1040, 760 + chain * 60)]
    : [560, 760]
  const now = context.currentTime
  let lastOscillator: OscillatorNode | undefined

  frequencies.forEach((frequency, index) => {
    const start = now + index * 0.055
    const end = start + 0.16
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = index === 0 ? 'sine' : 'triangle'
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(chain > 1 ? 0.065 : 0.05, start + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(start)
    oscillator.stop(end)
    lastOscillator = oscillator
  })

  lastOscillator?.addEventListener('ended', () => void context.close())
}
