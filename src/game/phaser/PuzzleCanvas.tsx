import { forwardRef, useImperativeHandle, useRef } from 'react'
import { CatPlacementArea, type CatPlacementAreaHandle } from './CatPlacementArea'
import { PuzzleFloor } from './PuzzleFloor'
import type { PuzzleCommand, PuzzleFeedback } from './PuzzleScene'
import type { LevelDefinition, PuzzleState } from '../types'

export interface PuzzleCanvasHandle {
  dispatch: (command: PuzzleCommand) => void
  placeAtScreenPoint: (clientX: number, clientY: number) => void
}

interface PuzzleCanvasProps {
  level: LevelDefinition
  onStateChange: (state: PuzzleState) => void
  onFeedback: (feedback: PuzzleFeedback) => void
}

export const PuzzleCanvas = forwardRef<PuzzleCanvasHandle, PuzzleCanvasProps>(function PuzzleCanvas(
  { level, onStateChange, onFeedback },
  forwardedRef
) {
  const placementRef = useRef<CatPlacementAreaHandle>(null)

  useImperativeHandle(forwardedRef, () => ({
    dispatch: (command) => placementRef.current?.dispatch(command),
    placeAtScreenPoint: (clientX, clientY) => placementRef.current?.placeAtScreenPoint(clientX, clientY)
  }), [])

  return (
    <div className="puzzle-canvas">
      <PuzzleFloor level={level} />
      <CatPlacementArea ref={placementRef} level={level} onStateChange={onStateChange} onFeedback={onFeedback} />
    </div>
  )
})
