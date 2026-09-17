import { useMemo, useState } from 'react'
import type { CatSkin } from '../../game/types'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { CatPortrait } from '../components/CatPortrait'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'

const CAT_SKINS: Array<{ id: CatSkin; name: string; price: number }> = [
  { id: 'orange', name: '橘貓', price: 0 },
  { id: 'black', name: '黑貓', price: 1500 },
  { id: 'gray', name: '灰白貓', price: 1500 },
  { id: 'white', name: '白貓', price: 2000 },
  { id: 'calico', name: '三花貓', price: 2000 },
  { id: 'siamese', name: '暹羅貓', price: 2500 },
  { id: 'ragdoll', name: '布偶貓', price: 3000 }
]

interface CollectionScreenProps {
  onBack: () => void
  onShop: () => void
}

export function CollectionScreen({ onBack, onShop }: CollectionScreenProps) {
  const { player, selectSkin } = usePlayer()
  const [selected, setSelected] = useState<string>(player.selectedCatSkin)
  const selectedSkin = useMemo(() => CAT_SKINS.find((skin) => skin.id === selected) ?? CAT_SKINS[0], [selected])
  const isUnlocked = player.unlockedCatSkins.includes(selected)

  const useSelectedSkin = () => {
    if (!isUnlocked) return onShop()
    selectSkin('cat', selected)
  }

  return (
    <main className="screen screen--collection">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title="貓咪收藏" subtitle="收集更多貓咪，累積更多幸福！" mascot={<CatPortrait skin={selectedSkin.id} small />} />
      <section className="collection-feature">
        <CatPortrait skin={selectedSkin.id} />
        <div className="collection-feature__detail"><h2>🐾 {selectedSkin.name} ♡</h2><p>{isUnlocked ? '溫暖又療癒的陪伴，是每一天的小確幸 ♡' : `需要 ${selectedSkin.price.toLocaleString()} Paw Coins 解鎖`}</p><AppButton onClick={useSelectedSkin} variant={isUnlocked ? 'primary' : 'cream'}>{isUnlocked && player.selectedCatSkin === selected ? '使用中' : isUnlocked ? '使用這隻貓' : '前往商店'}</AppButton></div>
      </section>
      <div className="collection-tabs"><button className="is-active" type="button">🐱 貓咪</button><button type="button" onClick={onShop}>📦 箱子</button><button type="button" onClick={onShop}>★ 特別系列</button></div>
      <section className="skin-grid" aria-label="貓咪外觀收藏">
        {CAT_SKINS.map((skin) => {
          const unlocked = player.unlockedCatSkins.includes(skin.id)
          return <button className={`skin-card ${selected === skin.id ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`} key={skin.id} type="button" onClick={() => setSelected(skin.id)}><CatPortrait skin={skin.id} small sleeping={skin.id === 'ragdoll'} /><strong>{skin.name}</strong><small>{unlocked ? player.selectedCatSkin === skin.id ? '使用中' : '已解鎖' : `🐾 ${skin.price.toLocaleString()}`}</small></button>
        })}
        <div className="skin-card skin-card--mystery"><span>?</span><strong>神祕貓</strong><small>Lv.50 解鎖</small></div>
      </section>
      <p className="collection-note">🐾 持續遊玩，解鎖更多可愛貓咪！</p>
    </main>
  )
}
