import { useState } from 'react'
import { format, useStrings } from '../../i18n'
import { showRewardedAd } from '../../services/ads/rewardedAds'
import { AppButton } from './AppButton'
import { GameImage } from './GameImage'
import { Modal } from './Modal'

interface DailyRewardModalProps {
  open: boolean
  streak: number
  canClaim: boolean
  onClaim: (amount: number) => void
  onClose: () => void
}

const REWARDS = [50, 80, 1, 100, 150, 2, 300]

export function DailyRewardModal({ open, streak, canClaim, onClaim, onClose }: DailyRewardModalProps) {
  const strings = useStrings()
  const [isLoading, setIsLoading] = useState(false)
  const day = streak % 7
  const amount = REWARDS[day]
  const rewardLabel = amount <= 2 ? format(strings.daily.hintReward, { amount }) : format(strings.daily.coinReward, { amount })

  const doubleReward = async () => {
    setIsLoading(true)
    const result = await showRewardedAd('daily-double')
    setIsLoading(false)
    if (result.completed) onClaim(amount <= 2 ? amount : amount * 2)
  }

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose} className="daily-modal">
      <GameImage asset="giftpink" className="daily-modal__gift" alt={strings.daily.giftAlt} /><h2>{strings.daily.title}</h2><p>{strings.daily.desc}</p>
      <div className="daily-days">{REWARDS.map((reward, index) => <div className={index === day && canClaim ? 'is-today' : index < day ? 'is-done' : ''} key={index}><small>{format(strings.daily.day, { n: index + 1 })}</small><strong>{reward <= 2 ? '💡' : '🐾'}</strong><em>{reward <= 2 ? `×${reward}` : reward}</em></div>)}</div>
      {canClaim ? <><p className="daily-modal__current">{format(strings.daily.today, { reward: rewardLabel })}</p><AppButton onClick={() => onClaim(amount)}>{strings.daily.claim}</AppButton><AppButton variant="purple" disabled={isLoading} onClick={() => void doubleReward()}>{isLoading ? strings.daily.loading : strings.daily.watchAd}</AppButton></> : <><p className="daily-modal__current">{strings.daily.tomorrow}</p><AppButton variant="cream" onClick={onClose}>{strings.daily.gotIt}</AppButton></>}
    </Modal>
  )
}
