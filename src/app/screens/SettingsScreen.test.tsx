import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SettingsScreen } from './SettingsScreen'

const mocks = vi.hoisted(() => ({
  player: {
    settings: { music: false, sound: true, haptics: false, language: 'zh-TW' as const }
  },
  updateSettings: vi.fn()
}))

vi.mock('../../state/PlayerContext', () => ({
  usePlayer: () => ({ player: mocks.player, updateSettings: mocks.updateSettings })
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('SettingsScreen controls', () => {
  it('uses the home artwork for the settings return action and removes the subtitle', () => {
    const { container } = render(
      <SettingsScreen onBack={vi.fn()} onToast={vi.fn()} onLegal={vi.fn()} />
    )

    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
    expect(screen.queryByText('讓每一次遊玩都更剛好！')).not.toBeInTheDocument()

    const homeButton = screen.getByRole('button', { name: '回到主頁' })
    expect(homeButton).toHaveClass('settings-home')
    expect(homeButton).toHaveClass('artwork-button')
    expect(container.querySelector('.settings-home img')).toHaveAttribute('src', '/assets/start.webp')
    expect(homeButton).not.toHaveTextContent('⌂')
  })

  it('keeps the three icon-only toggles together without descriptions', () => {
    const { container } = render(
      <SettingsScreen onBack={vi.fn()} onToast={vi.fn()} onLegal={vi.fn()} />
    )

    const toggleRow = container.querySelector('.settings-toggle-row')

    expect(toggleRow).toBeInTheDocument()
    expect(toggleRow?.querySelectorAll('.settings-toggle')).toHaveLength(3)
    expect(toggleRow?.querySelectorAll('.settings-toggle__copy')).toHaveLength(0)
    expect(toggleRow?.querySelectorAll('.settings-toggle__icon svg')).toHaveLength(3)
    expect(toggleRow?.querySelectorAll('[fill="currentColor"], [stroke="currentColor"]').length).toBeGreaterThan(0)
    expect(screen.getByRole('checkbox', { name: '音樂' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '音效' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '震動' })).toBeInTheDocument()
    expect(screen.queryByText('恢復購買項目')).not.toBeInTheDocument()
    expect(toggleRow).not.toHaveTextContent('陪伴拼圖時光的輕鬆背景音樂')
    expect(toggleRow).not.toHaveTextContent('每一個可愛動作都有回應')
    expect(toggleRow).not.toHaveTextContent('放好貓咪時的小小提示')
  })

  it('continues to update each setting from its icon toggle', () => {
    render(<SettingsScreen onBack={vi.fn()} onToast={vi.fn()} onLegal={vi.fn()} />)

    fireEvent.click(screen.getByRole('checkbox', { name: '音效' }))

    expect(mocks.updateSettings).toHaveBeenCalledWith({ sound: false })
  })
})
