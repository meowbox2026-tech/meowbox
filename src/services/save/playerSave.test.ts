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

  it('drops obsolete post-twenty-five progress instead of unlocking removed levels', () => {
    const legacy = {
      ...createDefaultPlayerSave(),
      currentLevel: 90,
      completedLevels: [1, 25, 30, 60, 90],
      stars: { 25: 3, 31: 3, 60: 2 },
      pawCoins: 912
    }

    const migrated = normalisePlayerSave(legacy)
    const migratedAgain = normalisePlayerSave(migrated)

    expect(migrated.currentLevel).toBe(25)
    expect(migratedAgain.currentLevel).toBe(25)
    expect(migrated.completedLevels).toEqual([1, 25])
    expect(migrated.stars).toEqual({ 25: 3 })
    expect(migrated.pawCoins).toBe(912)
    expect(normalisePlayerSave({ ...legacy, currentLevel: 26, completedLevels: [1, 25] }).currentLevel).toBe(25)
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

  it('clamps merged progress to the active mainline', () => {
    const local = { ...createDefaultPlayerSave(), currentLevel: 90, completedLevels: [25, 60], pawCoins: 100 }
    const cloud = { ...createDefaultPlayerSave(), currentLevel: 60, completedLevels: [24], pawCoins: 200 }

    expect(mergePlayerSaves(local, cloud).currentLevel).toBe(25)
    expect(mergePlayerSaves(local, cloud).completedLevels).toEqual([24, 25])
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
