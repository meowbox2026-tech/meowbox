import { useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)
  const day = streak % 7
  const amount = REWARDS[day]
  const rewardLabel = amount <= 2 ? `提示 ×${amount}` : `🐾 ${amount}`

  const doubleReward = async () => {
    setIsLoading(true)
    const result = await showRewardedAd('daily-double')
    setIsLoading(false)
    if (result.completed) onClaim(amount <= 2 ? amount : amount * 2)
  }

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose} className="daily-modal">
      <GameImage asset="giftpink" className="daily-modal__gift" alt="每日獎勵禮物" /><h2>每日獎勵</h2><p>今天也和貓咪一起，收下這份小確幸吧！</p>
      <div className="daily-days">{REWARDS.map((reward, index) => <div className={index === day && canClaim ? 'is-today' : index < day ? 'is-done' : ''} key={index}><small>Day {index + 1}</small><strong>{reward <= 2 ? '💡' : '🐾'}</strong><em>{reward <= 2 ? `×${reward}` : reward}</em></div>)}</div>
      {canClaim ? <><p className="daily-modal__current">今日可領：<strong>{rewardLabel}</strong></p><AppButton onClick={() => onClaim(amount)}>領取獎勵</AppButton><AppButton variant="purple" disabled={isLoading} onClick={() => void doubleReward()}>{isLoading ? '獎勵載入中…' : '▶ 看廣告 ×2'}</AppButton></> : <><p className="daily-modal__current">明天再回來，連續獎勵會更豐富！</p><AppButton variant="cream" onClick={onClose}>知道了</AppButton></>}
    </Modal>
  )
}
