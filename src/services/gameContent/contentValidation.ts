import { validateAuthoredPlanningLevel } from '../../game/core/planningValidation'
import type { PlanningLevel, PlanningCat, Placement } from '../../game/core/planningEngine'
import type { DropBoard, DropTile } from '../../game/core/dropEngine'
import type { CatAsset } from '../../game/types'
import type { GameTheme, RemoteContentManifest, ContentFileReference } from './contentTypes'

const LEVEL_COUNT_MINIMUM = 90
const LEVEL_COUNT_MAXIMUM = 500
const BOARD_SIZE = 8
const CAT_ASSETS: readonly CatAsset[] = [
  'arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue', 'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'
]
const THEME_KEYS: readonly (keyof GameTheme)[] = [
  'pageBackground', 'textPrimary', 'textStrong', 'textMuted', 'surface', 'surfaceAlt', 'surfaceElevated',
  'surfaceBorder', 'brand', 'brandStrong', 'accent', 'accentStrong', 'buttonText', 'buttonPrimaryStart',
  'buttonPrimaryEnd', 'buttonSecondaryStart', 'buttonSecondaryEnd', 'buttonWarmStart', 'buttonWarmEnd',
  'positiveStart', 'positiveEnd', 'positiveStrong', 'danger', 'focus', 'board', 'boardLine', 'selection',
  'overlayTop', 'overlayBottom', 'modalOverlay'
]

export function parsePlanningLevels(value: unknown): PlanningLevel[] | undefined {
  if (!Array.isArray(value) || value.length < LEVEL_COUNT_MINIMUM || value.length > LEVEL_COUNT_MAXIMUM) return undefined
  const levels: PlanningLevel[] = []
  for (let index = 0; index < value.length; index += 1) {
    const parsed = parsePlanningLevel(value[index], index + 1)
    if (!parsed) return undefined
    levels.push(parsed)
  }
  return levels
}

export function parseGameTheme(value: unknown): GameTheme | undefined {
  if (!isRecord(value)) return undefined
  const theme = {} as GameTheme
  for (const key of THEME_KEYS) {
    const color = value[key]
    if (typeof color !== 'string' || !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(color)) return undefined
    theme[key] = color
  }
  return theme
}

export function parseRemoteContentManifest(value: unknown): RemoteContentManifest | undefined {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isPositiveInteger(value.version)) return undefined
  if (typeof value.keyId !== 'string' || !/^[\da-f]{32}$/i.test(value.keyId)) return undefined
  if (typeof value.signature !== 'string' || !/^[\da-z+/]+=*$/i.test(value.signature)) return undefined
  const levels = parseContentFileReference(value.levels)
  const theme = parseContentFileReference(value.theme)
  if (!levels || !theme) return undefined
  return { schemaVersion: 1, version: value.version, levels, theme, keyId: value.keyId.toLowerCase(), signature: value.signature }
}

function parseContentFileReference(value: unknown): ContentFileReference | undefined {
  if (!isRecord(value) || typeof value.file !== 'string' || typeof value.sha256 !== 'string') return undefined
  if (!/^[a-z\d][a-z\d._-]*\.json$/i.test(value.file) || !/^[\da-f]{64}$/i.test(value.sha256)) return undefined
  return { file: value.file, sha256: value.sha256.toLowerCase() }
}

function parsePlanningLevel(value: unknown, expectedId: number): PlanningLevel | undefined {
  if (!isRecord(value) || value.id !== expectedId || value.width !== BOARD_SIZE || value.height !== BOARD_SIZE) return undefined
  const board = parseBoard(value.board)
  const cats = parseCats(value.cats)
  const solution = parseSolution(value.solution)
  if (!board || !cats || !solution || solution.length !== cats.length) return undefined

  const allIds = [...board.flatMap(row => row.flatMap(tile => tile ? [tile.id] : [])), ...cats.map(cat => cat.id)]
  if (new Set(allIds).size !== allIds.length) return undefined
  if (new Set(solution.map(placement => placement.catId)).size !== cats.length) return undefined
  if (!solution.every(placement => cats.some(cat => cat.id === placement.catId))) return undefined

  return { id: expectedId, width: BOARD_SIZE, height: BOARD_SIZE, board, cats, solution }
}

function parseBoard(value: unknown): DropBoard | undefined {
  if (!Array.isArray(value) || value.length !== BOARD_SIZE) return undefined
  const board: DropBoard = []
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) return undefined
    const parsedRow: Array<DropTile | null> = []
    for (const cell of row) {
      if (cell === null) {
        parsedRow.push(null)
        continue
      }
      if (!isRecord(cell) || !isPositiveInteger(cell.id) || !isCatAsset(cell.type)) return undefined
      parsedRow.push({ id: cell.id, type: cell.type })
    }
    board.push(parsedRow)
  }
  return board
}

function parseCats(value: unknown): PlanningCat[] | undefined {
  if (!Array.isArray(value) || value.length === 0 || value.length > BOARD_SIZE * BOARD_SIZE) return undefined
  const cats: PlanningCat[] = []
  for (const cat of value) {
    if (!isRecord(cat) || !isPositiveInteger(cat.id) || !isCatAsset(cat.type)) return undefined
    cats.push({ id: cat.id, type: cat.type })
  }
  if (new Set(cats.map(cat => cat.id)).size !== cats.length) return undefined
  return cats
}

function parseSolution(value: unknown): Placement[] | undefined {
  if (!Array.isArray(value)) return undefined
  const solution: Placement[] = []
  for (const placement of value) {
    if (!isRecord(placement) || !isPositiveInteger(placement.catId) || !isNonNegativeInteger(placement.x) || !isNonNegativeInteger(placement.y)) return undefined
    if (placement.x >= BOARD_SIZE || placement.y >= BOARD_SIZE) return undefined
    solution.push({ catId: placement.catId, x: placement.x, y: placement.y })
  }
  return solution
}

export function validatePlanningSolutions(levels: PlanningLevel[]): boolean {
  try {
    levels.forEach((level, index) => {
      if (level.id !== index + 1) throw new Error('Level IDs must stay sequential.')
      validateAuthoredPlanningLevel(level)
    })
    return true
  } catch {
    return false
  }
}

function isCatAsset(value: unknown): value is CatAsset {
  return typeof value === 'string' && CAT_ASSETS.includes(value as CatAsset)
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
