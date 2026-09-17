import type { ImgHTMLAttributes } from 'react'

interface GameImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  asset: string
}

function assetPath(asset: string): string {
  return `/assets/${asset}.webp`
}

/**
 * Loads the compact WebP artwork. Game artwork is never draggable.
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
