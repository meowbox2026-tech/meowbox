import { generateKeyPairSync } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const privateKeyPath = resolve(projectRoot, '.secrets/game-content-private.pem')
const publicKeyPath = resolve(projectRoot, 'src/services/gameContent/trustedContentPublicKey.pem')

if (existsSync(privateKeyPath) || existsSync(publicKeyPath)) {
  throw new Error('A game-content signing key already exists. Refusing to overwrite either key.')
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 3072,
  publicExponent: 0x10001
})
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' })
const publicPem = publicKey.export({ type: 'spki', format: 'pem' })

mkdirSync(dirname(privateKeyPath), { recursive: true, mode: 0o700 })
writeFileSync(privateKeyPath, privatePem, { mode: 0o600, flag: 'wx' })
writeFileSync(publicKeyPath, publicPem, { mode: 0o644, flag: 'wx' })

process.stdout.write('Created a private signing key in ignored .secrets/ and embedded its public key in the app source.\n')
process.stdout.write('Back up the private key securely and configure it as GAME_CONTENT_SIGNING_PRIVATE_KEY in Cloudflare Pages before publishing.\n')
