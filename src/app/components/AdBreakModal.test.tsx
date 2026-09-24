import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdBreakModal } from './AdBreakModal'

vi.mock('../../i18n', async () => {
  const actual = await vi.importActual<typeof import('../../i18n')>('../../i18n')
  return { ...actual, useStrings: () => ({ ads: {
    dialogAria: '廣告播放中', title: '廣告播放中', description: '請等待廣告完成。', remaining: '還剩 {seconds} 秒', ready: '廣告即將結束'
  } }) }
})

afterEach(cleanup)

describe('AdBreakModal', () => {
  it('keeps the test break visible until its provider window has elapsed', () => {
    vi.useFakeTimers()
    render(<AdBreakModal open />)

    expect(screen.getByRole('dialog', { name: '廣告播放中' })).toBeInTheDocument()
    expect(screen.getByText('還剩 30 秒')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(30000))
    expect(screen.getByText('廣告即將結束')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
