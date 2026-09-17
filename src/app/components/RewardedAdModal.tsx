import { useState } from 'react'
import { showRewardedAd, type RewardKind } from '../../services/ads/rewardedAds'
import { AppButton } from './AppButton'
import { GameImage } from './GameImage'
import { Modal } from './Modal'

interface RewardedAdModalProps {
  open: boolean
  kind: RewardKind
  title: string
  description: string
  onReward: () => void
  onClose: () => void
}

export function RewardedAdModal({ open, kind, title, description, onReward, onClose }: RewardedAdModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const watch = async () => {
    setIsLoading(true)
    const result = await showRewardedAd(kind)
    setIsLoading(false)
    if (result.completed) onReward()
  }

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose} className="reward-modal">
      <GameImage asset="watchad" className="reward-modal__art" alt="觀看廣告可獲得獎勵" />
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="reward-modal__mode">獎勵廣告測試模式</p>
      <AppButton variant="primary" onClick={() => void watch()} disabled={isLoading}>{isLoading ? '載入獎勵中…' : '觀看並領取'}</AppButton>
      <AppButton variant="cream" onClick={onClose} disabled={isLoading}>暫時不用</AppButton>
    </Modal>
  )
}
