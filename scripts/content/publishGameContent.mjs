import { constants, createHash, createPrivateKey, createPublicKey, sign } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const sourceDirectory = resolve(projectRoot, 'src/game/content')
const outputDirectory = resolve(projectRoot, 'dist/game-content')
const privateKeyPath = resolve(projectRoot, '.secrets/game-content-private.pem')
const publicKeyPath = resolve(projectRoot, 'src/services/gameContent/trustedContentPublicKey.txt')
const manifest = JSON.parse(readFileSync(resolve(sourceDirectory, 'manifest.json'), 'utf8'))
const levels = readFileSync(resolve(sourceDirectory, 'levels.json'))
const theme = readFileSync(resolve(sourceDirectory, 'theme.json'))

if (manifest.schemaVersion !== 1 || !Number.isSafeInteger(manifest.version) || manifest.version < 1) {
  throw new Error('Game content manifest must have schemaVersion 1 and a positive integer version.')
}

const parsedLevels = JSON.parse(levels.toString('utf8'))
if (!Array.isArray(parsedLevels) || parsedLevels.length < 90 || parsedLevels.length > 500) {
  throw new Error('Game content must include 90 to 500 levels.')
}
if (parsedLevels.some((level, index) => level.id !== index + 1)) {
  throw new Error('Game content level IDs must remain sequential and stable.')
}
const parsedTheme = JSON.parse(theme.toString('utf8'))
const themeKeys = [
  'pageBackground', 'textPrimary', 'textStrong', 'textMuted', 'surface', 'surfaceAlt', 'surfaceElevated',
  'surfaceBorder', 'brand', 'brandStrong', 'accent', 'accentStrong', 'buttonText', 'buttonPrimaryStart',
  'buttonPrimaryEnd', 'buttonSecondaryStart', 'buttonSecondaryEnd', 'buttonWarmStart', 'buttonWarmEnd',
  'positiveStart', 'positiveEnd', 'positiveStrong', 'danger', 'focus', 'board', 'boardLine', 'selection',
  'overlayTop', 'overlayBottom', 'modalOverlay'
]
if (!parsedTheme || themeKeys.some(key => !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(parsedTheme[key] ?? ''))) {
  throw new Error('Game theme must provide every supported color as a six- or eight-digit hex value.')
}

mkdirSync(outputDirectory, { recursive: true })
const levelsFile = `levels-${manifest.version}.json`
const themeFile = `theme-${manifest.version}.json`
writeFileSync(resolve(outputDirectory, levelsFile), levels)
writeFileSync(resolve(outputDirectory, themeFile), theme)

const trustedPublicKey = createPublicKey(readFileSync(publicKeyPath, 'utf8'))
const privateKeyText = process.env.GAME_CONTENT_SIGNING_PRIVATE_KEY?.replace(/\\n/g, '\n')
  ?? readFileSync(privateKeyPath, 'utf8')
const privateKey = createPrivateKey(privateKeyText)
const signingPublicKey = createPublicKey(privateKey)
const trustedKeyDer = trustedPublicKey.export({ type: 'spki', format: 'der' })
const signingKeyDer = signingPublicKey.export({ type: 'spki', format: 'der' })
if (!trustedKeyDer.equals(signingKeyDer)) {
  throw new Error('The content signing private key does not match the public key embedded in the app.')
}

const unsignedManifest = {
  schemaVersion: 1,
  version: manifest.version,
  levels: { file: levelsFile, sha256: hash(levels) },
  theme: { file: themeFile, sha256: hash(theme) },
  keyId: hash(trustedKeyDer).slice(0, 32)
}
const signature = sign('sha256', Buffer.from(serializeManifest(unsignedManifest)), {
  key: privateKey,
  padding: constants.RSA_PKCS1_PSS_PADDING,
  saltLength: 32
}).toString('base64')
const publishedManifest = { ...unsignedManifest, signature }
writeFileSync(resolve(outputDirectory, 'manifest.json'), `${JSON.stringify(publishedManifest, null, 2)}\n`)

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function serializeManifest(value) {
  return JSON.stringify({
    schemaVersion: value.schemaVersion,
    version: value.version,
    levels: value.levels,
    theme: value.theme,
    keyId: value.keyId
  })
}
