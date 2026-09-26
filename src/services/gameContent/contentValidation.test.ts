import { describe, expect, it } from 'vitest'
import { parseRemoteContentManifest } from './contentValidation'

describe('remote content manifest validation', () => {
  it('accepts a manifest with the required signing metadata', () => {
    expect(parseRemoteContentManifest(manifest())).toMatchObject({
      schemaVersion: 1,
      version: 2,
      keyId: 'a'.repeat(32),
      signature: 'c2lnbmF0dXJl'
    })
  })

  it('rejects unsigned or malformed manifests', () => {
    const unsigned = { ...manifest(), signature: undefined }

    expect(parseRemoteContentManifest(unsigned)).toBeUndefined()
    expect(parseRemoteContentManifest({ ...manifest(), keyId: 'not-a-fingerprint' })).toBeUndefined()
  })
})

function manifest() {
  return {
    schemaVersion: 1,
    version: 2,
    levels: { file: 'levels-2.json', sha256: 'a'.repeat(64) },
    theme: { file: 'theme-2.json', sha256: 'b'.repeat(64) },
    keyId: 'a'.repeat(32),
    signature: 'c2lnbmF0dXJl'
  }
}
