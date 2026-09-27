# 匿名排行榜

## 已實作

- 沿用遊戲分析事件的 Supabase 匿名登入；共用進行中的登入請求，避免建立兩個身分。
- 首頁左上頭像與排行榜入口。框與獎盃由 Chrome 的 ChatGPT 生圖，貓咪使用既有 12 張圖。
- 中／英／日文介面、2–16 字名稱、基本不當用語過濾、選擇頭像、公開前提示、退出排行榜。
- 依後端收到的最高已完成關卡編號降冪排名，同分同名次（1、1、3）。前 100 名之外另附自己的名次；重玩同一關不會提高最高關卡。
- 改名不改匿名 ID，不清除成績；每次修改間隔 10 秒。
- 不公開 Auth 帳號 UUID、電子郵件或原始遊戲事件；排行榜只公開隨機產生的玩家代碼供檢舉／封鎖使用。
- 可檢舉其他玩家（客服郵件）、封鎖並隱藏對方，且能在個人頁解除封鎖。
- 個人頁提供二次確認的匿名帳號永久刪除；Auth 帳號刪除會連帶刪除關聯的排行檔案、去重成績與 player_events，裝置本機進度保留。
- 排行榜與個人頁色彩是 theme.json 的 social* 欄位；圖片本身的顏色不是 JSON 色彩。

## 正式環境狀態（2026-09-27）

目標 Supabase 專案 `vistyxmouvqbkqetejbh` 已完成正式 schema 部署與 SQL 驗證：player events、排行榜私有表、封鎖表、clear trigger、安全名稱檢查、刪除匿名帳號 RPC 與排行榜 RPC 都存在；所有相關表已啟用 RLS，客戶端只能透過受限 RPC 存取。正式環境目前沒有 migration history 表，因此本次以 Dashboard SQL Editor 套用並以 schema／權限查詢驗證。

資料庫更新檔：`supabase/migrations/20260925001200_player_events.sql`、`supabase/migrations/20260925001300_allow_player_events_through_level_90.sql`、`supabase/migrations/20260926140743_anonymous_leaderboard.sql`、`supabase/migrations/20260927000000_leaderboard_safety_and_deletion.sql`、`supabase/migrations/20260927010000_leaderboard_highest_level.sql`。正式套用時以 Supabase Dashboard SQL Editor 執行；該專案沒有 `supabase_migrations.schema_migrations` 歷史表，因此這次未建立 CLI migration 記錄。不要直接對正式環境執行 `supabase db push`，除非先建立並核對正式 migration history。
不需改動現有簽章密鑰。這是 App 功能，必須隨 App 二進位版本更新，不能用遠端 theme.json 下發程式。

## 成績來源與限制

現有 player_events 的 level_completed 事件透過 trigger 寫入私有去重表。Migration 會回填既有已上報的通關事件。
同一關重玩不增加分數；不接受客戶端直接傳總分，也不把可修改的本機存檔直接匯入排名。
未曾上報的舊本機通關進度無法自動驗證，所以可能與本機最高關卡不同。
排行榜的分數是每位玩家已上報通關紀錄中的最大 `level_id`；去重表仍保留每個玩家／關卡一筆資料，讓重複事件不會影響結果。
現有離線分析佇列最多保留 100 筆，須在後續事件成功上報後才能反映；這不是完整的離線成績保證。
既有事件依然由客戶端上報，有身分／範圍限制但沒有伺服器重播驗證，因此不是防作弊競賽排行榜，不適用獎金、獎品或付費排名。
目前計分關卡範圍是既有事件支援的 1–90；增加關卡時需同步修改資料庫與事件驗證。

## 安全與上線前工作

- 私有表啟用 RLS、撤銷客戶端直接存取；受限 SECURITY DEFINER 僅在私有 schema，函式內用 auth.uid() 辨識。
- 公開 RPC 為 SECURITY INVOKER；anon 無 EXECUTE，authenticated 只能呼叫限制用途的函式。
- 退出排行榜只刪公開個人檔案；永久刪除匿名帳號會透過受限 SECURITY DEFINER RPC 刪除 `auth.users`，依現有 FK cascade 清除 profile、clears、封鎖關係及 `player_events`。
- 匿名身分沒有跨機復原；登出、清資料、移除 App 可能無法找回。不要自動刪除仍在使用的匿名帳號。
- 玩家檢舉透過已公開的客服 email 處理；這不是 App 內即時審核佇列。若玩家規模上升，需增加後台檢舉佇列、管理員工具及明確回應 SLA。
- App Store Connect 隱私資料揭露需要同步包含 User ID、Product Interaction、Gameplay Content 與廣告 SDK 的診斷／廣告資料，並更新政策 URL。
- 依官方建議檢查匿名登入的 CAPTCHA／Turnstile 和速率限制；不要為了測試關閉既有安全保護。
- [Supabase 匿名登入文件](https://supabase.com/docs/guides/auth/auth-anonymous)。

## 驗證

`npm test -- src/services/leaderboard src/services/analytics src/services/supabase`

`scripts/content/testLeaderboardDatabase.mjs` 可用 PGlite 模組路徑執行隔離 PostgreSQL 測試，不連正式資料庫。
涵蓋所有權、無效／不當名稱／頭像、修改冷卻、去重通關、並列排名、隱藏 Auth ID、封鎖／解除封鎖、完整資料刪除與未授權拒絕。
此測試不取代正式 Supabase 專案上的兩個實際匿名帳號驗證與資料庫 advisors。
