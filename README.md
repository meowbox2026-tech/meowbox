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
- Phaser 棋盤：拖放、Grid Snap、托盤左右滑動、已放置貓咪調整、Undo、Restart、Hint、Auto Place、旋轉。
- 資料驅動的 30 關導入順序，涵蓋障礙格、睡覺貓、黏黏貓、伸縮貓、箱蓋與限步挑戰。
- 獎勵廣告測試閘道：Hint、Auto Place、+3 Moves、叫醒睡覺貓、雙倍過關與每日雙倍。
- Local Save、設定、貨幣、星星、收藏與每日獎勵；原生 Preferences / Haptics 橋接已接入。
- 雲端存檔以可替換 provider 介面實作合併策略，保留 iCloud / Google Play Games 的原生接入點。
- `ArtworkButton` 專責將素材 WebP 做為按鈕外觀，文字則保持 HTML，兼顧可讀性、無障礙與未來多語系；首頁、遊戲操作、暫停與獎勵視窗皆已套用。生命值控制使用 `life.webp`，UI 素材與五張房間背景皆使用 WebP。
- `ResultModal` 將過關標題、星星、獎勵操作與「關卡／下一關／重玩」固定在同一個畫面；領取後只更新按鈕狀態，不切換第二個彈窗。
- 遊戲頂部關卡卡使用 `levelcard.webp`，暫停面板使用 `paused.webp` 並提供對齊圖片的可點擊文字按鈕；暫停面板的「設定」可直接進入設定頁，商店金幣格使用 `coins.webp`、`collect.webp`、`gift.webp`。

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

目前核心規則、存檔、素材按鈕、暫停面板、關卡卡與過關彈窗測試共 28 項；覆蓋率（核心規則與存檔範圍）會在 `npm run test:coverage` 產生最新報告。

## 原生上架前設定

`capacitor.config.ts` 已經就緒。完成 Apple / Google 的 App ID、AdMob 單位 ID、iCloud / Game Center、Google Play Games 設定後，可執行：

```bash
npx cap add ios
npx cap add android
npx cap sync
```

原生 Rewarded Ads 與同平台 Cloud Save 需要上述平台帳號與憑證，這些私人識別資料不會寫入專案原始碼。
