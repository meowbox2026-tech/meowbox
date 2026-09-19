import type { PlayerSettings } from '../services/save/playerSave'

export type Locale = PlayerSettings['language']

export const LOCALES: readonly Locale[] = ['zh-TW', 'en', 'ja'] as const

export function isLocale(value: unknown): value is Locale {
  return value === 'zh-TW' || value === 'en' || value === 'ja'
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : 'zh-TW'
}

export function htmlLangFor(locale: Locale): string {
  if (locale === 'zh-TW') return 'zh-Hant'
  return locale
}

export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語'
}
