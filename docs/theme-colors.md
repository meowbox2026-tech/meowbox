# 主題配色欄位（中文對照）

排行榜新增欄位：`socialText` 文字、`socialMutedText` 說明文字、`socialBorder` 框線、`socialBackgroundTop/Bottom` 面板漸層、`socialAvatarBackground` 頭像底色、`socialShadow` 陰影、`socialButtonBackground` 按鈕底色、`socialSelectedBackground` 選取及自己排名底色、`socialInputBackground` 輸入框、`socialFocus` 操作焦點、`socialErrorText` 錯誤文字。

所有色值統一修改 `src/game/content/theme.json`，各部位有獨立欄位，不共用托盤、計時器與設定面板的顏色。不是各拆一個下載檔案，保持現有簽章協定。

- 六碼 `#RRGGBB` 或八碼 `#RRGGBBAA`；透明用 `#00000000`。
- `themeFields.json` 是欄位定義與中文說明，不是色值來源。
- 新增欄位須先隨新版 App 發佈讀取／渲染支援；舊 App 不會因部署 JSON 自動支援新欄位。
- 已支援欄位之後只需修改 JSON、提高 manifest.json 的 version、建置簽章並部署；App 下次成功同步後套用，不是即時推播。
- 新版 App 讀取舊 JSON，新增欄位使用內建預設；既有必要欄位缺少或任何已知欄位格式錯誤會拒絕整份主題。
- 圖片內的像素、文案、尺寸與程式行為不由這份配色 JSON 修改。
- `positiveStart/End/Strong`、`selection` 等既有通用值保留相容；專屬欄位優先。新 App 的救援文案色請改 `goalText`，不是 `textStrong`。
- 棋盤格改接真正顯示的背景漸層；預設透明水藍色保留原本有效 CSS 的外觀。

## 欄位

| 欄位 | 中文說明 | 預設值 |
|---|---|---|
| `pageBackground` | App 外圍底色 | `#5f3c2b` |
| `textPrimary` | 通用內文 | `#633c2f` |
| `textStrong` | 通用強調文字（專屬欄位優先） | `#6d3925` |
| `textMuted` | 通用次要文字（專屬欄位優先） | `#8c6b54` |
| `surface` | 通用面板底色 | `#fffaf1` |
| `surfaceAlt` | 通用面板次色 | `#f3d6b9` |
| `surfaceElevated` | 通用浮起卡片底色 | `#fffdf7` |
| `surfaceBorder` | 通用邊框 | `#d6b08e` |
| `brand` | 通用品牌文字 | `#6d3925` |
| `brandStrong` | 深品牌色 | `#5a3023` |
| `accent` | 通用裝飾色 | `#f4c589` |
| `accentStrong` | 通用醒目框線 | `#f3a647` |
| `buttonText` | 一般按鈕文字 | `#fffdf7` |
| `buttonPrimaryStart` | 主要按鈕漸層上色 | `#8de965` |
| `buttonPrimaryEnd` | 主要按鈕漸層下色 | `#45b932` |
| `buttonSecondaryStart` | 藍色按鈕漸層上色 | `#72dfff` |
| `buttonSecondaryEnd` | 藍色按鈕漸層下色 | `#199ed9` |
| `buttonWarmStart` | 暖色按鈕漸層上色 | `#fffaf1` |
| `buttonWarmEnd` | 暖色按鈕漸層下色 | `#f3d6b8` |
| `positiveStart` | 正向狀態漸層上色（保留舊 App 相容） | `#dfff92` |
| `positiveEnd` | 正向狀態漸層下色（保留舊 App 相容） | `#a7dc65` |
| `positiveStrong` | 正向狀態強調色（保留舊 App 相容） | `#62a640` |
| `danger` | 一般警示色 | `#ee4f85` |
| `focus` | 通用操作焦點 | `#fff7a6` |
| `board` | 棋盤內部漸層起色 | `#d8f7f2` |
| `boardLine` | 棋盤格線 | `#ffffffd1` |
| `boardFrameTop` | 棋盤外框漸層上色 | `#fffdf7` |
| `boardFrameMiddle` | 棋盤外框漸層中色 | `#e8fbf6` |
| `boardFrameBottom` | 棋盤外框漸層下色 | `#dfeaff` |
| `boardGridMiddle` | 棋盤內部漸層中色 | `#dcecff` |
| `boardGridBottom` | 棋盤內部漸層下色 | `#f4e5ff` |
| `boardCellTop` | 棋盤格漸層上色 | `#ffffffa3` |
| `boardCellBottom` | 棋盤格漸層下色 | `#aadceb33` |
| `boardCellAltPink` | 每四格中的第二格底色 | `#aadceb33` |
| `boardCellAltPurple` | 每四格中的第三格底色 | `#aadceb33` |
| `boardCellAltYellow` | 每四格中的第四格底色 | `#aadceb33` |
| `boardFrameBorder` | 棋盤外邊框 | `#ffffffc7` |
| `boardGridBorder` | 棋盤內邊框 | `#ffffffe6` |
| `boardLabel` | MEOW LINE 8×8 文字 | `#587594` |
| `selection` | 通用選取色（專屬欄位優先） | `#ffe58a` |
| `overlayTop` | 背景遮罩上色 | `#fff4df0f` |
| `overlayBottom` | 背景遮罩下色 | `#5b2a1314` |
| `modalOverlay` | 彈窗後方遮罩 | `#271814aa` |
| `pauseModalBackground` | 暫停面板背景／透明度 | `#00000000` |
| `toastBackground` | 短暫提示背景 | `#6d3925` |
| `toastText` | 短暫提示文字 | `#fffdf7` |
| `toastBorder` | 短暫提示框線 | `#d6b08e` |
| `badgeBackground` | 按鈕數量徽章背景 | `#ee4f85` |
| `badgeText` | 按鈕數量徽章文字 | `#ffffff` |
| `screenTitleText` | 一般畫面標題 | `#6d3925` |
| `screenTitleShadow` | 一般畫面標題陰影 | `#fffaf1` |
| `screenSubtitleText` | 一般画面副標題 | `#8c6b54` |
| `levelNumberText` | 遊戲左上角關卡數字 | `#6d3925` |
| `homeStartText` | 首頁開始遊戲文字 | `#6d3925` |
| `homeNavigationText` | 首頁導覽按鈕文字 | `#6d3925` |
| `gameActionText` | 遊戲操作圖片按鈕文字 | `#743920` |
| `modalBorder` | 一般彈窗邊框 | `#d6b08e` |
| `modalText` | 一般彈窗文字 | `#6d3925` |
| `modalBackgroundTop` | 一般彈窗上色 | `#fffdf7` |
| `modalBackgroundBottom` | 一般彈窗下色 | `#f3d6b9` |
| `pauseTitleText` | 暫停標題文字 | `#713c28` |
| `pauseContinueText` | 暫停：繼續遊戲 | `#fffdf4` |
| `pauseRestartText` | 暫停：重新開始 | `#70402b` |
| `pauseHomeText` | 暫停：首頁 | `#70402b` |
| `pauseSettingsText` | 暫停：設定 | `#70402b` |
| `pauseButtonShadow` | 暫停按鈕文字陰影 | `#fff8e4e6` |
| `goalText` | 救出全部 X 隻貓咪 | `#6d3925` |
| `trayBackground` | 整條貓咪托盤底色 | `#d8f7f2` |
| `trayBorder` | 托盤外框 | `#d6b08e` |
| `trayHeadingText` | 依序放置貓咪 | `#8c6b54` |
| `trayHintText` | 左右滑動看更多貓咪 | `#8c6b54` |
| `trayCountText` | 已安排 X / Y | `#8c6b54` |
| `trayCardBackground` | 普通貓咪卡片底色 | `#fffdf7` |
| `trayCardBorder` | 普通貓咪卡片框線 | `#ffffffd1` |
| `trayNextBackground` | 下一隻貓咪卡片底色 | `#ffe58a` |
| `trayNextBorder` | 下一隻貓咪卡片框線 | `#ffffffd1` |
| `timerText` | 計時器數字 | `#70412e` |
| `timerBorder` | 計時器外框 | `#d5a06fb8` |
| `timerBackgroundTop` | 計時器上色 | `#fffcedf5` |
| `timerBackgroundBottom` | 計時器下色 | `#ffe0adeb` |
| `timerHighlight` | 計時器內亮邊 | `#ffffffe0` |
| `timerShadow` | 計時器外陰影 | `#7a47252e` |
| `timerIcon` | 計時器圖示 | `#bd7545` |
| `timerCompleteText` | 完成關卡的計時器數字 | `#7d4b2d` |
| `gameStatusText` | 遊戲狀態文字 | `#8c6b54` |
| `gameCompleteText` | 全部關卡完成提示 | `#8c6b54` |
| `undoConfirmText` | 撤回確認文案 | `#6d3925` |
| `tutorialText` | 斜線連線教學文字 | `#6d3925` |
| `objectiveText` | 目標面板文字 | `#6d3925` |
| `objectiveBackground` | 目標面板背景 | `#fffdf7` |
| `objectiveBorder` | 目標面板邊框 | `#d6b08e` |
| `placementHoverBackground` | 落點滑過底色 | `#ffffff33` |
| `placementHoverBorder` | 落點滑過框線 | `#ffffffd1` |
| `placementHoverGlow` | 落點滑過光暈 | `#69cdd642` |
| `placementPressTop` | 落點按下中心色 | `#ffffff85` |
| `placementPressBottom` | 落點按下外圍色 | `#98e1e71f` |
| `hintBackground` | 落點提示底色 | `#ffe58a` |
| `hintBorder` | 落點提示框線 | `#f3a647` |
| `hintSymbol` | 落點提示星形符號 | `#bd7e38` |
| `placedCatNumberText` | 已放貓咪順序數字 | `#5a3023` |
| `placedCatNumberBackground` | 已放貓咪順序數字底色 | `#ffe58a` |
| `catSelectionBackground` | 選貓面板底色 | `#fffaf1` |
| `catSelectionBorder` | 選貓面板框線 | `#d6b08e` |
| `catSelectionCardBackground` | 選貓卡片底色 | `#fffaf1` |
| `catSelectionCardBorder` | 選貓卡片框線 | `#d6b08e` |
| `catSelectionCardText` | 選貓卡片文字 | `#6d3925` |
| `catSelectionActiveBackground` | 選貓卡片選中底色 | `#ffe58a` |
| `catSelectionActiveBorder` | 選貓卡片選中框線 | `#f3a647` |
| `settingsBackgroundTop` | 設定面板上色 | `#fffdf7` |
| `settingsBackgroundBottom` | 設定面板下色 | `#f3d6b9` |
| `settingsBorder` | 設定面板外框 | `#d6b08e` |
| `settingsText` | 設定面板一般文字 | `#6d3925` |
| `settingsTitleText` | 設定頁標題 | `#6d3925` |
| `settingsDivider` | 設定面板內分隔線 | `#d6b08e` |
| `settingsToggleIcon` | 音樂／音效／震動圖示 | `#6d3925` |
| `settingsToggleOnBorder` | 開啟狀態開關框線 | `#62a640` |
| `settingsToggleOnBackground` | 開啟狀態開關底色 | `#a7dc65` |
| `settingsToggleOffBorder` | 關閉狀態開關框線 | `#d49a8e` |
| `settingsToggleOffTop` | 關閉狀態開關上色 | `#fff1e5` |
| `settingsToggleOffBottom` | 關閉狀態開關下色 | `#e9c4bf` |
| `settingsToggleKnob` | 開關圓形滑塊 | `#ffffff` |
| `settingsFocus` | 設定開關操作焦點 | `#fff7a6` |
| `settingsLanguageIcon` | 語言圖示 | `#6a8ed1` |
| `settingsLanguageTitle` | 語言標題 | `#6d3925` |
| `settingsLanguageBorder` | 語言選項外框 | `#d3a77e` |
| `settingsLanguageBackground` | 語言選項底色 | `#fffbf394` |
| `settingsLanguageText` | 未選取語言文字 | `#8a5b43` |
| `settingsLanguageDivider` | 語言選項分隔線 | `#ddb99b` |
| `settingsLanguageActiveText` | 已選取語言文字 | `#684128` |
| `settingsLanguageActiveTop` | 已選取語言上色 | `#ffe78e` |
| `settingsLanguageActiveBottom` | 已選取語言下色 | `#ffd46a` |
| `settingsLanguageActiveShadow` | 已選取語言陰影 | `#d58e2e33` |
| `settingsLinkText` | 隱私／條款／支援／關於連結文字 | `#6d3925` |
| `settingsLinkIcon` | 設定連結左側圖示 | `#6d8ed0` |
| `settingsLinkArrow` | 設定連結右側箭頭 | `#ef9a55` |
| `settingsHomeText` | 設定頁回到首頁文字 | `#743920` |
| `settingsHomeShadow` | 設定頁回到首頁文字陰影 | `#ffef9dc7` |
| `worldTabsBackground` | 章節切換列底色 | `#fffaf1` |
| `worldTabsBorder` | 章節切換列邊框 | `#d6b08e` |
| `worldTabsText` | 章節切換列說明 | `#6d3925` |
| `worldTabText` | 未選取章節文字 | `#8c6b54` |
| `worldTabActiveText` | 選取章節文字 | `#5a3023` |
| `worldTabActiveTop` | 選取章節上色 | `#dfff92` |
| `worldTabActiveBottom` | 選取章節下色 | `#a7dc65` |
| `worldTabActiveShadow` | 選取章節底邊 | `#62a640` |
| `levelBoardBackground` | 關卡清單面板底色 | `#fffaf1` |
| `levelBoardBorder` | 關卡清單面板框線 | `#d6b08e` |
| `levelBoardText` | 關卡清單面板文字 | `#6d3925` |
| `levelTileTop` | 一般關卡卡片上色 | `#fffdf7` |
| `levelTileBottom` | 一般關卡卡片下色 | `#f3d6b9` |
| `levelTileBorder` | 一般關卡卡片邊框 | `#d6b08e` |
| `levelTileText` | 一般關卡卡片文字 | `#6d3925` |
| `levelLockedBackground` | 鎖定關卡背景 | `#f3d6b9` |
| `levelLockedText` | 鎖定關卡文字 | `#8c6b54` |
| `levelCurrentTop` | 目前關卡上色 | `#dfff92` |
| `levelCurrentBottom` | 目前關卡下色 | `#a7dc65` |
| `levelCurrentBorder` | 目前關卡框線 | `#62a640` |
| `levelCurrentText` | 目前關卡文字 | `#6d3925` |
| `resultSuccessTop` | 成功結算背景上色 | `#fffdf7` |
| `resultSuccessMiddle` | 成功結算背景中色 | `#d8f7f2` |
| `resultSuccessBottom` | 成功結算背景下色 | `#f3d6b9` |
| `resultSuccessBorder` | 成功結算邊框 | `#d6b08e` |
| `resultSuccessText` | 成功結算內文 | `#6d3925` |
| `resultSuccessHeading` | 成功結算標題／摘要 | `#6d3925` |
| `resultFailureTop` | 失敗結算背景上色 | `#fffdf7` |
| `resultFailureMiddle` | 失敗結算背景中色 | `#d8f7f2` |
| `resultFailureBottom` | 失敗結算背景下色 | `#f3d6b9` |
| `resultFailureBorder` | 失敗結算邊框 | `#d6b08e` |
| `resultFailureText` | 失敗結算內文 | `#6d3925` |
| `resultFailureHeading` | 失敗結算標題／摘要 | `#ee4f85` |
| `resultTimeLabel` | 結算完成時間標籤 | `#6d3925` |
| `resultTimeValue` | 結算完成時間數字 | `#6d3925` |
| `resultButtonTop` | 結算按鈕上色 | `#fffaf1` |
| `resultButtonBottom` | 結算按鈕下色 | `#f3d6b8` |
| `resultButtonBorder` | 結算按鈕邊框 | `#d6b08e` |
| `resultButtonText` | 結算按鈕文字 | `#6d3925` |
| `pauseContinueShadow` | 暫停繼續按鈕文字陰影 | `#307e209e` |
