import { useEffect } from 'react'
import { CAT_LONG_PAW_DURATION_MS, CAT_LONG_PAW_PATH, type CatPawDirection } from '../../game/animation/catPaw'
import { CAT_SPRITE_SHEETS, type CatSpriteSheetName } from '../../game/animation/spriteSheet'

export type CatSpectacleKind =
  | 'idle'
  | 'pickup'
  | 'drop'
  | 'invalid'
  | 'combo'
  | 'paw'
  | 'run'
  | 'peek'
  | 'complete'
  | 'failed'

export type CatSpectacleAnchor = 'center' | 'bottom-left' | 'bottom-right'

export interface CatSpectacle {
  id: number
  kind: CatSpectacleKind
  side?: 'left' | 'right'
  anchor?: CatSpectacleAnchor
  direction?: CatPawDirection
}

const TRANSIENT_DURATIONS: Record<Exclude<CatSpectacleKind, 'idle' | 'run' | 'paw' | 'peek'>, number> = {
  pickup: 300,
  drop: 520,
  invalid: 360,
  combo: 820,
  complete: 1320,
  failed: 1080
}

const RUN_ACROSS_SCREEN_DURATION = 1220
const IDLE_SETTLE_BUFFER_MS = 96
export const CAT_PEEK_INTERVAL_MS = 10_000

export function getCatSpectacleDuration(kind: CatSpectacleKind): number {
  if (kind === 'run') return RUN_ACROSS_SCREEN_DURATION
  if (kind === 'idle') return CAT_SPRITE_SHEETS.idle.durationMs + IDLE_SETTLE_BUFFER_MS
  if (kind === 'paw') return CAT_LONG_PAW_DURATION_MS
  if (kind === 'peek') return CAT_SPRITE_SHEETS['peek-top'].durationMs
  return TRANSIENT_DURATIONS[kind]
}

export function getRandomDropAnchor(random: () => number = Math.random): CatSpectacleAnchor {
  const anchors: CatSpectacleAnchor[] = ['center', 'bottom-left', 'bottom-right']
  const index = Math.min(anchors.length - 1, Math.floor(Math.max(0, random()) * anchors.length))
  return anchors[index]
}

export interface CatSpectacleOverlayProps {
  effect?: CatSpectacle
  onComplete?: (effectId: number) => void
}

export function CatSpectacleOverlay({ effect, onComplete }: CatSpectacleOverlayProps) {
  useEffect(() => {
    if (!effect || !onComplete) return undefined

    const timer = window.setTimeout(() => onComplete(effect.id), getCatSpectacleDuration(effect.kind))
    return () => window.clearTimeout(timer)
  }, [effect, onComplete])

  if (!effect) return null

  const side = effect.side ?? 'left'
  const spriteSheet = getSpriteSheet(effect.kind)

  return (
    <div
      className={`cat-spectacle-layer cat-spectacle-layer--${effect.kind}`}
      data-effect-kind={effect.kind}
      data-testid="cat-spectacle-layer"
      aria-hidden="true"
    >
      {effect.kind === 'run' && (
        <div
          className={`cat-spectacle__runner cat-spectacle__runner--${side}`}
          data-testid="cat-spectacle-runner"
        >
          <CatSprite sheet="run" className="cat-sprite--run" />
        </div>
      )}

      {effect.kind === 'paw' && (
        <div
          className={`cat-spectacle__long-paw cat-spectacle__long-paw--${effect.direction ?? 'top'}`}
          data-direction={effect.direction ?? 'top'}
          data-testid="cat-spectacle-paw"
        >
          <img
            className="cat-spectacle__long-paw-image"
            data-testid="cat-spectacle-paw-image"
            src={CAT_LONG_PAW_PATH}
            alt=""
            draggable="false"
          />
        </div>
      )}

      {effect.kind === 'peek' && (
        <div className="cat-spectacle__peek cat-spectacle__peek--board-behind" data-direction="top" data-testid="cat-spectacle-peek">
          <CatSprite sheet="peek-top" className="cat-sprite--peek-top" />
        </div>
      )}

      {spriteSheet && effect.kind !== 'run' && effect.kind !== 'paw' && effect.kind !== 'peek' && (
        <div
          className={`cat-spectacle__gesture cat-gesture--${effect.kind} ${getGestureAnchorClass(effect)}`}
          data-testid="cat-spectacle-gesture"
        >
          <CatSprite sheet={spriteSheet} className={`cat-sprite--${spriteSheet}${effect.kind === 'combo' ? ' cat-sprite--combo' : ''}`} />
        </div>
      )}

      {!spriteSheet && effect.kind !== 'run' && effect.kind !== 'paw' && effect.kind !== 'peek' && (
        <div
          className={`cat-spectacle__gesture cat-gesture--${effect.kind} ${getGestureAnchorClass(effect)}`}
          data-testid="cat-spectacle-gesture"
        >
          <span className="cat-gesture__symbol">{getGestureSymbol(effect.kind)}</span>
          {effect.kind === 'drop' && <span className="cat-gesture__dust">✦　✦</span>}
        </div>
      )}
    </div>
  )
}

function getGestureAnchorClass(effect: CatSpectacle): string {
  if (effect.anchor) return `cat-spectacle__gesture--${effect.anchor}`
  return `cat-spectacle__gesture--${effect.side ?? 'left'}`
}

function getSpriteSheet(kind: CatSpectacleKind): CatSpriteSheetName | undefined {
  if (kind === 'idle' || kind === 'combo' || kind === 'complete' || kind === 'failed') return 'idle'
  return undefined
}

function CatSprite({ sheet, className }: { sheet: CatSpriteSheetName; className: string }) {
  return (
    <span
      className={`cat-spectacle__sprite cat-sprite ${className}`}
      data-sheet={sheet}
      data-testid="cat-spectacle-sprite"
      style={{ backgroundImage: `url(${CAT_SPRITE_SHEETS[sheet].path})` }}
    />
  )
}

function getGestureSymbol(kind: CatSpectacleKind): string {
  if (kind === 'pickup') return '↑'
  if (kind === 'drop') return '噗'
  return '✦'
}
