import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWebAdSenseGateways, getWebAdSenseConfig, loadAdSenseScript } from './webAdSense'

const config = { client: 'ca-pub-6662722631869742', bannerSlot: '123', isTesting: true }
type Break = { type: string; beforeReward?: (show: () => void) => void; adViewed?: () => void; adDismissed?: () => void; adBreakDone?: (info: { breakStatus: string }) => void }

function fakeWindow(behaviour: (options: Break) => void) {
  return { adBreak: vi.fn(behaviour) }
}

afterEach(() => { document.head.innerHTML = '' })

describe('web AdSense config', () => {
  it('accepts only well-formed ids and defaults to test mode', () => {
    expect(getWebAdSenseConfig({ VITE_ADSENSE_CLIENT: ' ca-pub-6662722631869742 ', VITE_ADSENSE_BANNER_SLOT: '42' }))
      .toEqual({ client: 'ca-pub-6662722631869742', bannerSlot: '42', isTesting: true })
    expect(getWebAdSenseConfig({ VITE_ADSENSE_CLIENT: 'evil"><script>', VITE_ADSENSE_BANNER_SLOT: 'x', VITE_ADSENSE_TESTING: 'false' }))
      .toEqual({ client: '', bannerSlot: '', isTesting: false })
  })

  it('injects the AdSense library once, flagged for test ads', () => {
    expect(loadAdSenseScript(config)).toBe(true)
    expect(loadAdSenseScript(config)).toBe(true)
    const scripts = document.querySelectorAll('script#meowbox-adsense')
    expect(scripts).toHaveLength(1)
    expect((scripts[0] as HTMLScriptElement).dataset.adbreakTest).toBe('on')
  })

  it('does nothing without a client id', () => {
    expect(createWebAdSenseGateways({ ...config, client: '' })).toBeUndefined()
  })
})

describe('web ad breaks', () => {
  it('reports a viewed interstitial', async () => {
    const win = fakeWindow((o) => o.adBreakDone?.({ breakStatus: 'viewed' }))
    await expect(createWebAdSenseGateways(config, win)!.interstitial.show()).resolves.toEqual({ shown: true })
    expect(win.adBreak.mock.calls[0][0].type).toBe('next')
  })

  it('grants the undo only when the reward ad is watched, not when skipped', async () => {
    const watched = fakeWindow((o) => { o.beforeReward?.(() => o.adViewed?.()); o.adBreakDone?.({ breakStatus: 'viewed' }) })
    await expect(createWebAdSenseGateways(config, watched)!.rewarded.show()).resolves.toEqual({ completed: true })
    const skipped = fakeWindow((o) => { o.beforeReward?.(() => o.adDismissed?.()); o.adBreakDone?.({ breakStatus: 'dismissed' }) })
    await expect(createWebAdSenseGateways(config, skipped)!.rewarded.show()).resolves.toEqual({ completed: false })
  })

  it('does not punish the player when no ad is available', async () => {
    const empty = fakeWindow((o) => o.adBreakDone?.({ breakStatus: 'frequencyCapped' }))
    await expect(createWebAdSenseGateways(config, empty)!.rewarded.show()).resolves.toEqual({ completed: true })
    await expect(createWebAdSenseGateways(config, empty)!.interstitial.show()).resolves.toEqual({ shown: false })
  })
})
