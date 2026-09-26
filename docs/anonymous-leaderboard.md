# 匿名排行榜

## 已實作

- 沿用遊戲分析事件的 Supabase 匿名登入；共用進行中的登入請求，避免建立兩個身分。
- 首頁左上頭像與排行榜入口。框與獎盃由 Chrome 的 ChatGPT 生圖，貓咪使用既有 12 張圖。
- 中／英／日文介面、2–16 字名稱、選擇頭像、公開前提示、退出排行榜。
- 依後端收到的不重複通關數降冪排名，同分同名次（1、1、3）。前 100 名之外另附自己的名次。
- 改名不改匿名 ID，不清除成績；每次修改間隔 10 秒。
- 不公開帳號 UUID、電子郵件或原始遊戲事件。
- 排行榜與個人頁色彩是 theme.json 的 social* 欄位；圖片本身的顏色不是 JSON 色彩。

## 尚未部署

目標專案為 `.env.local` 指向的 `vistyxmouvqbkqetejbh`。目前管理工具列出的專案不是此專案，切勿套用到其他專案。

資料庫更新檔：`supabase/migrations/20260926140743_anonymous_leaderboard.sql`。
正式套用前需取得正確專案的管理權限與部署授權；先在 staging 檢查既有 player_events schema、RLS、匿名登入和 auth.uid()。
不需改動現有簽章密鑰。這是新增 App 功能，必須隨 App 二進位版本更新，不能用遠端 theme.json 下發程式。

## 成績來源與限制

現有 player_events 的 level_completed 事件透過 trigger 寫入私有去重表。Migration 會回填既有已上報的通關事件。
同一關重玩不增加分數；不接受客戶端直接傳總分，也不把可修改的本機存檔直接匯入排名。
未曾上報的舊本機通關進度無法自動驗證，所以可能與本機通關數不同。
現有離線分析佇列最多保留 100 筆，須在後續事件成功上報後才能反映；這不是完整的離線成績保證。
既有事件依然由客戶端上報，有身分／範圍限制但沒有伺服器重播驗證，因此不是防作弊競賽排行榜，不適用獎金、獎品或付費排名。
目前計分關卡範圍是既有事件支援的 1–90；增加關卡時需同步修改資料庫與事件驗證。

## 安全與上線前工作

- 私有表啟用 RLS、撤銷客戶端直接存取；受限 SECURITY DEFINER 僅在私有 schema，函式內用 auth.uid() 辨識。
- 公開 RPC 為 SECURITY INVOKER；anon 無 EXECUTE，authenticated 只能呼叫限制用途的函式。
- 退出僅刪公開個人檔案，本機進度和既有分析紀錄不刪除；不是刪除 Auth 帳號。
- 匿名身分沒有跨機復原；登出、清資料、移除 App 可能無法找回。不要自動刪除仍在使用的匿名帳號。
- 上線前需要補齊暱稱檢舉／管理審核流程、帳號資料刪除流程、隱私政策及 App Store 資料揭露。
- 依官方建議檢查匿名登入的 CAPTCHA／Turnstile 和速率限制；不要為了測試關閉既有安全保護。
- [Supabase 匿名登入文件](https://supabase.com/docs/guides/auth/auth-anonymous)。

## 驗證

`npm test -- src/services/leaderboard src/services/analytics src/services/supabase`

`scripts/content/testLeaderboardDatabase.mjs` 可用 PGlite 模組路徑執行隔離 PostgreSQL 測試，不連正式資料庫。
涵蓋所有權、無效名稱／頭像、修改冷卻、去重通關、並列排名、隱藏 ID、退出與未授權拒絕。
此測試不取代正式 Supabase 專案上的兩個實際匿名帳號驗證與資料庫 advisors。
