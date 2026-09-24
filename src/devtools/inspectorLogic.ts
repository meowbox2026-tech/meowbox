export type InspectorMode = 'project' | 'inspector'

export interface InspectorState {
  grid: boolean
  rulers: boolean
  bounds: boolean
  labels: boolean
  adjust: boolean
  safeArea: boolean
  lockAspect: boolean
  panel: boolean
}

export interface InspectorOffset {
  x: number
  y: number
}

export interface InspectorOverride {
  x?: number
  y?: number
  width?: number
  height?: number
  baseWidth?: number
  baseHeight?: number
  scaleX?: number
  scaleY?: number
  rotate?: number
}

export type InspectorOffsets = Record<string, InspectorOverride>
export type InspectorOverrides = InspectorOffsets

export const DEFAULT_INSPECTOR_STATE: InspectorState = {
  grid: false,
  rulers: false,
  bounds: false,
  labels: false,
  adjust: false,
  safeArea: false,
  lockAspect: true,
  panel: false,
}

const INSPECTOR_STATE_KEYS: Array<keyof InspectorState> = [
  'grid',
  'rulers',
  'bounds',
  'labels',
  'adjust',
  'safeArea',
  'lockAspect',
  'panel',
]

const MAX_INSPECTOR_OFFSET = 2000
const MIN_INSPECTOR_SIZE = 20
const MAX_INSPECTOR_ROTATION = 360
const MIN_INSPECTOR_BASE_SIZE = 1
const MIN_INSPECTOR_SCALE = 0.01
const MAX_INSPECTOR_SCALE = 100

function clampInspectorOffset(value: number): number {
  return Math.max(-MAX_INSPECTOR_OFFSET, Math.min(MAX_INSPECTOR_OFFSET, value))
}

export function normalizeInspectorState(value: unknown): InspectorState {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const legacyAdjustment = source.move === true || source.resize === true || source.rotate === true

  return INSPECTOR_STATE_KEYS.reduce<InspectorState>((state, key) => {
    const savedValue = key === 'adjust' && source[key] === undefined
      ? legacyAdjustment
      : source[key]
    state[key] = savedValue === undefined ? DEFAULT_INSPECTOR_STATE[key] : savedValue === true
    return state
  }, { ...DEFAULT_INSPECTOR_STATE })
}

export function formatInspectorRect(rect: Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>): string {
  const round = (value: number) => Math.round(Number(value) || 0)
  return `x ${round(rect.x)}  y ${round(rect.y)}  ·  ${round(rect.width)} × ${round(rect.height)}`
}

export function normalizeInspectorOffsets(value: unknown): InspectorOffsets {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

  return Object.entries(source).reduce<InspectorOffsets>((offsets, [selector, rawOffset]) => {
    if (!selector || selector.length > 500 || /[{};]/.test(selector)) return offsets
    if (!rawOffset || typeof rawOffset !== 'object' || Array.isArray(rawOffset)) return offsets

    const raw = rawOffset as Record<string, unknown>
    const hasPosition = raw.x !== undefined || raw.y !== undefined
    const hasWidth = raw.width !== undefined
    const hasHeight = raw.height !== undefined
    const hasBaseWidth = raw.baseWidth !== undefined
    const hasBaseHeight = raw.baseHeight !== undefined
    const hasScaleX = raw.scaleX !== undefined
    const hasScaleY = raw.scaleY !== undefined
    const hasRotation = raw.rotate !== undefined

    if (hasPosition && (
      typeof raw.x !== 'number' || !Number.isFinite(raw.x)
      || typeof raw.y !== 'number' || !Number.isFinite(raw.y)
    )) return offsets

    const hasInvalidSize = (hasWidth && (typeof raw.width !== 'number' || !Number.isFinite(raw.width)))
      || (hasHeight && (typeof raw.height !== 'number' || !Number.isFinite(raw.height)))
    if (hasInvalidSize) return offsets
    if (hasBaseWidth !== hasBaseHeight) return offsets
    if (hasBaseWidth && (
      typeof raw.baseWidth !== 'number' || !Number.isFinite(raw.baseWidth)
      || typeof raw.baseHeight !== 'number' || !Number.isFinite(raw.baseHeight)
    )) return offsets
    if (hasScaleX !== hasScaleY) return offsets
    if (hasScaleX && (
      typeof raw.scaleX !== 'number' || !Number.isFinite(raw.scaleX) || raw.scaleX <= 0
      || typeof raw.scaleY !== 'number' || !Number.isFinite(raw.scaleY) || raw.scaleY <= 0
    )) return offsets
    if (hasRotation && (typeof raw.rotate !== 'number' || !Number.isFinite(raw.rotate))) return offsets
    if (!hasPosition && !hasWidth && !hasHeight && !hasBaseWidth && !hasScaleX && !hasRotation) return offsets

    const override: InspectorOverride = {}
    if (hasPosition) {
      override.x = clampInspectorOffset(raw.x as number)
      override.y = clampInspectorOffset(raw.y as number)
    }
    if (hasWidth) override.width = Math.max(MIN_INSPECTOR_SIZE, Math.min(MAX_INSPECTOR_OFFSET, raw.width as number))
    if (hasHeight) override.height = Math.max(MIN_INSPECTOR_SIZE, Math.min(MAX_INSPECTOR_OFFSET, raw.height as number))
    if (hasBaseWidth) {
      override.baseWidth = Math.max(MIN_INSPECTOR_BASE_SIZE, Math.min(MAX_INSPECTOR_OFFSET, raw.baseWidth as number))
      override.baseHeight = Math.max(MIN_INSPECTOR_BASE_SIZE, Math.min(MAX_INSPECTOR_OFFSET, raw.baseHeight as number))
    }
    if (hasScaleX) {
      override.scaleX = Math.max(MIN_INSPECTOR_SCALE, Math.min(MAX_INSPECTOR_SCALE, raw.scaleX as number))
      override.scaleY = Math.max(MIN_INSPECTOR_SCALE, Math.min(MAX_INSPECTOR_SCALE, raw.scaleY as number))
    }
    if (hasRotation) override.rotate = Math.max(-MAX_INSPECTOR_ROTATION, Math.min(MAX_INSPECTOR_ROTATION, raw.rotate as number))

    offsets[selector] = override
    return offsets
  }, {})
}

export function formatInspectorOffset(offset: Pick<InspectorOverride, 'x' | 'y'>): string {
  const round = (value: number) => Math.round(Number(value) || 0)
  return `x ${round(offset.x || 0)} · y ${round(offset.y || 0)}`
}

export function formatInspectorOverridesCss(offsets: InspectorOffsets): string {
  return Object.entries(normalizeInspectorOffsets(offsets))
    .map(([selector, offset]) => {
      const declarations: string[] = []
      if (offset.x !== undefined || offset.y !== undefined) {
        declarations.push(`translate: ${offset.x || 0}px ${offset.y || 0}px !important;`)
      }
      if (offset.scaleX !== undefined || offset.scaleY !== undefined) {
        declarations.push(`scale: ${offset.scaleX ?? 1} ${offset.scaleY ?? 1} !important;`)
      }
      if (offset.rotate !== undefined) declarations.push(`rotate: ${offset.rotate}deg !important;`)
      return `${selector} { ${declarations.join(' ')} }`
    })
    .join('\n')
}

export function formatInspectorExport(offsets: InspectorOffsets): string {
  const normalized = normalizeInspectorOffsets(offsets)
  const handoffOverrides = Object.entries(normalized).reduce<InspectorOffsets>((result, [selector, offset]) => {
    const handoff: InspectorOverride = {}
    if (offset.x !== undefined || offset.y !== undefined) {
      handoff.x = offset.x
      handoff.y = offset.y
    }
    if (offset.width !== undefined) handoff.width = offset.width
    if (offset.height !== undefined) handoff.height = offset.height
    if (offset.rotate !== undefined) handoff.rotate = offset.rotate
    result[selector] = handoff
    return result
  }, {})

  return JSON.stringify({ version: 2, overrides: handoffOverrides }, null, 2)
}

export function getInspectorModeFromSearch(search: string): InspectorMode | null {
  const value = new URLSearchParams(search).get('inspect')
  if (value === '1') return 'inspector'
  if (value === '0') return 'project'
  return null
}

export function isEditableInspectorTarget(target: EventTarget | null): boolean {
  const element = target as (EventTarget & {
    tagName?: string
    isContentEditable?: boolean
    contentEditable?: string | boolean
  }) | null
  const tagName = String(element?.tagName || '').toLowerCase()
  return element?.isContentEditable === true
    || element?.contentEditable === true
    || String(element?.contentEditable || '').toLowerCase() === 'true'
    || element instanceof Element && element.getAttribute('contenteditable') === 'true'
    || ['input', 'textarea', 'select'].includes(tagName)
}

export function getInspectableTarget(element: Element | null): Element | null {
  if (!element) return null
  return element.closest('button, a, [role="button"], [aria-label], .home-brand, .game-actions') || element
}

function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value)
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`)
}

function isSimpleCssIdentifier(value: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value)
}

export function getInspectorSelector(element: Element): string {
  const segments: string[] = []
  let current: Element | null = element

  while (current && current !== document.body && current.id !== 'meowbox-dev-inspector') {
    let segment = current.tagName.toLowerCase()
    if (current.id) {
      segment += `#${escapeCssIdentifier(current.id)}`
    } else {
      const classes = [...current.classList]
        .filter(isSimpleCssIdentifier)
        .slice(0, 3)
        .map((className) => `.${className}`)
        .join('')
      segment += classes
    }

    const parent: Element | null = current.parentElement
    if (parent) {
      const childIndex = [...parent.children].indexOf(current) + 1
      if (childIndex > 0) segment += `:nth-child(${childIndex})`
    }

    segments.unshift(segment)
    if (current.id === 'root') break
    current = parent
  }

  return segments.join(' > ')
}

export function describeInspectorElement(element: Element | null): string {
  if (!element) return '未選取元件'

  const tagName = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ''
  const classes = [...element.classList].slice(0, 3).map((className) => `.${className}`).join('')
  return `<${tagName}${id}${classes}>`
}
