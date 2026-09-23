import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const screensCss = readFileSync(resolve(process.cwd(), 'src/styles/screens.css'), 'utf8')

describe('home screen start button', () => {
  it('keeps its horizontal centering transform while pressed', () => {
    expect(screensCss).toMatch(
      /\.screen--home \.home-start:active:not\(:disabled\)\s*\{[^}]*transform:\s*translateX\(-50%\)\s+translateY\(3px\)\s+scale\(\.98\)\s*;/,
    )
  })
})
