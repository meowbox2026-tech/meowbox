import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Phaser from 'phaser'
import { PuzzleScene, type PuzzleCommand, type PuzzleFeedback } from './PuzzleScene'
import type { LevelDefinition, PuzzleState } from '../types'

export interface CatPlacementAreaHandle {
  dispatch: (command: PuzzleCommand) => void
  placeAtScreenPoint: (clientX: number, clientY: number) => void
}

interface CatPlacementAreaProps {
  level: LevelDefinition
  onStateChange: (state: PuzzleState) => void
  onFeedback: (feedback: PuzzleFeedback) => void
}

export const CatPlacementArea = forwardRef<CatPlacementAreaHandle, CatPlacementAreaProps>(function CatPlacementArea(
  { level, onStateChange, onFeedback },
  forwardedRef
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PuzzleScene | null>(null)

  useImperativeHandle(forwardedRef, () => ({
    dispatch: (command) => sceneRef.current?.dispatch(command),
    placeAtScreenPoint: (clientX, clientY) => {
      const host = hostRef.current
      const scene = sceneRef.current
      if (!host || !scene) return

      const rect = host.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      scene.placeAtCanvasPoint(
        (clientX - rect.left) * (scene.scale.width / rect.width),
        (clientY - rect.top) * (scene.scale.height / rect.height)
      )
    }
  }), [])

  useEffect(() => {
    if (!hostRef.current) return undefined
    const scene = new PuzzleScene({ level, onStateChange, onFeedback })
    sceneRef.current = scene
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      transparent: true,
      // The UI owns its tiny WebAudio feedback; Phaser's global audio mixer is unused.
      // Disabling it avoids creating a suspended context on mobile browsers.
      audio: { noAudio: true },
      render: { antialias: true, pixelArt: false },
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [scene]
    })

    return () => {
      sceneRef.current = null
      game.destroy(true)
    }
  }, [level, onFeedback, onStateChange])

  return <div className="cat-placement-area" ref={hostRef} aria-label="貓咪裝箱拼圖棋盤" />
})
