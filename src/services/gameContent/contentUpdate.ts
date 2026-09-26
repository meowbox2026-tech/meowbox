import { Capacitor } from '@capacitor/core'
import bundledThemeData from '../../game/content/theme.json'
import {
  BUNDLED_CONTENT_VERSION,
  BUNDLED_PLANNING_LEVELS,
  MAX_PLANNING_LEVEL,
  replacePlanningLevels
} from '../../game/data/planningLevels'
import { applyGameTheme } from './theme'
import {
  parseGameTheme,
  parsePlanningLevels,
  parseRemoteContentManifest,
  validatePlanningSolutions
} from './contentValidation'
import { verifyContentManifestSignature } from './contentSignature'
import { validateManifestUrl } from './contentUrl'
import {
  beginContentSession,
  confirmContentSession,
  createContentCache,
  stageContentBundle
} from './contentRollback'
import type { CachedContentBundle, ContentCache } from './contentRollback'
import type { GameContentSnapshot, RemoteContentManifest } from './contentTypes'
import trustedPublicKey from './trustedContentPublicKey.pem?raw'

const CACHE_KEY = 'meow-box-game-content-v2'
const FETCH_TIMEOUT_MS = 5000
const STARTUP_UPDATE_WINDOW_MS = 900
const MAX_CONTENT_BYTES = 2 * 1024 * 1024
const MAX_CACHE_BYTES = 4 * 1024 * 1024
const BUNDLED_THEME = parseGameTheme(bundledThemeData)!

let activeVersion = BUNDLED_CONTENT_VERSION
let cacheState: ContentCache = createContentCache()
let initialization: Promise<void> | undefined

export function initializeGameContent(): Promise<void> {
  if (!initialization) initialization = initialize()
  return initialization
}

export function confirmGameContentReady(): void {
  const confirmed = confirmContentSession(cacheState)
  if (confirmed === cacheState || writeCachedState(confirmed)) cacheState = confirmed
}

async function initialize(): Promise<void> {
  activateSnapshot({ version: BUNDLED_CONTENT_VERSION, levels: BUNDLED_PLANNING_LEVELS, theme: BUNDLED_THEME })
  cacheState = readCachedState()

  const session = beginContentSession(cacheState)
  if (session.state !== cacheState) {
    const prior = cacheState
    cacheState = session.state
    if (!writeCachedState(cacheState) && session.state.trial && session.state.trial !== prior.trial) {
      cacheState = { ...session.state, trial: undefined, staged: prior.staged }
    }
  }

  const candidate = cacheState.trial ?? cacheState.current
  if (candidate) {
    const cached = await validateCachedBundle(candidate)
    if (cached) {
      activateSnapshot(cached.snapshot)
    } else if (candidate === cacheState.trial) {
      cacheState = rejectTrial(cacheState, candidate.manifest.version)
      writeCachedState(cacheState)
      await activateLastConfirmedBundle()
    } else {
      await activateLastConfirmedBundle()
    }
  }

  const remoteUpdate = downloadLatestBundle(activeVersion).catch(() => undefined)
  const result = await Promise.race([
    remoteUpdate.then(update => ({ timedOut: false as const, update })),
    delay(STARTUP_UPDATE_WINDOW_MS).then(() => ({ timedOut: true as const, update: undefined }))
  ])

  if (!result.timedOut) {
    if (result.update) installRemoteBundle(result.update)
    return
  }

  void remoteUpdate.then(update => {
    if (update) stageRemoteBundle(update.bundle)
  })
}

async function activateLastConfirmedBundle(): Promise<void> {
  for (const fallback of [cacheState.current, cacheState.previous]) {
    if (!fallback) continue
    const validated = await validateCachedBundle(fallback)
    if (!validated) continue
    if (fallback === cacheState.previous) {
      cacheState = { ...cacheState, current: fallback, previous: undefined }
      writeCachedState(cacheState)
    }
    activateSnapshot(validated.snapshot)
    return
  }
}

async function downloadLatestBundle(minimumVersion: number): Promise<{
  bundle: CachedContentBundle
  snapshot: GameContentSnapshot
} | undefined> {
  const manifestUrl = getManifestUrl()
  if (!manifestUrl) return undefined

  const manifestText = await fetchText(manifestUrl)
  const manifest = parseRemoteContentManifest(parseJson(manifestText))
  if (!manifest || manifest.version <= minimumVersion || cacheState.rejectedVersions.includes(manifest.version)) return undefined
  const levelsUrl = resolveContentUrl(manifest.levels.file, manifestUrl)
  const themeUrl = resolveContentUrl(manifest.theme.file, manifestUrl)
  if (!levelsUrl || !themeUrl) return undefined

  const bundle: CachedContentBundle = {
    manifest,
    levelsText: '',
    themeText: ''
  }
  const [levelsText, themeText] = await Promise.all([fetchText(levelsUrl), fetchText(themeUrl)])
  if (new TextEncoder().encode(levelsText).byteLength + new TextEncoder().encode(themeText).byteLength > MAX_CONTENT_BYTES) {
    return undefined
  }
  bundle.levelsText = levelsText
  bundle.themeText = themeText
  return validateBundle(bundle)
}

async function validateCachedBundle(bundle: CachedContentBundle): Promise<{
  bundle: CachedContentBundle
  snapshot: GameContentSnapshot
} | undefined> {
  return validateBundle(bundle)
}

async function validateBundle(bundle: CachedContentBundle): Promise<{
  bundle: CachedContentBundle
  snapshot: GameContentSnapshot
} | undefined> {
  try {
    const { manifest, levelsText, themeText } = bundle
    if (!await verifyContentManifestSignature(manifest, trustedPublicKey)) return undefined
    const [levelsHash, themeHash] = await Promise.all([sha256(levelsText), sha256(themeText)])
    if (levelsHash !== manifest.levels.sha256 || themeHash !== manifest.theme.sha256) return undefined
    const levels = parsePlanningLevels(parseJson(levelsText))
    const theme = parseGameTheme(parseJson(themeText))
    if (!levels || !theme || levels.length < MAX_PLANNING_LEVEL || !validatePlanningSolutions(levels)) return undefined
    return { bundle, snapshot: { version: manifest.version, levels, theme } }
  } catch {
    return undefined
  }
}

function installRemoteBundle(update: { bundle: CachedContentBundle; snapshot: GameContentSnapshot }): void {
  const staged = stageContentBundle(cacheState, update.bundle)
  if (staged === cacheState) return
  if (cacheState.trial) {
    if (writeCachedState(staged)) cacheState = staged
    return
  }

  const trial = beginContentSession(staged)
  if (!trial.bundle || !writeCachedState(trial.state)) return
  cacheState = trial.state
  activateSnapshot(update.snapshot)
}

function stageRemoteBundle(bundle: CachedContentBundle): void {
  const staged = stageContentBundle(cacheState, bundle)
  if (staged !== cacheState && writeCachedState(staged)) cacheState = staged
}

function rejectTrial(cache: ContentCache, version: number): ContentCache {
  return {
    ...cache,
    trial: undefined,
    rejectedVersions: [...new Set([...cache.rejectedVersions, version])].slice(-8)
  }
}

function readCachedState(): ContentCache {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw || new TextEncoder().encode(raw).byteLength > MAX_CACHE_BYTES) return createContentCache()
    const value = parseJson(raw)
    if (!isRecord(value) || value.schemaVersion !== 2 || !Array.isArray(value.rejectedVersions)) return createContentCache()
    const rejectedVersions = value.rejectedVersions.filter(isPositiveInteger).slice(-8)
    return {
      schemaVersion: 2,
      current: parseCachedBundle(value.current),
      previous: parseCachedBundle(value.previous),
      staged: parseCachedBundle(value.staged),
      trial: parseCachedBundle(value.trial),
      rejectedVersions
    }
  } catch {
    return createContentCache()
  }
}

function parseCachedBundle(value: unknown): CachedContentBundle | undefined {
  if (!isRecord(value) || typeof value.levelsText !== 'string' || typeof value.themeText !== 'string') return undefined
  if (new TextEncoder().encode(value.levelsText).byteLength + new TextEncoder().encode(value.themeText).byteLength > MAX_CONTENT_BYTES) return undefined
  const manifest = parseRemoteContentManifest(value.manifest)
  return manifest ? { manifest, levelsText: value.levelsText, themeText: value.themeText } : undefined
}

function writeCachedState(state: ContentCache): boolean {
  try {
    const encoded = JSON.stringify(state)
    if (new TextEncoder().encode(encoded).byteLength > MAX_CACHE_BYTES) return false
    window.localStorage.setItem(CACHE_KEY, encoded)
    return true
  } catch {
    return false
  }
}

function activateSnapshot(snapshot: GameContentSnapshot): void {
  replacePlanningLevels(snapshot.levels)
  applyGameTheme(snapshot.theme)
  activeVersion = snapshot.version
}

function getManifestUrl(): string | undefined {
  const configuredUrl = import.meta.env.VITE_GAME_CONTENT_URL?.trim()
  if (configuredUrl) return validateManifestUrl(configuredUrl, import.meta.env.DEV)
  if (import.meta.env.DEV) return undefined
  const origin = Capacitor.isNativePlatform() ? 'https://meowbox.pages.dev' : window.location.origin
  return validateManifestUrl(new URL('/game-content/manifest.json', origin).toString(), false)
}

function resolveContentUrl(file: string, manifestUrl: string): string | undefined {
  try {
    const manifest = new URL(manifestUrl)
    const content = new URL(file, manifest)
    return content.origin === manifest.origin ? content.toString() : undefined
  } catch {
    return undefined
  }
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) throw new Error(`Content request failed with HTTP ${response.status}.`)
    if (new URL(response.url || url).origin !== new URL(url).origin) throw new Error('Remote game content redirected to another origin.')
    const contentLength = Number(response.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_BYTES) throw new Error('Remote game content is too large.')
    const text = await response.text()
    if (new TextEncoder().encode(text).byteLength > MAX_CONTENT_BYTES) throw new Error('Remote game content is too large.')
    return text
  } finally {
    window.clearTimeout(timeout)
  }
}

async function sha256(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
