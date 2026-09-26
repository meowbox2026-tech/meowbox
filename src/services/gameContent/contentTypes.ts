import type themeFields from '../../game/content/themeFields.json'
import type { PlanningLevel } from '../../game/core/planningEngine'

export type GameTheme = Record<keyof typeof themeFields, string>

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
