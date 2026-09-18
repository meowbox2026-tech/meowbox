export const MATCH3_CLEAR_EFFECT_DURATION_MS = 560
export const MATCH3_PRESENTATION_BUFFER_MS = 70
export const MATCH3_FALL_ANIMATION_DURATION_MS = 360
export const MATCH3_FALL_STAGGER_MS = 60
export const MATCH3_FALL_PRESENTATION_BUFFER_MS = 20

export function getMatch3ComboLabel(cascades: number): string | undefined {
  const count = normalizeCascadeCount(cascades)
  return count > 0 ? `喵喵 ×${count}` : undefined
}

export function getMatch3ClearDelay(cascade: number): number {
  return Math.max(0, normalizeCascadeCount(cascade) - 1) * getMatch3ClearWaveDuration()
}

export function getMatch3ClearWaveDuration(): number {
  return MATCH3_CLEAR_EFFECT_DURATION_MS + MATCH3_PRESENTATION_BUFFER_MS
}

export function getMatch3PresentationDuration(cascades: number): number {
  return normalizeCascadeCount(cascades) * getMatch3ClearWaveDuration()
}

export function getMatch3FallDelay(x: number, y: number, height: number, width = 8): number {
  return ((height - 1 - y) * width + x) / Math.max(1, height * width - 1) * MATCH3_FALL_STAGGER_MS
}

export function getMatch3FallPresentationDuration(height: number, width = 8): number {
  const rows = Number.isFinite(height) ? Math.max(1, Math.ceil(height)) : 1
  return MATCH3_FALL_ANIMATION_DURATION_MS + getMatch3FallDelay(width - 1, 0, rows, width) + MATCH3_FALL_PRESENTATION_BUFFER_MS
}

function normalizeCascadeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}
