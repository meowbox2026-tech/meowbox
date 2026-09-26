export type LegalDocumentId = 'privacy' | 'terms' | 'support'

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface LegalDocument {
  title: string
  subtitle: string
  sections: LegalSection[]
}

export const SUPPORT_EMAIL = 'meowbox2026@gmail.com'
export const LEGAL_UPDATED_AT = '2026 年 9 月 25 日'

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: '隱私權政策',
    subtitle: `最後更新：${LEGAL_UPDATED_AT}`,
    sections: [
      {
        heading: '我們重視你的隱私',
        paragraphs: ['Meow Line（以下稱「本遊戲」）由 Meow Line 開發團隊提供。我們希望用簡單、透明的方式說明目前版本如何處理資料。']
      },
      {
        heading: '目前版本會處理哪些資料？',
        paragraphs: ['本遊戲不要求建立帳號，也不會主動要求你的姓名、電話、地址、位置、聯絡人、照片、相機或麥克風資料。為了改善關卡與遊戲體驗，遊戲會使用 Supabase 建立不含姓名或電子郵件的匿名使用者識別碼，記錄必要的匿名遊戲事件。'],
        bullets: [
          '遊戲進度、星等與設定會儲存在你的裝置上。',
          'iPhone App 使用系統偏好儲存；手機網頁版使用瀏覽器本機儲存。',
          '匿名分析會記錄工作階段、關卡開始／完成／失敗、提示使用、過關時間、星等、關卡編號與事件時間；不記錄姓名、電子郵件、電話或可直接識別你的資料。',
          '如果你寄信給客服，我們會收到你主動提供的電子郵件地址、信件內容與附件。'
        ]
      },
      {
        heading: '資料如何使用與保存？',
        paragraphs: ['裝置上的遊戲資料只用來恢復遊戲進度、套用設定與提供遊戲功能。匿名分析資料只用來了解關卡難度、完成率、實際過關時間、提示與失敗訊號，以改善關卡與體驗；目前沒有設定固定自動刪除期限。刪除 App 或清除瀏覽器網站資料會移除裝置上的匿名工作階段憑證，之後的事件不會再與該憑證連結，但先前的匿名事件可能無法對應到特定個人。客服信件只會在處理問題、回覆請求與維護服務所需的期間保存。']
      },
      {
        heading: '第三方服務',
        paragraphs: ['匿名分析事件會傳送到 Supabase 託管的資料庫；前端只可送出符合規則的事件，無法讀取原始事件，玩家狀態頁只讀取彙總結果。Supabase 可能依其服務政策處理必要的連線技術資料。iOS App 啟用 Google Mobile Ads SDK／User Messaging Platform，插頁式與獎勵式廣告的請求、顯示與完成回呼由 SDK 處理。為提供廣告與量測，Google 可能處理 IP 位址／概略位置、裝置 ID（包含廣告識別碼）、廣告資料、產品互動、效能資料、崩潰與其他診斷資料；這些資料可能用於第三方廣告、開發者廣告或分析，裝置 ID 可能用於廣告追蹤，並會依適用的 App Tracking Transparency 同意狀態處理。拒絕追蹤不會阻止非個人化廣告載入。瀏覽器版本只使用本機測試廣告畫面，不會向第三方廣告 SDK 發出請求。']
      },
      {
        heading: '兒童隱私',
        paragraphs: ['本遊戲不以收集兒童個人資料為目的，也不會要求兒童提供個人資料。如果你認為未成年者在未經同意下向我們提供了個人資料，請透過客服信箱聯絡我們。']
      },
      {
        heading: '你的選擇',
        paragraphs: ['你可以透過刪除 App 或清除瀏覽器網站資料移除裝置上的遊戲資料與匿名工作階段憑證。若你曾透過客服信箱聯絡我們，可以來信要求更正或刪除該次客服往來資料；若要詢問匿名分析事件，請提供大約使用時間與裝置資訊，但由於未建立可辨識身分的帳號，我們可能無法定位或刪除特定匿名事件。']
      },
      {
        heading: '政策更新與聯絡方式',
        paragraphs: [`如果資料收集方式、廣告 SDK、雲端同步或付費服務改變，我們會更新本政策與 App Store 的隱私標示。若你有隱私問題，請寄信至 ${SUPPORT_EMAIL}。`]
      }
    ]
  },
  terms: {
    title: '服務條款',
    subtitle: `最後更新：${LEGAL_UPDATED_AT}`,
    sections: [
      {
        heading: '接受條款',
        paragraphs: ['下載、開啟或使用 Meow Line，即表示你同意本服務條款。如果你不同意，請停止使用本遊戲並刪除 App。']
      },
      {
        heading: '遊戲使用',
        paragraphs: ['本遊戲提供貓咪落下連線解謎與相關的遊戲內容，供個人、非商業用途使用。你應以合法且不影響其他人或服務運作的方式使用本遊戲。'],
        bullets: [
          '不得反向工程、修改、破解、轉售或重新散布本遊戲或其素材。',
          '不得利用錯誤、機器人或其他未授權方式取得遊戲進度或內容。',
          '不得移除著作權、商標或其他權利聲明。'
        ]
      },
      {
        heading: '遊戲資料與功能',
        paragraphs: ['目前版本主要將進度儲存在你的裝置上。刪除 App、清除網站資料、裝置故障或系統重置可能造成進度遺失。請在進行上述操作前自行備份重要資料。']
      },
      {
        heading: '付費內容與廣告',
        paragraphs: ['目前版本不提供遊戲內貨幣、商店、每日獎勵或購買獎勵。iOS App 主線每累計五次開始新局、從選關進入關卡、前往下一關或點擊重新開始後，會由 Google Mobile Ads SDK 顯示全螢幕插頁廣告；提示或上一步次數歸零時，可觀看獎勵式廣告，完成後分別增加三次提示或五次上一步，僅限當前關卡使用。瀏覽器版本只顯示本機測試畫面，不會請求第三方廣告。正式廣告的載入、曝光、獎勵完成與關閉時機由廣告供應商回呼控制；遊戲不要求玩家點擊廣告或開啟商店。若未來提供 App 內購買，交易會透過 Apple App Store 處理。']
      },
      {
        heading: '智慧財產權',
        paragraphs: ['本遊戲的程式、畫面、文字、角色、圖像、音效與品牌識別均由 Meow Line 開發團隊或合法授權方擁有。除本條款明確允許的個人使用外，不授予你任何智慧財產權。']
      },
      {
        heading: '服務變更與免責',
        paragraphs: ['我們可能為了修正錯誤、改善安全性或調整遊戲內容而更新、暫停或停止部分功能。法律允許的最大範圍內，本遊戲依「現況」提供，不保證永遠不中斷或完全沒有錯誤。']
      },
      {
        heading: '聯絡方式',
        paragraphs: [`若你對本條款有疑問，請寄信至 ${SUPPORT_EMAIL}。`]
      }
    ]
  },
  support: {
    title: '客服支援',
    subtitle: '遇到問題？我們一起找出連線。',
    sections: [
      {
        heading: '聯絡我們',
        paragraphs: ['請將問題寄至下方信箱，我們會依序回覆。'],
        bullets: [`客服信箱：${SUPPORT_EMAIL}`, '建議主旨：Meow Line｜問題說明']
      },
      {
        heading: '寄信時請附上',
        bullets: ['iPhone 型號或手機瀏覽器名稱', 'iOS 版本或瀏覽器版本', 'App 版本（若已安裝 App）', '發生問題的關卡與操作步驟', '必要時附上不含個人敏感資訊的截圖']
      },
      {
        heading: '常見問題',
        paragraphs: ['遊戲進度目前儲存在裝置本機。刪除 App、清除瀏覽器網站資料或更換裝置，可能無法保留原本進度。若畫面顯示不完整，請先關閉並重新開啟 App，或在手機瀏覽器重新整理頁面。']
      },
      {
        heading: '資料刪除請求',
        paragraphs: [`如果你曾寄信給客服並希望刪除客服往來資料，請使用同一個信箱寄信至 ${SUPPORT_EMAIL}，並在主旨註明「刪除資料請求」。`]
      }
    ]
  }
}
