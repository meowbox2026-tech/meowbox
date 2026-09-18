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
export const LEGAL_UPDATED_AT = '2026 年 9 月 18 日'

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: '隱私權政策',
    subtitle: `最後更新：${LEGAL_UPDATED_AT}`,
    sections: [
      {
        heading: '我們重視你的隱私',
        paragraphs: ['Meow Box（以下稱「本遊戲」）由 Meow Box 開發團隊提供。我們希望用簡單、透明的方式說明目前版本如何處理資料。']
      },
      {
        heading: '目前版本會處理哪些資料？',
        paragraphs: ['本遊戲不要求建立帳號，也不會主動要求你的姓名、電話、地址、位置、聯絡人、照片、相機或麥克風資料。'],
        bullets: [
          '遊戲進度、設定、提示數量與解鎖內容會儲存在你的裝置上。',
          'iPhone App 使用系統偏好儲存；手機網頁版使用瀏覽器本機儲存。',
          '如果你寄信給客服，我們會收到你主動提供的電子郵件地址、信件內容與附件。'
        ]
      },
      {
        heading: '資料如何使用與保存？',
        paragraphs: ['裝置上的遊戲資料只用來恢復遊戲進度、套用設定與提供遊戲功能。這些資料會保留到你刪除 App、清除瀏覽器網站資料，或自行重置遊戲資料為止。客服信件只會在處理問題、回覆請求與維護服務所需的期間保存。']
      },
      {
        heading: '第三方服務',
        paragraphs: ['目前版本未整合第三方廣告、分析或跨網站追蹤 SDK，也沒有把遊戲進度上傳到 Meow Box 的伺服器。App 使用 Apple 與 Capacitor 提供的系統能力（例如本機儲存與震動），這些能力不會把遊戲進度交給我們。Apple App Store、作業系統與電子郵件服務商可能依其各自政策處理必要的技術資料。'],
      },
      {
        heading: '兒童隱私',
        paragraphs: ['本遊戲不以收集兒童個人資料為目的，也不會要求兒童提供個人資料。如果你認為未成年者在未經同意下向我們提供了個人資料，請透過客服信箱聯絡我們。']
      },
      {
        heading: '你的選擇',
        paragraphs: ['你可以透過刪除 App 或清除瀏覽器網站資料移除裝置上的遊戲資料。若你曾透過客服信箱聯絡我們，也可以來信要求更正或刪除該次客服往來資料。']
      },
      {
        heading: '政策更新與聯絡方式',
        paragraphs: [`如果未來加入帳號、雲端同步、廣告、分析或付費服務，我們會在啟用前更新本政策與 App Store 的隱私標示。若你有隱私問題，請寄信至 ${SUPPORT_EMAIL}。`]
      }
    ]
  },
  terms: {
    title: '服務條款',
    subtitle: `最後更新：${LEGAL_UPDATED_AT}`,
    sections: [
      {
        heading: '接受條款',
        paragraphs: ['下載、開啟或使用 Meow Box，即表示你同意本服務條款。如果你不同意，請停止使用本遊戲並刪除 App。']
      },
      {
        heading: '遊戲使用',
        paragraphs: ['本遊戲提供貓咪裝箱拼圖與相關的遊戲內容，供個人、非商業用途使用。你應以合法且不影響其他人或服務運作的方式使用本遊戲。'],
        bullets: [
          '不得反向工程、修改、破解、轉售或重新散布本遊戲或其素材。',
          '不得利用錯誤、機器人或其他未授權方式取得遊戲進度、獎勵或內容。',
          '不得移除著作權、商標或其他權利聲明。'
        ]
      },
      {
        heading: '遊戲資料與功能',
        paragraphs: ['目前版本主要將進度儲存在你的裝置上。刪除 App、清除網站資料、裝置故障或系統重置可能造成進度遺失。請在進行上述操作前自行備份重要資料。']
      },
      {
        heading: '付費內容與廣告',
        paragraphs: ['目前版本中的商店、獎勵或廣告相關畫面可能包含測試內容，不代表已提供可購買商品或實際廣告服務。若未來提供 App 內購買，交易會透過 Apple App Store 處理，並會在提供前更新相關說明。']
      },
      {
        heading: '智慧財產權',
        paragraphs: ['本遊戲的程式、畫面、文字、角色、圖像、音效與品牌識別均由 Meow Box 開發團隊或合法授權方擁有。除本條款明確允許的個人使用外，不授予你任何智慧財產權。']
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
    subtitle: '遇到問題？我們會陪你一起整理紙箱。',
    sections: [
      {
        heading: '聯絡我們',
        paragraphs: ['請將問題寄至下方信箱，我們會依序回覆。'],
        bullets: [`客服信箱：${SUPPORT_EMAIL}`, '建議主旨：Meow Box｜問題說明']
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
