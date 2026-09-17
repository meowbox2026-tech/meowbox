import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameImage } from './GameImage'

describe('GameImage', () => {
  it('loads the WebP artwork and disables native image dragging', () => {
    const { container } = render(<GameImage asset="start" alt="開始遊戲" />)
    const image = container.querySelector('img')

    expect(image).toHaveAttribute('src', '/assets/start.webp')
    expect(image).toHaveAttribute('draggable', 'false')
  })
})
