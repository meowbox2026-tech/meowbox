# MEOW BOX｜貓咪裝箱拼圖

以 React + TypeScript + Phaser + Capacitor 建立的直式手機拼圖遊戲原型。畫面以 9:16 為設計基準，直接使用 `allpng` 提供的 UI 素材；房間背景已轉為 1080 × 1920 高品質 WebP 優化載入體積，並內建 Huninn 繁中圓體，避免手機端退回一般系統字型。

## 開始使用

```bash
npm install
npm run dev
```

建立正式 Web 包：

```bash
npm run build
```

## 已完成的功能

- 首頁、關卡選擇、遊戲、收藏、商店、設定、每日獎勵。
- Phaser 棋盤：拖放、Grid Snap、獨立貓咪選擇區、已放置貓咪調整、Undo、Restart、Hint、Auto Place、旋轉。
- 第一關是 3×3 自由放置關：9 隻 1×1 貓咪素材分成每組 4 隻，放滿一組後自動顯示下一組。
- 資料驅動的 30 關導入順序，涵蓋障礙格、睡覺貓、黏黏貓、伸縮貓、箱蓋與限步挑戰。
- 獎勵廣告測試閘道：Hint、Auto Place、+3 Moves、叫醒睡覺貓、雙倍過關與每日雙倍。
- Local Save、設定、貨幣、星星、收藏與每日獎勵；貓幣與生命值 UI 目前暫時隱藏，原生 Preferences / Haptics 橋接已接入。
- 雲端存檔以可替換 provider 介面實作合併策略，保留 iCloud / Google Play Games 的原生接入點。
- `ArtworkButton` 專責將素材 WebP 做為按鈕外觀，文字則保持 HTML，兼顧可讀性、無障礙與未來多語系；首頁、遊戲操作、暫停與獎勵視窗皆已套用。生命值控制使用 `life.webp`，UI 素材與五張房間背景皆使用 WebP。
- `ResultModal` 將過關標題、星星、獎勵操作與「關卡／下一關／重玩」固定在同一個畫面；領取後只更新按鈕狀態，不切換第二個彈窗。
- 遊戲頂部關卡卡使用 `levelcard.webp`，暫停面板使用 `paused.webp` 並提供對齊圖片的可點擊文字按鈕；暫停面板的「設定」可直接進入設定頁，商店金幣格使用 `coins.webp`、`collect.webp`、`gift.webp`。
- 正式貓咪素材改為 12 張透明 PNG（傲嬌、太陽、愛魚、三種普通色、獨處、睡覺、紙箱、調皮、貓老大、黏人），所有關卡共用這組圖片；每個 `CatDefinition` 同時保存 `occupancyMask`、`anchor`、`offset` 與 `bleed`，碰撞只讀邏輯遮罩，不讀圖片 alpha。
- 第一關將 `PuzzleFloor` 地板元件、`CatPlacementArea` 貓咪放置元件與 `CatSelectionTray` 選擇區分開；3×3 地板使用 9 張 `boxes/modular/floor.png`，後續關卡仍可沿用完整紙箱模組。
- Phaser 紙箱使用多層紙板邊緣、內凹腔體、格子高低光、折角、前緣遮擋與接觸陰影；貓咪放下時會先下落，再產生輕微下沉與 squash/settle 回彈。

## 分層

- `src/app/`：React 畫面、彈窗與可重用 UI。
- `src/game/core/`：可單元測試的拼圖規則，完全不依賴 Phaser。
- `src/game/phaser/`：棋盤繪製、拖放和視覺回饋。
- `src/game/data/`：關卡定義，不把關卡寫死在 Scene。
- `src/services/`：存檔、廣告、聲音、震動與雲端同步橋接。
- `src/state/`：玩家進度與設定。

所有手寫來源檔均低於 500 行。

## 驗證

```bash
npm run lint
npm test
npm run test:coverage
npm run build
```

目前核心規則、存檔、素材按鈕、暫停面板、關卡卡、過關彈窗與法律頁面測試共 106 項；覆蓋率（核心規則與存檔範圍）會在 `npm run test:coverage` 產生最新報告。

## App Store 與 iOS

- 隱私權政策、使用條款與客服頁面已放在 `public/privacy.html`、`public/terms.html`、`public/support.html`，客服信箱為 `meowbox2026@gmail.com`。
- App 內設定頁也可開啟相同內容；`ios/App/App/PrivacyInfo.xcprivacy` 已聲明目前只使用本機 UserDefaults 儲存進度，不做追蹤。
- iOS App 圖示為 `public/app-icon.png`，Xcode 1024 × 1024 圖示位於 `ios/App/App/Assets.xcassets/AppIcon.appiconset/`。

在 Xcode 執行 iPhone 版本：

```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

在 Xcode 選取 `App` target、連接已信任的 iPhone，確認 Signing Team 後按 Run。App Store Connect 的 Privacy Policy URL 請填部署後的 `https://你的 Pages 網域/privacy.html`，Support URL 請填 `/support.html`。

## 原生上架前設定

`capacitor.config.ts` 已經就緒。完成 Apple / Google 的 App ID、AdMob 單位 ID、iCloud / Game Center、Google Play Games 設定後，可執行：

```bash
npx cap add ios
npx cap add android
npx cap sync
```

原生 Rewarded Ads 與同平台 Cloud Save 需要上述平台帳號與憑證，這些私人識別資料不會寫入專案原始碼。
