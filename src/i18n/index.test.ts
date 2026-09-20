import { describe, expect, it } from 'vitest'
import { getStrings, format, getLegalDocument, getLevelName, getLevelGuidance, getDropCatName, getCatSkinName, getBoxName } from './index'
import { zhTW } from './zhTW'
import { en } from './en'
import { ja } from './ja'

function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'string' && typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      keysOf(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return [prefix]
}

describe('i18n dictionaries', () => {
  it('keeps the same key shape across all locales', () => {
    const base = keysOf(zhTW).sort()
    expect(keysOf(en).sort()).toEqual(base)
    expect(keysOf(ja).sort()).toEqual(base)
    expect(base.length).toBeGreaterThan(100)
  })

  it('resolves each locale without falling back to another language', () => {
    expect(getStrings('en').home.start).toBe('Start Game')
    expect(getStrings('ja').home.start).toBe('ゲームスタート')
    expect(getStrings('zh-TW').home.start).toBe('開始遊戲')
    expect(getStrings('xx').home.start).toBe('開始遊戲')
  })

  it('formats placeholders', () => {
    expect(format('救出 {done} / {target}', { done: 3, target: 18 })).toBe('救出 3 / 18')
    expect(format(getStrings('en').game.rescue, { done: 3, target: 18 })).toBe('Rescued 3 / 18')
  })

  it('localizes game data names', () => {
    expect(getDropCatName('orange', 'en')).toBe('Tangerine')
    expect(getDropCatName('orange', 'ja')).toBe('みかん')
    expect(getCatSkinName('calico', 'en')).toBe('Calico')
    expect(getBoxName('night', 'ja')).toBe('星空ボックス')
    expect(getLevelName(1, 'en')).toBe('First Meeting')
    expect(getLevelName(30, 'ja')).toBe('箱長のパーティー')
    expect(getLevelName(31, 'zh-TW')).toBe('花園初見')
    expect(getLevelGuidance(31, 'zh-TW')).toContain('三隻')
    expect(getLevelGuidance(1, 'zh-TW')).toContain('第 3 欄')
  })

  it('localizes legal documents', () => {
    expect(getLegalDocument('privacy', 'zh-TW').title).toBe('隱私權政策')
    expect(getLegalDocument('privacy', 'en').title).toBe('Privacy Policy')
    expect(getLegalDocument('support', 'ja').title).toBe('サポート')
  })
})
