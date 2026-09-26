import type { PlanningLevel } from '../../game/core/planningEngine'

export interface GameTheme {
  pageBackground: string
  textPrimary: string
  textStrong: string
  textMuted: string
  surface: string
  surfaceAlt: string
  surfaceElevated: string
  surfaceBorder: string
  brand: string
  brandStrong: string
  accent: string
  accentStrong: string
  buttonText: string
  buttonPrimaryStart: string
  buttonPrimaryEnd: string
  buttonSecondaryStart: string
  buttonSecondaryEnd: string
  buttonWarmStart: string
  buttonWarmEnd: string
  positiveStart: string
  positiveEnd: string
  positiveStrong: string
  danger: string
  focus: string
  board: string
  boardLine: string
  selection: string
  overlayTop: string
  overlayBottom: string
  modalOverlay: string
}

export interface ContentFileReference {
  file: string
  sha256: string
}

export interface RemoteContentManifest {
  schemaVersion: 1
  version: number
  levels: ContentFileReference
  theme: ContentFileReference
  keyId: string
  signature: string
}

export interface GameContentSnapshot {
  version: number
  levels: PlanningLevel[]
  theme: GameTheme
}
