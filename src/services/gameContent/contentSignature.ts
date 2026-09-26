import type { RemoteContentManifest } from './contentTypes'

type UnsignedManifest = Omit<RemoteContentManifest, 'signature'>

const SIGNATURE_SALT_LENGTH = 32

export function serializeManifestForSigning(manifest: UnsignedManifest): string {
  return JSON.stringify({
    schemaVersion: manifest.schemaVersion,
    version: manifest.version,
    levels: { file: manifest.levels.file, sha256: manifest.levels.sha256 },
    theme: { file: manifest.theme.file, sha256: manifest.theme.sha256 },
    keyId: manifest.keyId
  })
}

export async function deriveContentKeyId(publicKeyPem: string): Promise<string> {
  const keyBytes = decodePem(publicKeyPem)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', keyBytes)
  return [...new Uint8Array(digest)].slice(0, 16).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function verifyContentManifestSignature(
  manifest: RemoteContentManifest,
  trustedPublicKeyPem: string
): Promise<boolean> {
  try {
    if (!manifest.signature || !manifest.keyId || !trustedPublicKeyPem) return false
    if (manifest.keyId !== await deriveContentKeyId(trustedPublicKeyPem)) return false
    const publicKey = await globalThis.crypto.subtle.importKey(
      'spki',
      decodePem(trustedPublicKeyPem),
      { name: 'RSA-PSS', hash: 'SHA-256' },
      false,
      ['verify']
    )
    return await globalThis.crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: SIGNATURE_SALT_LENGTH },
      publicKey,
      decodeBase64(manifest.signature),
      new TextEncoder().encode(serializeManifestForSigning(manifest))
    )
  } catch {
    return false
  }
}

function decodePem(pem: string): Uint8Array {
  const base64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  return decodeBase64(base64)
}

function decodeBase64(value: string): Uint8Array {
  const decoded = globalThis.atob(value)
  return Uint8Array.from(decoded, character => character.charCodeAt(0))
}
