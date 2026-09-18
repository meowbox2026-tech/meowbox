import type { ImgHTMLAttributes } from 'react'
import { Capacitor } from '@capacitor/core'

interface GameImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  asset: string
}

function assetPath(asset: string): string {
  return Capacitor.isNativePlatform()
    ? `/assets-native/${asset}.png`
    : `/assets/${asset}.webp`
}

/**
 * Loads compact WebP artwork on the web and ImageIO-compatible PNG artwork
 * in the native shell. Game artwork is never draggable.
 */
export function GameImage({ asset, ...props }: GameImageProps) {
  return (
    <img
      {...props}
      src={assetPath(asset)}
      draggable={false}
    />
  )
}
