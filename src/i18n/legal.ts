import type { LegalDocument, LegalDocumentId } from '../app/legal/legalContent'
import { SUPPORT_EMAIL } from '../app/legal/legalContent'
import type { Locale } from './locale'
import { toLocale } from './locale'

export const LEGAL_UPDATED_AT: Record<Locale, string> = {
  'zh-TW': '2026 年 9 月 18 日',
  en: 'September 18, 2026',
  ja: '2026年9月18日'
}

const zh: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: '隱私權政策',
    subtitle: `最後更新：${LEGAL_UPDATED_AT['zh-TW']}`,
    sections: [
      { heading: '我們重視你的隱私', paragraphs: ['Meow Box（以下稱「本遊戲」）由 Meow Box 開發團隊提供。我們希望用簡單、透明的方式說明目前版本如何處理資料。'] },
      {
        heading: '目前版本會處理哪些資料？',
        paragraphs: ['本遊戲不要求建立帳號，也不會主動要求你的姓名、電話、地址、位置、聯絡人、照片、相機或麥克風資料。'],
        bullets: ['遊戲進度、設定、提示數量與解鎖內容會儲存在你的裝置上。', 'iPhone App 使用系統偏好儲存；手機網頁版使用瀏覽器本機儲存。', `如果你寄信給客服，我們會收到你主動提供的電子郵件地址、信件內容與附件。`]
      },
      { heading: '資料如何使用與保存？', paragraphs: ['裝置上的遊戲資料只用來恢復遊戲進度、套用設定與提供遊戲功能。這些資料會保留到你刪除 App、清除瀏覽器網站資料，或自行重置遊戲資料為止。客服信件只會在處理問題、回覆請求與維護服務所需的期間保存。'] },
      { heading: '第三方服務', paragraphs: ['目前版本未整合第三方廣告、分析或跨網站追蹤 SDK，也沒有把遊戲進度上傳到 Meow Box 的伺服器。App 使用 Apple 與 Capacitor 提供的系統能力（例如本機儲存與震動），這些能力不會把遊戲進度交給我們。Apple App Store、作業系統與電子郵件服務商可能依其各自政策處理必要的技術資料。'] },
      { heading: '兒童隱私', paragraphs: ['本遊戲不以收集兒童個人資料為目的，也不會要求兒童提供個人資料。如果你認為未成年者在未經同意下向我們提供了個人資料，請透過客服信箱聯絡我們。'] },
      { heading: '你的選擇', paragraphs: ['你可以透過刪除 App 或清除瀏覽器網站資料移除裝置上的遊戲資料。若你曾透過客服信箱聯絡我們，也可以來信要求更正或刪除該次客服往來資料。'] },
      { heading: '政策更新與聯絡方式', paragraphs: [`如果未來加入帳號、雲端同步、廣告、分析或付費服務，我們會在啟用前更新本政策與 App Store 的隱私標示。若你有隱私問題，請寄信至 ${SUPPORT_EMAIL}。`] }
    ]
  },
  terms: {
    title: '服務條款',
    subtitle: `最後更新：${LEGAL_UPDATED_AT['zh-TW']}`,
    sections: [
      { heading: '接受條款', paragraphs: ['下載、開啟或使用 Meow Box，即表示你同意本服務條款。如果你不同意，請停止使用本遊戲並刪除 App。'] },
      {
        heading: '遊戲使用',
        paragraphs: ['本遊戲提供貓咪裝箱拼圖與相關的遊戲內容，供個人、非商業用途使用。你應以合法且不影響其他人或服務運作的方式使用本遊戲。'],
        bullets: ['不得反向工程、修改、破解、轉售或重新散布本遊戲或其素材。', '不得利用錯誤、機器人或其他未授權方式取得遊戲進度、獎勵或內容。', '不得移除著作權、商標或其他權利聲明。']
      },
      { heading: '遊戲資料與功能', paragraphs: ['目前版本主要將進度儲存在你的裝置上。刪除 App、清除網站資料、裝置故障或系統重置可能造成進度遺失。請在進行上述操作前自行備份重要資料。'] },
      { heading: '付費內容與廣告', paragraphs: ['目前版本中的商店、獎勵或廣告相關畫面可能包含測試內容，不代表已提供可購買商品或實際廣告服務。若未來提供 App 內購買，交易會透過 Apple App Store 處理，並會在提供前更新相關說明。'] },
      { heading: '智慧財產權', paragraphs: ['本遊戲的程式、畫面、文字、角色、圖像、音效與品牌識別均由 Meow Box 開發團隊或合法授權方擁有。除本條款明確允許的個人使用外，不授予你任何智慧財產權。'] },
      { heading: '服務變更與免責', paragraphs: ['我們可能為了修正錯誤、改善安全性或調整遊戲內容而更新、暫停或停止部分功能。法律允許的最大範圍內，本遊戲依「現況」提供，不保證永遠不中斷或完全沒有錯誤。'] },
      { heading: '聯絡方式', paragraphs: [`若你對本條款有疑問，請寄信至 ${SUPPORT_EMAIL}。`] }
    ]
  },
  support: {
    title: '客服支援',
    subtitle: '遇到問題？我們會陪你一起整理紙箱。',
    sections: [
      { heading: '聯絡我們', paragraphs: ['請將問題寄至下方信箱，我們會依序回覆。'], bullets: [`客服信箱：${SUPPORT_EMAIL}`, '建議主旨：Meow Box｜問題說明'] },
      { heading: '寄信時請附上', bullets: ['iPhone 型號或手機瀏覽器名稱', 'iOS 版本或瀏覽器版本', 'App 版本（若已安裝 App）', '發生問題的關卡與操作步驟', '必要時附上不含個人敏感資訊的截圖'] },
      { heading: '常見問題', paragraphs: ['遊戲進度目前儲存在裝置本機。刪除 App、清除瀏覽器網站資料或更換裝置，可能無法保留原本進度。若畫面顯示不完整，請先關閉並重新開啟 App，或在手機瀏覽器重新整理頁面。'] },
      { heading: '資料刪除請求', paragraphs: [`如果你曾寄信給客服並希望刪除客服往來資料，請使用同一個信箱寄信至 ${SUPPORT_EMAIL}，並在主旨註明「刪除資料請求」。`] }
    ]
  }
}

const enDocs: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: `Last updated: ${LEGAL_UPDATED_AT.en}`,
    sections: [
      { heading: 'We value your privacy', paragraphs: ['Meow Box (“the game”) is provided by the Meow Box team. We explain in simple, transparent terms how the current version handles data.'] },
      {
        heading: 'What does the current version handle?',
        paragraphs: ['The game needs no account and never asks for your name, phone, address, location, contacts, photos, camera, or microphone.'],
        bullets: ['Progress, settings, hint counts, and unlocks stay on your device.', 'The iPhone app uses system preferences; the mobile web version uses browser local storage.', 'If you email support, we receive the address, message, and attachments you send.']
      },
      { heading: 'Use and retention', paragraphs: ['On-device data is only used to restore progress, apply settings, and run the game. It stays until you delete the app, clear site data, or reset the game. Support emails are kept only while handling your request.'] },
      { heading: 'Third-party services', paragraphs: ['The current version has no third-party ads, analytics, or cross-site tracking SDKs, and never uploads progress to our servers. The app uses Apple and Capacitor system features (such as local storage and haptics) that do not share your progress with us. Apple, the OS, and email providers may process necessary technical data under their own policies.'] },
      { heading: 'Children’s privacy', paragraphs: ['The game is not designed to collect children’s personal data and never asks children for it. If you believe a minor shared personal data without consent, please contact us.'] },
      { heading: 'Your choices', paragraphs: ['Remove on-device data by deleting the app or clearing site data. If you contacted support, you can ask us to correct or delete that correspondence.'] },
      { heading: 'Updates and contact', paragraphs: [`If accounts, cloud sync, ads, analytics, or paid features arrive, we will update this policy and the App Store privacy labels first. For privacy questions, email ${SUPPORT_EMAIL}.`] }
    ]
  },
  terms: {
    title: 'Terms of Service',
    subtitle: `Last updated: ${LEGAL_UPDATED_AT.en}`,
    sections: [
      { heading: 'Accepting these terms', paragraphs: ['By downloading, opening, or playing Meow Box, you agree to these terms. If you disagree, please stop playing and delete the app.'] },
      {
        heading: 'Using the game',
        paragraphs: ['Meow Box offers cat-packing puzzles and related content for personal, non-commercial use. Please play lawfully and without harming others or the service.'],
        bullets: ['Do not reverse-engineer, modify, hack, resell, or redistribute the game or its assets.', 'Do not exploit bugs, bots, or unauthorized means to gain progress, rewards, or content.', 'Do not remove copyright, trademark, or other rights notices.']
      },
      { heading: 'Game data and features', paragraphs: ['The current version stores progress mainly on your device. Deleting the app, clearing site data, device failure, or OS resets may lose progress. Please back up anything important first.'] },
      { heading: 'Paid content and ads', paragraphs: ['Shop, reward, or ad screens may show test content and do not mean real items or ads are for sale. Future in-app purchases would go through the Apple App Store with updated instructions.'] },
      { heading: 'Intellectual property', paragraphs: ['Code, visuals, text, characters, art, audio, and branding belong to the Meow Box team or its licensors. Nothing beyond personal use is granted.'] },
      { heading: 'Changes and disclaimer', paragraphs: ['We may update, suspend, or stop features to fix bugs, improve safety, or adjust content. To the maximum extent allowed by law, the game is provided “as is” without guarantees of uninterrupted or error-free play.'] },
      { heading: 'Contact', paragraphs: [`Questions about these terms? Email ${SUPPORT_EMAIL}.`] }
    ]
  },
  support: {
    title: 'Support',
    subtitle: 'Stuck? We will tidy the box together with you.',
    sections: [
      { heading: 'Contact us', paragraphs: ['Please email the address below and we will reply in order.'], bullets: [`Support email: ${SUPPORT_EMAIL}`, 'Suggested subject: Meow Box｜Issue report'] },
      { heading: 'Please include', bullets: ['iPhone model or mobile browser name', 'iOS or browser version', 'App version (if installed)', 'Level and steps where the issue happened', 'A screenshot without sensitive personal info, if helpful'] },
      { heading: 'FAQ', paragraphs: ['Progress is stored locally on your device. Deleting the app, clearing site data, or switching devices may lose it. If the screen looks broken, restart the app or refresh the mobile page.'] },
      { heading: 'Data deletion requests', paragraphs: [`To delete past support correspondence, email ${SUPPORT_EMAIL} from the same address with the subject “Deletion request”.`] }
    ]
  }
}

const jaDocs: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'プライバシーポリシー',
    subtitle: `最終更新：${LEGAL_UPDATED_AT.ja}`,
    sections: [
      { heading: 'プライバシーを大切にします', paragraphs: ['Meow Box（以下「本ゲーム」）は Meow Box 開発チームが提供します。現行バージョンのデータ取扱いを、シンプルで分かりやすく説明します。'] },
      {
        heading: '現行バージョンで扱うデータ',
        paragraphs: ['本ゲームはアカウント登録不要で、氏名・電話・住所・位置・連絡先・写真・カメラ・マイクの情報を求めません。'],
        bullets: ['進行状況・設定・ヒント数・解放内容はお使いの端末に保存されます。', 'iPhoneアプリはシステム設定、モバイルWeb版はブラウザのローカル保存を使います。', 'サポートにメールした場合、送信いただいたアドレス・内容・添付を受け取ります。']
      },
      { heading: '利用と保存', paragraphs: ['端末上のデータは進行復元・設定適用・ゲーム機能のためだけに使います。アプリ削除・サイトデータ消去・リセットまで保持されます。サポートメールは対応に必要な期間のみ保存します。'] },
      { heading: '第三者サービス', paragraphs: ['現行バージョンに第三者の広告・分析・クロスサイト追跡SDKはなく、進行状況を当方サーバーに送信しません。AppleとCapacitorのシステム機能（ローカル保存・振動など）は進行状況を当方に渡しません。Apple・OS・メール事業者が各ポリシーに基づき必要な技術データを扱う場合があります。'] },
      { heading: '子どものプライバシー', paragraphs: ['本ゲームは子どもの個人データ収集を目的とせず、求めることもありません。未成年者が同意なく提供したと思われる場合はご連絡ください。'] },
      { heading: 'あなたの選択', paragraphs: ['アプリ削除やサイトデータ消去で端末データを削除できます。サポート連絡済みの場合は、その往復メールの訂正・削除をご依頼いただけます。'] },
      { heading: '更新と連絡先', paragraphs: [`アカウント・クラウド同期・広告・分析・課金機能を追加する場合は、事前に本ポリシーとApp Storeのプライバシー表示を更新します。ご質問は ${SUPPORT_EMAIL} まで。`] }
    ]
  },
  terms: {
    title: '利用規約',
    subtitle: `最終更新：${LEGAL_UPDATED_AT.ja}`,
    sections: [
      { heading: '規約への同意', paragraphs: ['Meow Boxのダウンロード・起動・利用により、本規約に同意したものとみなします。同意できない場合は利用を中止し、アプリを削除してください。'] },
      {
        heading: 'ゲームの利用',
        paragraphs: ['本ゲームは猫の箱詰めパズル等のコンテンツを、個人・非商用利用向けに提供します。合法かつ他者やサービス運営を妨げない方法でご利用ください。'],
        bullets: ['リバースエンジニアリング・改変・不正利用・転売・再配布を禁じます。', '不具合・Bot・未承認手段による進行・報酬・コンテンツの取得を禁じます。', '著作権・商標その他の権利表示を削除しないでください。']
      },
      { heading: 'ゲームデータと機能', paragraphs: ['現行バージョンは進行状況を主に端末に保存します。アプリ削除・サイトデータ消去・故障・初期化で消失する恐れがあります。大切なデータは事前にご自身でお控えください。'] },
      { heading: '課金と広告', paragraphs: ['ショップ・報酬・広告関連画面にテスト内容が含まれる場合があり、実際の販売や広告提供を意味しません。将来的なアプリ内課金はApple App Store経由で処理し、事前に関連説明を更新します。'] },
      { heading: '知的財産権', paragraphs: ['プログラム・画面・文章・キャラ・画像・音・ブランドはMeow Box開発チームまたは正規ライセンサーが保有します。個人利用以外の権利は付与されません。'] },
      { heading: '変更と免責', paragraphs: ['不具合修正・安全性向上・内容調整のため、機能の更新・停止・終了を行う場合があります。法令で認められる最大範囲で、本ゲームは「現状有姿」で提供され、中断なし・無誤動作を保証しません。'] },
      { heading: '連絡先', paragraphs: [`本規約へのご質問は ${SUPPORT_EMAIL} まで。`] }
    ]
  },
  support: {
    title: 'サポート',
    subtitle: 'お困りですか？一緒に箱を整理しましょう。',
    sections: [
      { heading: 'お問い合わせ', paragraphs: ['下記アドレスへお送りください。順番に返信します。'], bullets: [`サポート：${SUPPORT_EMAIL}`, '推奨件名：Meow Box｜不具合報告'] },
      { heading: 'メールに添えてください', bullets: ['iPhone機種名またはモバイルブラウザ名', 'iOS・ブラウザのバージョン', 'アプリのバージョン（インストール済みの場合）', '問題のレベルと操作手順', '必要に応じて個人情報を含まないスクリーンショット'] },
      { heading: 'よくある質問', paragraphs: ['進行状況は端末ローカルに保存されます。アプリ削除・サイトデータ消去・機種変更で失われる場合があります。表示が崩れたらアプリ再起動やモバイルページの更新をお試しください。'] },
      { heading: 'データ削除のご依頼', paragraphs: [`過去のサポート往復メールの削除は、同じアドレスから ${SUPPORT_EMAIL} へ件名「削除リクエスト」でお送りください。`] }
    ]
  }
}

export function getLegalDocument(documentId: LegalDocumentId, locale: unknown): LegalDocument {
  const normalized = toLocale(locale)
  if (normalized === 'en') return enDocs[documentId]
  if (normalized === 'ja') return jaDocs[documentId]
  return zh[documentId]
}
