import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DropMechanicsLayer } from './DropMechanicsLayer'
import type { DropWave } from '../core/dropEngine'

const wave: DropWave = {
  board: [[null]],
  after: [[null]],
  cells: [{ x: 1, y: 2 }],
  combo: 1,
  points: 30,
  damagedScratchPostIds: ['post'],
  collectedFishTreatIds: ['fish'],
  damagedScratchPosts: [{ id: 'post', x: 1, y: 2, hp: 1 }],
  collectedFishTreats: [{ id: 'fish', x: 2, y: 3 }],
  traitEffects: [
    { cell: { x: 1, y: 2 }, trait: 'scratch' },
    { cell: { x: 2, y: 2 }, trait: 'hungry' }
  ]
}

describe('drop mechanic effects', () => {
  it('renders cute, localized feedback for every mechanic event', () => {
    const { container } = render(<DropMechanicsLayer
      width={4}
      height={8}
      scratchPosts={[{ id: 'post', x: 1, y: 2, hp: 1 }]}
      fishTreats={[{ id: 'fish', x: 2, y: 3 }]}
      tunnels={[{ id: 'tunnel', entryColumn: 0, exitColumn: 3 }]}
      patrol={{ columns: [0, 2, 3], index: 1, dropsUntilMove: 1 }}
      wave={wave}
      routed
      routedColumn={3}
      patrolMoved
    />)

    expect(container.querySelector('[data-mechanic="scratch-post"]')).toHaveAttribute('data-hp', '1')
    expect(container.querySelector('[data-mechanic="fish-treat"]')).toBeInTheDocument()
    expect(container.querySelector('[data-tunnel-id="tunnel"]')).toBeInTheDocument()
    expect(container.querySelector('[data-mechanic="patrol"]')).toBeInTheDocument()
    expect(container).toHaveTextContent('爪爪！')
    expect(container).toHaveTextContent('喵♡')
    expect(container).toHaveTextContent('抓抓！')
    expect(container).toHaveTextContent('好吃！')
    expect(container).toHaveTextContent('穿過去！')
    expect(container).toHaveTextContent('跑跑～')
  })
})
