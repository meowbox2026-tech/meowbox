import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameScreen } from './GameScreen'

vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { pawCoins: 0, settings: { music: false, haptics: false } }, completeLevel: vi.fn()
}) }))
vi.mock('../../services/audio/audioService', () => ({ startBackgroundMusic: vi.fn(), stopBackgroundMusic: vi.fn() }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))

afterEach(cleanup)

describe('GameScreen mainline routing', () => {
  it('uses planning mode for the last active level', () => {
    render(<GameScreen levelId={25} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={vi.fn()} onLevelSelect={vi.fn()} onToast={vi.fn()} />)

    expect(document.querySelectorAll('.planning-cell')).toHaveLength(64)
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.getByText('彩虹小隊')).toBeInTheDocument()
  })

  it('clamps an obsolete level request to the last active planning level', () => {
    render(<GameScreen levelId={26} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={vi.fn()} onLevelSelect={vi.fn()} onToast={vi.fn()} />)

    expect(screen.getByText('彩虹小隊')).toBeInTheDocument()
    expect(screen.queryByRole('timer')).toBeNull()
  })
})
