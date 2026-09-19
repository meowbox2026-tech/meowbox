import { useStrings } from '../../i18n'
import { GameImage } from './GameImage'
import { Modal } from './Modal'

interface PauseModalProps {
  open: boolean
  onContinue: () => void
  onRestart: () => void
  onHome: () => void
  onSettings: () => void
}

/** Keeps the supplied pause-panel artwork and its functional hit areas together. */
export function PauseModal({ open, onContinue, onRestart, onHome, onSettings }: PauseModalProps) {
  const strings = useStrings()
  return (
    <Modal open={open} className="pause-modal" onClose={onContinue} ariaLabel={strings.pause.dialogAria}>
      <div className="pause-panel">
        <GameImage asset="paused" alt={strings.pause.pausedAlt} />
        <h2 className="pause-panel__title">{strings.pause.title}</h2>
        <button className="pause-panel__close" type="button" onClick={onContinue} aria-label={strings.pause.close} />
        <button className="pause-panel__continue" type="button" onClick={onContinue}><span>{strings.pause.continue}</span></button>
        <button className="pause-panel__restart" type="button" onClick={onRestart}><span>{strings.pause.restart}</span></button>
        <button className="pause-panel__home" type="button" onClick={onHome}><span>{strings.pause.home}</span></button>
        <button className="pause-panel__settings" type="button" onClick={onSettings}><span>{strings.pause.settings}</span></button>
      </div>
    </Modal>
  )
}
