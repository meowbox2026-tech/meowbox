import { useLayoutEffect, useRef, useState } from 'react'
import { getVisibleCatGroup } from '../../game/data/catTray'
import { getCatAssetPath } from '../../game/data/catAssets'
import type { CatDefinition, LevelDefinition, PuzzleState } from '../../game/types'
import { getPuzzleMetrics } from '../../game/phaser/puzzleLayout'

interface TrayBounds {
  left: number
  top: number
  width: number
  height: number
}

export interface CatSelectionTrayProps {
  level: LevelDefinition
  puzzle: PuzzleState
  selectedCatId?: string
  onSelect: (catId: string) => void
  onDrop: (clientX: number, clientY: number) => void
}

export function CatSelectionTray({ level, puzzle, selectedCatId, onSelect, onDrop }: CatSelectionTrayProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<TrayBounds>()
  const visibleCats = getVisibleCatGroup(level, puzzle)

  useLayoutEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined

    const updateBounds = () => {
      const rect = layer.getBoundingClientRect()
      const metrics = getPuzzleMetrics(rect.width, rect.height, level.board, level.id === 1)
      setBounds({
        left: 18,
        top: metrics.trayY,
        width: Math.max(0, rect.width - 36),
        height: metrics.trayHeight
      })
    }

    updateBounds()
    if (typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(updateBounds)
    observer.observe(layer)
    return () => observer.disconnect()
  }, [level])

  return (
    <div className="cat-selection-tray-layer" ref={layerRef}>
      <section
        className="cat-selection-tray"
        aria-label="貓咪選擇區"
        style={bounds ? {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          visibility: 'visible'
        } : undefined}
      >
        <div className="cat-selection-tray__cards">
          {visibleCats.map((cat) => (
            <CatSelectionCard
              cat={cat}
              key={cat.id}
              isPlaced={Boolean(puzzle.placements[cat.id])}
              isSelected={cat.id === selectedCatId}
              onDrop={onDrop}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

interface CatSelectionCardProps {
  cat: CatDefinition
  isPlaced: boolean
  isSelected: boolean
  onSelect: (catId: string) => void
  onDrop: (clientX: number, clientY: number) => void
}

function CatSelectionCard({ cat, isPlaced, isSelected, onSelect, onDrop }: CatSelectionCardProps) {
  const pointerStart = useRef<{ x: number; y: number } | undefined>(undefined)
  const didMove = useRef(false)

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    pointerStart.current = { x: event.clientX, y: event.clientY }
    didMove.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onSelect(cat.id)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    if (!start) return
    didMove.current = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
  }

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    // A tap ends over the tray and is harmless; a drag ends over the board and places the selected cat.
    onDrop(event.clientX, event.clientY)
    pointerStart.current = undefined
    didMove.current = false
  }

  const cancelPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (didMove.current) onDrop(event.clientX, event.clientY)
    pointerStart.current = undefined
    didMove.current = false
  }

  return (
    <button
      type="button"
      className={`cat-selection-tray__card${isSelected ? ' is-selected' : ''}${isPlaced ? ' is-placed' : ''}`}
      aria-label={cat.name}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={cancelPointer}
    >
      {cat.visualAsset && <img src={getCatAssetPath(cat.visualAsset)} alt="" aria-hidden="true" />}
      {getCatBadge(cat) && <span className="cat-selection-tray__badge" aria-hidden="true">{getCatBadge(cat)}</span>}
      {isPlaced && <small>已放入</small>}
    </button>
  )
}

function getCatBadge(cat: CatDefinition): string {
  if (cat.rule?.kind === 'adjacent-to-special') return '🐟'
  if (cat.type === 'sleeping') return 'zZ'
  if (cat.type === 'sticky') return '♡'
  if (cat.type === 'stretch') return '↔'
  return ''
}
