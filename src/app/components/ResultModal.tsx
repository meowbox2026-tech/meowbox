import { ArtworkButton } from './ArtworkButton'
import { GameImage } from './GameImage'
import { Modal } from './Modal'

interface ResultModalProps {
  open: boolean
  stars: number
  reward: number
  isClaimed: boolean
  onClaim: () => void
  onDouble: () => void
  onLevelSelect: () => void
  onNextLevel: () => void
  onRestart: () => void
}

export function ResultModal({
  open,
  stars,
  reward,
  isClaimed,
  onClaim,
  onDouble,
  onLevelSelect,
  onNextLevel,
  onRestart,
}: ResultModalProps) {
  const claimLabel = isClaimed ? '已領取獎勵' : '領取獎勵'
  const doubleLabel = isClaimed ? '雙倍獎勵已領取' : '雙倍獎勵'

  return (
    <Modal open={open} className="result-modal" ariaLabel="過關囉！">
      <div className="result-modal__header">
        <GameImage asset="giftpink" className="result-modal__celebration" alt="" aria-hidden="true" />
        <h2>過關囉！</h2>
        <div className="result-stars" aria-label={`${stars} 顆星`}>
          {[1, 2, 3].map((star) => <GameImage asset="stars" className={star <= stars ? 'is-earned' : ''} key={star} alt="" aria-hidden="true" />)}
        </div>
        <p>{stars === 3 ? '太完美了！' : '完成得很棒，再挑戰三星吧！'}</p>
      </div>

      <section className="result-rewards" aria-label="過關獎勵">
        <div className="result-rewards__heading"><span>獎勵</span><strong>🐾 {reward}</strong></div>
        <div className="result-rewards__actions">
          <ArtworkButton asset="rewards" className="result-rewards__button result-rewards__button--dark" disabled={isClaimed} aria-label={claimLabel} onClick={onClaim}>{isClaimed ? '已領取' : '領取獎勵'}</ArtworkButton>
          <ArtworkButton asset="watchad" className="result-rewards__button result-rewards__button--dark" disabled={isClaimed} aria-label={doubleLabel} onClick={onDouble}>{isClaimed ? '已領取' : '雙倍獎勵'}</ArtworkButton>
        </div>
      </section>

      <nav className="result-nav" aria-label="過關後操作">
        <ArtworkButton asset="levelselect" className="result-nav__button result-nav__button--dark" onClick={onLevelSelect}>關卡</ArtworkButton>
        <ArtworkButton asset="nextlevel" className="result-nav__button" onClick={onNextLevel}>下一關</ArtworkButton>
        <ArtworkButton asset="replay" className="result-nav__button" onClick={onRestart}>重玩</ArtworkButton>
      </nav>
    </Modal>
  )
}
