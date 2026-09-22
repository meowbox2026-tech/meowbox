import type { CSSProperties } from 'react'
import { patrolColumn } from '../core/dropRouting'
import type { DropWave } from '../core/dropEngine'
import type { CatTunnel, DropPatrol, FishTreat, ScratchPost } from '../core/dropTypes'
import { useStrings } from '../../i18n'

export function DropMechanicsLayer({ width, height, scratchPosts, fishTreats, tunnels, patrol, wave, routedColumn, routed = false, patrolMoved = false }: {
  width: number
  height: number
  scratchPosts: ScratchPost[]
  fishTreats: FishTreat[]
  tunnels: CatTunnel[]
  patrol?: DropPatrol
  wave?: DropWave
  routedColumn?: number
  routed?: boolean
  patrolMoved?: boolean
}) {
  const strings = useStrings()
  const blocked = patrolColumn({ patrol })
  return <div className="drop-mechanics" aria-hidden="true">
    {scratchPosts.filter((post) => post.hp > 0).map((post) => <span
      className={`drop-mechanic drop-mechanic--scratch${post.hp > 1 ? ' is-double' : ''}`}
      data-mechanic="scratch-post" data-hp={post.hp} key={post.id}
      style={{ left: `${post.x / width * 100}%`, top: `${post.y / height * 100}%` }}
    >🪵<small>{post.hp}</small></span>)}
    {fishTreats.map((treat) => <span
      className="drop-mechanic drop-mechanic--fish" data-mechanic="fish-treat" key={treat.id}
      style={{ left: `${treat.x / width * 100}%`, top: `${treat.y / height * 100}%` }}
    >🐟</span>)}
    {tunnels.map((tunnel) => <span className="drop-tunnel-route" data-tunnel-id={tunnel.id} key={tunnel.id}>
      <i style={{ left: `${tunnel.entryColumn / width * 100}%` }}>↘</i>
      <i style={{ left: `${tunnel.exitColumn / width * 100}%` }}>↗</i>
    </span>)}
    {blocked !== undefined && <span className="drop-patrol-block" data-mechanic="patrol" style={{ '--patrol-left': `${blocked / width * 100}%` } as CSSProperties}>🐾</span>}
    {wave?.damagedScratchPosts.map((post) => <span className="drop-effect drop-effect--scratch" key={`hit-${post.id}`} style={{ left: `${post.x / width * 100}%`, top: `${post.y / height * 100}%` }}>{strings.game.tutorialScratchEffect}</span>)}
    {wave?.collectedFishTreats.map((treat) => <span className="drop-effect drop-effect--fish" key={`eat-${treat.id}`} style={{ left: `${treat.x / width * 100}%`, top: `${treat.y / height * 100}%` }}>{strings.game.tutorialFishEffect}</span>)}
    {wave?.traitEffects.map(({ cell, trait }, index) => <span className={`drop-effect drop-effect--trait-${trait}`} key={`trait-${cell.x}-${cell.y}-${index}`} style={{ left: `${cell.x / width * 100}%`, top: `${cell.y / height * 100}%` }}>{trait === 'scratch' ? strings.game.traitScratchEffect : strings.game.tutorialHungryEffect}</span>)}
    {routed && routedColumn !== undefined && <span className="drop-effect drop-effect--tunnel" style={{ left: `${routedColumn / width * 100}%` }}>{strings.game.tutorialTunnelEffect}</span>}
    {patrolMoved && <span className="drop-effect drop-effect--patrol">{strings.game.tutorialPatrolEffect}</span>}
  </div>
}
