import { getLegalDocument, useLocale, useStrings } from '../../i18n'
import { AppButton } from '../components/AppButton'
import { ScreenTitle } from '../components/ScreenTitle'
import { TopBar } from '../components/TopBar'
import { SUPPORT_EMAIL, type LegalDocumentId } from '../legal/legalContent'

interface LegalScreenProps {
  documentId: LegalDocumentId
  onBack: () => void
}

export function LegalScreen({ documentId, onBack }: LegalScreenProps) {
  const locale = useLocale()
  const strings = useStrings()
  const document = getLegalDocument(documentId, locale)

  return (
    <main className="screen screen--legal">
      <TopBar coins={0} onBack={onBack} />
      <ScreenTitle title={document.title} subtitle={document.subtitle} />
      <article className="legal-card">
        {document.sections.map((section) => (
          <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          </section>
        ))}
        {documentId === 'support' && <a className="legal-email" href={`mailto:${SUPPORT_EMAIL}`}>{strings.legal.emailCta}</a>}
      </article>
      <AppButton className="settings-home" variant="pink" onClick={onBack}>{strings.legal.backToSettings}</AppButton>
    </main>
  )
}
