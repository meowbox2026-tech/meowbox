import type { RemoteContentManifest } from './contentTypes'

export interface CachedContentBundle {
  manifest: RemoteContentManifest
  levelsText: string
  themeText: string
}

export interface ContentCache {
  schemaVersion: 2
  current?: CachedContentBundle
  previous?: CachedContentBundle
  staged?: CachedContentBundle
  trial?: CachedContentBundle
  rejectedVersions: number[]
}

export function createContentCache(): ContentCache {
  return { schemaVersion: 2, rejectedVersions: [] }
}

export function beginContentSession(cache: ContentCache): { state: ContentCache; bundle?: CachedContentBundle } {
  if (cache.trial) {
    const rejectedVersions = [...new Set([...cache.rejectedVersions, cache.trial.manifest.version])].slice(-8)
    const state = { ...cache, trial: undefined, rejectedVersions }
    return { state, bundle: state.current }
  }
  if (cache.staged) {
    const state = { ...cache, staged: undefined, trial: cache.staged }
    return { state, bundle: state.trial }
  }
  return { state: cache, bundle: cache.current }
}

export function stageContentBundle(cache: ContentCache, bundle: CachedContentBundle): ContentCache {
  const latestKnownVersion = Math.max(
    cache.current?.manifest.version ?? 0,
    cache.staged?.manifest.version ?? 0,
    cache.trial?.manifest.version ?? 0
  )
  if (bundle.manifest.version <= latestKnownVersion || cache.rejectedVersions.includes(bundle.manifest.version)) return cache
  return { ...cache, previous: undefined, staged: bundle }
}

export function confirmContentSession(cache: ContentCache): ContentCache {
  if (!cache.trial) return cache
  return {
    ...cache,
    current: cache.trial,
    previous: cache.current ?? cache.previous,
    trial: undefined
  }
}
