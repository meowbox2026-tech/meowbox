# MEOW LINE｜喵序｜貓咪落下連線

以 React + TypeScript + Phaser + Capacitor 建立的直式手機貓咪落下連線解謎遊戲。玩家選擇欄位讓貓咪落下，三隻以上同款貓咪連成橫、直或斜線即可消除，掉落後還會觸發連鎖。所有頁面以 iPhone SE 直式 CSS viewport（375 × 667）為設計基準，並以 safe-area 與容器單位維持其他手機的可用性；UI 素材使用 `public/assets` 的 WebP 與 `public/assets-native` 的原生 PNG，花園背景已轉為高品質 WebP 優化載入體積，並內建 Huninn 繁中圓體，避免手機端退回一般系統字型。

## 開始使用

```bash
npm install
npm run dev
```

建立正式 Web 包：

```bash
npm run build
```

## 目前玩法

第 1–90 關使用固定 8×8 配置解謎：依托盤順序把貓咪放入空格，全部放好後才依序進行橫、直、斜三連線與局部重力；每關提供一次提示，標出下一隻貓的推薦位置，清空本關貓咪便過關。第 90 關完成後回到選關並顯示主線完成。

- NOW／NEXT 預覽、落點虛影、鍵盤操作、第一手引導。
- 每累計五次遊玩操作（開始新局、從選關進入、前往下一關或點擊重新開始）顯示一次廣告；瀏覽器測試 gateway 以全螢幕畫面模擬 30 秒，沒有商店跳轉或誘導點擊控制。正式 iOS 插頁廣告的長度、廣告內商店連結與 X 關閉按鈕由 AdMob SDK／廣告素材控制。
- 暫停、玩法說明、重玩、音效及觸覺設定、減少動態效果。
- 星等與關卡進度自動保存；未完成棋盤不保存。
- 目前不提供貓幣、商店、每日獎勵或購買獎勵；上一步次數用完時，可觀看獎勵廣告補充 5 次，且只在目前關卡有效。

### 設計文件

- [遊玩規則](docs/遊玩規則.md)
- [後續關卡設計](docs/後續關卡設計.md)：包含 16–30 關基礎設計、五關版型意圖，以及 31–90 關的主線銜接說明。
- [31–90 關卡設計規格](docs/31-90關卡設計規格.md)：60 關固定盤面、逐關設計卡、resolver 驗證與難度驗收記錄。

### 程式分層

- `src/game/core/dropEngine.ts`：落下、四方向消除、重力、分數、勝負。
- `src/game/phaser/useDropGame.ts`：動畫階段、輸入鎖、暫停與重玩生命週期。
- `src/game/phaser/DropBoard.tsx`：React 棋盤與落點預覽。
- `src/game/data/planningLevels.ts`、`src/game/data/planningLevelTwo.ts`、`src/game/data/planningLevelThree.ts`、`src/game/data/planningLevelFour.ts`、`src/game/data/planningLevelFive.ts`、`src/game/data/planningExtendedLevels.ts`：第 1–90 關固定棋盤與托盤解法。
- 第 31–90 關已加入主線，沿用同一套支撐、方向與合流規則；關卡資料使用固定 seed 載入，不依賴裝置隨機或線上題庫。
- `src/app/screens/GameScreen.tsx`：資料驅動的關卡介面、說明與結算。
- `src/styles/game-drop.css`：新版棋盤樣式與動畫。
- `src/services/`、`src/state/`：沿用音效、震動、設定與本機存檔。

舊 Phaser 拼圖與交換三消程式暫存供歷史參考，目前遊戲入口已不使用它們。新玩法不需要 Phaser 執行包。

## 驗證

```bash
npm run lint
npm test
npm run test:coverage
npm run build
```

核心新規則與動畫流程覆蓋率可獨立檢查：

```bash
npm run test:coverage -- --coverage.include='src/game/core/dropEngine.ts' --coverage.include='src/game/phaser/useDropGame.ts'
```

## App Store 與 iOS

- 隱私權政策、使用條款與客服頁面已放在 `public/privacy.html`、`public/terms.html`、`public/support.html`，客服信箱為 `meowbox2026@gmail.com`。
- App 內設定頁也可開啟相同內容；目前會以 Supabase 匿名使用者與事件資料記錄工作階段、關卡結果、過關時間、提示與星等，用於關卡與體驗分析，不收集玩家註冊資料。`ios/App/App/PrivacyInfo.xcprivacy` 同步聲明匿名分析資料類型，未將分析資料用於跨 App 追蹤。
- iOS App 圖示為 `public/app-icon.png`，Xcode 1024 × 1024 圖示位於 `ios/App/App/Assets.xcassets/AppIcon.appiconset/`。

在 Xcode 執行 iPhone 版本：

```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

在 Xcode 選取 `App` target、連接已信任的 iPhone，確認 Signing Team 後按 Run。App Store Connect 網址如下：Privacy Policy：`https://meowbox.vercel.app/privacy.html`、Terms of Use：`https://meowbox.vercel.app/terms.html`、Support：`https://meowbox.vercel.app/support.html`。

## 原生上架前設定

`capacitor.config.ts` 已經就緒。專案已加入 `@capacitor-community/admob`，瀏覽器仍使用本機測試 gateway；iOS 原生環境在 `.env.local` 設定完整 AdMob ID 後，會改用 SDK 的插頁與獎勵廣告回呼。正式廣告單位已在 AdMob 的 Meow Box iOS 應用程式中啟用；請不要把本機環境檔加入 git。先複製環境範本並填入 AdMob 後台產生的三個 ID：

```bash
cp .env.example .env.local
```

開發測試時保持 `VITE_ADMOB_TESTING=true`；正式 App Store／TestFlight build 使用已啟用的正式廣告單位時設為 `false`。iOS 還必須把同一個 App ID 寫入 `ios/App/App/Info.plist` 的 `GADApplicationIdentifier`，並保留 SKAdNetwork 與 ATT 設定，再同步原生專案：

```bash
npx cap sync ios
```

正式原生插頁／獎勵廣告與同平台 Cloud Save 需要上述平台帳號、廣告單位 ID，以及 AdMob 後台的付款、稅務與身分驗證資料；這些私人識別資料不會寫入專案原始碼。正式廣告 SDK 接入後，顯示時間、曝光、獎勵完成與關閉時機以供應商回呼為準，不能用前端自製倒數取代，也不能要求玩家點擊廣告、開啟商店或以點擊換取獎勵。
