import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

export interface PlayerSettings {
  music: boolean
  sound: boolean
  haptics: boolean
  language: 'zh-TW' | 'en' | 'ja'
}

export interface DailyRewardState {
  lastClaimDate?: string
  streak: number
}

export interface PlayerSave {
  version: 1
  updatedAt: string
  currentLevel: number
  completedLevels: number[]
  stars: Record<number, number>
  pawCoins: number
  hints: number
  unlockedCatSkins: string[]
  unlockedBoxSkins: string[]
  selectedCatSkin: string
  selectedBoxSkin: string
  dailyReward: DailyRewardState
  settings: PlayerSettings
}

const STORAGE_KEY = 'meow-box-player-save'

export function createDefaultPlayerSave(): PlayerSave {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    currentLevel: 1,
    completedLevels: [],
    stars: {},
    pawCoins: 480,
    hints: 3,
    unlockedCatSkins: ['orange'],
    unlockedBoxSkins: ['classic'],
    selectedCatSkin: 'orange',
    selectedBoxSkin: 'classic',
    dailyReward: { streak: 0 },
    settings: { music: true, sound: true, haptics: true, language: 'zh-TW' }
  }
}

export function normalisePlayerSave(value: unknown): PlayerSave {
  const defaults = createDefaultPlayerSave()
  if (!isRecord(value)) return defaults

  const rawSettings = isRecord(value.settings) ? value.settings : {}
  const rawDaily = isRecord(value.dailyReward) ? value.dailyReward : {}
  return {
    ...defaults,
    version: 1,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : defaults.updatedAt,
    currentLevel: toPositiveInteger(value.currentLevel, defaults.currentLevel),
    completedLevels: uniqueNumbers(value.completedLevels),
    stars: normaliseStars(value.stars),
    pawCoins: toNonNegativeInteger(value.pawCoins, defaults.pawCoins),
    hints: toNonNegativeInteger(value.hints, defaults.hints),
    unlockedCatSkins: uniqueStrings(value.unlockedCatSkins, defaults.unlockedCatSkins),
    unlockedBoxSkins: uniqueStrings(value.unlockedBoxSkins, defaults.unlockedBoxSkins),
    selectedCatSkin: typeof value.selectedCatSkin === 'string' ? value.selectedCatSkin : defaults.selectedCatSkin,
    selectedBoxSkin: typeof value.selectedBoxSkin === 'string' ? value.selectedBoxSkin : defaults.selectedBoxSkin,
    dailyReward: {
      lastClaimDate: typeof rawDaily.lastClaimDate === 'string' ? rawDaily.lastClaimDate : undefined,
      streak: toNonNegativeInteger(rawDaily.streak, 0)
    },
    settings: {
      music: typeof rawSettings.music === 'boolean' ? rawSettings.music : defaults.settings.music,
      sound: typeof rawSettings.sound === 'boolean' ? rawSettings.sound : defaults.settings.sound,
      haptics: typeof rawSettings.haptics === 'boolean' ? rawSettings.haptics : defaults.settings.haptics,
      language: isLanguage(rawSettings.language) ? rawSettings.language : defaults.settings.language
    }
  }
}

export function mergePlayerSaves(local: PlayerSave, cloud: PlayerSave): PlayerSave {
  const newest = new Date(cloud.updatedAt).getTime() >= new Date(local.updatedAt).getTime() ? cloud : local
  return {
    ...newest,
    completedLevels: uniqueNumbers([...local.completedLevels, ...cloud.completedLevels]),
    unlockedCatSkins: uniqueStrings([...local.unlockedCatSkins, ...cloud.unlockedCatSkins], []),
    unlockedBoxSkins: uniqueStrings([...local.unlockedBoxSkins, ...cloud.unlockedBoxSkins], []),
    stars: mergeStars(local.stars, cloud.stars)
  }
}

export async function loadPlayerSave(): Promise<PlayerSave> {
  try {
    const storedValue = Capacitor.isNativePlatform()
      ? (await Preferences.get({ key: STORAGE_KEY })).value
      : window.localStorage.getItem(STORAGE_KEY)
    return normalisePlayerSave(storedValue ? JSON.parse(storedValue) : undefined)
  } catch {
    return createDefaultPlayerSave()
  }
}

export async function persistPlayerSave(save: PlayerSave): Promise<void> {
  const value = JSON.stringify({ ...save, updatedAt: new Date().toISOString() })
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key: STORAGE_KEY, value })
    return
  }
  window.localStorage.setItem(STORAGE_KEY, value)
}

function normaliseStars(value: unknown): Record<number, number> {
  if (!isRecord(value)) return {}
  return Object.fromEntries(Object.entries(value)
    .filter((entry): entry is [string, number] => Number.isInteger(Number(entry[0])) && typeof entry[1] === 'number')
    .map(([id, stars]) => [Number(id), Math.max(0, Math.min(3, Math.floor(stars)))]))
}

function mergeStars(first: Record<number, number>, second: Record<number, number>): Record<number, number> {
  const ids = new Set([...Object.keys(first), ...Object.keys(second)].map(Number))
  return Object.fromEntries([...ids].map((id) => [id, Math.max(first[id] ?? 0, second[id] ?? 0)]))
}

function uniqueNumbers(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is number => typeof item === 'number' && Number.isInteger(item) && item > 0))].sort((a, b) => a - b)
}

function uniqueStrings(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
}

function toPositiveInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback
}

function toNonNegativeInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback
}

function isLanguage(value: unknown): value is PlayerSettings['language'] {
  return value === 'zh-TW' || value === 'en' || value === 'ja'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
