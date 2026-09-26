# MEOW LINE｜喵序｜貓咪落下連線

以 React + TypeScript + Phaser + Capacitor 建立的直式手機貓咪落下連線解謎遊戲。玩家選擇欄位讓貓咪落下，三隻以上同款貓咪連成橫、直或斜線即可消除，掉落後還會觸發連鎖。所有頁面以 iPhone SE 直式 CSS viewport（375 × 667）為設計基準，並以 safe-area 與容器單位維持其他手機的可用性；UI 素材使用 `public/assets` 的 WebP 與 `public/assets-native` 的原生 PNG，花園背景已轉為高品質 WebP 優化載入體積，並內建 Huninn 繁中圓體，避免手機端退回一般系統字型。

## 開始使用

正式 Web 版本部署於 Cloudflare Pages 專案 `meowbox`，網址為 `https://meowbox.pages.dev`。使用者以 `cloudflare2k7` 稱呼 Cloudflare 環境；它不是目前 Dashboard 顯示的 Pages 專案名稱。

```bash
npm install
npm run dev
```

建立正式 Web 包：

```bash
npm run build
```

### 遠端關卡與介面配色

遊戲啟動時會檢查 Cloudflare Pages 專案 `meowbox` 的內容版本；iOS App 使用 `https://meowbox.pages.dev/game-content/manifest.json`，網頁版使用目前 Pages 網址。關卡與主題色都只以 JSON 資料更新，不下載或執行遠端 JavaScript、HTML 或 CSS。App 內建完整遊戲和關卡，離線或遠端資料不合法時仍可玩。

遠端 manifest 以 RSA-PSS / SHA-256 簽名，App 內固定公開金鑰並同時驗證簽名、檔案雜湊、關卡格式與每關解答。私鑰只用於建置簽名，不會放進 App。成功下載的內容先作為候選版；App 完成啟動後才確認為穩定版。若下次開啟時候選版未被確認，App 會退回上一份已確認內容並暫時封鎖該版。啟動期間 0.9 秒內完成的更新會立即試用；較慢的下載先快取，在下次開啟時試用。玩家正在玩的棋盤不會被中途替換。

- `src/game/content/levels.json`：正式關卡資料，也是 App 內建備份。保留既有關卡 ID 和順序；調整難度時修改該關盤面、托盤或解答。新增關卡只能接在目前最後一關之後。
- `src/game/content/theme.json`：介面主題色。可調整頁面底色、文字、卡片、按鈕、關卡選單、棋盤和提示色；`src/styles/theme.css` 定義各色套用位置。修改時保留所有色彩欄位；貓咪插圖和按鈕圖片中的顏色仍由圖片素材決定。
- `src/game/content/manifest.json`：內容版本。每次發布關卡或主題變更，都把 `version` 加 1；回復舊內容時也要以新的、更大的版本號重新發布，不能把版本號倒退。

首次設定時，`npm run content:generate-key` 會產生一組簽名金鑰：公開金鑰放在 `src/services/gameContent/trustedContentPublicKey.txt` 並隨 App 發布；私鑰放在 `.secrets/game-content-private.pem`（已忽略、不提交）。請安全備份私鑰，並只把它設成 Cloudflare Pages 專案 `meowbox` 的 Production secret `GAME_CONTENT_SIGNING_PRIVATE_KEY`；不可改成 `VITE_` 變數或提交進 Git。Cloudflare 不會再顯示 secret 原文。不要未經安全評估就把 Production 私鑰複製到 Preview。每次修改內容後執行 `npm run build` 檢查；建置會產生簽名 manifest 與帶 SHA-256 的版本檔。Cloudflare Pages 已連接 `vvstudiocode/meowbox`，`main` 生產分支自動部署已啟用；審查並提交要發布的改動後，推送到 `main` 才會部署。若遺失私鑰，必須更換 App 內公開金鑰並重新送審新的 iOS binary。

2026-09-26 已修復：將完整 PEM（包含 BEGIN/END 標頭）以單行、字面 `\n` 換行格式存入 `meowbox` Production 的 `GAME_CONTENT_SIGNING_PRIVATE_KEY`，重試 commit `7f807d0` 後，部署 `8e2d485e-6e7b-459e-96bb-d04e3df445ff` 已成功。正式網址的內容版本 1 已通過 App 公開金鑰的 RSA-PSS 簽名驗證，以及關卡／主題檔案 SHA-256 驗證，包含 90 關與 30 個配色欄位。先前三次解析錯誤是歷史紀錄；這次無須更改遊戲程式碼。後續調整內容時，修改 JSON、增加內容版本號，再推送至 main 即可。

首次支援遠端內容的 iOS App 仍須經 App Store 發布；之後只調整既有機制可顯示的關卡資料或配色，可透過 Cloudflare Pages 更新 JSON。這不是完整網頁程式碼 Live Update：Apple 指引 2.5.2 禁止下載或執行會新增或改變 App 功能的程式碼。只更新既有格式的 JSON 內容，審查風險較低，但不能保證一定通過；簽名也不會讓遠端程式碼更新變合規。[Apple App Review Guideline 2.5.2](https://developer.apple.com/app-store/review/guidelines/)

遠端資料必須保留 1–90 關的 ID，並通過資料格式及完整解答驗證；任何一關格式錯誤或解不出來，整包更新都會被拒絕。玩家已取得的關卡進度與星星會保留。存檔目前支援最多 500 關。

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
- `src/game/content/levels.json`：第 1–90 關的正式資料，也是原生 App 的內建備份；`src/game/data/planningLevels.ts` 載入並驗證關卡。
- `src/services/gameContent/contentUpdate.ts`：向 Cloudflare 檢查關卡與主題版本，驗證後快取並套用。
- `src/services/gameContent/contentSignature.ts`、`contentRollback.ts`：驗證簽名、管理候選版與失敗回退。
- 第 31–90 關沿用同一套支撐、方向與合流規則；上架版本內含完整關卡資料，遠端版本可調整難度或追加新關。
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

在 Xcode 選取 `App` target、連接已信任的 iPhone，確認 Signing Team 後按 Run。Cloudflare Pages 網址如下：Privacy Policy：`https://meowbox.pages.dev/privacy.html`、Terms of Use：`https://meowbox.pages.dev/terms.html`、Support：`https://meowbox.pages.dev/support.html`。

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
