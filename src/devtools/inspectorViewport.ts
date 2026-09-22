export interface InspectorViewport {
  width: number
  height: number
}

export interface InspectorDevicePreset extends InspectorViewport {
  id: string
  label: string
  note: string
}

/** iPhone SE logical pixels at 100% zoom. All Inspector tuning starts here. */
export const INSPECTOR_BASELINE: InspectorDevicePreset = {
  id: 'iphone-se',
  label: 'iPhone SE',
  width: 375,
  height: 667,
  note: '開發基準 · 100%',
}

export const INSPECTOR_BASELINE_STORAGE_KEY = 'meowbox-dev-inspector-baseline.v1'

export function loadInspectorBaselineVisible(): boolean {
  try {
    const saved = window.localStorage.getItem(INSPECTOR_BASELINE_STORAGE_KEY)
    return saved === null ? true : saved === '1'
  } catch {
    return true
  }
}

export function saveInspectorBaselineVisible(visible: boolean): void {
  try {
    window.localStorage.setItem(INSPECTOR_BASELINE_STORAGE_KEY, visible ? '1' : '0')
  } catch {
    // Baseline visibility is session-only when storage is denied.
  }
}

/**
 * Verification checklist. SE 375x667 is tuned first; every other phone
 * only checks that the same fluid layout scales up without clipping.
 */
export const INSPECTOR_DEVICE_PRESETS: InspectorDevicePreset[] = [
  INSPECTOR_BASELINE,
  { id: 'android-small', label: 'Android 小屏', width: 360, height: 640, note: '最小寬度檢查' },
  { id: 'android-common', label: 'Android 常見', width: 360, height: 740, note: '常見 Android 高度' },
  { id: 'iphone-12-14', label: 'iPhone 12 / 13 / 14', width: 390, height: 844, note: '主流 iPhone 高度' },
  { id: 'iphone-pro', label: 'iPhone 14 / 15 Pro', width: 393, height: 852, note: '靈動島機型' },
  { id: 'iphone-11', label: 'iPhone 11 / XR', width: 414, height: 896, note: '寬屏檢查' },
  { id: 'iphone-max', label: 'iPhone Pro Max', width: 430, height: 932, note: '最大高度檢查' },
]

export interface InspectorViewportStatus {
  isBaseline: boolean
  matchedPreset: InspectorDevicePreset | null
  widthDelta: number
  heightDelta: number
  hint: string
}

export function formatInspectorViewport(viewport: InspectorViewport): string {
  return `${Math.round(viewport.width)} × ${Math.round(viewport.height)}`
}

export function matchInspectorPreset(viewport: InspectorViewport): InspectorDevicePreset | null {
  const width = Math.round(viewport.width)
  const height = Math.round(viewport.height)
  return INSPECTOR_DEVICE_PRESETS.find((preset) => preset.width === width && preset.height === height) ?? null
}

export function getInspectorViewportStatus(viewport: InspectorViewport): InspectorViewportStatus {
  const width = Math.round(viewport.width)
  const height = Math.round(viewport.height)
  const widthDelta = width - INSPECTOR_BASELINE.width
  const heightDelta = height - INSPECTOR_BASELINE.height
  const isBaseline = widthDelta === 0 && heightDelta === 0
  const matchedPreset = matchInspectorPreset(viewport)

  if (isBaseline) {
    return {
      isBaseline,
      matchedPreset,
      widthDelta,
      heightDelta,
      hint: 'SE 375×667 基準一致（100%）：固定舞台等比縮放，全機型同一構圖。',
    }
  }

  const parts: string[] = [`比 SE 寬 ${widthDelta >= 0 ? '+' : ''}${widthDelta}px、高 ${heightDelta >= 0 ? '+' : ''}${heightDelta}px。`]
  if (widthDelta < 0) parts.push('寬度小於 SE，注意橫向裁切。')
  if (heightDelta < 0) parts.push('高度小於 SE，注意底部導覽被擠壓。')
  if (widthDelta >= 0 && heightDelta >= 0) parts.push('舞台等比放大置中，檢查出血邊是否自然。')

  return { isBaseline, matchedPreset, widthDelta, heightDelta, hint: parts.join('') }
}
