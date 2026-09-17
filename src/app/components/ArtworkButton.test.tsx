import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArtworkButton } from './ArtworkButton'

describe('ArtworkButton', () => {
  it('keeps the artwork decorative while exposing its text as the button name', () => {
    const { container } = render(<ArtworkButton asset="start">開始遊戲</ArtworkButton>)

    expect(screen.getByRole('button', { name: '開始遊戲' })).toHaveAttribute('type', 'button')
    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/start.webp')
    expect(container.querySelector('img')).toHaveAttribute('draggable', 'false')
  })

  it('supports icon-only controls with an accessible name and badge', () => {
    render(<ArtworkButton asset="undo" badge={2} aria-label="上一步" />)

    expect(screen.getByRole('button', { name: '上一步' })).toHaveTextContent('2')
  })
})
