import { useMemo } from 'react'
import {
  INSPECTOR_BASELINE,
  INSPECTOR_DEVICE_PRESETS,
  formatInspectorViewport,
  getInspectorViewportStatus,
  type InspectorViewport,
} from './inspectorViewport'

interface InspectorViewportPanelProps {
  viewport: InspectorViewport
  baselineVisible: boolean
  onToggleBaseline: (visible: boolean) => void
}

export function InspectorViewportPanel({ viewport, baselineVisible, onToggleBaseline }: InspectorViewportPanelProps) {
  const status = useMemo(() => getInspectorViewportStatus(viewport), [viewport])

  return (
    <div className="mbo-panel__section">
      <div className="mbo-panel__section-title">Viewport / SE 基準</div>
      <div className="mbo-viewport__baseline">
        <strong>{INSPECTOR_BASELINE.label} {INSPECTOR_BASELINE.width}×{INSPECTOR_BASELINE.height}</strong>
        <span>{INSPECTOR_BASELINE.note}</span>
      </div>
      <div className="mbo-viewport__current" data-baseline={String(status.isBaseline)}>
        目前 {formatInspectorViewport(viewport)}{status.isBaseline ? ' · 基準一致' : ''}
      </div>
      <p className="mbo-viewport__hint">{status.hint}</p>
      <label className="mbo-lock-aspect">
        <input
          aria-label="顯示 SE 基準框"
          type="checkbox"
          checked={baselineVisible}
          onChange={(event) => onToggleBaseline(event.target.checked)}
        />
        顯示 SE 基準框
      </label>
      <ul className="mbo-viewport__presets">
        {INSPECTOR_DEVICE_PRESETS.map((preset) => {
          const matched = status.matchedPreset?.id === preset.id
          return (
            <li key={preset.id} data-matched={String(matched)} title={preset.note}>
              <span>{matched ? '✓' : '·'} {preset.label}</span>
              <span>{preset.width}×{preset.height}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
