import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react'
import { getCatAssetPath } from '../data/catAssets'
import { format, getMatch3CatLabel, useLocale, useStrings } from '../../i18n'
import type { CatAsset } from '../types'
import {
  areMatch3PointsAdjacent,
  createMatch3State,
  swapMatch3Tiles,
  type Match3Board as Match3BoardState,
  type Match3Point,
  type Match3ResolutionStep,
  type Match3State,
  type Match3SwapResult,
  type Match3Tile
} from '../core/match3Engine'
import {
  getMatch3ClearWaveDuration,
  getMatch3ComboLabel,
  getMatch3FallPresentationDuration,
  getMatch3FallDelay
} from '../core/match3Presentation'

export interface Match3BoardHandle {
  reset: () => void
}

export interface Match3BoardProps {
  width: number
  height: number
  tileAssets: CatAsset[]
  initialBoard?: Match3BoardState
  random?: () => number
  onAction?: (result: Match3SwapResult) => void
  onClearWave?: (cascade: number) => void
  onStateChange?: (state: Match3State) => void
  overlay?: ReactNode
}

interface DragPreview {
  point: Match3Point
  tile: Match3Tile
  x: number
  y: number
  size: number
}

export const Match3Board = forwardRef<Match3BoardHandle, Match3BoardProps>(function Match3Board(
  { width, height, tileAssets, initialBoard, random, onAction, onStateChange, onClearWave, overlay },
  forwardedRef
) {
  const locale = useLocale()
  const strings = useStrings()
  const randomRef = useRef(random ?? Math.random)
  const waveFeedback = useRef(onClearWave)
  waveFeedback.current = onClearWave
  const [rejectedCells, setRejectedCells] = useState<string[]>([])
  const boardShellRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<Match3State>(() => createState())
  const [displayBoard, setDisplayBoard] = useState<Match3BoardState>(() => state.board)
  const [selected, setSelected] = useState<Match3Point>()
  const [dragTarget, setDragTarget] = useState<Match3Point>()
  const [fallingCells, setFallingCells] = useState<Map<string, number>>(new Map())
  const [resolutionSteps, setResolutionSteps] = useState<Match3ResolutionStep[]>([])
  const [activeResolutionStepIndex, setActiveResolutionStepIndex] = useState(0)
  const [resolutionPhase, setResolutionPhase] = useState<'clearing' | 'falling'>('clearing')
  const [dragPreview, setDragPreview] = useState<DragPreview>()
  const pointerStart = useRef<{ point: Match3Point; x: number; y: number } | undefined>(undefined)
  const dragTargetRef = useRef<Match3Point | undefined>(undefined)
  const suppressClickUntil = useRef(0)
  const fallTimer = useRef<number | undefined>(undefined)
  const clearTimer = useRef<number | undefined>(undefined)

  function createState(): Match3State {
    return createMatch3State({
      width,
      height,
      tileTypes: tileAssets,
      board: initialBoard,
      random: randomRef.current
    })
  }

  useImperativeHandle(forwardedRef, () => ({
    reset: () => {
      if (fallTimer.current !== undefined) window.clearTimeout(fallTimer.current)
      if (clearTimer.current !== undefined) window.clearTimeout(clearTimer.current)
      const nextState = createState()
      setState(nextState)
      setDisplayBoard(nextState.board)
      setSelected(undefined)
      setDragTarget(undefined)
      setFallingCells(new Map())
      setResolutionSteps([])
      setActiveResolutionStepIndex(0)
      setResolutionPhase('clearing')
      setDragPreview(undefined)
      setRejectedCells([])
    }
  }), [height, initialBoard, tileAssets, width])

  useEffect(() => {
    onStateChange?.(state)
  }, [onStateChange, state])

  useEffect(() => () => {
    if (fallTimer.current !== undefined) window.clearTimeout(fallTimer.current)
    if (clearTimer.current !== undefined) window.clearTimeout(clearTimer.current)
  }, [])

  useEffect(() => {
    const step = resolutionSteps[activeResolutionStepIndex]
    if (!step) return

    if (resolutionPhase === 'clearing') {
      clearTimer.current = window.setTimeout(() => {
        setDisplayBoard(step.nextBoard)
        if (step.nextBoard.some(row => row.some(tile => tile === null))) {
          setActiveResolutionStepIndex(current => current + 1)
          waveFeedback.current?.(activeResolutionStepIndex + 2)
          return
        }
        setFallingCells(getFallOffsets(step.board, step.nextBoard))
        setResolutionPhase('falling')
      }, getMatch3ClearWaveDuration())
    } else {
      fallTimer.current = window.setTimeout(() => {
        setFallingCells(new Map())
        if (activeResolutionStepIndex >= resolutionSteps.length - 1) {
          setResolutionSteps([])
          setActiveResolutionStepIndex(0)
          setResolutionPhase('clearing')
          return
        }
        setActiveResolutionStepIndex((current) => current + 1)
        setResolutionPhase('clearing')
        waveFeedback.current?.(activeResolutionStepIndex + 2)
      }, getMatch3FallPresentationDuration(height))
    }

    return () => {
      if (clearTimer.current !== undefined) window.clearTimeout(clearTimer.current)
      if (fallTimer.current !== undefined) window.clearTimeout(fallTimer.current)
      clearTimer.current = undefined
      fallTimer.current = undefined
    }
  }, [activeResolutionStepIndex, height, resolutionPhase, resolutionSteps])

  const trySwap = (first: Match3Point, second: Match3Point) => {
    const result = swapMatch3Tiles(state, first, second, randomRef.current)
    onAction?.(result)
    if (!result.accepted) {
      setSelected(undefined)
      setRejectedCells([`${first.x}:${first.y}`, `${second.x}:${second.y}`])
      return
    }

    const firstStep = result.resolutionSteps[0]
    if (!firstStep) return
    setRejectedCells([])
    waveFeedback.current?.(1)

    setState(result.state)
    setDisplayBoard(firstStep.board)
    setSelected(undefined)
    setDragTarget(undefined)
    setFallingCells(new Map())
    setResolutionSteps(result.resolutionSteps)
    setActiveResolutionStepIndex(0)
    setResolutionPhase('clearing')
  }

  const selectOrSwap = (point: Match3Point) => {
    if (!selected) {
      setSelected(point)
      return
    }
    if (selected.x === point.x && selected.y === point.y) {
      setSelected(undefined)
      return
    }
    if (!areMatch3PointsAdjacent(selected, point)) {
      setSelected(point)
      return
    }
    trySwap(selected, point)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, point: Match3Point) => {
    event.preventDefault()
    pointerStart.current = { point, x: event.clientX, y: event.clientY }
    dragTargetRef.current = undefined
    setDragTarget(undefined)
    const tile = state.board[point.y]?.[point.x]
    if (tile) setDragPreview(createDragPreview(event, point, tile, width))
    suppressClickUntil.current = 0
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    if (!start) return
    const target = getDragTarget(start, event.clientX, event.clientY, width, height)
    if (target) suppressClickUntil.current = Date.now() + 500
    dragTargetRef.current = target
    setDragTarget(target)
    const tile = state.board[start.point.y]?.[start.point.x]
    if (tile) setDragPreview(createDragPreview(event, start.point, tile, width))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    if (!start) return

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const target = dragTargetRef.current ?? getDragTarget(start, event.clientX, event.clientY, width, height)
    if (target) {
      trySwap(start.point, target)
    }
    if (hasDragged(start, event.clientX, event.clientY)) suppressClickUntil.current = Date.now() + 500

    pointerStart.current = undefined
    dragTargetRef.current = undefined
    setDragTarget(undefined)
    setDragPreview(undefined)
  }

  const handlePointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    pointerStart.current = undefined
    dragTargetRef.current = undefined
    setDragTarget(undefined)
    setDragPreview(undefined)
    suppressClickUntil.current = Date.now() + 500
  }

  const isResolving = resolutionSteps.length > 0 || fallingCells.size > 0
  const activeResolutionStep = resolutionPhase === 'clearing'
    ? resolutionSteps[activeResolutionStepIndex]
    : undefined
  const activeClearEvent = activeResolutionStep?.clearEvent
  const comboLabel = activeClearEvent ? getMatch3ComboLabel(activeResolutionStepIndex + 1, locale) : undefined

  return (
    <div
      ref={boardShellRef}
      className="match3-board-shell"
      style={{ '--match3-columns': width, '--match3-rows': height } as React.CSSProperties}
    >
      <div className="match3-board" role="grid" aria-label={strings.match3.board}>
        {displayBoard.flatMap((row, y) => row.map((tile, x) => {
          const point = { x, y }
          const isSelected = selected?.x === x && selected?.y === y
          const isDragTarget = dragTarget?.x === x && dragTarget?.y === y
          const isDragging = dragPreview?.point.x === x && dragPreview?.point.y === y
          const isClearing = Boolean(activeClearEvent?.cells.some((cell) => cell.x === x && cell.y === y))
          const cellKey = `${x}:${y}`
          const fallRows = fallingCells.get(cellKey)
          const tileLabel = tile ? getMatch3CatLabel(tile.type as CatAsset, locale) : strings.match3.empty

          return (
            <button
              className={`match3-tile${isSelected ? ' is-selected' : ''}${isDragTarget ? ' is-drag-target' : ''}${isDragging ? ' is-dragging' : ''}${isClearing ? ' is-clearing' : ''}${fallRows ? ' is-falling' : ''}${tile ? '' : ' is-empty'}`}
              data-tile-type={tile?.type}
              data-rejected={rejectedCells.includes(cellKey) || undefined}
              onAnimationEnd={(event) => {
                if (event.animationName === 'match3-rejected') setRejectedCells([])
              }}
              key={cellKey}
              type="button"
              role="gridcell"
              aria-label={format(strings.match3.cell, { col: x + 1, row: y + 1, name: tileLabel })}
              aria-pressed={isSelected}
              disabled={!tile || isResolving}
              style={{
                '--match3-delay': fallRows ? `${getMatch3FallDelay(x, y, height)}ms` : '0ms',
                '--match3-fall-distance': fallRows ? `calc(-${fallRows * 100}% - ${fallRows * 3}px)` : '0%'
              } as React.CSSProperties}
              onPointerDown={(event) => tile && handlePointerDown(event, point)}
              onPointerMove={tile ? handlePointerMove : undefined}
              onPointerUp={tile ? handlePointerUp : undefined}
              onPointerCancel={tile ? handlePointerCancel : undefined}
              onClick={() => {
                if (Date.now() < suppressClickUntil.current) return
                selectOrSwap(point)
              }}
            >
              {tile && <span className="match3-tile__body">
                <span className="match3-tile__piece">
                  <img src={getCatAssetPath(tile.type as CatAsset)} alt="" draggable="false" />
                </span>
              </span>}
            </button>
          )
        }))}
      </div>
      {activeClearEvent && <div className="match3-clear-layer" data-testid="match3-clear-layer" aria-hidden="true">
        {activeClearEvent.cells.map((cell) => (
          <div
            className="match3-clear-effect"
            data-testid="match3-clear-effect"
            data-cascade={activeClearEvent.cascade}
            key={`${activeClearEvent.cascade}:${cell.x}:${cell.y}`}
            style={{
              gridColumn: cell.x + 1,
              gridRow: cell.y + 1,
              '--match3-clear-delay': '0ms'
            } as React.CSSProperties}
          >
            <span className="match3-clear-effect__stars" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i></span>
          </div>
        ))}
      </div>}
      {comboLabel && <div
        className="match3-combo-pop"
        data-testid="match3-combo"
        data-cascade={activeResolutionStepIndex + 1}
        key={`combo-${activeResolutionStepIndex}`}
        role="status"
        aria-live="polite"
      >
        {comboLabel}
      </div>}
      {dragPreview && <div
        className="match3-drag-ghost"
        data-testid="match3-drag-ghost"
        aria-hidden="true"
        style={{ left: dragPreview.x, top: dragPreview.y, width: dragPreview.size, height: dragPreview.size }}
      >
        <img src={getCatAssetPath(dragPreview.tile.type as CatAsset)} alt="" draggable="false" />
      </div>}
      {overlay}
    </div>
  )
})

function createDragPreview(
  event: React.PointerEvent<HTMLButtonElement>,
  point: Match3Point,
  tile: Match3Tile,
  width: number
): DragPreview {
  const shell = event.currentTarget.closest('.match3-board-shell')?.getBoundingClientRect()
  const size = shell ? shell.width / width * .88 : 42
  return {
    point,
    tile,
    x: shell ? event.clientX - shell.left : event.clientX,
    y: shell ? event.clientY - shell.top : event.clientY,
    size
  }
}

function getDragTarget(
  start: { point: Match3Point; x: number; y: number },
  clientX: number,
  clientY: number,
  width: number,
  height: number
): Match3Point | undefined {
  const deltaX = clientX - start.x
  const deltaY = clientY - start.y
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 18) return undefined

  const target = {
    x: start.point.x + (Math.abs(deltaX) >= Math.abs(deltaY) ? Math.sign(deltaX) : 0),
    y: start.point.y + (Math.abs(deltaY) > Math.abs(deltaX) ? Math.sign(deltaY) : 0)
  }
  return target.x >= 0 && target.x < width && target.y >= 0 && target.y < height ? target : undefined
}

function hasDragged(
  start: { point: Match3Point; x: number; y: number },
  clientX: number,
  clientY: number
): boolean {
  return Math.max(Math.abs(clientX - start.x), Math.abs(clientY - start.y)) >= 18
}

function getFallOffsets(previous: Match3BoardState, next: Match3BoardState): Map<string, number> {
  const previousPositions = new Map<number, Match3Point>()
  previous.forEach((row, y) => row.forEach((tile, x) => {
    if (tile) previousPositions.set(tile.id, { x, y })
  }))

  const offsets = new Map<string, number>()
  // Keep new cats spaced one cell apart above the board, rather than
  // starting every new cat at the same position just above the first row.
  const newTilesPerColumn = next[0].map((_, x) =>
    next.reduce((count, row) => count + (row[x] && !previousPositions.has(row[x]!.id) ? 1 : 0), 0)
  )
  next.forEach((row, y) => row.forEach((tile, x) => {
    if (!tile) return
    const previousPoint = previousPositions.get(tile.id)
    const rowsFallen = previousPoint?.x === x ? y - previousPoint.y : undefined
    const fallRows = rowsFallen && rowsFallen > 0 ? rowsFallen : previousPoint ? 0 : newTilesPerColumn[x]
    if (fallRows > 0) offsets.set(`${x}:${y}`, fallRows)
  }))
  return offsets
}
