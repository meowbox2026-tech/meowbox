import { describe, expect, it } from 'vitest'
import { DROP_LEVEL_MANIFEST, getDropLevelManifest, MAX_DROP_LEVEL } from './dropManifest'

describe('drop level manifest', () => {
  it('keeps level selection metadata for all 90 levels', () => {
    expect(DROP_LEVEL_MANIFEST).toHaveLength(90)
    expect(DROP_LEVEL_MANIFEST.map((level) => level.id)).toEqual(Array.from({ length: 90 }, (_, index) => index + 1))
    expect(DROP_LEVEL_MANIFEST.filter((level) => level.world === 1)).toHaveLength(30)
    expect(DROP_LEVEL_MANIFEST.filter((level) => level.world === 2)).toHaveLength(30)
    expect(DROP_LEVEL_MANIFEST.filter((level) => level.world === 3)).toHaveLength(30)
    expect(MAX_DROP_LEVEL).toBe(90)
  })

  it('returns only lightweight information for a selected level', () => {
    const level = getDropLevelManifest(61)

    expect(level).toMatchObject({ id: 61, world: 3, timeLimit: 160, width: 8, height: 8, target: 60 })
    expect(level).not.toHaveProperty('initialBoard')
    expect(level).not.toHaveProperty('initialQueue')
  })

  it('falls back to the first level for an invalid id', () => {
    expect(getDropLevelManifest(0).id).toBe(1)
    expect(getDropLevelManifest(999).id).toBe(1)
  })
})
