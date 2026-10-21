import type { InterstitialAdGateway } from './interstitialAds'
import type { UndoRewardAdGateway } from './undoRewardAd'

/**
 * Browser ads use Google AdSense: the H5 Games Ads Ad Placement API
 * (`adBreak`) for interstitial/rewarded breaks and a display unit for the
 * in-game banner. Google's own CMP (AdSense privacy messaging) handles consent.
 */
export interface WebAdSenseConfig {
  client: string
  bannerSlot: string
  isTesting: boolean
}

type Environment = Record<string, string | boolean | undefined>
const clean = (value: string | boolean | undefined) => typeof value === 'string' ? value.trim() : ''
const CLIENT_PATTERN = /^ca-pub-\d{10,20}$/
// Public identifiers (they ship in page markup anyway); env vars can override them.
const DEFAULT_CLIENT = 'ca-pub-6662722631869742'
const DEFAULT_BANNER_SLOT = '3638501215'

export function getWebAdSenseConfig(environment: Environment = import.meta.env): WebAdSenseConfig {
  const client = clean(environment.VITE_ADSENSE_CLIENT) || DEFAULT_CLIENT
  const bannerSlot = clean(environment.VITE_ADSENSE_BANNER_SLOT) || DEFAULT_BANNER_SLOT
  const testing = clean(environment.VITE_ADSENSE_TESTING)
  return {
    client: CLIENT_PATTERN.test(client) ? client : '',
    bannerSlot: /^\d+$/.test(bannerSlot) ? bannerSlot : '',
    // Test ads everywhere except production builds, unless explicitly overridden.
    isTesting: testing ? testing !== 'false' : environment.PROD !== true
  }
}

export const hasWebAdSense = (config: WebAdSenseConfig = getWebAdSenseConfig()) => Boolean(config.client)
/** Local dev keeps the timed demo and preview box instead of live AdSense. */
export const isWebAdSenseActive = (isDev: boolean = import.meta.env.DEV) => !isDev && hasWebAdSense()

interface PlacementInfo { breakStatus?: string }
interface AdBreakOptions {
  type: 'next' | 'reward'
  name: string
  beforeAd?: () => void
  afterAd?: () => void
  beforeReward?: (showAdFn: () => void) => void
  adDismissed?: () => void
  adViewed?: () => void
  adBreakDone?: (info: PlacementInfo) => void
}
interface AdSenseWindow {
  adsbygoogle?: unknown[]
  adBreak?: (options: AdBreakOptions) => void
  adConfig?: (options: Record<string, unknown>) => void
}

const SCRIPT_ID = 'meowbox-adsense'
const configuredWindows = new WeakSet<object>()
/** Safety net: a stuck provider must never freeze the game. */
const BREAK_TIMEOUT_MS = 90000

export function loadAdSenseScript(config: WebAdSenseConfig, doc: Document = document): boolean {
  if (!config.client) return false
  const win = doc.defaultView as (Window & AdSenseWindow) | null
  if (!win) return false
  win.adsbygoogle = win.adsbygoogle ?? []
  // Official H5 Games Ads bootstrap: queue calls until the library loads.
  const queue = (options: unknown) => { win.adsbygoogle!.push(options) }
  win.adBreak = win.adBreak ?? queue
  win.adConfig = win.adConfig ?? queue
  // index.html already injects the tag on the production host so reviewers see it before the game starts.
  if (!doc.getElementById(SCRIPT_ID)) {
    const script = doc.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.client)}`
    script.dataset.adFrequencyHint = '30s'
    if (config.isTesting) script.dataset.adbreakTest = 'on'
    doc.head.appendChild(script)
  }
  if (!configuredWindows.has(win)) {
    configuredWindows.add(win)
    win.adConfig?.({ preloadAdBreaks: 'on', sound: 'on' })
  }
  return true
}

function runAdBreak(win: AdSenseWindow, options: Omit<AdBreakOptions, 'adBreakDone'>): Promise<PlacementInfo & { viewed: boolean; dismissed: boolean }> {
  return new Promise((resolve) => {
    let viewed = false
    let dismissed = false
    let settled = false
    const finish = (info: PlacementInfo) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve({ ...info, viewed, dismissed })
    }
    const timer = window.setTimeout(() => finish({ breakStatus: 'timeout' }), BREAK_TIMEOUT_MS)
    try {
      win.adBreak!({
        ...options,
        adViewed: () => { viewed = true },
        adDismissed: () => { dismissed = true },
        adBreakDone: finish
      })
    } catch {
      finish({ breakStatus: 'error' })
    }
  })
}

export function createWebAdSenseGateways(config: WebAdSenseConfig, win: AdSenseWindow = window as unknown as AdSenseWindow):
  { interstitial: InterstitialAdGateway; rewarded: UndoRewardAdGateway } | undefined {
  if (!config.client) return undefined
  const ready = () => loadAdSenseScript(config) && typeof win.adBreak === 'function'
  return {
    interstitial: {
      async show() {
        if (!ready()) return { shown: false }
        const result = await runAdBreak(win, { type: 'next', name: 'level-start' })
        return { shown: result.breakStatus === 'viewed' }
      }
    },
    rewarded: {
      async show() {
        // Without the library the player must still be able to undo.
        if (!ready()) return { completed: true }
        const result = await runAdBreak(win, {
          type: 'reward',
          name: 'undo-reward',
          // The player already confirmed in our own dialog, so start immediately.
          beforeReward: (showAdFn) => showAdFn()
        })
        if (result.viewed) return { completed: true }
        if (result.dismissed) return { completed: false }
        // No fill / frequency cap: don't punish the player for missing inventory.
        return { completed: result.breakStatus !== 'dismissed' }
      }
    }
  }
}

let cached: ReturnType<typeof createWebAdSenseGateways> | null | undefined
export function getWebAdSenseGateways() {
  if (cached === undefined) cached = typeof window === 'undefined' || !isWebAdSenseActive() ? null : createWebAdSenseGateways(getWebAdSenseConfig()) ?? null
  return cached ?? undefined
}

export function pushAdSenseSlot(): void {
  const win = window as unknown as AdSenseWindow
  win.adsbygoogle = win.adsbygoogle ?? []
  win.adsbygoogle.push({})
}
