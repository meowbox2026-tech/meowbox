import { Fragment } from 'react'
import { getCatAssetPath } from '../data/catAssets'
import { format, getDropCatName, useLocale, useStrings } from '../../i18n'
import type { CatAsset } from '../types'

export function DropPreview({ current, next, soon }: { current: string; next: string; soon?: string }) {
  const locale = useLocale()
  const strings = useStrings()
  const cats = [
    { slot: 'now', type: current, label: strings.game.now, alt: format(strings.game.nowAlt, { name: getDropCatName(current, locale) }) },
    { slot: 'next', type: next, label: strings.game.next, alt: format(strings.game.nextAlt, { name: getDropCatName(next, locale) }) },
    ...(soon ? [{ slot: 'soon', type: soon, label: strings.game.soon, alt: format(strings.game.soonAlt, { name: getDropCatName(soon, locale) }) }] : [])
  ]
  const isThreePreview = cats.length === 3

  return <section className="drop-preview" aria-label={isThreePreview ? strings.game.previewThree : strings.game.preview}>
    {cats.map((cat, index) => <Fragment key={`${cat.type}-${index}`}>
        {index > 0 && <span className="drop-preview__arrow" aria-hidden="true">→</span>}
        <div className={`drop-preview__cat drop-preview__cat--${cat.slot}`} data-cat-type={cat.type} data-preview-slot={cat.slot}>
          <span>{cat.label}</span>
          <img key={index === 0 ? `${cat.type}-${next}` : cat.type} src={getCatAssetPath(cat.type as CatAsset)} alt={cat.alt} draggable={false} />
        </div>
      </Fragment>)}
  </section>
}
