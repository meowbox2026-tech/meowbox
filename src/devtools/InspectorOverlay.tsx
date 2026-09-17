import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  DEFAULT_INSPECTOR_STATE,
  describeInspectorElement,
  formatInspectorExport,
  formatInspectorOffset,
  formatInspectorOverridesCss,
  formatInspectorRect,
  getInspectableTarget,
  getInspectorModeFromSearch,
  getInspectorSelector,
  isEditableInspectorTarget,
  normalizeInspectorOffsets,
  normalizeInspectorState,
  type InspectorMode,
  type InspectorOverride,
  type InspectorOffsets,
  type InspectorState,
} from './inspectorLogic'
import './inspector.css'

const STORAGE_KEY = 'meowbox-dev-inspector.v1'
const OVERRIDES_STORAGE_KEY = 'meowbox-dev-inspector-overrides.v1'
const MODE_STORAGE_KEY = 'meowbox-dev-inspector-mode.v1'
const MODE_SHORTCUTS: Record<string, keyof InspectorState> = {
  g: 'grid',
  r: 'rulers',
  s: 'safeArea',
  b: 'bounds',
  l: 'labels',
  a: 'adjust',
  // Keep the old adjustment shortcuts as aliases after merging the controls.
  m: 'adjust',
  d: 'adjust',
  o: 'adjust',
}

type AdjustmentMode = 'move' | 'resize' | 'rotate'
type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw'
type NumericOverrideField = 'width' | 'height' | 'rotate'

const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'ne', 'se', 'sw']
const MIN_SIZE = 20
const MAX_SIZE = 2000
const MAX_ROTATION = 360

interface DragSession {
  pointerId: number
  kind: AdjustmentMode
  selector: string
  startX: number
  startY: number
  baseOverride: InspectorOverride
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
  startAngle: number
  resizeHandle?: ResizeHandle
}

function loadInspectorState(): InspectorState {
  const explicitMode = getInspectorModeFromSearch(window.location.search)
  let state = DEFAULT_INSPECTOR_STATE

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    state = saved ? normalizeInspectorState(JSON.parse(saved)) : DEFAULT_INSPECTOR_STATE
  } catch {
    // Private browsing modes can deny localStorage; the inspector still works for the session.
  }

  if (explicitMode === 'inspector') {
    return { ...state, grid: true, rulers: true, safeArea: true, panel: true }
  }

  if (explicitMode === 'project') return { ...state, panel: false }
  return state
}

function loadInspectorMode(): InspectorMode {
  const explicitMode = getInspectorModeFromSearch(window.location.search)
  if (explicitMode) return explicitMode

  try {
    return window.sessionStorage.getItem(MODE_STORAGE_KEY) === 'inspector' ? 'inspector' : 'project'
  } catch {
    return 'project'
  }
}

function saveInspectorState(state: InspectorState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private browsing modes can deny localStorage; the inspector still works for the session.
  }
}

function saveInspectorMode(mode: InspectorMode) {
  try {
    window.sessionStorage.setItem(MODE_STORAGE_KEY, mode)
  } catch {
    // A denied sessionStorage only disables mode persistence; the current tab still works.
  }
}

function loadInspectorOffsets(): InspectorOffsets {
  try {
    const saved = window.localStorage.getItem(OVERRIDES_STORAGE_KEY)
    return saved ? migrateLegacySizeOverrides(normalizeInspectorOffsets(JSON.parse(saved))) : {}
  } catch {
    return {}
  }
}

function saveInspectorOffsets(offsets: InspectorOffsets) {
  try {
    window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(offsets))
  } catch {
    // Private browsing modes can deny localStorage; preview adjustments still work for the session.
  }
}

function getInspectableElement(event: Pick<MouseEvent, 'clientX' | 'clientY'>, ignoredRoot?: Element | null): Element | null {
  const element = document.elementFromPoint?.(event.clientX, event.clientY)
  if (!(element instanceof Element) || element === document.documentElement || element === document.body) return null
  if (ignoredRoot?.contains(element)) return null
  return element
}

function clampSize(value: number): number {
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, value))
}

function clampRotation(value: number): number {
  return Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, value))
}

function getPreviewBaseDimensions(override: InspectorOverride, rect: Pick<DOMRect, 'width' | 'height'>) {
  const baseWidth = override.baseWidth
    ?? (override.scaleX && override.width !== undefined ? override.width / override.scaleX : rect.width)
  const baseHeight = override.baseHeight
    ?? (override.scaleY && override.height !== undefined ? override.height / override.scaleY : rect.height)
  return {
    width: Math.max(1, baseWidth),
    height: Math.max(1, baseHeight),
  }
}

function getPreviewDimensions(override: InspectorOverride, rect: Pick<DOMRect, 'width' | 'height'>) {
  const base = getPreviewBaseDimensions(override, rect)
  return {
    width: override.width ?? base.width * (override.scaleX ?? 1),
    height: override.height ?? base.height * (override.scaleY ?? 1),
  }
}

function createPreviewSizeOverride(
  current: InspectorOverride,
  rect: Pick<DOMRect, 'width' | 'height'>,
  width: number,
  height: number,
): InspectorOverride {
  const base = getPreviewBaseDimensions(current, rect)
  const nextWidth = clampSize(width)
  const nextHeight = clampSize(height)

  return {
    ...current,
    width: nextWidth,
    height: nextHeight,
    baseWidth: base.width,
    baseHeight: base.height,
    scaleX: nextWidth / base.width,
    scaleY: nextHeight / base.height,
  }
}

function migrateLegacySizeOverrides(offsets: InspectorOffsets): InspectorOffsets {
  return Object.entries(offsets).reduce<InspectorOffsets>((migrated, [selector, override]) => {
    const hasLegacySize = (override.width !== undefined || override.height !== undefined)
      && override.scaleX === undefined
      && override.scaleY === undefined
    if (!hasLegacySize) {
      migrated[selector] = override
      return migrated
    }

    try {
      const element = document.querySelector(selector)
      const rect = element?.getBoundingClientRect()
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        migrated[selector] = override
        return migrated
      }

      migrated[selector] = createPreviewSizeOverride(
        override,
        rect,
        override.width ?? rect.width,
        override.height ?? rect.height,
      )
    } catch {
      migrated[selector] = override
    }
    return migrated
  }, {})
}

function getResizeDimensions(drag: DragSession, clientX: number, clientY: number, lockAspect: boolean) {
  const baseWidth = drag.baseOverride.width ?? drag.rect.width
  const baseHeight = drag.baseOverride.height ?? drag.rect.height
  const deltaX = clientX - drag.startX
  const deltaY = clientY - drag.startY
  const handle = drag.resizeHandle || 'se'
  const widthCandidate = ['nw', 'sw'].includes(handle) ? baseWidth - deltaX : baseWidth + deltaX
  const heightCandidate = ['nw', 'ne'].includes(handle) ? baseHeight - deltaY : baseHeight + deltaY

  if (!lockAspect) {
    return { width: clampSize(widthCandidate), height: clampSize(heightCandidate) }
  }

  const widthScale = widthCandidate / Math.max(baseWidth, 1)
  const heightScale = heightCandidate / Math.max(baseHeight, 1)
  const preferredScale = Math.abs(deltaX) >= Math.abs(deltaY) ? widthScale : heightScale
  const minScale = Math.max(MIN_SIZE / Math.max(baseWidth, 1), MIN_SIZE / Math.max(baseHeight, 1))
  const maxScale = Math.min(MAX_SIZE / Math.max(baseWidth, 1), MAX_SIZE / Math.max(baseHeight, 1))
  const scale = Math.max(minScale, Math.min(maxScale, preferredScale))

  return { width: clampSize(baseWidth * scale), height: clampSize(baseHeight * scale) }
}

function RulerTicks({ axis, length }: { axis: 'x' | 'y'; length: number }) {
  const ticks = useMemo(() => {
    const count = Math.ceil(length / 100) + 1
    return Array.from({ length: count }, (_, index) => index * 100)
  }, [length])

  return <>
    {ticks.map((value) => <span key={value} style={axis === 'x' ? { left: value } : { top: value }}>{value}</span>)}
  </>
}

export function InspectorOverlay() {
  const [mode, setMode] = useState<InspectorMode>(loadInspectorMode)
  const [state, setState] = useState<InspectorState>(loadInspectorState)
  const [offsets, setOffsets] = useState<InspectorOffsets>(loadInspectorOffsets)
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null)
  const [pinnedElement, setPinnedElement] = useState<Element | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [exportStatus, setExportStatus] = useState('')
  const inspectorRootRef = useRef<HTMLDivElement | null>(null)
  const offsetsRef = useRef<InspectorOffsets>(offsets)
  const modeRef = useRef<InspectorMode>(mode)
  const dragRef = useRef<DragSession | null>(null)
  const suppressClickRef = useRef(false)
  const [, setLayoutTick] = useState(0)

  offsetsRef.current = offsets
  modeRef.current = mode

  useEffect(() => {
    saveInspectorState(state)
  }, [state])

  useEffect(() => {
    saveInspectorOffsets(offsets)
  }, [offsets])

  useEffect(() => {
    saveInspectorMode(mode)
  }, [mode])

  useEffect(() => {
    const explicitMode = getInspectorModeFromSearch(window.location.search)
    if (!explicitMode) return

    const url = new URL(window.location.href)
    url.searchParams.delete('inspect')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  const patchState = useCallback((patch: Partial<InspectorState>) => {
    setState((current) => ({ ...current, ...patch }))
  }, [])

  const setInspectorMode = useCallback((nextMode: InspectorMode) => {
    modeRef.current = nextMode
    setMode(nextMode)
    if (nextMode === 'project') setState((current) => ({ ...current, panel: false }))
  }, [])

  const toggleInspectorMode = useCallback(() => {
    setInspectorMode(modeRef.current === 'inspector' ? 'project' : 'inspector')
  }, [setInspectorMode])

  const setAdjustMode = useCallback((enabled: boolean) => {
    setState((current) => ({ ...current, adjust: enabled }))
  }, [])

  const selectedElement = pinnedElement || hoveredElement
  const selectedRect = selectedElement?.isConnected ? selectedElement.getBoundingClientRect() : null
  const selectedSelector = selectedElement ? getInspectorSelector(selectedElement) : ''
  const selectedOffset = selectedSelector ? offsets[selectedSelector] : undefined
  const selectedWidth = selectedRect ? selectedOffset?.width ?? selectedRect.width : 0
  const selectedHeight = selectedRect ? selectedOffset?.height ?? selectedRect.height : 0
  const selectedRotation = selectedOffset?.rotate ?? 0
  const selectionStyle: CSSProperties | undefined = selectedRect
    ? { left: selectedRect.left, top: selectedRect.top, width: selectedRect.width, height: selectedRect.height }
    : undefined
  const selectedSummary = selectedElement && selectedRect
    ? `${pinnedElement ? '已固定選取' : '目前滑過'}\n${describeInspectorElement(selectedElement)}\n${formatInspectorRect(selectedRect)}\n尺寸 ${Math.round(selectedWidth)} × ${Math.round(selectedHeight)}${selectedOffset && (selectedOffset.x !== undefined || selectedOffset.y !== undefined) ? `\n位移 ${formatInspectorOffset(selectedOffset)}` : ''}${selectedOffset?.rotate !== undefined ? `\n旋轉 ${Math.round(selectedRotation)}°` : ''}`
    : state.adjust
      ? '調整模式：拖曳元件移動、四角改尺寸、上方控制點旋轉。'
      : '開啟「元件框線」後，將滑鼠移到元件上；點擊可固定選取。'

  const beginAdjustment = useCallback((event: PointerEvent, element: Element, kind: AdjustmentMode, resizeHandle?: ResizeHandle) => {
    if (!element.isConnected || element.id === 'root') return

    const selector = getInspectorSelector(element)
    const rect = element.getBoundingClientRect()
    const baseOverride = offsetsRef.current[selector] || {}
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    dragRef.current = {
      pointerId: event.pointerId,
      kind,
      selector,
      startX: event.clientX,
      startY: event.clientY,
      baseOverride,
      rect,
      startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
      resizeHandle,
    }
    suppressClickRef.current = true
    setHoveredElement(element)
    setPinnedElement(element)
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }, [])

  const clearSelectedOffset = useCallback(() => {
    if (!selectedSelector) return
    setOffsets((current) => {
      if (!current[selectedSelector]) return current
      const next = { ...current }
      Reflect.deleteProperty(next, selectedSelector)
      return next
    })
  }, [selectedSelector])

  const updateSelectedValue = useCallback((field: NumericOverrideField, rawValue: string) => {
    if (!selectedSelector || !selectedElement || !selectedRect || rawValue.trim() === '') return
    const value = Number(rawValue)
    if (!Number.isFinite(value)) return

    const current = offsetsRef.current[selectedSelector] || {}
    const nextOverride = field === 'rotate'
      ? { ...current, rotate: value }
      : createPreviewSizeOverride(
        current,
        selectedRect,
        field === 'width' ? value : getPreviewDimensions(current, selectedRect).width,
        field === 'height' ? value : getPreviewDimensions(current, selectedRect).height,
      )
    const normalized = normalizeInspectorOffsets({
      [selectedSelector]: nextOverride,
    })[selectedSelector]
    if (!normalized) return

    setOffsets((currentOffsets) => ({ ...currentOffsets, [selectedSelector]: normalized }))
  }, [selectedElement, selectedRect, selectedSelector])

  const handleResizePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>, resizeHandle: ResizeHandle) => {
    if (!state.adjust || !selectedElement) return
    event.preventDefault()
    event.stopPropagation()
    beginAdjustment(event.nativeEvent, selectedElement, 'resize', resizeHandle)
  }, [beginAdjustment, selectedElement, state.adjust])

  const handleRotatePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!state.adjust || !selectedElement) return
    event.preventDefault()
    event.stopPropagation()
    beginAdjustment(event.nativeEvent, selectedElement, 'rotate')
  }, [beginAdjustment, selectedElement, state.adjust])

  useEffect(() => {
    let frame = 0

    const refresh = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setLayoutTick((tick) => tick + 1)
      })
    }

    const handleMove = (event: MouseEvent) => {
      setPointer({ x: event.clientX, y: event.clientY })
      if (mode !== 'inspector' || dragRef.current || (!state.bounds && !state.labels && !state.adjust)) return
      const inspectorRoot = inspectorRootRef.current
      if (inspectorRoot && event.target instanceof Node && inspectorRoot.contains(event.target)) {
        setHoveredElement(null)
        return
      }
      const element = getInspectableElement(event, inspectorRoot)
      setHoveredElement(state.adjust ? getInspectableTarget(element) : element)
    }

    const handleClick = (event: MouseEvent) => {
      const inspectorRoot = inspectorRootRef.current
      if (mode !== 'inspector') return
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        if (event.target instanceof Node && inspectorRoot?.contains(event.target)) return
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return
      }
      if ((!state.bounds && !state.labels && !state.adjust) || (event.target instanceof Node && inspectorRoot?.contains(event.target))) return

      const rawElement = getInspectableElement(event, inspectorRoot)
      const element = state.adjust ? getInspectableTarget(rawElement) : rawElement
      if (!element) return

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      setHoveredElement(element)
      setPinnedElement(element)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const inspectorRoot = inspectorRootRef.current
      if (mode !== 'inspector' || !state.adjust || (event.target instanceof Node && inspectorRoot?.contains(event.target))) return

      const rawElement = getInspectableElement(event, inspectorRoot)
      const element = getInspectableTarget(rawElement)
      if (!element || element.id === 'root') return
      beginAdjustment(event, element, 'move')
    }

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return

      let nextOverride: InspectorOverride = { ...drag.baseOverride }
      if (drag.kind === 'move') {
        nextOverride.x = (drag.baseOverride.x ?? 0) + event.clientX - drag.startX
        nextOverride.y = (drag.baseOverride.y ?? 0) + event.clientY - drag.startY
      } else if (drag.kind === 'resize') {
        const dimensions = getResizeDimensions(drag, event.clientX, event.clientY, state.lockAspect)
        nextOverride = createPreviewSizeOverride(drag.baseOverride, drag.rect, dimensions.width, dimensions.height)
      } else {
        const centerX = drag.rect.left + drag.rect.width / 2
        const centerY = drag.rect.top + drag.rect.height / 2
        const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX)
        const delta = (angle - drag.startAngle) * 180 / Math.PI
        nextOverride.rotate = clampRotation((drag.baseOverride.rotate ?? 0) + delta)
      }

      setPointer({ x: event.clientX, y: event.clientY })
      setOffsets((current) => ({ ...current, [drag.selector]: nextOverride }))
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    const handlePointerEnd = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragRef.current = null
      suppressClickRef.current = true
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      refresh()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const inspectorRoot = inspectorRootRef.current
      if ((event.target instanceof Node && inspectorRoot?.contains(event.target)) || isEditableInspectorTarget(event.target)) return

      if (event.key === 'Escape') {
        if (mode !== 'inspector') return
        dragRef.current = null
        setHoveredElement(null)
        setPinnedElement(null)
        patchState({ panel: false })
        return
      }

      if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) return
      const shortcut = event.key.toLowerCase()
      if (shortcut === 'i') {
        event.preventDefault()
        toggleInspectorMode()
        return
      }
      if (mode !== 'inspector') return

      const inspectorMode = MODE_SHORTCUTS[shortcut]
      if (!inspectorMode) return

      event.preventDefault()
      if (inspectorMode === 'adjust') {
        setAdjustMode(!state.adjust)
      } else {
        patchState({ [inspectorMode]: !state[inspectorMode] })
      }
    }

    window.addEventListener('mousemove', handleMove, true)
    window.addEventListener('click', handleClick, true)
    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('pointermove', handlePointerMove, true)
    window.addEventListener('pointerup', handlePointerEnd, true)
    window.addEventListener('pointercancel', handlePointerEnd, true)
    window.addEventListener('scroll', refresh, true)
    window.addEventListener('resize', handleResize, true)
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', handleMove, true)
      window.removeEventListener('click', handleClick, true)
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('pointermove', handlePointerMove, true)
      window.removeEventListener('pointerup', handlePointerEnd, true)
      window.removeEventListener('pointercancel', handlePointerEnd, true)
      window.removeEventListener('scroll', refresh, true)
      window.removeEventListener('resize', handleResize, true)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [beginAdjustment, mode, patchState, setAdjustMode, state, toggleInspectorMode])

  const handleExport = useCallback(async () => {
    const exportText = formatInspectorExport(offsetsRef.current)
    if (!navigator.clipboard?.writeText) {
      setExportStatus('請從下方文字框複製調整資料')
      return
    }

    try {
      await navigator.clipboard.writeText(exportText)
      setExportStatus('已複製調整資料')
    } catch {
      setExportStatus('請從下方文字框複製調整資料')
    }
  }, [])

  const overridesCss = mode === 'inspector' ? formatInspectorOverridesCss(offsets) : ''
  const exportText = formatInspectorExport(offsets)
  const hasSelectionControls = Boolean(selectedRect && state.adjust)
  const rootClassName = [
    'mbo-root',
    state.panel && 'is-panel-open',
    state.grid && 'is-grid',
    state.rulers && 'is-rulers',
    state.safeArea && 'is-safe-area',
    state.adjust && 'is-adjust-mode',
  ].filter(Boolean).join(' ')

  if (mode === 'project') return null

  return createPortal(
    <div id="meowbox-dev-inspector" ref={inspectorRootRef} className={rootClassName} data-mode={mode}>
      <style id="mbo-inspector-overrides">{overridesCss}</style>
      <div className="mbo-surface" aria-hidden="true" style={{ '--mbo-mouse-x': `${pointer.x}px`, '--mbo-mouse-y': `${pointer.y}px` } as CSSProperties}>
        <div className="mbo-grid" />
        <div className="mbo-safe-area mbo-safe-area--top" data-label="safe top" />
        <div className="mbo-safe-area mbo-safe-area--bottom" data-label="safe bottom" />
        <div className="mbo-rulers">
          <div className="mbo-ruler-x"><RulerTicks axis="x" length={viewport.width} /></div>
          <div className="mbo-ruler-y"><RulerTicks axis="y" length={viewport.height} /></div>
        </div>
        <div className="mbo-crosshair mbo-crosshair--x" />
        <div className="mbo-crosshair mbo-crosshair--y" />
        <div className="mbo-coordinate">x {Math.round(pointer.x)} · y {Math.round(pointer.y)}</div>
        <div className={`mbo-selection${selectedRect && (state.bounds || state.labels || state.adjust) ? ' is-visible' : ''}`} data-pinned={String(Boolean(pinnedElement))} style={selectionStyle}>
          <div className="mbo-selection__label">{selectedRect ? `${describeInspectorElement(selectedElement)}  ·  ${formatInspectorRect(selectedRect)}` : ''}</div>
          {hasSelectionControls && <div className="mbo-selection__controls">
            {RESIZE_HANDLES.map((resizeHandle) => (
              <button
                aria-label={`調整${resizeHandle}尺寸`}
                className={`mbo-resize-handle mbo-resize-handle--${resizeHandle}`}
                key={resizeHandle}
                type="button"
                onPointerDown={(event) => handleResizePointerDown(event, resizeHandle)}
              />
            ))}
            <button aria-label="旋轉元件" className="mbo-rotate-handle" type="button" onPointerDown={handleRotatePointerDown}>↻</button>
          </div>}
        </div>
      </div>

      <section className="mbo-panel" role="dialog" aria-label="MeowBox 檢視工具" hidden={!state.panel}>
        <div className="mbo-panel__header">
          <div>
            <strong className="mbo-panel__title">MEOWBOX INSPECTOR</strong>
            <span className="mbo-panel__status">Inspector 模式 · 本分頁</span>
          </div>
          <button className="mbo-panel__close" type="button" onClick={() => patchState({ panel: false })} aria-label="關閉檢視工具">×</button>
        </div>
        <button className="mbo-mode-switch" type="button" onClick={() => setInspectorMode('project')}>切換專案模式</button>
        <div className="mbo-panel__section-title">Overlay / Adjustment</div>
        <div className="mbo-modes">
          {([
            ['grid', '格線', 'G'],
            ['rulers', '尺規／座標', 'R'],
            ['safeArea', '安全區', 'S'],
            ['bounds', '元件框線', 'B'],
            ['labels', '元件資訊', 'L'],
            ['adjust', '調整模式', 'A'],
          ] as Array<[keyof InspectorState, string, string]>).map(([inspectorMode, label, shortcut]) => (
            <label className="mbo-mode" key={inspectorMode}>
              <input
                aria-label={label}
                type="checkbox"
                checked={state[inspectorMode]}
                onChange={(event) => patchState({ [inspectorMode]: event.target.checked })}
              />
              <span>{label}</span>
              <kbd>{shortcut}</kbd>
            </label>
          ))}
        </div>
        <div className="mbo-panel__section">
          <div className="mbo-panel__section-title">Selected element</div>
          <pre className="mbo-selection-detail" data-detail>{selectedSummary}</pre>
          {selectedElement && selectedRect && <>
            <div className="mbo-adjust-grid">
              <label className="mbo-adjust-field"><span>寬度 W</span><input aria-label="預覽寬度" type="number" min={MIN_SIZE} max={MAX_SIZE} value={Math.round(selectedWidth)} onChange={(event) => updateSelectedValue('width', event.target.value)} /></label>
              <label className="mbo-adjust-field"><span>高度 H</span><input aria-label="預覽高度" type="number" min={MIN_SIZE} max={MAX_SIZE} value={Math.round(selectedHeight)} onChange={(event) => updateSelectedValue('height', event.target.value)} /></label>
              <label className="mbo-adjust-field"><span>旋轉</span><input aria-label="預覽旋轉角度" type="number" min={-MAX_ROTATION} max={MAX_ROTATION} value={Math.round(selectedRotation)} onChange={(event) => updateSelectedValue('rotate', event.target.value)} /></label>
            </div>
            {state.adjust && <label className="mbo-lock-aspect"><input aria-label="鎖定比例" type="checkbox" checked={state.lockAspect} onChange={(event) => patchState({ lockAspect: event.target.checked })} />鎖定比例</label>}
          </>}
          {selectedOffset && <button className="mbo-panel__clear" type="button" onClick={clearSelectedOffset}>重設此元件調整</button>}
          {Object.keys(offsets).length > 0 && <button className="mbo-panel__clear" type="button" onClick={() => setOffsets({})}>清除全部調整</button>}
          <button className="mbo-panel__clear" type="button" onClick={() => { setHoveredElement(null); setPinnedElement(null) }}>清除選取</button>
        </div>
        <div className="mbo-panel__section">
          <div className="mbo-panel__section-title">Handoff</div>
          <button className="mbo-panel__clear mbo-panel__export" type="button" onClick={handleExport}>複製調整資料</button>
          {exportStatus && <div className="mbo-export-status" role="status">{exportStatus}</div>}
          <details className="mbo-export-details">
            <summary>查看調整資料</summary>
            <textarea aria-label="Inspector 調整資料" readOnly rows={5} value={exportText} />
          </details>
        </div>
        <p className="mbo-panel__hint">拖曳元件不會重新開啟面板。移動、尺寸、旋轉都只套用在 Inspector 預覽；設定依本分頁／本機保存，正式模式不會套用。</p>
      </section>

      <button className="mbo-launcher" type="button" onClick={() => patchState({ panel: true })} aria-label="開啟 MeowBox 檢視工具" title="MeowBox 檢視工具">▦</button>
    </div>,
    document.body,
  )
}
