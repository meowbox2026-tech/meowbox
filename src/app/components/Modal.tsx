import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  children: ReactNode
  className?: string
  onClose?: () => void
  ariaLabel?: string
}

export function Modal({ open, children, className = '', onClose, ariaLabel }: ModalProps) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal-card ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  )
}
