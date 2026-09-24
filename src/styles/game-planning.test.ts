import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const planningCss = readFileSync(resolve(process.cwd(), 'src/styles/game-planning.css'), 'utf8')
const boardEffectsCss = readFileSync(resolve(process.cwd(), 'src/styles/game-board-effects.css'), 'utf8')

describe('planning screen layout', () => {
  it('matches the tray width to the planning board', () => {
    expect(planningCss).toMatch(/\.planning-tray \{[^}]*width:\s*min\(100%, 360px\)/)
  })

  it('keeps the planning group slightly below the top bar', () => {
    expect(planningCss).toMatch(/\.planning-tray \{[^}]*margin:\s*clamp\(11px, 2cqh, 15px\) auto 0/)
  })

  it('gives the planning actions a larger touch target on short stages', () => {
    expect(planningCss).toMatch(/\.planning-edit-actions \.artwork-button \{[^}]*width:\s*clamp\(68px, 19vw, 76px\)[^}]*height:\s*clamp\(68px, 19vw, 76px\)/)

    const compactLayout = planningCss.match(/@container \(max-height: 700px\) \{([\s\S]*)$/)?.[1] ?? ''
    expect(compactLayout).toMatch(/\.planning-edit-actions \{[^}]*min-height:\s*68px/)
    expect(compactLayout).toMatch(/\.planning-edit-actions \.artwork-button \{ width:\s*68px; height:\s*68px; flex-basis:\s*68px;/)
    expect(compactLayout).toMatch(/\.screen--planning \.planning-start \{ height: min\(9\.9cqh, 70px\); min-height: min\(9\.9cqh, 70px\);/)
  })

  it('does not include animated background effects on the planning board', () => {
    expect(planningCss).not.toMatch(/\.planning-board--prism::before/)
    expect(boardEffectsCss).not.toMatch(/planning-board--prism::before|planning-board--prism::after/)
    expect(boardEffectsCss).not.toMatch(/planning-water-sweep|planning-water-breathe/)
  })
})
