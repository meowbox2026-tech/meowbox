import defaults from '../../game/content/theme.json'
import fields from '../../game/content/themeFields.json'
import type { GameTheme } from './contentTypes'

/** New fields fall back for older signed JSON; explicit invalid colors fail closed. */
export function parseGameTheme(value: unknown): GameTheme | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const input = value as Record<string, unknown>
  const entries: Array<[keyof GameTheme, string]> = []
  for (const key of Object.keys(fields) as Array<keyof GameTheme>) {
    const definition = fields[key]
    const required = 'required' in definition && definition.required
    const color = Object.hasOwn(input, key) ? input[key] : required ? undefined : defaults[key]
    if (typeof color !== 'string' || !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(color)) return undefined
    entries.push([key, color])
  }
  return Object.fromEntries(entries) as GameTheme
}
