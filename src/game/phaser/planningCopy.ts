import type { Locale } from '../../i18n/locale'

const zh = {
  title: '一起回家', goal: (count: number) => `救出全部 ${count} 隻貓咪`, calm: '不限時間・先排好再開始',
  tray: '依序放置貓咪', placed: '已安排', choose: '把最前面的貓放進棋盤', ready: '都排好了！準備開始救援',
  cardLabel: (position: number, name: string) => `第 ${position} 隻待放貓咪：${name}`,
  note: '數字是放置順序；只有消除後貓咪才會掉落', fixed: '原有貓咪', take: '拿回',
  cellLabel: (row: number, column: number) => `放在第 ${row} 排、第 ${column} 欄`,
  board: '8 × 8 貓咪棋盤', undo: '撤銷上一步', undoAdAttention: '點擊補充上一步', undoAdConfirmTitle: '補充上一步', undoAdConfirmBody: '目前沒有上一步次數，要觀看廣告補充 5 次嗎？', undoAdConfirmAction: '觀看廣告', undoAdGranted: '本關已獲得 5 次上一步', undoAdUnavailable: '廣告尚未完成，沒有增加次數', hintAdAttention: '點擊補充提示', hintAdConfirmTitle: '補充提示', hintAdConfirmBody: '目前沒有提示次數，要觀看廣告補充 3 次嗎？', hintAdGranted: '本關已獲得 3 次提示', hintAdUnavailable: '廣告尚未完成，沒有增加提示', useHint: '提示', start: '開始救援',
  cancel: '取消', wave: '連鎖', retryNotice: '配置結算失敗，已重置配置，請再試一次。', mainlineDone: '第 30 關完成，主線暫告一段落！', restart: '整關重來', remaining: '還有', cats: '隻貓咪', swipe: '左右滑動看更多貓咪',
  failures: '失敗', times: '次', edit: '修改配置', completed: '全部回家了！',
  next: (id: number) => `前往第 ${id} 關`, levels: '返回關卡', hint: '小提示：先消掉支撐，上面的貓才會落到一起。'
}
type Copy = typeof zh
const en: Copy = {
  title: 'Home together', goal: (count: number) => `Rescue all ${count} cats`, calm: 'No timer · Arrange, then start',
  tray: 'Place cats in order', placed: 'Placed', choose: 'Place the first cat on the board', ready: 'All set! Start the rescue',
  cardLabel: (position: number, name: string) => `Waiting cat ${position}: ${name}`,
  note: 'Numbers show placement order; cats fall only after clearing', fixed: 'Starting cat', take: 'Take back',
  cellLabel: (row: number, column: number) => `Place at row ${row}, column ${column}`,
  board: '8 × 8 cat board', undo: 'Undo', undoAdAttention: 'Tap to get more undos', undoAdConfirmTitle: 'Get more undos?', undoAdConfirmBody: 'You have no undos left. Watch an ad to add 5 undos for this level?', undoAdConfirmAction: 'Watch ad', undoAdGranted: 'This level gained 5 undos', undoAdUnavailable: 'The ad did not finish, so no undos were added', hintAdAttention: 'Tap to get more hints', hintAdConfirmTitle: 'Get more hints?', hintAdConfirmBody: 'You have no hints left. Watch an ad to add 3 hints for this level?', hintAdGranted: 'This level gained 3 hints', hintAdUnavailable: 'The ad did not finish, so no hints were added', useHint: 'Hint', start: 'Start rescue',
  cancel: 'Cancel', wave: 'Chain', retryNotice: 'The arrangement failed resolution and was reset. Try again.', mainlineDone: 'Level 30 complete—the mainline pauses here for now!', restart: 'Restart level', remaining: 'Remaining:', cats: 'cats', swipe: 'Swipe sideways to see more cats',
  failures: 'Failed attempts:', times: '', edit: 'Edit arrangement', completed: 'Everyone is home!',
  next: (id: number) => `Go to level ${id}`, levels: 'Level select', hint: 'Tip: clear the support so the cats above can meet.'
}
const ja: Copy = {
  title: 'みんなで帰ろう', goal: (count: number) => `${count} 匹すべてを助けよう`, calm: '時間制限なし・並べてからスタート',
  tray: '順番に猫を置く', placed: '配置済み', choose: '先頭の猫を盤面に置こう', ready: '準備完了！救出を始めよう',
  cardLabel: (position: number, name: string) => `待機中の${position}匹目：${name}`,
  note: '数字は置いた順番です。消した後にだけ猫が落ちます', fixed: '最初からいる猫', take: '戻す',
  cellLabel: (row: number, column: number) => `${row}行 ${column}列に置く`,
  board: '8 × 8 の猫ボード', undo: 'ひとつ戻す', undoAdAttention: '広告で回数を追加', undoAdConfirmTitle: '戻す回数を追加', undoAdConfirmBody: '戻す回数がありません。広告を見て5回追加しますか？', undoAdConfirmAction: '広告を見る', undoAdGranted: 'このステージに5回分追加しました', undoAdUnavailable: '広告が完了しなかったため追加されません', hintAdAttention: '広告でヒントを追加', hintAdConfirmTitle: 'ヒントを追加', hintAdConfirmBody: 'ヒントがありません。広告を見て3回追加しますか？', hintAdGranted: 'このステージに3回分追加しました', hintAdUnavailable: '広告が完了しなかったためヒントは追加されません', useHint: 'ヒント', start: '救出スタート',
  cancel: 'キャンセル', wave: '連鎖', retryNotice: '配置の解決に失敗したため、盤面をリセットしました。もう一度試してみてね。', mainlineDone: 'ステージ30クリア！メインラインはここで一休みです。', restart: '最初からやり直す', remaining: '残り', cats: '匹', swipe: '左右にスワイプして猫を見る',
  failures: '失敗', times: '回', edit: '配置を修正', completed: 'みんな帰れた！',
  next: (id: number) => `ステージ${id}へ`, levels: 'ステージ選択', hint: 'ヒント：支えを消すと、上の猫が落ちて揃います。'
}
export const planningCopy: Record<Locale, Copy> = { 'zh-TW': zh, en, ja }
