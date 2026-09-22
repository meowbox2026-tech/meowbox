import { Fragment } from 'react'
import { getCatAssetPath } from '../data/catAssets'
import { format, getDropCatName, useLocale, useStrings } from '../../i18n'
import type { CatAsset } from '../types'
import type { CatToken, CatTrait } from '../core/dropTypes'

interface PreviewProps {
  current: string
  next: string
  soon?: string
  later?: string
  currentTrait?: CatTrait
  nextTrait?: CatTrait
  soonTrait?: CatTrait
  laterTrait?: CatTrait
  tokens?: CatToken[]
  previewCount?: 2 | 3 | 4
}

const slots = ['now', 'next', 'soon', 'later'] as const

export function DropPreview({ current, next, soon, later, currentTrait = 'none', nextTrait = 'none', soonTrait = 'none', laterTrait = 'none', tokens, previewCount }: PreviewProps) {
  const locale = useLocale()
  const strings = useStrings()
  const fallback: CatToken[] = [
    { type: current, trait: currentTrait },
    { type: next, trait: nextTrait },
    ...(soon ? [{ type: soon, trait: soonTrait }] : []),
    ...(later ? [{ type: later, trait: laterTrait }] : [])
  ]
  const cats = (tokens?.length ? tokens : fallback).slice(0, previewCount ?? fallback.length)
  const labelFor = (slot: string): string => slot === 'now' ? strings.game.now : slot === 'next' ? strings.game.next : slot === 'soon' ? strings.game.soon : strings.game.later
  const altFor = (slot: string, name: string): string => slot === 'now'
    ? format(strings.game.nowAlt, { name })
    : slot === 'next' ? format(strings.game.nextAlt, { name })
      : slot === 'soon' ? format(strings.game.soonAlt, { name }) : format(strings.game.laterAlt, { name })
  const traitLabel = (trait: CatTrait): string => trait === 'scratch' ? strings.game.traitScratch : trait === 'hungry' ? strings.game.traitHungry : ''
  const previewLabel = cats.length === 4 ? strings.game.previewFour : cats.length === 3 ? strings.game.previewThree : strings.game.preview

  return <section className={`drop-preview drop-preview--${cats.length}`} aria-label={previewLabel}>
    {cats.map((cat, index) => {
      const slot = slots[index]
      const name = getDropCatName(cat.type, locale)
      const ability = traitLabel(cat.trait)
      return <Fragment key={`${cat.type}-${cat.trait}-${index}`}>
        {index > 0 && <span className="drop-preview__arrow" aria-hidden="true">→</span>}
        <div className={`drop-preview__cat drop-preview__cat--${slot}`} data-cat-type={cat.type} data-preview-slot={slot} data-trait={cat.trait}>
          <span>{labelFor(slot)}</span>
          <img key={`${cat.type}-${index}`} src={getCatAssetPath(cat.type as CatAsset)} alt={altFor(slot, name)} draggable={false} />
          {ability && <b className="drop-preview__trait" aria-label={ability}>{ability}</b>}
        </div>
      </Fragment>
    })}
  </section>
}
