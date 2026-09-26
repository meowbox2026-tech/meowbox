import { describe, expect, it } from 'vitest'
import {
  beginContentSession,
  confirmContentSession,
  createContentCache,
  stageContentBundle
} from './contentRollback'
import type { CachedContentBundle } from './contentRollback'

describe('remote content rollback', () => {
  it('keeps the last confirmed bundle if a trial update was not confirmed', () => {
    const stable = bundle(4)
    const trial = bundle(5)
    const state = { ...createContentCache(), current: stable, trial }

    const session = beginContentSession(state)

    expect(session.bundle).toBe(stable)
    expect(session.state.trial).toBeUndefined()
    expect(session.state.rejectedVersions).toContain(5)
  })

  it('promotes a staged bundle to a trial and confirms it only after the app is ready', () => {
    const stable = bundle(4)
    const candidate = bundle(5)
    const staged = stageContentBundle({ ...createContentCache(), current: stable }, candidate)
    const session = beginContentSession(staged)

    expect(session.bundle).toBe(candidate)
    expect(session.state.current).toBe(stable)
    expect(session.state.trial).toBe(candidate)

    const confirmed = confirmContentSession(session.state)
    expect(confirmed.current).toBe(candidate)
    expect(confirmed.previous).toBe(stable)
    expect(confirmed.trial).toBeUndefined()
  })

  it('does not stage an older or previously rejected release', () => {
    const stable = bundle(7)
    const state = { ...createContentCache(), current: stable, rejectedVersions: [8] }

    expect(stageContentBundle(state, bundle(6))).toBe(state)
    expect(stageContentBundle(state, bundle(8))).toBe(state)
  })
})

function bundle(version: number): CachedContentBundle {
  return {
    manifest: {
      schemaVersion: 1,
      version,
      levels: { file: `levels-${version}.json`, sha256: 'a'.repeat(64) },
      theme: { file: `theme-${version}.json`, sha256: 'b'.repeat(64) },
      keyId: 'test-key',
      signature: 'signed'
    },
    levelsText: '[]',
    themeText: '{}'
  }
}
