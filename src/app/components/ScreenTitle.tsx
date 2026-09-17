import type { ReactNode } from 'react'

import { GameImage } from './GameImage'

interface ScreenTitleProps {
  title: string
  subtitle?: string
  mascot?: ReactNode
}

export function ScreenTitle({ title, subtitle, mascot }: ScreenTitleProps) {
  return (
    <div className="screen-title">
      <GameImage asset="shopsign" className="screen-title__art" alt="" aria-hidden="true" />
      {mascot && <div className="screen-title__mascot">{mascot}</div>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
