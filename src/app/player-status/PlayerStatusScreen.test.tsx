import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PlayerStatusScreen } from './PlayerStatusScreen'

afterEach(cleanup)

describe('PlayerStatusScreen', () => {
  it('shows a data-integrity state instead of fabricated metrics', () => {
    render(<PlayerStatusScreen />)

    expect(screen.getByRole('heading', { name: '玩家狀態' })).toBeInTheDocument()
    expect(screen.getByText('資料尚未接入')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '尚無可驗證的玩家資料' })).toBeInTheDocument()
    expect(screen.getByText('level_completed')).toBeInTheDocument()
    expect(screen.queryByText('示範資料')).not.toBeInTheDocument()
    expect(screen.queryByText('12,480')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '匯出資料' })).toBeDisabled()
  })

  it('keeps the selected date range visible without inventing numbers', () => {
    render(<PlayerStatusScreen />)

    fireEvent.click(screen.getByRole('button', { name: '最近 30 天' }))
    expect(screen.getByRole('button', { name: '最近 30 天' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/中央事件資料來源/)).toBeInTheDocument()
    expect(screen.queryByText('38,920')).not.toBeInTheDocument()
  })
})
