import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DropPreview } from './DropPreview'

describe('drop preview', () => {
  it('shows four explicit token slots and readable trait labels', () => {
    const { container } = render(<DropPreview
      current="orange"
      next="blue"
      previewCount={4}
      tokens={[
        { type: 'orange', trait: 'none' },
        { type: 'blue', trait: 'scratch' },
        { type: 'white', trait: 'hungry' },
        { type: 'box', trait: 'none' }
      ]}
    />)

    expect(container.querySelector('.drop-preview--4')).toBeInTheDocument()
    expect(container.querySelectorAll('.drop-preview__cat')).toHaveLength(4)
    expect(container.querySelector('.drop-preview__cat--later')).toHaveAttribute('data-cat-type', 'box')
    expect(container.querySelector('[data-trait="scratch"]')).toHaveTextContent('愛抓抓')
    expect(container.querySelector('[data-trait="hungry"]')).toHaveTextContent('貪吃')
  })
})
