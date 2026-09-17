import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { ScreenTitle } from '../components/ScreenTitle'
import { Toggle } from '../components/Toggle'
import { TopBar } from '../components/TopBar'

interface SettingsScreenProps {
  onBack: () => void
  onToast: (message: string) => void
}

export function SettingsScreen({ onBack, onToast }: SettingsScreenProps) {
  const { player, updateSettings } = usePlayer()
  return (
    <main className="screen screen--settings">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title="設定" subtitle="讓每一次遊玩都更剛好！" />
      <section className="settings-card">
        <Toggle icon="♫" label="音樂" description="陪伴拼圖時光的輕鬆背景音樂" checked={player.settings.music} onChange={(music) => updateSettings({ music })} />
        <Toggle icon="🔊" label="音效" description="每一個可愛動作都有回應" checked={player.settings.sound} onChange={(sound) => updateSettings({ sound })} />
        <Toggle icon="📳" label="震動" description="放好貓咪時的小小提示" checked={player.settings.haptics} onChange={(haptics) => updateSettings({ haptics })} />
        <div className="settings-language"><span>◎</span><strong>語言</strong><div>{(['zh-TW', 'en', 'ja'] as const).map((language) => <button key={language} className={player.settings.language === language ? 'is-active' : ''} onClick={() => updateSettings({ language })} type="button">{language === 'zh-TW' ? '繁體中文' : language === 'en' ? 'English' : '日本語'}</button>)}</div></div>
        {['隱私權政策', '服務條款', '客服支援', '恢復購買項目', '關於遊戲'].map((item) => <button className="settings-link" key={item} onClick={() => onToast(item === '恢復購買項目' ? '原生購買恢復服務已預留，需接上商店商品 ID。' : `${item} 頁面會在正式上架時接入。`)} type="button"><span>{item === '客服支援' ? '◖◗' : '▤'}</span><strong>{item}</strong><b>›</b></button>)}
      </section>
      <AppButton className="settings-home" variant="pink" onClick={onBack}>⌂　回到主頁</AppButton>
    </main>
  )
}
