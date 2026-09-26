import { describe, expect, it } from 'vitest'
import { validateManifestUrl } from './contentUrl'

describe('remote content URL validation', () => {
  it('allows HTTPS endpoints', () => {
    expect(validateManifestUrl('https://meowbox.pages.dev/game-content/manifest.json', false))
      .toBe('https://meowbox.pages.dev/game-content/manifest.json')
  })

  it('allows HTTP only for loopback development servers', () => {
    expect(validateManifestUrl('http://localhost:8788/game-content/manifest.json', true))
      .toBe('http://localhost:8788/game-content/manifest.json')
    expect(validateManifestUrl('http://example.com/manifest.json', true)).toBeUndefined()
    expect(validateManifestUrl('http://localhost/manifest.json', false)).toBeUndefined()
  })

  it('rejects non-web and malformed URLs', () => {
    expect(validateManifestUrl('file:///tmp/manifest.json', true)).toBeUndefined()
    expect(validateManifestUrl('not a URL', false)).toBeUndefined()
  })
})
