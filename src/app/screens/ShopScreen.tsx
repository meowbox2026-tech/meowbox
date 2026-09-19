import { useState } from 'react'
import { format, getBoxName, getCatSkinName, useLocale, useStrings } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { CatPortrait } from '../components/CatPortrait'
import { GameImage } from '../components/GameImage'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'

const SHOP_CATS = [
  { id: 'black', price: 1500 },
  { id: 'gray', price: 1500 },
  { id: 'white', price: 2000 },
  { id: 'calico', price: 2000 }
]

const BOXES = [
  { id: 'classic', price: 0, tone: 'classic' },
  { id: 'strawberry', price: 1000, tone: 'strawberry' },
  { id: 'night', price: 1000, tone: 'night' },
  { id: 'garden', price: 1500, tone: 'garden' }
]

interface ShopScreenProps {
  onBack: () => void
  onToast: (message: string) => void
}

export function ShopScreen({ onBack, onToast }: ShopScreenProps) {
  const { player, addCoins, purchaseSkin, selectSkin } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const [tab, setTab] = useState<'coins' | 'cats' | 'boxes'>('coins')

  const buyCat = (skinId: string, price: number) => {
    if (purchaseSkin('cat', skinId, price)) onToast(strings.shop.newCat)
    else onToast(strings.shop.notEnough)
  }

  const buyBox = (boxId: string, price: number) => {
    if (purchaseSkin('box', boxId, price)) {
      selectSkin('box', boxId)
      onToast(strings.shop.newBox)
    } else onToast(strings.shop.notEnough)
  }

  return (
    <main className="screen screen--shop">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title={strings.shop.title} subtitle={strings.shop.subtitle} />
      <div className="shop-tabs">
        <button className={tab === 'coins' ? 'is-active' : ''} onClick={() => setTab('coins')} type="button"><GameImage asset="coins" alt="" aria-hidden="true" /><span>{strings.shop.coinsTab}</span></button>
        <button className={tab === 'cats' ? 'is-active' : ''} onClick={() => setTab('cats')} type="button"><GameImage asset="collect" alt="" aria-hidden="true" /><span>{strings.shop.catsTab}</span></button>
        <button className={tab === 'boxes' ? 'is-active' : ''} onClick={() => setTab('boxes')} type="button"><GameImage asset="gift" alt="" aria-hidden="true" /><span>{strings.shop.boxesTab}</span></button>
      </div>
      {tab === 'coins' && <section className="shop-section"><div className="shop-section__heading"><h2><GameImage asset="coins" alt="" aria-hidden="true" /> Paw Coins</h2><span>{strings.shop.coinsDesc}</span></div><div className="coin-pack-grid">{[1000, 3000, 10000, 30000].map((amount) => <article className="coin-pack" key={amount}><GameImage asset="coins" className="coin-pack__art" alt="" aria-hidden="true" /><strong>{amount.toLocaleString()}</strong><small>Paw Coins</small><AppButton variant="primary" onClick={() => { addCoins(amount); onToast(format(strings.shop.testClaimed, { amount: amount.toLocaleString() })) }}>{strings.shop.claim}</AppButton></article>)}</div><p className="shop-disclaimer">{strings.shop.disclaimer}</p></section>}
      {tab === 'cats' && <section className="shop-section"><div className="shop-section__heading"><h2><GameImage asset="collect" alt="" aria-hidden="true" /> {strings.shop.catsHeading}</h2><span>{strings.shop.catsDesc}</span></div><div className="shop-item-grid">{SHOP_CATS.map((cat) => { const owned = player.unlockedCatSkins.includes(cat.id); return <article className="shop-item" key={cat.id}><CatPortrait skin={cat.id} small /><strong>{getCatSkinName(cat.id, locale)}</strong><AppButton icon={owned ? undefined : 'coins'} variant={owned ? 'cream' : 'primary'} onClick={() => owned ? selectSkin('cat', cat.id) : buyCat(cat.id, cat.price)}>{owned ? strings.shop.use : cat.price.toLocaleString()}</AppButton></article> })}</div></section>}
      {tab === 'boxes' && <section className="shop-section"><div className="shop-section__heading"><h2><GameImage asset="gift" alt="" aria-hidden="true" /> {strings.shop.boxesHeading}</h2><span>{strings.shop.boxesDesc}</span></div><div className="shop-item-grid">{BOXES.map((box) => { const owned = player.unlockedBoxSkins.includes(box.id); return <article className="shop-item" key={box.id}><span className={`box-swatch box-swatch--${box.tone}`}>📦</span><strong>{getBoxName(box.id, locale)}</strong><AppButton icon={owned ? undefined : 'coins'} variant={owned ? 'cream' : 'primary'} onClick={() => owned ? selectSkin('box', box.id) : buyBox(box.id, box.price)}>{owned ? player.selectedBoxSkin === box.id ? strings.shop.using : strings.shop.use : box.price.toLocaleString()}</AppButton></article> })}</div></section>}
      <section className="remove-ads"><CatPortrait skin="gray" small sleeping /><div><strong>{strings.shop.removeAdsTitle}</strong><small>{strings.shop.removeAdsDesc}</small></div><AppButton variant="pink" onClick={() => onToast(strings.shop.removeAdsToast)}>NT$ 90</AppButton></section>
    </main>
  )
}
