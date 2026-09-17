import { useState } from 'react'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { CatPortrait } from '../components/CatPortrait'
import { GameImage } from '../components/GameImage'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'

const SHOP_CATS = [
  { id: 'black', name: '黑貓', price: 1500 },
  { id: 'gray', name: '灰白貓', price: 1500 },
  { id: 'white', name: '白貓', price: 2000 },
  { id: 'calico', name: '三花貓', price: 2000 }
]

const BOXES = [
  { id: 'classic', name: '經典紙箱', price: 0, tone: 'classic' },
  { id: 'strawberry', name: '草莓紙箱', price: 1000, tone: 'strawberry' },
  { id: 'night', name: '星空紙箱', price: 1000, tone: 'night' },
  { id: 'garden', name: '花園紙箱', price: 1500, tone: 'garden' }
]

interface ShopScreenProps {
  onBack: () => void
  onToast: (message: string) => void
}

export function ShopScreen({ onBack, onToast }: ShopScreenProps) {
  const { player, addCoins, purchaseSkin, selectSkin } = usePlayer()
  const [tab, setTab] = useState<'coins' | 'cats' | 'boxes'>('coins')

  const buyCat = (skinId: string, price: number) => {
    if (purchaseSkin('cat', skinId, price)) onToast('新貓咪已加入收藏！')
    else onToast('Paw Coin 不夠，先多闖幾關吧！')
  }

  const buyBox = (boxId: string, price: number) => {
    if (purchaseSkin('box', boxId, price)) {
      selectSkin('box', boxId)
      onToast('已換上新的紙箱外觀！')
    } else onToast('Paw Coin 不夠，先多闖幾關吧！')
  }

  return (
    <main className="screen screen--shop">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title="商店" subtitle="更多可愛貓咪，更多快樂日常！" />
      <div className="shop-tabs">
        <button className={tab === 'coins' ? 'is-active' : ''} onClick={() => setTab('coins')} type="button"><GameImage asset="coins" alt="" aria-hidden="true" /><span>金幣</span></button>
        <button className={tab === 'cats' ? 'is-active' : ''} onClick={() => setTab('cats')} type="button"><GameImage asset="collect" alt="" aria-hidden="true" /><span>貓咪</span></button>
        <button className={tab === 'boxes' ? 'is-active' : ''} onClick={() => setTab('boxes')} type="button"><GameImage asset="gift" alt="" aria-hidden="true" /><span>紙箱</span></button>
      </div>
      {tab === 'coins' && <section className="shop-section"><div className="shop-section__heading"><h2><GameImage asset="coins" alt="" aria-hidden="true" /> Paw Coins</h2><span>金幣能解鎖更多可愛造型！</span></div><div className="coin-pack-grid">{[1000, 3000, 10000, 30000].map((amount) => <article className="coin-pack" key={amount}><GameImage asset="coins" className="coin-pack__art" alt="" aria-hidden="true" /><strong>{amount.toLocaleString()}</strong><small>Paw Coins</small><AppButton variant="primary" onClick={() => { addCoins(amount); onToast(`測試商店：已加入 ${amount.toLocaleString()} Paw Coins`) }}>領取</AppButton></article>)}</div><p className="shop-disclaimer">正式上架時，這些按鈕將接到 App Store / Google Play 的安全付款流程。</p></section>}
      {tab === 'cats' && <section className="shop-section"><div className="shop-section__heading"><h2><GameImage asset="collect" alt="" aria-hidden="true" /> 貓咪造型</h2><span>收集每一隻獨一無二的貓咪！</span></div><div className="shop-item-grid">{SHOP_CATS.map((cat) => { const owned = player.unlockedCatSkins.includes(cat.id); return <article className="shop-item" key={cat.id}><CatPortrait skin={cat.id} small /><strong>{cat.name}</strong><AppButton icon={owned ? undefined : 'coins'} variant={owned ? 'cream' : 'primary'} onClick={() => owned ? selectSkin('cat', cat.id) : buyCat(cat.id, cat.price)}>{owned ? '使用' : cat.price.toLocaleString()}</AppButton></article> })}</div></section>}
      {tab === 'boxes' && <section className="shop-section"><div className="shop-section__heading"><h2><GameImage asset="gift" alt="" aria-hidden="true" /> 紙箱造型</h2><span>替貓咪準備更舒適的小屋！</span></div><div className="shop-item-grid">{BOXES.map((box) => { const owned = player.unlockedBoxSkins.includes(box.id); return <article className="shop-item" key={box.id}><span className={`box-swatch box-swatch--${box.tone}`}>📦</span><strong>{box.name}</strong><AppButton icon={owned ? undefined : 'coins'} variant={owned ? 'cream' : 'primary'} onClick={() => owned ? selectSkin('box', box.id) : buyBox(box.id, box.price)}>{owned ? player.selectedBoxSkin === box.id ? '使用中' : '使用' : box.price.toLocaleString()}</AppButton></article> })}</div></section>}
      <section className="remove-ads"><CatPortrait skin="gray" small sleeping /><div><strong>移除廣告</strong><small>享受更順暢、更愉快的拼圖體驗！</small></div><AppButton variant="pink" onClick={() => onToast('正式版會使用原生商店完成購買與 Restore Purchases。')}>NT$ 90</AppButton></section>
    </main>
  )
}
