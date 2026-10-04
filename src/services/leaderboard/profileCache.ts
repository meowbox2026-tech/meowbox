import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { parseProfile, type PublicProfile } from './profile'

const STORAGE_KEY = 'meowbox-leaderboard-profile-v1'

export interface CachedProfileEntry {
  userId: string
  profile: PublicProfile | null
  cachedAt: number
}

let memoryEntry: CachedProfileEntry | undefined

export function getCachedProfile(): PublicProfile | null | undefined {
  return memoryEntry?.profile
}

export function getCachedProfileEntry(): CachedProfileEntry | undefined {
  return memoryEntry
}

export async function loadCachedProfile(userId: string): Promise<CachedProfileEntry | undefined> {
  if (memoryEntry) return memoryEntry.userId === userId ? memoryEntry : undefined

  const entry = await readStoredEntry()
  if (!entry || entry.userId !== userId) return undefined
  memoryEntry = entry
  return entry
}

export async function persistCachedProfile(userId: string, profile: PublicProfile | null): Promise<void> {
  const entry: CachedProfileEntry = { userId, profile, cachedAt: Date.now() }
  memoryEntry = entry
  try {
    await writeStoredEntry(entry)
  } catch {
    // The in-memory cache still removes the avatar flash when storage is unavailable.
  }
}

export async function clearCachedProfile(): Promise<void> {
  memoryEntry = undefined
  try {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: STORAGE_KEY })
      return
    }
    getBrowserStorage()?.removeItem(STORAGE_KEY)
  } catch {
    // Clearing a best-effort cache must not block leaving or deleting an account.
  }
}

export function resetProfileCacheForTests(): void {
  memoryEntry = undefined
}

async function readStoredEntry(): Promise<CachedProfileEntry | undefined> {
  try {
    const value = Capacitor.isNativePlatform()
      ? (await Preferences.get({ key: STORAGE_KEY })).value
      : getBrowserStorage()?.getItem(STORAGE_KEY)
    return parseStoredEntry(value)
  } catch {
    return undefined
  }
}

async function writeStoredEntry(entry: CachedProfileEntry): Promise<void> {
  const value = JSON.stringify(entry)
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: STORAGE_KEY, value })
    return
  }
  getBrowserStorage()?.setItem(STORAGE_KEY, value)
}

function parseStoredEntry(value: unknown): CachedProfileEntry | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return undefined
  }
  if (!isRecord(parsed) || typeof parsed.userId !== 'string' || !parsed.userId
    || typeof parsed.cachedAt !== 'number' || !Number.isFinite(parsed.cachedAt)) return undefined

  const profile = parsed.profile === null ? null : parseProfile(parsed.profile)
  if (parsed.profile !== null && !profile) return undefined
  return { userId: parsed.userId, profile, cachedAt: parsed.cachedAt }
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
