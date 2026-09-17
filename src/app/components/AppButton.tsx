import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { GameImage } from './GameImage'

type ButtonVariant = 'primary' | 'blue' | 'purple' | 'cream' | 'pink' | 'icon'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: string
  children?: ReactNode
  badge?: string | number
}

export function AppButton({
  variant = 'primary',
  icon,
  children,
  badge,
  className = '',
  type = 'button',
  ...props
}: AppButtonProps) {
  return (
    <button className={`app-button app-button--${variant} ${className}`} type={type} {...props}>
      {icon && <GameImage asset={icon} className="app-button__icon" alt="" aria-hidden="true" />}
      {children && <span className="app-button__label">{children}</span>}
      {badge !== undefined && <span className="app-button__badge">{badge}</span>}
    </button>
  )
}
