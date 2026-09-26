import type { LegalDocument, LegalDocumentId } from '../app/legal/legalContent'
import { SUPPORT_EMAIL } from '../app/legal/legalContent'
import type { Locale } from './locale'
import { toLocale } from './locale'

export const LEGAL_UPDATED_AT: Record<Locale, string> = {
  'zh-TW': '2026 年 9 月 25 日',
  en: 'September 25, 2026',
  ja: '2026年9月25日'
}

const zh: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: '隱私權政策',
    subtitle: `最後更新：${LEGAL_UPDATED_AT['zh-TW']}`,
    sections: [
      { heading: '我們重視你的隱私', paragraphs: ['Meow Line（以下稱「本遊戲」）由 Meow Line 開發團隊提供。我們希望用簡單、透明的方式說明目前版本如何處理資料。'] },
      {
        heading: '目前版本會處理哪些資料？',
        paragraphs: ['本遊戲不要求建立帳號，也不會主動要求你的姓名、電話、地址、位置、聯絡人、照片、相機或麥克風資料。為了改善關卡與遊戲體驗，遊戲會使用 Supabase 建立不含姓名或電子郵件的匿名使用者識別碼，記錄必要的匿名遊戲事件。'],
        bullets: ['遊戲進度、星等與設定會儲存在你的裝置上。', 'iPhone App 使用系統偏好儲存；手機網頁版使用瀏覽器本機儲存。', '匿名分析會記錄工作階段、關卡開始／完成／失敗、提示使用、過關時間、星等、關卡編號與事件時間；不記錄姓名、電子郵件、電話或可直接識別你的資料。', `如果你寄信給客服，我們會收到你主動提供的電子郵件地址、信件內容與附件。`]
      },
      { heading: '資料如何使用與保存？', paragraphs: ['裝置上的遊戲資料只用來恢復遊戲進度、套用設定與提供遊戲功能。匿名分析資料只用來了解關卡難度、完成率、實際過關時間、提示與失敗訊號，以改善關卡與體驗；目前沒有設定固定自動刪除期限。刪除 App 或清除瀏覽器網站資料會移除裝置上的匿名工作階段憑證，之後的事件不會再與該憑證連結，但先前的匿名事件可能無法對應到特定個人。客服信件只會在處理問題、回覆請求與維護服務所需的期間保存。'] },
      { heading: '第三方服務', paragraphs: ['匿名分析事件會傳送到 Supabase 託管的資料庫；前端只可送出符合規則的事件，無法讀取原始事件，玩家狀態頁只讀取彙總結果。Supabase 可能依其服務政策處理必要的連線技術資料。iOS App 啟用 Google Mobile Ads SDK／User Messaging Platform，插頁式與獎勵式廣告的請求、顯示與完成回呼由 SDK 處理。為提供廣告與量測，Google 可能處理 IP 位址／概略位置、裝置 ID（包含廣告識別碼）、廣告資料、產品互動、效能資料、崩潰與其他診斷資料；這些資料可能用於第三方廣告、開發者廣告或分析，裝置 ID 可能用於廣告追蹤，並會依適用的 App Tracking Transparency 同意狀態處理。拒絕追蹤不會阻止非個人化廣告載入。瀏覽器版本只使用本機測試廣告畫面，不會向第三方廣告 SDK 發出請求。'] },
      { heading: '兒童隱私', paragraphs: ['本遊戲不以收集兒童個人資料為目的，也不會要求兒童提供個人資料。如果你認為未成年者在未經同意下向我們提供了個人資料，請透過客服信箱聯絡我們。'] },
      { heading: '你的選擇', paragraphs: ['你可以透過刪除 App 或清除瀏覽器網站資料移除裝置上的遊戲資料與匿名工作階段憑證。若你曾透過客服信箱聯絡我們，可以來信要求更正或刪除該次客服往來資料；若要詢問匿名分析事件，請提供大約使用時間與裝置資訊，但由於未建立可辨識身分的帳號，我們可能無法定位或刪除特定匿名事件。'] },
      { heading: '政策更新與聯絡方式', paragraphs: [`如果資料收集方式、廣告 SDK、雲端同步或付費服務改變，我們會更新本政策與 App Store 的隱私標示。若你有隱私問題，請寄信至 ${SUPPORT_EMAIL}。`] }
    ]
  },
  terms: {
    title: '服務條款',
    subtitle: `最後更新：${LEGAL_UPDATED_AT['zh-TW']}`,
    sections: [
      { heading: '接受條款', paragraphs: ['下載、開啟或使用 Meow Line，即表示你同意本服務條款。如果你不同意，請停止使用本遊戲並刪除 App。'] },
      {
        heading: '遊戲使用',
        paragraphs: ['本遊戲提供貓咪落下連線解謎與相關的遊戲內容，供個人、非商業用途使用。你應以合法且不影響其他人或服務運作的方式使用本遊戲。'],
        bullets: ['不得反向工程、修改、破解、轉售或重新散布本遊戲或其素材。', '不得利用錯誤、機器人或其他未授權方式取得遊戲進度或內容。', '不得移除著作權、商標或其他權利聲明。']
      },
      { heading: '遊戲資料與功能', paragraphs: ['目前版本主要將進度儲存在你的裝置上。刪除 App、清除網站資料、裝置故障或系統重置可能造成進度遺失。請在進行上述操作前自行備份重要資料。'] },
      { heading: '付費內容與廣告', paragraphs: ['目前版本不提供遊戲內貨幣、商店、每日獎勵或購買獎勵。iOS App 主線每累計五次開始新局、從選關進入關卡、前往下一關或點擊重新開始後，會由 Google Mobile Ads SDK 顯示全螢幕插頁廣告；提示或上一步次數歸零時，可觀看獎勵式廣告，完成後分別增加三次提示或五次上一步，僅限當前關卡使用。瀏覽器版本只顯示本機測試畫面，不會請求第三方廣告。正式廣告的載入、曝光、獎勵完成與關閉時機由廣告供應商回呼控制；遊戲不要求玩家點擊廣告或開啟商店。若未來提供 App 內購買，交易會透過 Apple App Store 處理。'] },
      { heading: '智慧財產權', paragraphs: ['本遊戲的程式、畫面、文字、角色、圖像、音效與品牌識別均由 Meow Line 開發團隊或合法授權方擁有。除本條款明確允許的個人使用外，不授予你任何智慧財產權。'] },
      { heading: '服務變更與免責', paragraphs: ['我們可能為了修正錯誤、改善安全性或調整遊戲內容而更新、暫停或停止部分功能。法律允許的最大範圍內，本遊戲依「現況」提供，不保證永遠不中斷或完全沒有錯誤。'] },
      { heading: '聯絡方式', paragraphs: [`若你對本條款有疑問，請寄信至 ${SUPPORT_EMAIL}。`] }
    ]
  },
  support: {
    title: '客服支援',
    subtitle: '遇到問題？我們一起找出連線。',
    sections: [
      { heading: '聯絡我們', paragraphs: ['請將問題寄至下方信箱，我們會依序回覆。'], bullets: [`客服信箱：${SUPPORT_EMAIL}`, '建議主旨：Meow Line｜問題說明'] },
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
      { heading: 'We value your privacy', paragraphs: ['Meow Line (“the game”) is provided by the Meow Line team. We explain in simple, transparent terms how the current version handles data.'] },
      {
        heading: 'What does the current version handle?',
        paragraphs: ['The game needs no account and never asks for your name, phone, address, location, contacts, photos, camera, or microphone. To improve levels and gameplay, it uses Supabase to create an anonymous identifier without your name or email and records necessary anonymous game events.'],
        bullets: ['Progress, stars, and settings stay on your device.', 'The iPhone app uses system preferences; the mobile web version uses browser local storage.', 'Anonymous analytics records sessions, level starts/completions/failures, hints, clear times, stars, level IDs, and event timestamps; it does not record your name, email, phone number, or direct identifiers.', 'If you email support, we receive the address, message, and attachments you send.']
      },
      { heading: 'Use and retention', paragraphs: ['On-device data is used to restore progress, apply settings, and run the game. Anonymous analytics is used to understand level difficulty, completion, actual clear times, hints, and failure signals so we can improve the game. There is currently no fixed automatic deletion period. Deleting the app or clearing site data removes the local anonymous session credential; earlier anonymous events may not be traceable to a particular person. Support emails are kept only while handling your request.'] },
      { heading: 'Third-party services', paragraphs: ['Anonymous analytics events are sent to a Supabase-hosted database. The client can submit only validated events and cannot read raw events; the player-status page reads aggregate results. Supabase may process necessary connection data under its policies. The iOS app enables Google Mobile Ads SDK / User Messaging Platform for interstitial and rewarded ads; the SDK handles ad requests, presentation, and completion callbacks. To provide and measure ads, Google may process IP address / coarse location, device ID including the advertising identifier, advertising data, product interaction, performance data, crash data, and other diagnostic data. These may be used for third-party advertising, developer advertising, or analytics; device ID may be used for advertising tracking subject to applicable App Tracking Transparency consent. Refusing tracking does not prevent non-personalized ads from loading. The browser version uses only a local test ad screen and does not contact a third-party ad SDK.'] },
      { heading: 'Children’s privacy', paragraphs: ['The game is not designed to collect children’s personal data and never asks children for it. If you believe a minor shared personal data without consent, please contact us.'] },
      { heading: 'Your choices', paragraphs: ['Remove on-device data and the anonymous session credential by deleting the app or clearing site data. If you contacted support, you can ask us to correct or delete that correspondence. To ask about anonymous analytics, provide an approximate time and device; because there is no identifiable account, we may be unable to locate or delete specific anonymous events.'] },
      { heading: 'Updates and contact', paragraphs: [`If our data collection, ad SDK, cloud sync, or paid features change, we will update this policy and the App Store privacy labels. For privacy questions, email ${SUPPORT_EMAIL}.`] }
    ]
  },
  terms: {
    title: 'Terms of Service',
    subtitle: `Last updated: ${LEGAL_UPDATED_AT.en}`,
    sections: [
      { heading: 'Accepting these terms', paragraphs: ['By downloading, opening, or playing Meow Line, you agree to these terms. If you disagree, please stop playing and delete the app.'] },
      {
        heading: 'Using the game',
        paragraphs: ['Meow Line offers cat drop-and-match puzzles and related content for personal, non-commercial use. Please play lawfully and without harming others or the service.'],
        bullets: ['Do not reverse-engineer, modify, hack, resell, or redistribute the game or its assets.', 'Do not exploit bugs, bots, or unauthorized means to gain progress or content.', 'Do not remove copyright, trademark, or other rights notices.']
      },
      { heading: 'Game data and features', paragraphs: ['The current version stores progress mainly on your device. Deleting the app, clearing site data, device failure, or OS resets may lose progress. Please back up anything important first.'] },
      { heading: 'Paid content and ads', paragraphs: ['The current version has no in-game currency, shop, daily rewards, or purchase rewards. In the iOS app, Google Mobile Ads shows a full-screen interstitial after every five play actions, including starting from level select, moving to the next level, and restarting a level. When hints or undos reach zero, a rewarded ad can add three hints or five undos for the current level only. The browser version uses only a local test screen and does not request a third-party ad. The provider controls production ad loading, impressions, reward completion, and dismissal callbacks; the game never asks players to click an ad or open a store. Future in-app purchases would go through the Apple App Store with updated instructions.'] },
      { heading: 'Intellectual property', paragraphs: ['Code, visuals, text, characters, art, audio, and branding belong to the Meow Line team or its licensors. Nothing beyond personal use is granted.'] },
      { heading: 'Changes and disclaimer', paragraphs: ['We may update, suspend, or stop features to fix bugs, improve safety, or adjust content. To the maximum extent allowed by law, the game is provided “as is” without guarantees of uninterrupted or error-free play.'] },
      { heading: 'Contact', paragraphs: [`Questions about these terms? Email ${SUPPORT_EMAIL}.`] }
    ]
  },
  support: {
    title: 'Support',
    subtitle: 'Stuck? We will find the next line with you.',
    sections: [
      { heading: 'Contact us', paragraphs: ['Please email the address below and we will reply in order.'], bullets: [`Support email: ${SUPPORT_EMAIL}`, 'Suggested subject: Meow Line｜Issue report'] },
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
      { heading: 'プライバシーを大切にします', paragraphs: ['Meow Line（以下「本ゲーム」）は Meow Line 開発チームが提供します。現行バージョンのデータ取扱いを、シンプルで分かりやすく説明します。'] },
      {
        heading: '現行バージョンで扱うデータ',
        paragraphs: ['本ゲームはアカウント登録不要で、氏名・電話・住所・位置・連絡先・写真・カメラ・マイクの情報を求めません。ステージと体験の改善のため、氏名やメールアドレスを含まない匿名識別子を Supabase で作成し、必要なゲームイベントを記録します。'],
        bullets: ['進行状況・星・設定はお使いの端末に保存されます。', 'iPhoneアプリはシステム設定、モバイルWeb版はブラウザのローカル保存を使います。', '匿名分析ではセッション、ステージの開始・完了・失敗、ヒント、クリア時間、星、ステージ番号、イベント時刻を記録します。氏名・メールアドレス・電話番号・直接識別子は記録しません。', 'サポートにメールした場合、送信いただいたアドレス・内容・添付を受け取ります。']
      },
      { heading: '利用と保存', paragraphs: ['端末上のデータは進行復元・設定適用・ゲーム機能のために使います。匿名分析はステージの難易度、完了、実際のクリア時間、ヒント、失敗を理解し改善するために使います。現在、固定の自動削除期間は設定していません。アプリ削除やサイトデータ消去で端末上の匿名セッション情報は削除されますが、過去の匿名イベントを特定の個人に結び付けられない場合があります。サポートメールは対応に必要な期間のみ保存します。'] },
      { heading: '第三者サービス', paragraphs: ['匿名分析イベントは Supabase がホストするデータベースへ送信されます。クライアントは検証済みイベントだけを送信でき、元のイベントを読み取れません。プレイヤー状態ページは集計結果だけを読み取ります。Supabase はポリシーに基づき必要な接続技術データを扱う場合があります。iOSアプリでは Google Mobile Ads SDK / User Messaging Platform を使い、インタースティシャル広告とリワード広告を表示します。広告の提供と測定のため、Google が IPアドレス／概略位置、端末ID（広告識別子を含む）、広告データ、アプリ操作、パフォーマンス、クラッシュ、その他の診断データを扱う場合があります。これらは第三者広告、開発者広告、分析に使われる場合があり、端末IDは適用される App Tracking Transparency の同意に応じて広告追跡に使われる場合があります。追跡を拒否してもパーソナライズされていない広告は読み込まれます。ブラウザ版のテスト広告画面は第三者広告SDKへ接続しません。'] },
      { heading: '子どものプライバシー', paragraphs: ['本ゲームは子どもの個人データ収集を目的とせず、求めることもありません。未成年者が同意なく提供したと思われる場合はご連絡ください。'] },
      { heading: 'あなたの選択', paragraphs: ['アプリ削除やサイトデータ消去で端末データと匿名セッション情報を削除できます。サポート連絡済みの場合は、その往復メールの訂正・削除をご依頼いただけます。匿名分析については、おおよその利用時刻と端末情報をお知らせください。ただし識別可能なアカウントがないため、特定の匿名イベントを特定・削除できない場合があります。'] },
      { heading: '更新と連絡先', paragraphs: [`データ収集、広告SDK、クラウド同期、課金機能が変わる場合は、本ポリシーとApp Storeのプライバシー表示を更新します。ご質問は ${SUPPORT_EMAIL} まで。`] }
    ]
  },
  terms: {
    title: '利用規約',
    subtitle: `最終更新：${LEGAL_UPDATED_AT.ja}`,
    sections: [
      { heading: '規約への同意', paragraphs: ['Meow Lineのダウンロード・起動・利用により、本規約に同意したものとみなします。同意できない場合は利用を中止し、アプリを削除してください。'] },
      {
        heading: 'ゲームの利用',
        paragraphs: ['本ゲームは猫を落としてつなぐパズル等のコンテンツを、個人・非商用利用向けに提供します。合法かつ他者やサービス運営を妨げない方法でご利用ください。'],
        bullets: ['リバースエンジニアリング・改変・不正利用・転売・再配布を禁じます。', '不具合・Bot・未承認手段による進行・コンテンツの取得を禁じます。', '著作権・商標その他の権利表示を削除しないでください。']
      },
      { heading: 'ゲームデータと機能', paragraphs: ['現行バージョンは進行状況を主に端末に保存します。アプリ削除・サイトデータ消去・故障・初期化で消失する恐れがあります。大切なデータは事前にご自身でお控えください。'] },
      { heading: '課金と広告', paragraphs: ['現行バージョンにゲーム内通貨・ショップ・デイリー報酬・購入報酬はありません。iOSアプリでは Google Mobile Ads が、レベル選択からの開始・次のレベルへの移動・やり直しを含むプレイ操作5回ごとに全画面インタースティシャルを表示します。ヒントまたは戻す回数がなくなったら、報酬広告の完了後にそのステージだけヒント3回または戻す5回を追加します。ブラウザ版はローカルのテスト画面だけを使い、第三者広告へリクエストしません。正式広告の読み込み・表示・完了・閉じるコールバックは広告事業者が制御し、ゲームから広告クリックやストア移動を要求しません。将来的なアプリ内課金はApple App Store経由で処理します。'] },
      { heading: '知的財産権', paragraphs: ['プログラム・画面・文章・キャラ・画像・音・ブランドはMeow Line開発チームまたは正規ライセンサーが保有します。個人利用以外の権利は付与されません。'] },
      { heading: '変更と免責', paragraphs: ['不具合修正・安全性向上・内容調整のため、機能の更新・停止・終了を行う場合があります。法令で認められる最大範囲で、本ゲームは「現状有姿」で提供され、中断なし・無誤動作を保証しません。'] },
      { heading: '連絡先', paragraphs: [`本規約へのご質問は ${SUPPORT_EMAIL} まで。`] }
    ]
  },
  support: {
    title: 'サポート',
    subtitle: 'お困りですか？一緒に次のラインを探しましょう。',
    sections: [
      { heading: 'お問い合わせ', paragraphs: ['下記アドレスへお送りください。順番に返信します。'], bullets: [`サポート：${SUPPORT_EMAIL}`, '推奨件名：Meow Line｜不具合報告'] },
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
