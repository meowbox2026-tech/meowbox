# MEOW BOX｜貓咪落下消除

以 React + TypeScript + Phaser + Capacitor 建立的直式手機落下消除遊戲原型。所有頁面以 iPhone SE 直式 CSS viewport（375 × 667）為設計基準，並以 safe-area 與容器單位維持其他手機的可用性；直接使用 `allpng` 提供的 UI 素材，房間背景已轉為 1080 × 1920 高品質 WebP 優化載入體積，並內建 Huninn 繁中圓體，避免手機端退回一般系統字型。

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

第 1–15 關使用固定 8×8 配置解謎：依托盤順序把貓咪放入空格，全部放好後才依序進行橫、直、斜三連線與局部重力；清空本關貓咪便過關。第 16–90 關使用貓咪落下消除，依關卡使用不同棋盤、倒數與消除目標；動畫、暫停、廣告與背景期間停表。

- NOW／NEXT 預覽、落點虛影、鍵盤操作、第一手引導。
- 點擊當下更新 NOW／NEXT；結算後保留上次欄位的落點預覽。每局一次廣告提示、一次復活（碰頂清底排／超時加賽 3 次），目前廣告為測試 gateway。
- 落地回彈、愛心星光、連鎖加分、頂端警戒、成功與失敗結算。
- 暫停、玩法說明、重玩、音效及觸覺設定、減少動態效果。
- 星等和過關貓掌幣自動保存；未完成棋盤不保存。
- 90 關資料已完成；第 1–15 關使用配置解謎、第 16–90 關使用落下引擎。玩家依序完成關卡解鎖下一關，舊存檔不會帶玩家進入錯誤玩法。

### 設計文件

- [遊玩規則](docs/game-design/遊玩規則.md)
- [後續關卡設計](docs/game-design/後續關卡設計.md)

### 程式分層

- `src/game/core/dropEngine.ts`：落下、四方向消除、重力、分數、勝負。
- `src/game/phaser/useDropGame.ts`：動畫階段、輸入鎖、暫停與重玩生命週期。
- `src/game/phaser/DropBoard.tsx`：React 棋盤與落點預覽。
- `src/game/data/planningLevels.ts`、`src/game/data/planningLevelTwo.ts`：第 1–15 關固定棋盤與托盤解法。
- `src/game/data/dropLevels.ts`：第 16–90 關棋盤、貓種、秒數、目標與初始盤面。
- `src/app/screens/GameScreen.tsx`：資料驅動的關卡介面、說明、結算與獎勵。
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
- App 內設定頁也可開啟相同內容；`ios/App/App/PrivacyInfo.xcprivacy` 已聲明目前只使用本機 UserDefaults 儲存進度，不做追蹤。
- iOS App 圖示為 `public/app-icon.png`，Xcode 1024 × 1024 圖示位於 `ios/App/App/Assets.xcassets/AppIcon.appiconset/`。

在 Xcode 執行 iPhone 版本：

```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

在 Xcode 選取 `App` target、連接已信任的 iPhone，確認 Signing Team 後按 Run。App Store Connect 網址如下：Privacy Policy：`https://meowbox.pages.dev/privacy.html`、Terms of Use：`https://meowbox.pages.dev/terms.html`、Support：`https://meowbox.pages.dev/support.html`。

## 原生上架前設定

`capacitor.config.ts` 已經就緒。完成 Apple / Google 的 App ID、AdMob 單位 ID、iCloud / Game Center、Google Play Games 設定後，可執行：

```bash
npx cap add ios
npx cap add android
npx cap sync
```

原生 Rewarded Ads 與同平台 Cloud Save 需要上述平台帳號與憑證，這些私人識別資料不會寫入專案原始碼。
