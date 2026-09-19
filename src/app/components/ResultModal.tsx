import { format, useStrings } from '../../i18n'
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
  const strings = useStrings()
  const claimLabel = isClaimed ? strings.result.claimedLabel : strings.result.claim
  const doubleLabel = isClaimed ? strings.result.doubleClaimedLabel : strings.result.double

  return (
    <Modal open={open} className="result-modal" ariaLabel={strings.result.dialogAria}>
      <div className="result-modal__header">
        <GameImage asset="giftpink" className="result-modal__celebration" alt="" aria-hidden="true" />
        <h2>{strings.result.title}</h2>
        <div className="result-stars" aria-label={format(strings.result.starsAria, { stars })}>
          {[1, 2, 3].map((star) => <GameImage asset="stars" className={star <= stars ? 'is-earned' : ''} key={star} alt="" aria-hidden="true" />)}
        </div>
        <p>{stars === 3 ? strings.result.perfect : strings.result.good}</p>
      </div>

      <section className="result-rewards" aria-label={strings.result.rewards}>
        <div className="result-rewards__heading"><span>{strings.result.rewardLabel}</span><strong>🐾 {reward}</strong></div>
        <div className="result-rewards__actions">
          <ArtworkButton asset="rewards" className="result-rewards__button result-rewards__button--dark" disabled={isClaimed} aria-label={claimLabel} onClick={onClaim}>{isClaimed ? strings.result.claimed : strings.result.claim}</ArtworkButton>
          <ArtworkButton asset="watchad" className="result-rewards__button result-rewards__button--dark" disabled={isClaimed} aria-label={doubleLabel} onClick={onDouble}>{isClaimed ? strings.result.claimed : strings.result.double}</ArtworkButton>
        </div>
      </section>

      <nav className="result-nav" aria-label={strings.result.nav}>
        <ArtworkButton asset="levelselect" className="result-nav__button result-nav__button--dark" onClick={onLevelSelect}>{strings.result.levelNav}</ArtworkButton>
        <ArtworkButton asset="nextlevel" className="result-nav__button" onClick={onNextLevel}>{strings.result.next}</ArtworkButton>
        <ArtworkButton asset="replay" className="result-nav__button" onClick={onRestart}>{strings.result.replay}</ArtworkButton>
      </nav>
    </Modal>
  )
}
