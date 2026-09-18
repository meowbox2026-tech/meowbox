export interface CatDropScale {
  x: number
  y: number
}

export function getCatDropScale(progress: number): CatDropScale {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const easedProgress = 1 - Math.pow(1 - clampedProgress, 3)
  const landingSquash = Math.sin(clampedProgress * Math.PI)
  const baseScale = 0.92 + easedProgress * 0.08

  return {
    x: baseScale + landingSquash * 0.12,
    y: baseScale - landingSquash * 0.14
  }
}

export function getCatDisplayAngle(rotation: number, dragTilt: number, isPreview: boolean): number {
  const boundedTilt = Math.max(-12, Math.min(12, dragTilt))
  return rotation * 90 + (isPreview ? boundedTilt : 0)
}
