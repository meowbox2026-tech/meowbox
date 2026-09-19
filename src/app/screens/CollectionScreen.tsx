import { useMemo, useState } from 'react'
import type { CatSkin } from '../../game/types'
import { format, getCatSkinName, useLocale, useStrings } from '../../i18n'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { CatPortrait } from '../components/CatPortrait'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'

const CAT_SKINS: Array<{ id: CatSkin; price: number }> = [
  { id: 'orange', price: 0 },
  { id: 'black', price: 1500 },
  { id: 'gray', price: 1500 },
  { id: 'white', price: 2000 },
  { id: 'calico', price: 2000 },
  { id: 'siamese', price: 2500 },
  { id: 'ragdoll', price: 3000 }
]

interface CollectionScreenProps {
  onBack: () => void
  onShop: () => void
}

export function CollectionScreen({ onBack, onShop }: CollectionScreenProps) {
  const { player, selectSkin } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const [selected, setSelected] = useState<string>(player.selectedCatSkin)
  const selectedSkin = useMemo(() => CAT_SKINS.find((skin) => skin.id === selected) ?? CAT_SKINS[0], [selected])
  const isUnlocked = player.unlockedCatSkins.includes(selected)

  const useSelectedSkin = () => {
    if (!isUnlocked) return onShop()
    selectSkin('cat', selected)
  }
  const selectedName = getCatSkinName(selectedSkin.id, locale)

  return (
    <main className="screen screen--collection">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title={strings.collection.title} subtitle={strings.collection.subtitle} mascot={<CatPortrait skin={selectedSkin.id} small />} />
      <section className="collection-feature">
        <CatPortrait skin={selectedSkin.id} />
        <div className="collection-feature__detail"><h2>🐾 {selectedName} ♡</h2><p>{isUnlocked ? strings.collection.companionUnlocked : format(strings.collection.unlockPrice, { price: selectedSkin.price.toLocaleString() })}</p><AppButton onClick={useSelectedSkin} variant={isUnlocked ? 'primary' : 'cream'}>{isUnlocked && player.selectedCatSkin === selected ? strings.collection.using : isUnlocked ? strings.collection.useCat : strings.collection.goShop}</AppButton></div>
      </section>
      <div className="collection-tabs"><button className="is-active" type="button">{strings.collection.catsTab}</button><button type="button" onClick={onShop}>{strings.collection.boxesTab}</button><button type="button" onClick={onShop}>{strings.collection.specialTab}</button></div>
      <section className="skin-grid" aria-label={strings.collection.gridLabel}>
        {CAT_SKINS.map((skin) => {
          const unlocked = player.unlockedCatSkins.includes(skin.id)
          return <button className={`skin-card ${selected === skin.id ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}`} key={skin.id} type="button" onClick={() => setSelected(skin.id)}><CatPortrait skin={skin.id} small sleeping={skin.id === 'ragdoll'} /><strong>{getCatSkinName(skin.id, locale)}</strong><small>{unlocked ? player.selectedCatSkin === skin.id ? strings.collection.using : strings.collection.unlocked : `🐾 ${skin.price.toLocaleString()}`}</small></button>
        })}
        <div className="skin-card skin-card--mystery"><span>?</span><strong>{strings.collection.mysteryName}</strong><small>{strings.collection.mysteryHint}</small></div>
      </section>
      <p className="collection-note">{strings.collection.note}</p>
    </main>
  )
}
