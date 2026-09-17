import { describe, expect, it, vi } from 'vitest'
import { synchronisePlayerSave, type CloudSaveProvider } from './cloudSync'
import { createDefaultPlayerSave } from './playerSave'

describe('cloud sync bridge', () => {
  it('leaves local save alone when a provider is unavailable', async () => {
    const local = createDefaultPlayerSave()
    const provider: CloudSaveProvider = {
      isAvailable: vi.fn().mockResolvedValue(false),
      download: vi.fn(),
      upload: vi.fn()
    }

    await expect(synchronisePlayerSave(local, provider)).resolves.toBe(local)
    expect(provider.download).not.toHaveBeenCalled()
  })

  it('merges and uploads a newer cloud save when a provider is available', async () => {
    const local = { ...createDefaultPlayerSave(), completedLevels: [1], updatedAt: '2026-09-17T00:00:00.000Z' }
    const cloud = { ...createDefaultPlayerSave(), completedLevels: [2], updatedAt: '2026-09-18T00:00:00.000Z' }
    const upload = vi.fn().mockResolvedValue(undefined)
    const provider: CloudSaveProvider = { isAvailable: vi.fn().mockResolvedValue(true), download: vi.fn().mockResolvedValue(cloud), upload }

    const merged = await synchronisePlayerSave(local, provider)

    expect(merged.completedLevels).toEqual([1, 2])
    expect(upload).toHaveBeenCalledWith(merged)
  })
})
