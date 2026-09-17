import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INSPECTOR_STATE,
  describeInspectorElement,
  formatInspectorExport,
  formatInspectorRect,
  formatInspectorOffset,
  formatInspectorOverridesCss,
  getInspectableTarget,
  getInspectorModeFromSearch,
  isEditableInspectorTarget,
  normalizeInspectorOffsets,
  normalizeInspectorState,
} from './inspectorLogic'

describe('development inspector state', () => {
  it('normalizes persisted toggles and ignores unknown values', () => {
    expect(normalizeInspectorState({ grid: true, rulers: 1, bounds: false, labels: 'yes', safeArea: true, panel: true, extra: true })).toEqual({
      grid: true,
      rulers: false,
      bounds: false,
      labels: false,
      adjust: false,
      safeArea: true,
      lockAspect: true,
      panel: true,
    })
  })

  it('migrates any legacy adjustment toggle into the unified adjustment mode', () => {
    expect(normalizeInspectorState({ move: true })).toMatchObject({ adjust: true })
    expect(normalizeInspectorState({ resize: true })).toMatchObject({ adjust: true })
    expect(normalizeInspectorState({ rotate: true })).toMatchObject({ adjust: true })
    expect(normalizeInspectorState({ move: true, adjust: false })).toMatchObject({ adjust: false })
  })

  it('uses a safe all-off default for malformed storage', () => {
    expect(normalizeInspectorState(null)).toEqual(DEFAULT_INSPECTOR_STATE)
    expect(normalizeInspectorState({ grid: 'true' })).toEqual(DEFAULT_INSPECTOR_STATE)
  })

  it('formats rectangles and describes the selected element', () => {
    expect(formatInspectorRect({ x: 1.6, y: 20.49, width: 99.9, height: 48.2 })).toBe('x 2  y 20  ·  100 × 48')

    const element = document.createElement('button')
    element.id = 'start'
    element.className = 'artwork-button home-start'
    expect(describeInspectorElement(element)).toBe('<button#start.artwork-button.home-start>')
  })

  it('recognizes editable targets so shortcuts do not hijack typing', () => {
    const input = document.createElement('input')
    const contentEditable = document.createElement('div')
    contentEditable.contentEditable = 'true'

    expect(isEditableInspectorTarget(input)).toBe(true)
    expect(isEditableInspectorTarget(contentEditable)).toBe(true)
    expect(isEditableInspectorTarget(document.createElement('button'))).toBe(false)
  })

  it('normalizes saved offsets and generates copyable preview CSS', () => {
    const offsets = normalizeInspectorOffsets({
      '#root > button.home-start:nth-child(2)': {
        x: 12.4,
        y: -8.8,
        width: 180.2,
        height: 90.6,
        baseWidth: 120,
        baseHeight: 60,
        scaleX: 1.5016666667,
        scaleY: 1.51,
        rotate: -12.6,
      },
      '.invalid': { x: '12', y: 0 },
      '.partial': { x: 3 },
    })

    expect(offsets).toEqual({
      '#root > button.home-start:nth-child(2)': {
        x: 12.4,
        y: -8.8,
        width: 180.2,
        height: 90.6,
        baseWidth: 120,
        baseHeight: 60,
        scaleX: 1.5016666667,
        scaleY: 1.51,
        rotate: -12.6,
      },
    })
    expect(formatInspectorOffset({ x: 12.4, y: -8.8 })).toBe('x 12 · y -9')
    expect(formatInspectorOverridesCss(offsets)).toBe('#root > button.home-start:nth-child(2) { translate: 12.4px -8.8px !important; scale: 1.5016666667 1.51 !important; rotate: -12.6deg !important; }')
    expect(JSON.parse(formatInspectorExport(offsets))).toEqual({
      version: 2,
      overrides: {
        '#root > button.home-start:nth-child(2)': {
          x: 12.4,
          y: -8.8,
          width: 180.2,
          height: 90.6,
          rotate: -12.6,
        },
      },
    })
  })

  it('accepts size-only overrides and resolves explicit inspector mode queries', () => {
    expect(normalizeInspectorOffsets({ '.card': { width: 240, height: 120, rotate: 15 } })).toEqual({
      '.card': { width: 240, height: 120, rotate: 15 },
    })
    expect(normalizeInspectorOffsets({ '.scaled-card': { width: 240, height: 120, baseWidth: 120, baseHeight: 60, scaleX: 2, scaleY: 2 } })).toEqual({
      '.scaled-card': { width: 240, height: 120, baseWidth: 120, baseHeight: 60, scaleX: 2, scaleY: 2 },
    })
    expect(getInspectorModeFromSearch('?inspect=1')).toBe('inspector')
    expect(getInspectorModeFromSearch('?inspect=0')).toBe('project')
    expect(getInspectorModeFromSearch('?foo=bar')).toBeNull()
  })

  it('promotes a nested artwork label to its movable component', () => {
    const button = document.createElement('button')
    button.className = 'artwork-button home-start'
    const label = document.createElement('span')
    button.append(label)

    expect(getInspectableTarget(label)).toBe(button)
  })
})
