import { useEffect, useRef, useState } from 'react'
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
  const [error, setError] = useState<string>()
  const inFlight = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const watch = async () => {
    if (inFlight.current) return
    inFlight.current = true
    setIsLoading(true)
    setError(undefined)
    try {
      const result = await showRewardedAd(kind)
      if (!mounted.current) return
      if (result.completed && result.kind === kind) onReward()
      else setError('尚未完成觀看，沒有使用獎勵次數。可以再試一次。')
    } catch {
      if (mounted.current) setError('廣告暫時無法播放，請稍後再試。獎勵次數沒有扣除。')
    } finally {
      inFlight.current = false
      if (mounted.current) setIsLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose} className="reward-modal">
      <GameImage asset="watchad" className="reward-modal__art" alt="觀看廣告可獲得獎勵" />
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="reward-modal__mode">獎勵廣告測試模式</p>
      {error && <p role="alert">{error}</p>}
      <AppButton variant="primary" onClick={() => void watch()} disabled={isLoading}>{isLoading ? '載入獎勵中…' : '觀看並領取'}</AppButton>
      <AppButton variant="cream" onClick={onClose} disabled={isLoading}>暫時不用</AppButton>
    </Modal>
  )
}
