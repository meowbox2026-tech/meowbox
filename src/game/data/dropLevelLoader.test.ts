import { describe, expect, it } from 'vitest'
import { clearDropLevelCache, loadDropLevelById } from './dropLevelLoader'

describe('drop level loader', () => {
  it('loads only the requested level and reuses it on the next request', async () => {
    clearDropLevelCache()

    const first = await loadDropLevelById(31)
    const second = await loadDropLevelById(31)

    expect(first.id).toBe(31)
    expect(first.initialBoard).toHaveLength(8)
    expect(first.initialQueue.length).toBeGreaterThan(0)
    expect(second).toBe(first)
  })

  it('loads a different variant without changing the base level cache', async () => {
    clearDropLevelCache()

    const base = await loadDropLevelById(51, 0)
    const variant = await loadDropLevelById(51, 2)

    expect(base.id).toBe(51)
    expect(variant.id).toBe(51)
    expect(variant.variant).toBe(2)
    expect(variant).not.toBe(base)
  })
})
