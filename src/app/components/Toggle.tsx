interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon: string
}

export function Toggle({ label, description, checked, onChange, icon }: ToggleProps) {
  return (
    <label className="settings-toggle">
      <span className="settings-toggle__icon">{icon}</span>
      <span className="settings-toggle__copy"><strong>{label}</strong>{description && <small>{description}</small>}</span>
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-track"><span /></span>
    </label>
  )
}
