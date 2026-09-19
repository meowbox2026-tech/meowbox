import { useEffect } from 'react'
import { usePlayer } from '../state/PlayerContext'
import { en } from './en'
import { getLevelGuidance, getLevelName } from './gameData'
import { ja } from './ja'
import { htmlLangFor, toLocale, type Locale } from './locale'
import type { Strings } from './strings'
import { format } from './strings'
import { zhTW } from './zhTW'

export type { Locale } from './locale'
export { LOCALES, LOCALE_LABELS, htmlLangFor, isLocale, toLocale } from './locale'
export type { Strings, StringVars } from './strings'
export { format } from './strings'
export * from './gameData'
export * from './legal'

const DICTS: Record<Locale, Strings> = { 'zh-TW': zhTW, en, ja }

export function getStrings(locale: unknown): Strings {
  return DICTS[toLocale(locale)]
}

export function useLocale(): Locale {
  try {
    const { player } = usePlayer()
    return toLocale(player?.settings?.language)
  } catch {
    return 'zh-TW'
  }
}

export function useStrings(): Strings {
  return getStrings(useLocale())
}

export function useLocalizedLevel(levelId: number): { name: string; guidance: string } {
  const locale = useLocale()
  return { name: getLevelName(levelId, locale), guidance: getLevelGuidance(levelId, locale) }
}

export function useDocumentLanguage(): void {
  const locale = useLocale()
  const title = getStrings(locale).app.title
  useEffect(() => {
    document.documentElement.lang = htmlLangFor(locale)
    document.title = title
  }, [locale, title])
}

export function t(template: string, vars?: Record<string, string | number>): string {
  return format(template, vars)
}
