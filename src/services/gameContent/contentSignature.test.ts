import { constants, generateKeyPairSync, sign, webcrypto } from 'node:crypto'
import type { KeyObject } from 'node:crypto'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  deriveContentKeyId,
  serializeManifestForSigning,
  verifyContentManifestSignature
} from './contentSignature'
import type { RemoteContentManifest } from './contentTypes'

describe('remote game-content signatures', () => {
  beforeAll(() => vi.stubGlobal('crypto', webcrypto))

  it('accepts a valid signature from the pinned key', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const manifest = await signManifest(privateKey, publicKeyPem)

    await expect(verifyContentManifestSignature(manifest, publicKeyPem)).resolves.toBe(true)
  })

  it('rejects a changed version even when file hashes still look valid', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const manifest = await signManifest(privateKey, publicKeyPem)

    await expect(verifyContentManifestSignature({ ...manifest, version: 99 }, publicKeyPem)).resolves.toBe(false)
  })

  it('rejects a signature made by a different key', async () => {
    const first = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const second = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const firstPublicPem = first.publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const secondPublicPem = second.publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const manifest = await signManifest(first.privateKey, firstPublicPem)

    await expect(verifyContentManifestSignature(manifest, secondPublicPem)).resolves.toBe(false)
  })
})

async function signManifest(
  privateKey: KeyObject,
  publicKeyPem: string
): Promise<RemoteContentManifest> {
  const unsignedManifest = {
    schemaVersion: 1 as const,
    version: 2,
    levels: { file: 'levels-2.json', sha256: 'a'.repeat(64) },
    theme: { file: 'theme-2.json', sha256: 'b'.repeat(64) },
    keyId: await deriveContentKeyId(publicKeyPem)
  }
  const payload = serializeManifestForSigning(unsignedManifest)
  const signature = sign('sha256', Buffer.from(payload), {
    key: privateKey,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
  }).toString('base64')

  return { ...unsignedManifest, signature }
}
