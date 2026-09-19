import { LOCALES, LOCALE_LABELS, useStrings } from '../../i18n'
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
  const strings = useStrings()
  const legalLinks: Array<{ label: string; documentId: LegalDocumentId }> = [
    { label: strings.settings.privacy, documentId: 'privacy' },
    { label: strings.settings.terms, documentId: 'terms' },
    { label: strings.settings.support, documentId: 'support' }
  ]

  return (
    <main className="screen screen--settings">
      <TopBar coins={player.pawCoins} onBack={onBack} />
      <ScreenTitle title={strings.settings.title} subtitle={strings.settings.subtitle} />
      <section className="settings-card">
        <Toggle icon="♫" label={strings.settings.musicLabel} description={strings.settings.musicDesc} checked={player.settings.music} onChange={(music) => updateSettings({ music })} />
        <Toggle icon="🔊" label={strings.settings.soundLabel} description={strings.settings.soundDesc} checked={player.settings.sound} onChange={(sound) => updateSettings({ sound })} />
        <Toggle icon="📳" label={strings.settings.hapticsLabel} description={strings.settings.hapticsDesc} checked={player.settings.haptics} onChange={(haptics) => updateSettings({ haptics })} />
        <div className="settings-language"><span>◎</span><strong>{strings.settings.language}</strong><div>{LOCALES.map((language) => <button key={language} className={player.settings.language === language ? 'is-active' : ''} onClick={() => updateSettings({ language })} type="button">{LOCALE_LABELS[language]}</button>)}</div></div>
        {legalLinks.map(({ label, documentId }) => <button className="settings-link" key={label} onClick={() => onLegal(documentId)} type="button"><span>{label === strings.settings.support ? '◖◗' : '▤'}</span><strong>{label}</strong><b>›</b></button>)}
        <button className="settings-link" onClick={() => onToast(strings.settings.restoreToast)} type="button"><span>↻</span><strong>{strings.settings.restore}</strong><b>›</b></button>
        <button className="settings-link" onClick={() => onToast(strings.settings.aboutToast)} type="button"><span>ⓘ</span><strong>{strings.settings.about}</strong><b>›</b></button>
      </section>
      <AppButton className="settings-home" variant="pink" onClick={onBack}>{strings.settings.backHome}</AppButton>
    </main>
  )
}
