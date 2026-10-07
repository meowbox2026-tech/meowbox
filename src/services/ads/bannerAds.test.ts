import { describe, expect, it, vi } from 'vitest'
import { BannerAdPosition, BannerAdSize } from '@capacitor-community/admob'
import { createBannerController } from './bannerAds'

function setup(overrides = {}) {
  const client = { showBanner: vi.fn().mockResolvedValue(undefined), removeBanner: vi.fn().mockResolvedValue(undefined) }
  const initialize = vi.fn().mockResolvedValue(true)
  const controller = createBannerController({ platform: 'ios', isTesting: true, adId: '', initialize, client, ...overrides })
  return { controller, client, initialize }
}

describe('game banner lifecycle', () => {
  it('shows a fixed test banner after consent and removes it on departure', async () => {
    const { controller, client, initialize } = setup()
    await controller.setVisible(true)
    expect(initialize).toHaveBeenCalledOnce()
    expect(client.showBanner).toHaveBeenCalledWith(expect.objectContaining({
      adId: 'ca-app-pub-3940256099942544/2934735716', adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER, isTesting: true
    }))
    await controller.setVisible(true)
    expect(client.showBanner).toHaveBeenCalledOnce()
    await controller.setVisible(false)
    expect(client.removeBanner).toHaveBeenCalledOnce()
  })
  it.each([{ platform: 'web' }, { isTesting: false }, { initialize: async () => false }])('does not request ads without native configuration and consent: %j', async overrides => {
    const { controller, client } = setup(overrides)
    await controller.setVisible(true)
    expect(client.showBanner).not.toHaveBeenCalled()
  })
  it('uses the configured production unit only when test mode is disabled', async () => {
    const { controller, client } = setup({ isTesting: false, adId: 'production-banner' })
    await controller.setVisible(true)
    expect(client.showBanner).toHaveBeenCalledWith(expect.objectContaining({ adId: 'production-banner', isTesting: false }))
  })
  it('cancels a pending show when leaving during initialization', async () => {
    let ready!: (value: boolean) => void
    const { controller, client } = setup({ initialize: vi.fn(() => new Promise<boolean>(resolve => { ready = resolve })) })
    const showing = controller.setVisible(true)
    await Promise.resolve()
    const leaving = controller.setVisible(false)
    ready(true)
    await Promise.all([showing, leaving])
    expect(client.showBanner).not.toHaveBeenCalled()
  })
  it('removes a banner that finishes loading after leaving', async () => {
    let loaded!: () => void
    const { controller, client } = setup()
    client.showBanner.mockImplementation(() => new Promise<void>(resolve => { loaded = resolve }))
    const showing = controller.setVisible(true)
    await Promise.resolve()
    await Promise.resolve()
    const leaving = controller.setVisible(false)
    loaded()
    await Promise.all([showing, leaving])
    expect(client.removeBanner).toHaveBeenCalledOnce()
  })
  it('cleans up failed loads and permits retry', async () => {
    const { controller, client } = setup()
    client.showBanner.mockRejectedValueOnce(new Error('offline'))
    await controller.setVisible(true)
    expect(client.removeBanner).toHaveBeenCalledOnce()
    await controller.setVisible(true)
    expect(client.showBanner).toHaveBeenCalledTimes(2)
  })
})
