import { afterEach, describe, expect, it, vi } from 'vitest'
import { setUndoRewardAdGateway, showUndoRewardAd, type UndoRewardAdGateway } from './undoRewardAd'

describe('undo reward ads', () => {
  afterEach(() => {
    setUndoRewardAdGateway(undefined)
  })

  it('returns completion from the provider without granting uses locally', async () => {
    const gateway: UndoRewardAdGateway = { show: vi.fn().mockResolvedValue({ completed: true }) }
    setUndoRewardAdGateway(gateway)

    await expect(showUndoRewardAd()).resolves.toEqual({ completed: true })
    expect(gateway.show).toHaveBeenCalledOnce()
  })

  it('propagates provider failures so the current level receives no bonus', async () => {
    const gateway: UndoRewardAdGateway = { show: vi.fn().mockRejectedValue(new Error('no fill')) }
    setUndoRewardAdGateway(gateway)

    await expect(showUndoRewardAd()).rejects.toThrow('no fill')
  })
})
