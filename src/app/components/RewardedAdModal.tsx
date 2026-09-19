import { useEffect, useRef, useState } from 'react'
import { useStrings } from '../../i18n'
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
  const strings = useStrings()
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
      else setError(strings.rewarded.incomplete)
    } catch {
      if (mounted.current) setError(strings.rewarded.unavailable)
    } finally {
      inFlight.current = false
      if (mounted.current) setIsLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose} className="reward-modal">
      <GameImage asset="watchad" className="reward-modal__art" alt={strings.rewarded.watchAlt} />
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="reward-modal__mode">{strings.rewarded.testMode}</p>
      {error && <p role="alert">{error}</p>}
      <AppButton variant="primary" onClick={() => void watch()} disabled={isLoading}>{isLoading ? strings.rewarded.loadingClaim : strings.rewarded.watchAndClaim}</AppButton>
      <AppButton variant="cream" onClick={onClose} disabled={isLoading}>{strings.rewarded.later}</AppButton>
    </Modal>
  )
}
