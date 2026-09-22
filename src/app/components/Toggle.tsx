type ToggleIcon = 'music' | 'sound' | 'haptics'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon: ToggleIcon
}

function ToggleIconGraphic({ icon }: { icon: ToggleIcon }) {
  return (
    <span aria-hidden="true" className={`settings-toggle__icon settings-toggle__icon--${icon}`}>
      <svg aria-hidden="true" fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 32 32">
        {icon === 'music' && <path fill="currentColor" d="M12 5v16.2a4.8 4.8 0 1 1-2-3.8V9.2L25 5v12.2a4.8 4.8 0 1 1-2-3.8V7.8L12 10.4V5Z" />}
        {icon === 'sound' && <>
          <path d="M4.5 12h5l6.2-5.2v18.4L9.5 20h-5z" fill="currentColor" />
          <path d="M20 12.5c1.9 2 1.9 5 0 7M23.2 9c3.4 3.7 3.4 9.3 0 13" />
        </>}
        {icon === 'haptics' && <>
          <rect height="21" rx="2.3" width="12" x="10" y="5.5" />
          <path d="M6.5 11v10M3.5 13.5v5M25.5 11v10M28.5 13.5v5M15 23.2h2" />
        </>}
      </svg>
    </span>
  )
}

export function Toggle({ label, checked, onChange, icon }: ToggleProps) {
  return (
    <label className="settings-toggle">
      <ToggleIconGraphic icon={icon} />
      <input aria-label={label} checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span aria-hidden="true" className="toggle-track"><span /></span>
    </label>
  )
}
