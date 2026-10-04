export const TRANSFER_ANIMATION_MS = 1000
export const TRANSFER_STAGGER_MS = 180
export const getTransferFrameDuration = (count: number) => TRANSFER_ANIMATION_MS
  + Math.max(0, count - 1) * TRANSFER_STAGGER_MS + 100
