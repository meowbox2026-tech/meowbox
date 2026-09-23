import { useEffect, useState } from 'react'
import { format, useStrings } from '../../i18n'
import { DEMO_INTERSTITIAL_DURATION_MS } from '../../services/ads/interstitialAds'
import { Modal } from './Modal'

interface AdBreakModalProps {
  open: boolean
}

export function AdBreakModal({ open }: AdBreakModalProps) {
  const strings = useStrings()
  const [remainingMs, setRemainingMs] = useState(DEMO_INTERSTITIAL_DURATION_MS)

  useEffect(() => {
    if (!open) return undefined
    const startedAt = Date.now()
    const update = () => setRemainingMs(Math.max(0, DEMO_INTERSTITIAL_DURATION_MS - (Date.now() - startedAt)))
    update()
    const timer = window.setInterval(update, 250)
    return () => window.clearInterval(timer)
  }, [open])

  const remainingSeconds = Math.ceil(remainingMs / 1000)
  return <Modal open={open} ariaLabel={strings.ads.dialogAria} className="ad-break-modal">
    <div className="ad-break-modal__mark" aria-hidden="true">AD</div>
    <h2>{strings.ads.title}</h2>
    <p>{strings.ads.description}</p>
    <strong>{remainingSeconds > 0 ? format(strings.ads.remaining, { seconds: remainingSeconds }) : strings.ads.ready}</strong>
  </Modal>
}
