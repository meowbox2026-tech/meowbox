import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { ScreenTitle } from '../components/ScreenTitle'
import { Toggle } from '../components/Toggle'
import { TopBar } from '../components/TopBar'
import type { LegalDocumentId } from '../legal/legalContent'

interface SettingsScreenProps {
  onBack: () => void
  onToast: (message: string) => void
  onLegal: (documentId: LegalDocumentId) => void
}

export function SettingsScreen({ onBack, onToast, onLegal }: SettingsScreenProps) {
  const { player, updateSettings } = usePlayer()
  const legalLinks: Array<{ label: string; documentId: LegalDocumentId }> = [
    { label: '隱私權政策', documentId: 'privacy' },
    { label: '服務條款', documentId: 'terms' },
    { label: '客服支援', documentId: 'support' }
  ]

  return (
    <main className="screen screen--settings">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title="設定" subtitle="讓每一次遊玩都更剛好！" />
      <section className="settings-card">
        <Toggle icon="♫" label="音樂" description="陪伴拼圖時光的輕鬆背景音樂" checked={player.settings.music} onChange={(music) => updateSettings({ music })} />
        <Toggle icon="🔊" label="音效" description="每一個可愛動作都有回應" checked={player.settings.sound} onChange={(sound) => updateSettings({ sound })} />
        <Toggle icon="📳" label="震動" description="放好貓咪時的小小提示" checked={player.settings.haptics} onChange={(haptics) => updateSettings({ haptics })} />
        <div className="settings-language"><span>◎</span><strong>語言</strong><div>{(['zh-TW', 'en', 'ja'] as const).map((language) => <button key={language} className={player.settings.language === language ? 'is-active' : ''} onClick={() => updateSettings({ language })} type="button">{language === 'zh-TW' ? '繁體中文' : language === 'en' ? 'English' : '日本語'}</button>)}</div></div>
        {legalLinks.map(({ label, documentId }) => <button className="settings-link" key={label} onClick={() => onLegal(documentId)} type="button"><span>{label === '客服支援' ? '◖◗' : '▤'}</span><strong>{label}</strong><b>›</b></button>)}
        <button className="settings-link" onClick={() => onToast('原生購買恢復服務已預留，需接上商店商品 ID。')} type="button"><span>↻</span><strong>恢復購買項目</strong><b>›</b></button>
        <button className="settings-link" onClick={() => onToast('Meow Box 貓咪裝箱拼圖，目前版本 1.0.0。')} type="button"><span>ⓘ</span><strong>關於遊戲</strong><b>›</b></button>
      </section>
      <AppButton className="settings-home" variant="pink" onClick={onBack}>⌂　回到主頁</AppButton>
    </main>
  )
}
