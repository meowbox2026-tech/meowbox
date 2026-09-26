import { useLocale } from './index'

const copy = {
  'zh-TW': {
    profile: '我的貓咪', board: '排行榜', subtitle: '已通關數 · 同分並列', back: '返回',
    name: '玩家名稱', nameHint: '2–16 字，可使用中英文、數字、空格、底線與連字號。',
    avatar: '選擇貓咪頭像', save: '儲存', join: '加入排行榜', loading: '載入中…',
    error: '目前無法連線，請稍後再試。若剛改過名稱，請等 10 秒。', retry: '重新整理',
    empty: '還沒有玩家加入，成為第一位吧！', me: '你', clears: '已通關',
    notice: '加入後，名稱、頭像與已同步通關數會公開。請勿使用真實姓名或聯絡資料。',
    anonymous: '不需綁定帳號。此匿名身分僅保存在目前裝置；刪除 App 或換機可能無法找回。',
    leave: '退出排行榜', confirmLeave: '確定移除公開名稱與頭像？本機遊戲進度不會刪除。',
    cancel: '取消', invalid: '請輸入 2–16 字的有效名稱。', saved: '已儲存',
    notJoined: '尚未加入排行榜', scoreNote: '只計算後端收到的不重複通關紀錄；離線紀錄同步後才會更新。',
  },
  en: {
    profile: 'My cat', board: 'Leaderboard', subtitle: 'Levels cleared · shared ranks for ties', back: 'Back',
    name: 'Player name', nameHint: '2–16 letters, numbers, spaces, underscores or hyphens.',
    avatar: 'Choose a cat', save: 'Save', join: 'Join leaderboard', loading: 'Loading…',
    error: 'Unable to connect. Please retry later. Wait 10 seconds between profile edits.', retry: 'Refresh',
    empty: 'No players yet. Be the first!', me: 'You', clears: 'Cleared',
    notice: 'Your name, avatar and synced clear count will be public. Do not use personal or contact details.',
    anonymous: 'No account linking required. This identity is stored on this device; reinstalling or switching devices may lose it.',
    leave: 'Leave leaderboard', confirmLeave: 'Remove your public name and avatar? Local game progress stays.',
    cancel: 'Cancel', invalid: 'Enter a valid name of 2–16 characters.', saved: 'Saved',
    notJoined: 'Not on the leaderboard', scoreNote: 'Only distinct clears received by the server count. Offline records appear after syncing.',
  },
  ja: {
    profile: 'マイねこ', board: 'ランキング', subtitle: 'クリア数・同点は同順位', back: '戻る',
    name: 'プレイヤー名', nameHint: '2〜16文字。文字、数字、空白、_、- が使えます。',
    avatar: 'ねこを選ぶ', save: '保存', join: 'ランキングに参加', loading: '読み込み中…',
    error: '接続できません。後でもう一度お試しください。編集後は10秒お待ちください。', retry: '更新',
    empty: 'まだ参加者がいません。最初に参加しよう！', me: 'あなた', clears: 'クリア',
    notice: '名前、アイコン、同期済みのクリア数が公開されます。本名や連絡先は使わないでください。',
    anonymous: 'アカウント連携は不要です。この端末に保存され、再インストールや機種変更で失われる場合があります。',
    leave: 'ランキングから退出', confirmLeave: '公開名とアイコンを削除しますか？端末のゲーム進行は残ります。',
    cancel: 'キャンセル', invalid: '2〜16文字の有効な名前を入力してください。', saved: '保存しました',
    notJoined: 'ランキング未参加', scoreNote: 'サーバーに届いた重複しないクリアのみ集計します。オフライン記録は同期後に反映されます。',
  }
}

export function useLeaderboardCopy() { return copy[useLocale()] }
