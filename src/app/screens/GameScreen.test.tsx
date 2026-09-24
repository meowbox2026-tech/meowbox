import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameScreen } from './GameScreen'

vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { settings: { music: false, sound: false, haptics: false } }, completeLevel: vi.fn()
}) }))
vi.mock('../../services/audio/audioService', () => ({ startBackgroundMusic: vi.fn(), stopBackgroundMusic: vi.fn() }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))

afterEach(cleanup)

describe('GameScreen mainline routing', () => {
  it('uses planning mode for the last active level', () => {
    render(<GameScreen levelId={30} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={vi.fn()} onLevelSelect={vi.fn()} onToast={vi.fn()} onPlayAction={vi.fn()} onWatchUndoAd={vi.fn()} />)

    expect(document.querySelectorAll('.planning-cell')).toHaveLength(64)
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.getByText('救出全部 54 隻貓咪')).toHaveClass('planning-top-goal')
  })

  it('clamps an obsolete level request to the last active planning level', () => {
    render(<GameScreen levelId={31} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={vi.fn()} onLevelSelect={vi.fn()} onToast={vi.fn()} onPlayAction={vi.fn()} onWatchUndoAd={vi.fn()} />)

    expect(screen.getByText('救出全部 54 隻貓咪')).toHaveClass('planning-top-goal')
    expect(screen.queryByRole('timer')).toBeNull()
  })
})
