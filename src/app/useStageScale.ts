import { useEffect, useState } from 'react'

/** Design truth: iPhone SE logical pixels. The stage is authored once at this size. */
export const STAGE_WIDTH = 375
export const STAGE_HEIGHT = 667

export const STAGE_SCALE_PROPERTY = '--stage-scale'

/** Uniform fit-inside scale so every phone renders the same composition. */
export function computeStageScale(viewportWidth: number, viewportHeight: number): number {
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight)) return 1
  if (viewportWidth <= 0 || viewportHeight <= 0) return 1
  return Math.min(viewportWidth / STAGE_WIDTH, viewportHeight / STAGE_HEIGHT)
}

function readViewportScale(): number {
  return computeStageScale(window.innerWidth, window.innerHeight)
}

export function useStageScale(): number {
  const [scale, setScale] = useState(readViewportScale)

  useEffect(() => {
    const update = () => setScale(readViewportScale())
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty(STAGE_SCALE_PROPERTY, String(scale))
  }, [scale])

  return scale
}
