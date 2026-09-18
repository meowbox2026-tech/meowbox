import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createPuzzleState } from '../../game/core/puzzleEngine'
import { getLevelById } from '../../game/data/levels'
import { CatSelectionTray } from './CatSelectionTray'

describe('CatSelectionTray', () => {
  it('renders four independent cat cards without arrow controls', () => {
    const level = getLevelById(1)

    render(
      <CatSelectionTray
        level={level}
        puzzle={createPuzzleState(level)}
        onSelect={vi.fn()}
        onDrop={vi.fn()}
      />
    )

    expect(screen.getByRole('region', { name: '貓咪選擇區' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.getByRole('button', { name: '傲嬌貓' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /上一組|下一組|左|右/ })).not.toBeInTheDocument()
    expect(screen.queryByText('‹')).not.toBeInTheDocument()
    expect(screen.queryByText('›')).not.toBeInTheDocument()
  })
})
