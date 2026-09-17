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
  return (
    <Modal open={open} className="pause-modal" onClose={onContinue} ariaLabel="暫停選單">
      <div className="pause-panel">
        <GameImage asset="paused" alt="遊戲已暫停" />
        <h2 className="pause-panel__title">暫停</h2>
        <button className="pause-panel__close" type="button" onClick={onContinue} aria-label="關閉暫停選單" />
        <button className="pause-panel__continue" type="button" onClick={onContinue}><span>繼續遊戲</span></button>
        <button className="pause-panel__restart" type="button" onClick={onRestart}><span>重新開始本關</span></button>
        <button className="pause-panel__home" type="button" onClick={onHome}><span>回到主頁</span></button>
        <button className="pause-panel__settings" type="button" onClick={onSettings}><span>設定</span></button>
      </div>
    </Modal>
  )
}
