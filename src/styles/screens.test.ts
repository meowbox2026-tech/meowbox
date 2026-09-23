import { describe, expect, it } from 'vitest'
import screensCss from './screens.css?raw'

describe('home screen start button', () => {
  it('keeps its horizontal centering transform while pressed', () => {
    expect(screensCss).toMatch(
      /\.screen--home \.home-start:active:not\(:disabled\)\s*\{[^}]*transform:\s*translateX\(-50%\)\s+translateY\(3px\)\s+scale\(\.98\)\s*;/,
    )
  })
})
