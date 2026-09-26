import type { GameTheme } from './contentTypes'

export function applyGameTheme(theme: GameTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${toKebabCase(key)}`, value)
  })
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}
