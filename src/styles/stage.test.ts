import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const stageCss = readFileSync(resolve(process.cwd(), 'src/styles/stage.css'), 'utf8')

describe('stage background layers', () => {
  it('does not apply the ambient overlay to the game screen', () => {
    expect(stageCss).toMatch(/\.app-bleed\[data-screen='game'\]::after\s*\{[^}]*display:\s*none/)
  })

  it('allows only direct non-game pages to scroll inside the fixed stage', () => {
    expect(stageCss).toMatch(/\.app-stage > \.screen:not\(\.screen--game\)\s*\{[^}]*overflow-y:\s*auto/)
    expect(stageCss).toMatch(/\.app-stage > \.screen:not\(\.screen--game\)::\-webkit-scrollbar\s*\{[^}]*display:\s*none/)
  })
})
