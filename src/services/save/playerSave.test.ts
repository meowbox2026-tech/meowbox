import { describe, expect, it } from 'vitest'
import { createDefaultPlayerSave, loadPlayerSave, mergePlayerSaves, normalisePlayerSave, persistPlayerSave } from './playerSave'

describe('player save', () => {
  it('migrates an incomplete stored value without losing safe defaults', () => {
    const save = normalisePlayerSave({ pawCoins: 120 })

    expect(save.version).toBe(1)
    expect(save.pawCoins).toBe(120)
    expect(save.unlockedCatSkins).toContain('orange')
    expect(save.settings.haptics).toBe(true)
  })

  it('prefers newer cloud progress but unions durable unlocks and completions', () => {
    const local = {
      ...createDefaultPlayerSave(),
      updatedAt: '2026-09-17T01:00:00.000Z',
      currentLevel: 4,
      completedLevels: [1, 2, 3],
      unlockedCatSkins: ['orange', 'black']
    }
    const cloud = {
      ...createDefaultPlayerSave(),
      updatedAt: '2026-09-18T01:00:00.000Z',
      currentLevel: 3,
      completedLevels: [1, 2],
      unlockedCatSkins: ['orange', 'white']
    }

    const merged = mergePlayerSaves(local, cloud)

    expect(merged.currentLevel).toBe(3)
    expect(merged.completedLevels).toEqual([1, 2, 3])
    expect(merged.unlockedCatSkins).toEqual(['orange', 'black', 'white'])
  })

  it('clamps malformed stars and preserves only supported language settings', () => {
    const save = normalisePlayerSave({
      stars: { 1: 8, 2: -2, invalid: 3 },
      settings: { language: 'unsupported' }
    })

    expect(save.stars).toEqual({ 1: 3, 2: 0 })
    expect(save.settings.language).toBe('zh-TW')
  })

  it('persists and reloads the browser local save', async () => {
    window.localStorage.clear()
    const save = { ...createDefaultPlayerSave(), pawCoins: 777, currentLevel: 8 }

    await persistPlayerSave(save)
    const loaded = await loadPlayerSave()

    expect(loaded.pawCoins).toBe(777)
    expect(loaded.currentLevel).toBe(8)
  })
})
