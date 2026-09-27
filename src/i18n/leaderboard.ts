import { useLocale } from './index'

const copy = {
  'zh-TW': {
    profile: '我的貓咪', board: '排行榜', subtitle: '最高關卡 · 同分並列', close: '關閉',
    name: '玩家名稱', avatar: '選擇貓咪頭像', save: '儲存變更', join: '加入並儲存', loading: '載入中…',
    error: '資料暫時無法載入。請檢查網路後按「重新整理」；若剛修改名稱，請等 10 秒再儲存。', retry: '重新整理',
    empty: '還沒有玩家加入，成為第一位吧！', me: '你', highestLevel: '最高關卡',
    notice: '加入後，名稱、頭像與已同步的最高通關關卡會公開。請勿使用真實姓名或聯絡資料。可檢舉或封鎖玩家。',
    anonymous: '不需綁定帳號。此匿名身分僅保存在目前裝置；刪除 App 或換機可能無法找回。',
    leave: '退出排行榜', confirmLeave: '確定移除公開名稱與頭像？本機遊戲進度不會刪除。',
    deleteAccount: '刪除匿名帳號與雲端資料', confirmDelete: '這會永久刪除匿名帳號、排行榜資料與雲端分析紀錄，無法復原；本機遊戲進度會保留。確定繼續？',
    permanentDelete: '永久刪除', block: '封鎖', blockQuestion: '封鎖「{name}」？對方會從你的排行榜隱藏，你可隨時在個人頁解除。',
    confirmBlock: '確認封鎖', report: '檢舉', blockedHeading: '已封鎖的玩家', blockedEmpty: '目前沒有封鎖玩家。', unblock: '解除封鎖',
    blockedNotice: '已封鎖此玩家；你可到個人頁的封鎖名單管理。',
    cancel: '取消', invalid: '請輸入 2–16 字的有效名稱，並避免不當用語。', saved: '已儲存',
    notJoined: '尚未加入排行榜', scoreNote: '排行榜以後端收到的最高通關關卡為準；離線紀錄同步後才會更新。',
  },
  en: {
    profile: 'My cat', board: 'Leaderboard', subtitle: 'Highest level · shared ranks for ties', close: 'Close',
    name: 'Player name', avatar: 'Choose a cat', save: 'Save changes', join: 'Join & save', loading: 'Loading…',
    error: 'Could not load the data. Check your connection and refresh. Wait 10 seconds before saving another profile edit.', retry: 'Refresh',
    empty: 'No players yet. Be the first!', me: 'You', highestLevel: 'Highest level',
    notice: 'Your name, avatar and highest synced completed level will be public. Do not use personal or contact details. You can report or block players.',
    anonymous: 'No account linking required. This identity is stored on this device; reinstalling or switching devices may lose it.',
    leave: 'Leave leaderboard', confirmLeave: 'Remove your public name and avatar? Local game progress stays.',
    deleteAccount: 'Delete anonymous account and cloud data', confirmDelete: 'This permanently deletes your anonymous account, leaderboard profile and cloud analytics. This cannot be undone; local game progress stays. Continue?',
    permanentDelete: 'Delete permanently', block: 'Block', blockQuestion: 'Block “{name}”? They will be hidden from your leaderboard. You can unblock them from your profile.',
    confirmBlock: 'Confirm block', report: 'Report', blockedHeading: 'Blocked players', blockedEmpty: 'You have not blocked anyone.', unblock: 'Unblock',
    blockedNotice: 'Player blocked. Manage your blocked list from your profile.',
    cancel: 'Cancel', invalid: 'Enter a valid 2–16 character name without inappropriate terms.', saved: 'Saved',
    notJoined: 'Not on the leaderboard', scoreNote: "Rankings use each player's highest completed level received by the server. Offline records appear after syncing.",
  },
  ja: {
    profile: 'マイねこ', board: 'ランキング', subtitle: '最高レベル・同点は同順位', close: '閉じる',
    name: 'プレイヤー名', avatar: 'ねこを選ぶ', save: '変更を保存', join: '参加して保存', loading: '読み込み中…',
    error: 'データを読み込めません。接続を確認して更新してください。プロフィール変更後は、次の保存まで10秒お待ちください。', retry: '更新',
    empty: 'まだ参加者がいません。最初に参加しよう！', me: 'あなた', highestLevel: '最高レベル',
    notice: '名前、アイコン、同期済みの最高クリアレベルが公開されます。本名や連絡先は使わないでください。',
    anonymous: 'アカウント連携は不要です。この端末に保存され、再インストールや機種変更で失われる場合があります。',
    leave: 'ランキングから退出', confirmLeave: '公開名とアイコンを削除しますか？端末のゲーム進行は残ります。',
    deleteAccount: '匿名アカウントとクラウドデータを削除', confirmDelete: '匿名アカウント、ランキング、クラウド分析データを完全に削除します。取り消せません。端末のゲーム進行は残ります。続けますか？',
    permanentDelete: '完全に削除', block: 'ブロック', blockQuestion: '「{name}」をブロックしますか？ランキングに表示されなくなります。プロフィールから解除できます。',
    confirmBlock: 'ブロックを確認', report: '報告', blockedHeading: 'ブロック中のプレイヤー', blockedEmpty: 'ブロック中のプレイヤーはいません。', unblock: 'ブロック解除',
    blockedNotice: 'プレイヤーをブロックしました。プロフィールから管理できます。',
    cancel: 'キャンセル', invalid: '不適切な表現を避け、2〜16文字で入力してください。', saved: '保存しました',
    notJoined: 'ランキング未参加', scoreNote: 'サーバーに届いた最高クリアレベルで順位を決めます。オフライン記録は同期後に反映されます。',
  }
}

export function useLeaderboardCopy() { return copy[useLocale()] }
