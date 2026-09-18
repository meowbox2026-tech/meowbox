import { useLayoutEffect, useRef, useState } from 'react'
import { MODULAR_BOX_ASSETS } from '../data/boxAssets'
import type { LevelDefinition } from '../types'
import { getPuzzleMetrics } from './puzzleLayout'

interface PuzzleFloorProps {
  level: LevelDefinition
}

interface FloorBounds {
  left: number
  top: number
  width: number
  height: number
}

export function PuzzleFloor({ level }: PuzzleFloorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<FloorBounds>()

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host || level.id !== 1) return undefined

    const updateBounds = () => {
      const rect = host.getBoundingClientRect()
      const metrics = getPuzzleMetrics(rect.width, rect.height, level.board, true)
      setBounds({ left: metrics.x, top: metrics.y, width: metrics.boardWidth, height: metrics.boardHeight })
    }

    updateBounds()
    if (typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(updateBounds)
    observer.observe(host)
    return () => observer.disconnect()
  }, [level])

  if (level.id !== 1) return null

  const cells = Array.from({ length: level.board.width * level.board.height }, (_, index) => ({
    x: index % level.board.width,
    y: Math.floor(index / level.board.width)
  }))

  return (
    <div className="puzzle-floor-layer" ref={hostRef} aria-hidden="true">
      <div
        className="puzzle-floor"
        style={bounds ? {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          gridTemplateColumns: `repeat(${level.board.width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${level.board.height}, minmax(0, 1fr))`,
          visibility: 'visible'
        } : undefined}
      >
        {cells.map((cell) => (
          <img
            className="puzzle-floor-tile"
            key={`${cell.x}-${cell.y}`}
            src={MODULAR_BOX_ASSETS.floor.path}
            alt=""
            draggable="false"
          />
        ))}
      </div>
    </div>
  )
}
