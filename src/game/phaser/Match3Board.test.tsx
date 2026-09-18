import { act, fireEvent, render, screen, within, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Match3Board } from './Match3Board'
import type { Match3Board as Match3BoardState, Match3SwapResult } from '../core/match3Engine'
import { getMatch3ClearWaveDuration, getMatch3FallPresentationDuration } from '../core/match3Presentation'

const TILE_ASSETS = ['alone', 'blue', 'fishLover', 'orange', 'white'] as const

function boardFromRows(rows: string[]): Match3BoardState {
  const types = {
    a: 'alone',
    b: 'blue',
    c: 'fishLover',
    d: 'orange',
    e: 'white',
    f: 'fishLover',
    o: 'orange',
    w: 'white'
  } as const
  let nextId = 1
  return rows.map((row) => row.split('').map((type) => ({ id: nextId++, type: types[type as keyof typeof types] })))
}

describe('Match3Board', () => {
  afterEach(cleanup)

  it('renders every cell as an accessible tile', () => {
    render(<Match3Board width={8} height={8} tileAssets={[...TILE_ASSETS]} random={() => 0.2} />)

    expect(screen.getByRole('grid', { name: '三消棋盤' })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(64)
  })

  it('swaps cats when one is dragged onto an adjacent cat and keeps the board mounted', () => {
    const onAction = vi.fn()
    render(
      <Match3Board
        width={4}
        height={4}
        tileAssets={[...TILE_ASSETS]}
        initialBoard={boardFromRows([
          'abfo',
          'bfoa',
          'faaw',
          'aabo'
        ])}
        random={() => 0.8}
        onAction={onAction}
      />
    )

    const grid = screen.getByRole('grid', { name: '三消棋盤' })
    const cells = within(grid).getAllByRole('gridcell')
    const unaffectedCell = cells[0]
    const draggedCell = cells[2 * 4 + 2]

    act(() => {
      dispatchPointerEvent(draggedCell, 'pointerdown', { clientX: 100, clientY: 100 })
      dispatchPointerEvent(draggedCell, 'pointermove', { clientX: 100, clientY: 140 })
    })

    expect(screen.getByTestId('match3-drag-ghost')).toBeInTheDocument()
    expect(draggedCell).toHaveClass('is-dragging')

    act(() => {
      dispatchPointerEvent(draggedCell, 'pointerup', { clientX: 100, clientY: 140 })
    })

    expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({
      accepted: true,
      clearedCount: expect.any(Number)
    }))
    expect(screen.getByRole('grid', { name: '三消棋盤' })).toBe(grid)
    expect(within(grid).getAllByRole('gridcell')[0]).toBe(unaffectedCell)
    const clearingCell = within(grid).getAllByRole('gridcell').find((cell) => cell.classList.contains('is-clearing'))
    expect(clearingCell).toBeDefined()
    expect(clearingCell).toBeDisabled()
    expect(clearingCell?.querySelector('.match3-tile__body img')).toBeInTheDocument()
    expect(screen.getByTestId('match3-clear-layer')).toBeInTheDocument()
    const result = onAction.mock.lastCall?.[0] as Match3SwapResult | undefined
    expect(screen.getAllByTestId('match3-clear-effect')).toHaveLength(
      result?.clearEvents.flatMap((event) => event.cells).length ?? 0
    )
    expect(screen.queryByTestId('match3-drag-ghost')).not.toBeInTheDocument()
  })

  it('plays a three-wave chain one clear wave at a time with a counting combo label', () => {
    vi.useFakeTimers()
    const onAction = vi.fn()
    const onClearWave = vi.fn()
    const refillValues = [
      0.03242476633749902,
      0.07025589840486646,
      0.9353603331837803,
      0.8946607047691941,
      0.3456739156972617,
      0.11059395736083388,
      0.6429440148640424,
      0.6224095430225134,
      0.48066752194426954
    ]
    try {
      render(
        <Match3Board
          width={5}
          height={5}
          tileAssets={[...TILE_ASSETS]}
          initialBoard={boardFromRows([
            'addab',
            'adaea',
            'eccac',
            'ecaee',
            'aeceb'
          ])}
          random={() => refillValues.shift() ?? 0.5}
          onAction={onAction}
          onClearWave={onClearWave}
        />
      )

      const cells = within(screen.getByRole('grid', { name: '三消棋盤' })).getAllByRole('gridcell')
      fireEvent.click(cells[2 * 5 + 3])
      fireEvent.click(cells[2 * 5 + 4])

      const result = onAction.mock.lastCall?.[0] as Match3SwapResult
      const firstClearCell = result.resolutionSteps[0].clearEvent.cells[0]
      const firstClearTile = cells[firstClearCell.y * 5 + firstClearCell.x]

      expect(screen.getByTestId('match3-combo')).toHaveTextContent('喵喵 ×1')
      expect(onClearWave.mock.calls).toEqual([[1]])
      expect(screen.getByTestId('match3-combo')).toHaveAttribute('data-cascade', '1')
      expect(screen.getAllByTestId('match3-clear-effect')).toHaveLength(3)
      expect(firstClearTile).toHaveAttribute('data-tile-type', firstClearCell.type)
      expect(firstClearTile).toHaveClass('is-clearing')
      expect(screen.getAllByTestId('match3-clear-effect').map((effect) => effect.getAttribute('data-cascade'))).toEqual([
        '1', '1', '1'
      ])

      act(() => vi.advanceTimersByTime(getMatch3ClearWaveDuration()))
      expect(screen.queryByTestId('match3-combo')).not.toBeInTheDocument()
      expect(screen.queryByTestId('match3-clear-effect')).not.toBeInTheDocument()
      expect(within(screen.getByRole('grid', { name: '三消棋盤' })).getAllByRole('gridcell').some((cell) => cell.classList.contains('is-falling'))).toBe(true)

      act(() => vi.advanceTimersByTime(getMatch3FallPresentationDuration(5)))
      expect(screen.getByTestId('match3-combo')).toHaveTextContent('喵喵 ×2')
      expect(onClearWave.mock.calls).toEqual([[1], [2]])
      expect(screen.getByTestId('match3-combo')).toHaveAttribute('data-cascade', '2')
      expect(screen.getAllByTestId('match3-clear-effect')).toHaveLength(3)
      expect(screen.getAllByTestId('match3-clear-effect').map((effect) => effect.getAttribute('data-cascade'))).toEqual([
        '2', '2', '2'
      ])

      act(() => vi.advanceTimersByTime(getMatch3ClearWaveDuration()))
      expect(screen.queryByTestId('match3-combo')).not.toBeInTheDocument()
      expect(screen.queryByTestId('match3-clear-effect')).not.toBeInTheDocument()
      expect(within(screen.getByRole('grid', { name: '三消棋盤' })).getAllByRole('gridcell').some((cell) => cell.classList.contains('is-falling'))).toBe(true)

      act(() => vi.advanceTimersByTime(getMatch3FallPresentationDuration(5)))
      expect(screen.getByTestId('match3-combo')).toHaveTextContent('喵喵 ×3')
      expect(onClearWave.mock.calls).toEqual([[1], [2], [3]])
      expect(screen.getByTestId('match3-combo')).toHaveAttribute('data-cascade', '3')
      expect(screen.getAllByTestId('match3-clear-effect')).toHaveLength(3)
      expect(screen.getAllByTestId('match3-clear-effect').map((effect) => effect.getAttribute('data-cascade'))).toEqual([
        '3', '3', '3'
      ])

      act(() => vi.advanceTimersByTime(getMatch3ClearWaveDuration()))
      expect(screen.queryByTestId('match3-combo')).not.toBeInTheDocument()
      expect(screen.queryByTestId('match3-clear-effect')).not.toBeInTheDocument()

      act(() => vi.advanceTimersByTime(getMatch3FallPresentationDuration(5)))
      expect(screen.queryByTestId('match3-combo')).not.toBeInTheDocument()
      expect(screen.queryByTestId('match3-clear-effect')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

function dispatchPointerEvent(element: HTMLElement, type: string, position: { clientX: number; clientY: number }): void {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    clientX: { value: position.clientX },
    clientY: { value: position.clientY }
  })
  element.dispatchEvent(event)
}
