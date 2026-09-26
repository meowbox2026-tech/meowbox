import { describe, expect, it } from 'vitest'
import defaults from '../../game/content/theme.json'
import fields from '../../game/content/themeFields.json'
import { parseGameTheme } from './themeValidation'
import { applyGameTheme } from './theme'

describe('independent theme colors', () => {
  it('keeps bundled colors and schema aligned', () => {
    expect(Object.keys(defaults).sort()).toEqual(Object.keys(fields).sort())
    expect(parseGameTheme(defaults)).toEqual(defaults)
  })

  it('fills new colors when reading older signed themes', () => {
    const legacy = Object.fromEntries(Object.entries(defaults).filter(([key]) => {
      const field = fields[key as keyof typeof fields]
      return 'required' in field && field.required
    }))
    expect(parseGameTheme(legacy)).toEqual(defaults)
    delete legacy.boardLabel
    expect(parseGameTheme(legacy)).toBeUndefined()
  })

  it.each([null, 42, '', '#fff', 'url(https://example.com)', '#ffffff; color:red'])('rejects invalid new colors: %s', color => {
    expect(parseGameTheme({ ...defaults, timerText: color })).toBeUndefined()
  })

  it('applies independent colors and alpha without accepting unknown CSS fields', () => {
    const theme = parseGameTheme({ ...defaults, trayBackground: '#12345678', timerText: '#abcdef', arbitrary: '#ffffff' })!
    expect(theme).not.toHaveProperty('arbitrary')
    const original = document.documentElement.getAttribute('style')
    try {
      applyGameTheme(theme)
      expect(document.documentElement.style.getPropertyValue('--theme-tray-background')).toBe('#12345678')
      expect(document.documentElement.style.getPropertyValue('--theme-timer-text')).toBe('#abcdef')
      expect(document.documentElement.style.getPropertyValue('--theme-settings-background-top')).toBe(defaults.settingsBackgroundTop)
    } finally {
      if (original === null) document.documentElement.removeAttribute('style')
      else document.documentElement.setAttribute('style', original)
    }
  })
})
