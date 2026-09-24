import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { usePageSuspended } from './usePageSuspended'

function SuspensionProbe() {
  const suspended = usePageSuspended()
  return <output data-testid="suspended">{String(suspended)}</output>
}

afterEach(() => {
  cleanup()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
})

describe('usePageSuspended', () => {
  it('suspends game state immediately when the window loses focus and resumes on focus', () => {
    render(<SuspensionProbe />)

    fireEvent.blur(window)

    expect(screen.getByTestId('suspended')).toHaveTextContent('true')

    fireEvent.focus(window)

    expect(screen.getByTestId('suspended')).toHaveTextContent('false')
  })

  it('follows document visibility changes used by mobile web views', () => {
    render(<SuspensionProbe />)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })

    act(() => document.dispatchEvent(new Event('visibilitychange')))

    expect(screen.getByTestId('suspended')).toHaveTextContent('true')
  })
})
