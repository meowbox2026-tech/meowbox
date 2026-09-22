import type { DropLevelDefinition } from './dropLevelTypes'
import { getDropLevelManifest } from './dropManifest'
import { getWorldOneLevel } from './dropWorldOne'

const VARIANT_SESSION_PREFIX = 'meowbox-drop-variant:'
const levelCache = new Map<string, Promise<DropLevelDefinition>>()

function normalizeVariant(variant: number, variantCount: number): number {
  if (variantCount <= 1) return 0
  return ((Math.floor(variant) % variantCount) + variantCount) % variantCount
}

export function loadDropLevelById(id: number, variant = 0): Promise<DropLevelDefinition> {
  const manifest = getDropLevelManifest(id)
  const normalizedVariant = normalizeVariant(variant, manifest.variantCount)
  const key = `${manifest.id}:${normalizedVariant}`
  const cached = levelCache.get(key)
  if (cached) return cached

  const pending = (async () => {
    if (manifest.world === 1) {
      return getWorldOneLevel(manifest.id)
    }
    if (manifest.world === 2) {
      const module = await import('./dropWorldTwo')
      return module.getWorldTwoLevel(manifest.id, normalizedVariant)
    }
    const module = await import('./dropWorldThree')
    return module.getWorldThreeLevel(manifest.id, normalizedVariant)
  })()
  levelCache.set(key, pending)
  void pending.catch(() => levelCache.delete(key))
  return pending
}

export function prefetchDropLevel(id: number, variant = 0): void {
  void loadDropLevelById(id, variant)
}

export function clearDropLevelCache(): void {
  levelCache.clear()
}

export function getStoredDropVariant(id: number): number {
  const manifest = getDropLevelManifest(id)
  if (manifest.variantCount <= 1) return 0
  try {
    const stored = Number(window.sessionStorage.getItem(`${VARIANT_SESSION_PREFIX}${manifest.id}`))
    return Number.isInteger(stored) && stored >= 0 ? stored % manifest.variantCount : 0
  } catch {
    return 0
  }
}

/** Advance only when the player explicitly replays the level. */
export function advanceDropVariant(id: number): number {
  const manifest = getDropLevelManifest(id)
  if (manifest.variantCount <= 1) return 0
  const next = (getStoredDropVariant(manifest.id) + 1) % manifest.variantCount
  try {
    window.sessionStorage.setItem(`${VARIANT_SESSION_PREFIX}${manifest.id}`, String(next))
  } catch {
    // A blocked session store should not prevent the level from restarting.
  }
  return next
}
