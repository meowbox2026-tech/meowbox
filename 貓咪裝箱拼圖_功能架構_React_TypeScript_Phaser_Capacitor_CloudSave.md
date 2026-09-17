# 貓咪裝箱拼圖｜功能架構

## 一、遊戲定位

一款以「把不同形狀的貓咪完整塞進紙箱」為核心的休閒益智遊戲。

遊戲重點：

- 規則簡單，玩家可以快速理解
- 靠不同箱型、貓咪佔位、特殊規則產生大量關卡
- 不依賴大量新素材
- 以療癒、可愛、輕鬆為主要視覺與遊戲感受
- 普通關卡可以自由嘗試與重新排列
- 挑戰關卡加入步數限制與特殊條件
- 商業模式以玩家主動選擇的 Rewarded Ads 為主

---

## 二、核心玩法

### 2.1 基本目標

玩家需要把本關所有貓咪完整放進紙箱的有效空間中。

過關時必須符合：

- 所有貓咪都已放入紙箱
- 貓咪不能重疊
- 貓咪不能超出紙箱範圍
- 不能放在障礙格
- 必須符合特殊貓咪規則
- 必須符合特殊箱子規則

### 2.2 貓咪佔位

每隻貓咪都有不同的格子 Shape。

例如：

```text
1×1
■

1×2
■■

1×3
■■■

1×4
■■■■

2×2
■■
■■

L 型
■■■
■

Z 型
■■
 ■■

T 型
■■■
 ■
```

同一種 Shape 可以套用不同貓咪外觀。

例如：

- 橘貓
- 黑貓
- 白貓
- 三花貓
- 英短
- 暹羅
- 布偶

Shape 負責玩法，Skin 負責外觀。

---

## 三、遊戲畫面架構

### 3.1 上方區域

顯示：

- Level 關卡編號
- 星星評價
- Paw Coin 貓掌幣
- Pause 暫停

### 3.2 中央區域

主要紙箱棋盤，約佔畫面 65%～70%。

功能：

- 顯示紙箱形狀
- 顯示有效格
- 顯示障礙格
- 顯示已放入的貓咪
- 顯示箱蓋狀態
- 顯示特殊規則提示

### 3.3 下方 Cat Tray

待放貓咪區，一次約顯示 4 隻貓咪。

玩家可以左右滑動查看本關所有剩餘貓咪。

功能：

- 顯示剩餘貓咪
- 顯示貓咪 Shape
- 顯示特殊貓咪 Icon
- 支援左右滑動
- 支援拖曳進入紙箱

本關所有貓咪從一開始就必須讓玩家知道。

不使用「放完才隨機出現未知下一隻」的方式。

### 3.4 下方操作功能

包含：

- Undo
- Restart
- Hint

後續可以加入：

- Auto Place
- 特殊救援功能

---

## 四、基本操作

### 4.1 Drag & Drop

玩家從 Cat Tray 拖曳貓咪到紙箱。

如果位置合法：

- 自動吸附到格子
- 顯示放置成功動畫
- 播放輕微音效與震動

如果位置不合法：

- 回到原位置
- 顯示紅色或抖動提示

### 4.2 重新移動

普通貓咪放入紙箱後，可以重新拿起來調整位置。

玩家可以反覆：

```text
放入
↓
發現不對
↓
拿起來
↓
重新排列
```

普通關卡不因單次放錯直接失敗。

### 4.3 Undo

回到上一步操作。

用途：

- 還原剛剛放置
- 還原移動
- 還原特殊操作

### 4.4 Restart

整關重新開始。

所有貓咪與紙箱狀態恢復初始配置。

---

## 五、第一版核心 Puzzle 機制

以下功能第一版正式遊戲全部需要具備，但不會在第 1 關一次全部出現。

### 5.1 障礙格

紙箱內部分位置不能放貓咪。

例如：

```text
□□□□□□
□□❌□□□
□□□□□□
□❌□□□□
□□□□□□
```

用途：

- 改變紙箱可用空間
- 產生不同排列方式
- 增加關卡變化

障礙物外觀可以是：

- 玩具
- 膠帶
- 毛線球
- 紙箱破洞
- 固定物品

### 5.2 睡覺貓

特殊貓咪。

規則：

- 可以正常拖曳
- 放下後會睡著
- 睡著後不能再次移動

玩家必須思考：「這隻貓應該什麼時候放？」

用途：

- 製造放置順序
- 增加死局可能
- 提供 Rewarded Ads 救援點

廣告功能：

```text
看廣告
↓
叫醒睡覺貓一次
↓
重新移動
```

### 5.3 黏黏貓

兩隻或多隻特殊貓咪必須保持相鄰。

例如：

```text
🐱🐱
```

可能規則：

- 必須上下相鄰
- 必須左右相鄰
- 只要相鄰即可

用途：

- 改變排列方式
- 增加空間限制
- 製造新的關卡解法

### 5.4 伸縮貓

特殊貓咪可以改變佔位長度。

例如：

```text
■■
```

可以變成：

```text
■■■
```

或：

```text
■■■■
```

可能尺寸：

- 1×2
- 1×3
- 1×4

玩家可以在放置前切換長度。

用途：

- 同一隻貓產生多種解法
- 增加關卡自由度
- 降低新素材需求

### 5.5 箱蓋

部分紙箱區域完成後會自動蓋起來。

規則：

- 區域填滿後箱蓋關閉
- 箱蓋關閉後，裡面的貓不能再移動
- 玩家必須先確認該區排列正確

用途：

- 製造區域完成順序
- 增加關卡策略
- 不需要新增大量素材即可提升難度

### 5.6 限步數關卡

不是所有關卡都有，主要出現在 Challenge 關卡。

例如：

```text
Moves：12
```

操作會消耗步數。

步數歸零但還沒完成：

```text
Challenge Failed
```

玩家可以：

- Restart
- 使用 Paw Coin 增加步數
- 看 Rewarded Ad +3 Moves

---

## 六、關卡類型

### 6.1 一般關卡

特色：

- 無時間限制
- 無步數限制
- 普通貓可以自由重新移動
- 主要讓玩家理解與享受 Puzzle

### 6.2 特殊機制關卡

會加入：

- 障礙格
- 睡覺貓
- 黏黏貓
- 伸縮貓
- 箱蓋

可以單獨使用，也可以互相組合。

### 6.3 Challenge 關卡

加入：

- 限步數
- 較複雜箱型
- 多種特殊貓咪
- 多種限制同時出現

失敗後可：

- Restart
- 看廣告增加步數
- 使用 Paw Coin 增加步數

---

## 七、建議關卡導入順序

雖然第一版所有核心機制都要完成，但玩家不會一次全部遇到。

建議：

```text
Lv.1～3
基本塞箱

Lv.4～6
障礙格

Lv.7～10
睡覺貓

Lv.11～15
黏黏貓

Lv.16～20
伸縮貓

Lv.21～25
箱蓋

Lv.26+
混合機制 + 限步數 Challenge
```

後續關卡主要靠不同規則組合產生難度。

例如：

```text
L 型箱子
+
障礙格
+
睡覺貓
+
伸縮貓
```

或：

```text
雙箱子
+
黏黏貓
+
箱蓋
+
12 Moves
```

---

## 八、過關條件

正式過關條件：

所有本關貓咪都完整放入紙箱有效格內，並符合所有特殊規則。

需要符合：

- 所有貓咪已使用
- 沒有重疊
- 沒有超出紙箱
- 沒有放入障礙格
- 黏黏貓符合相鄰條件
- 伸縮貓狀態合法
- 箱蓋條件完成
- 睡覺貓狀態合法

全部完成：

```text
LEVEL COMPLETE
```

---

## 九、失敗與卡關

### 9.1 普通關卡

普通關卡沒有硬性 Game Over。

玩家可以自由重新排列。

如果系統判斷目前配置已經無法完成，可以提示：

```text
好像卡住了 🐾
```

提供：

- Undo
- Restart
- Hint

### 9.2 Challenge 關卡失敗

當：

```text
Moves = 0
```

而關卡尚未完成。

顯示：

```text
Challenge Failed
```

選項：

- Restart
- Paw Coin +3 Moves
- 看廣告 +3 Moves

---

## 十、提示系統

### 10.1 Hint

玩家卡住時使用。

效果：

- 顯示一隻貓的正確位置
- 或提示下一隻適合放置的貓

取得方式：

- 免費次數
- Paw Coin
- Rewarded Ad

### 10.2 Auto Place

直接幫玩家放好一隻貓。

取得方式：

- Paw Coin
- Rewarded Ad

---

## 十一、星星評價

完成關卡即可獲得至少 1 星。

建議：

```text
★★★
目標步數內完成
且沒有使用 Hint

★★
超過目標步數
或使用少量 Hint

★
成功完成即可
```

普通關卡不會因為沒拿三星而無法繼續。

---

## 十二、遊戲貨幣

### 12.1 Paw Coin

主要遊戲貨幣。

取得方式：

- 過關
- 每日獎勵
- Challenge
- Rewarded Ad
- 未來活動

用途：

- Hint
- Auto Place
- +3 Moves
- 叫醒睡覺貓
- Cat Skin
- Box Skin

---

## 十三、營收模式

第一版不使用「每過幾關強制跳廣告」。

主要採 Rewarded Ads，玩家自己決定要不要觀看。

### 13.1 Hint 廣告

```text
看廣告
↓
取得 Hint
```

### 13.2 Auto Place 廣告

```text
看廣告
↓
自動放好一隻貓
```

### 13.3 Challenge +3 Moves

當步數歸零：

```text
看廣告
↓
+3 Moves
```

### 13.4 睡覺貓救援

睡覺貓放錯後：

```text
看廣告
↓
叫醒一次
↓
重新移動
```

### 13.5 過關獎勵加倍

例如：

```text
正常領取
🐾 50
```

或：

```text
看廣告
↓
🐾 100
```

---

## 十四、外觀與收藏

### 14.1 Cat Skin

可以解鎖：

- 橘貓
- 黑貓
- 白貓
- 三花
- 英短
- 暹羅
- 布偶
- 節慶造型

Skin 不改變 Shape，只改外觀。

### 14.2 Box Skin

例如：

- 普通紙箱
- 草莓箱
- 櫻花箱
- 星空箱
- 萬聖節箱
- 聖誕箱

不影響實際關卡規則。

---

## 十五、每日系統

第一版可以加入簡單每日獎勵。

例如：

```text
Day 1  Paw Coin
Day 2  Paw Coin
Day 3  Hint
Day 4  Paw Coin
Day 5  Cat Skin
Day 6  Paw Coin
Day 7  特殊獎勵
```

可提供：

```text
看 Rewarded Ad
↓
今日獎勵 ×2
```

---

## 十六、存檔系統

第一版至少需要 Local Save。

儲存：

- 玩家目前關卡
- 已完成關卡
- 星星數
- Paw Coin
- 已解鎖 Skin
- 每日獎勵狀態
- 遊戲設定

---

## 十七、第一版功能總表

### 必做

- [ ] 關卡系統
- [ ] 紙箱 Grid
- [ ] 多種紙箱 Shape
- [ ] 多種貓咪 Shape
- [ ] Drag & Drop
- [ ] Snap 自動吸附
- [ ] Cat Tray
- [ ] Cat Tray 左右滑動
- [ ] 已放置貓咪重新移動
- [ ] Undo
- [ ] Restart
- [ ] Hint
- [ ] Auto Place
- [ ] 障礙格
- [ ] 睡覺貓
- [ ] 黏黏貓
- [ ] 伸縮貓
- [ ] 箱蓋
- [ ] 限步數 Challenge
- [ ] 過關判定
- [ ] 失敗判定
- [ ] 星星評價
- [ ] Paw Coin
- [ ] Rewarded Ads
- [ ] +3 Moves
- [ ] 睡覺貓救援
- [ ] 過關獎勵 ×2
- [ ] Cat Skin
- [ ] Box Skin
- [ ] 每日獎勵
- [ ] Local Save
- [ ] 基本音效
- [ ] 基本震動
- [ ] 基本動畫

---

## 十八、核心設計原則

這款遊戲不是靠一直增加新素材延長內容。

主要依靠：

```text
不同箱型
×
不同貓咪 Shape
×
障礙格
×
睡覺貓
×
黏黏貓
×
伸縮貓
×
箱蓋
×
限步數
```

產生大量關卡組合。

核心方向：

> 少量素材 + 多種規則排列組合 = 大量 Puzzle 關卡

---

# 十七、正式技術架構

本遊戲第一版正式採用：

```text
React
+
TypeScript
+
Phaser
+
Capacitor
```

技術原則：

- 不使用 Unity
- 不使用 PixiJS
- React 負責 App UI
- TypeScript 負責資料結構與核心邏輯
- Phaser 負責遊戲畫面與互動
- Capacitor 負責 iOS / Android App 打包與原生功能

---

## 17.1 React

React 負責非核心遊戲畫面與 App UI。

主要負責：

- Home 首頁
- Level Select 關卡選擇
- Shop 商店
- Cat Collection 貓咪收藏
- Box Collection 箱子收藏
- Daily Reward 每日獎勵
- Settings 設定
- Pause UI
- Result 過關畫面
- Challenge Failed 畫面
- Rewarded Ad 按鈕與提示視窗

React 不負責棋盤碰撞、格子吸附與遊戲迴圈。

---

## 17.2 TypeScript

整個專案統一使用 TypeScript。

用途：

- Cat Shape 型別
- Level Data 關卡資料
- Game State
- Save Data
- Reward 系統
- 廣告狀態
- 商店資料
- Puzzle Rule 驗證
- 避免大型專案後期大量型別錯誤

---

## 17.3 Phaser

Phaser 負責核心遊戲畫面與遊戲互動。

主要負責：

- Box Grid
- Cat Shape
- Drag & Drop
- Grid Snap
- 合法位置判定
- 碰撞判定
- Cat Tray 遊戲物件
- 障礙格
- 睡覺貓
- 黏黏貓
- 伸縮貓
- 箱蓋
- 限步數 Challenge
- Tween
- 動畫
- 粒子效果
- 音效
- 相機效果
- Hint 顯示
- Auto Place 動畫
- 過關效果

核心 Puzzle 規則應獨立成純 TypeScript 模組，不要全部寫死在 Phaser Scene。

---

## 17.4 Capacitor

Capacitor 負責把 Web 遊戲打包成正式 App。

輸出：

```text
Web
iOS
Android
```

主要橋接：

- iOS 原生功能
- Android 原生功能
- Haptics 震動
- Status Bar
- App Lifecycle
- Local Storage / Preferences
- Rewarded Ads
- 未來 IAP
- 未來通知
- 未來 Cloud Save

---

# 十八、技術分工

```text
React + TypeScript
│
├── Home
├── Level Select
├── Shop
├── Collection
├── Daily Reward
├── Settings
├── Result UI
└── Game Screen
      │
      └── Phaser
           │
           ├── Grid
           ├── Cats
           ├── Drag & Drop
           ├── Snap
           ├── Puzzle Rules
           ├── Obstacles
           ├── Special Cats
           ├── Box Lid
           ├── Challenge
           └── Effects

          ↓

      Game State / Save State
          │
          ↓

       Capacitor
          │
      ┌───┴────┐
     iOS     Android
```

---

# 十九、建議專案資料夾

```text
src/
│
├── app/
│   ├── routes/
│   ├── screens/
│   └── components/
│
├── game/
│   ├── phaser/
│   │   ├── scenes/
│   │   ├── objects/
│   │   ├── effects/
│   │   └── input/
│   │
│   ├── core/
│   │   ├── grid/
│   │   ├── placement/
│   │   ├── validation/
│   │   ├── win-condition/
│   │   └── challenge/
│   │
│   └── rules/
│       ├── obstacle.ts
│       ├── sleeping-cat.ts
│       ├── sticky-cat.ts
│       ├── stretch-cat.ts
│       └── box-lid.ts
│
├── data/
│   ├── levels/
│   ├── cats/
│   ├── skins/
│   └── rewards/
│
├── state/
│   ├── game-store.ts
│   ├── player-store.ts
│   └── settings-store.ts
│
├── services/
│   ├── save/
│   ├── ads/
│   ├── audio/
│   ├── haptics/
│   └── analytics/
│
├── types/
│   ├── level.ts
│   ├── cat.ts
│   ├── save.ts
│   └── reward.ts
│
└── assets/
    ├── cats/
    ├── boxes/
    ├── ui/
    ├── audio/
    └── effects/
```

---

# 二十、關卡資料格式

關卡不要寫死在 Scene 裡。

使用 JSON / TypeScript Data 驅動。

範例：

```json
{
  "id": 26,
  "type": "challenge",
  "board": {
    "width": 6,
    "height": 6
  },
  "blockedCells": [
    [2, 1],
    [4, 3]
  ],
  "cats": [
    {
      "id": "cat_01",
      "shape": "1x3",
      "type": "normal"
    },
    {
      "id": "cat_02",
      "shape": "2x2",
      "type": "sleeping"
    },
    {
      "id": "cat_03",
      "shape": "L",
      "type": "sticky"
    }
  ],
  "moves": 12,
  "boxLid": true
}
```

優點：

- AI 可以快速產生大量關卡
- 不修改程式即可新增關卡
- 容易做關卡編輯器
- 容易調整難度
- 容易批次驗證關卡是否有解

---

# 二十一、核心邏輯與畫面分離

不要把「能不能放」直接寫死在 Phaser Sprite 裡。

建議流程：

```text
Phaser
↓
玩家拖貓咪
↓
取得 Grid Position
↓
Puzzle Core 驗證
↓
是否合法？
```

合法：

```text
Game State 更新
↓
Phaser 播放 Snap 動畫
```

不合法：

```text
Game State 不變
↓
Phaser 播放回彈動畫
```

這樣未來比較容易：

- 做 Hint
- 做 Auto Place
- 做自動解題
- 驗證關卡是否有解
- 做關卡編輯器
- 寫單元測試

---

# 二十二、存檔技術

第一版：

```text
Local Save
```

建議透過 Capacitor Preferences 或其他本地儲存方案。

儲存：

```text
currentLevel
completedLevels
stars
pawCoins
unlockedCatSkins
unlockedBoxSkins
dailyReward
settings
```

未來再視需要加入 Cloud Save。

---

# 二十三、廣告技術

主要使用 Rewarded Ads。

廣告觸發：

- Hint
- Auto Place
- +3 Moves
- Wake Sleeping Cat
- Reward ×2
- Daily Reward ×2

分工：

```text
React
↓
顯示廣告按鈕 / UI

Ads Service
↓
統一管理廣告邏輯

Capacitor Plugin
↓
呼叫 iOS / Android 原生廣告 SDK

Reward Callback
↓
更新 Game State
```

Phaser 不直接控制廣告 SDK。

---

# 二十四、開發原則

## UI

使用 React。

## 遊戲

使用 Phaser。

## 資料與規則

使用 TypeScript 純邏輯模組。

## App 打包

使用 Capacitor。

## 關卡

Data Driven，不寫死在程式裡。

## 儲存

第一版 Local Save。

## 廣告

Rewarded Ads 為主，不做每幾關強制插頁廣告。

---

# 二十五、正式技術結論

```text
React
│
│ App UI
│
├───────────────┐
│               │
TypeScript      Phaser
│               │
資料 / 規則      遊戲 / 動畫 / 操作
│               │
└───────┬───────┘
        │
    Capacitor
        │
   ┌────┴────┐
  iOS      Android
```

正式開發 Stack：

> React + TypeScript + Phaser + Capacitor

這套架構優先針對：

- 2D Puzzle
- 手機直式遊戲
- Drag & Drop
- Grid
- 大量關卡
- Rewarded Ads
- iOS / Android 同一套程式碼

---

# 二十六、Cloud Save 雲端存檔

第一版正式支援平台原生 Cloud Save，但不強制玩家建立本遊戲自己的帳號。

## 26.1 iOS

使用：

```text
iCloud
+
Game Center
```

用途：

- 同步遊戲進度
- 換 iPhone / iPad 後恢復進度
- 使用 Apple 平台帳號識別玩家
- 不需要另外建立 Email / 密碼登入系統

建議同步資料：

```text
currentLevel
completedLevels
stars
pawCoins
unlockedCatSkins
unlockedBoxSkins
dailyReward
settings
```

永久購買狀態仍以 App Store 購買紀錄為準。

---

## 26.2 Android

使用：

```text
Google Play Games
+
Cloud Save
```

用途：

- 同步遊戲進度
- 換 Android 裝置後恢復進度
- 使用 Google Play Games 帳號識別玩家
- 不需要另外建立遊戲帳號

建議同步資料：

```text
currentLevel
completedLevels
stars
pawCoins
unlockedCatSkins
unlockedBoxSkins
dailyReward
settings
```

永久購買狀態仍以 Google Play 購買紀錄為準。

---

## 26.3 本機存檔與雲端存檔關係

遊戲仍然保留 Local Save。

架構：

```text
遊戲中
↓
先寫入 Local Save
↓
有網路時
↓
同步 Cloud Save
```

好處：

- 沒網路也能玩
- 存檔速度快
- 雲端同步失敗時不影響正常遊戲
- 換裝置時可以恢復進度

建議原則：

```text
Local Save = 即時主要存檔
Cloud Save = 備份與跨裝置同步
```

---

## 26.4 同步衝突處理

如果本機與雲端資料不同，不直接覆蓋。

建議先比較：

```text
updatedAt
currentLevel
completedLevels
stars
```

基本策略：

```text
較新的存檔優先
```

如果兩邊差異過大，可顯示選擇：

```text
使用本機進度
或
使用雲端進度
```

避免玩家進度被錯誤覆蓋。

---

## 26.5 購買與 Restore Purchases

Cloud Save 不取代 App Store / Google Play 的購買系統。

永久購買例如：

- Remove Ads
- 永久 Cat Skin Pack
- 永久 Box Skin Pack
- Starter Pack 中的永久內容

仍由：

```text
iOS
App Store / StoreKit

Android
Google Play Billing
```

負責驗證。

設定頁保留：

```text
Restore Purchases
```

用途：

- 玩家刪除 App 後重新安裝
- 換新裝置
- 重新取得永久購買內容

本機可以快取：

```text
permanentPurchaseState
```

但正式判定仍以商店購買紀錄為準。

---

## 26.6 第一版登入規則

第一版：

```text
不做自建帳號
不做 Email / Password
不強制註冊
```

玩家直接進遊戲。

平台雲端同步依靠：

```text
iOS → iCloud / Game Center
Android → Google Play Games
```

玩家不需要額外建立 MEOW BOX 帳號。

---

## 26.7 跨平台限制

需要注意：

```text
iCloud / Game Center
≠
Google Play Games
```

兩邊的 Cloud Save 彼此不互通。

因此：

```text
iPhone → iPhone
可以同步

Android → Android
可以同步

iPhone → Android
第一版不支援直接同步
```

如果未來需要：

```text
iPhone ↔ Android
```

共用同一份進度，再升級為：

```text
Supabase
+
Sign in with Apple
+
Sign in with Google
```

建立自己的 User ID 與跨平台 Cloud Save。

---

## 26.8 Cloud Save 資料格式

建議：

```json
{
  "version": 1,
  "updatedAt": "2026-09-17T01:00:00Z",
  "currentLevel": 26,
  "completedLevels": [1, 2, 3, 4, 5],
  "stars": {
    "1": 3,
    "2": 3,
    "3": 2
  },
  "pawCoins": 1250,
  "unlockedCatSkins": [
    "orange_cat",
    "black_cat"
  ],
  "unlockedBoxSkins": [
    "default_box"
  ],
  "dailyReward": {
    "lastClaimDate": "2026-09-17",
    "streak": 4
  },
  "settings": {
    "music": true,
    "sound": true,
    "haptics": true,
    "language": "zh-TW"
  }
}
```

---

## 26.9 Cloud Save 開發 Checklist

- [ ] Local Save
- [ ] Save Data Version
- [ ] updatedAt 時間戳
- [ ] iOS iCloud 設定
- [ ] iOS Game Center 整合
- [ ] Android Google Play Games 整合
- [ ] Android Cloud Save 整合
- [ ] 上傳雲端存檔
- [ ] 下載雲端存檔
- [ ] App 啟動時同步
- [ ] App 進入背景時同步
- [ ] 過關後同步
- [ ] 購買後同步相關狀態
- [ ] 本機 / 雲端衝突判斷
- [ ] 離線模式
- [ ] Cloud Save 失敗重試
- [ ] Restore Purchases
- [ ] 換裝置恢復測試
- [ ] iOS → iOS 恢復測試
- [ ] Android → Android 恢復測試

---

# 二十七、更新後正式儲存架構

```text
React + TypeScript + Phaser
          │
          ↓
      Game State
          │
          ↓
      Local Save
          │
     ┌────┴────┐
     │         │
    iOS      Android
     │         │
 iCloud /   Google Play
Game Center   Games
     │         │
 Cloud Save  Cloud Save
```

第一版原則：

> 玩家不用註冊即可遊玩。

> Local Save 負責即時存檔。

> Apple / Google Cloud Save 負責同平台換裝置恢復。

> 永久購買由 App Store / Google Play 負責恢復。

> 未來真的需要 iPhone 與 Android 共用同一份進度，再加入 Supabase 帳號系統。
