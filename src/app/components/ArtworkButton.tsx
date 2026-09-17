import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { GameImage } from './GameImage'

interface ArtworkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asset: string
  badge?: string | number
  children?: ReactNode
}

/**
 * A semantic button whose visible surface comes from the supplied game artwork.
 * Copy stays in HTML so it remains readable, localisable, and accessible.
 */
export function ArtworkButton({
  asset,
  badge,
  children,
  className = '',
  type = 'button',
  ...props
}: ArtworkButtonProps) {
  return (
    <button className={`artwork-button ${className}`.trim()} type={type} {...props}>
      <GameImage asset={asset} className="artwork-button__image" alt="" aria-hidden="true" />
      {children && <span className="artwork-button__label">{children}</span>}
      {badge !== undefined && <span className="artwork-button__badge">{badge}</span>}
    </button>
  )
}
