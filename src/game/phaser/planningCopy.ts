import type { Locale } from '../../i18n/locale'

const zh = {
  title: '一起回家', goal: (count: number) => `救出全部 ${count} 隻貓咪`, calm: '完成越快，星星越多', timerLabel: '關卡時間', resultTime: '完成時間', starsLabel: (count: number) => `${count} 顆星`,
  tray: '依序放置貓咪', placed: '已安排', choose: '把最前面的貓放進棋盤', ready: '都排好了！準備開始救援',
  cardLabel: (position: number, name: string) => `第 ${position} 隻待放貓咪：${name}`,
  note: '數字是放置順序；只有消除後貓咪才會掉落', fixed: '原有貓咪', take: '拿回',
  cellLabel: (row: number, column: number) => `放在第 ${row} 排、第 ${column} 欄`,
  board: '8 × 8 貓咪棋盤', undo: '撤銷上一步', undoAdAttention: '點擊補充上一步', undoAdConfirmTitle: '補充上一步', undoAdConfirmBody: '目前沒有上一步次數，要觀看廣告補充 5 次嗎？', undoAdConfirmAction: '觀看廣告', undoAdGranted: '本關已獲得 5 次上一步', undoAdUnavailable: '廣告尚未完成，沒有增加次數', hintAdAttention: '點擊補充提示', hintAdConfirmTitle: '補充提示', hintAdConfirmBody: '目前沒有提示次數，要觀看廣告補充 3 次嗎？', hintAdGranted: '本關已獲得 3 次提示', hintAdUnavailable: '廣告尚未完成，沒有增加提示', useHint: '提示', start: '開始救援',
  cancel: '取消', wave: '連鎖', clear: '消除！', combo: (count: number) => `COMBO ×${count}`, retryNotice: '配置結算失敗，已重置配置，請再試一次。', mainlineDone: '第 90 關完成，主線暫告一段落！', restart: '重新開始本關', remaining: '還有', cats: '隻貓咪', swipe: '左右滑動看更多貓咪',
  failures: '失敗', times: '次', edit: '修改配置', completed: '全部回家了！', successEyebrow: '救援成功', successEncouragement: '太棒了！貓咪都安全回家了 ♡',
  failureTitle: '挑戰失敗', failureEyebrow: '再試一次', failureEncouragement: '沒關係！換個順序再試一次，貓咪還在等你帶回家 ♡', failureHintAd: '觀看廣告獲得 3 次提示', keepTrying: '繼續挑戰', continueAction: '繼續',
  noSolutionTitle: '目前配置無法完成', noSolutionEyebrow: '找不到可用提示', noSolutionEncouragement: '剛才的放置方式已經沒有可行解，請重新開始本關。', noSolutionHintAd: '觀看廣告取得提示並重新開始',
  next: (id: number) => `前往第 ${id} 關`, levels: '返回關卡', hint: '小提示：先消掉支撐，上面的貓才會落到一起。'
}
type Copy = typeof zh
const en: Copy = {
  title: 'Home together', goal: (count: number) => `Rescue all ${count} cats`, calm: 'Clear faster to earn more stars',
  tray: 'Place cats in order', placed: 'Placed', choose: 'Place the first cat on the board', ready: 'All set! Start the rescue',
  cardLabel: (position: number, name: string) => `Waiting cat ${position}: ${name}`,
  note: 'Numbers show placement order; cats fall only after clearing', fixed: 'Starting cat', take: 'Take back',
  cellLabel: (row: number, column: number) => `Place at row ${row}, column ${column}`,
  board: '8 × 8 cat board', undo: 'Undo', undoAdAttention: 'Tap to get more undos', undoAdConfirmTitle: 'Get more undos?', undoAdConfirmBody: 'You have no undos left. Watch an ad to add 5 undos for this level?', undoAdConfirmAction: 'Watch ad', undoAdGranted: 'This level gained 5 undos', undoAdUnavailable: 'The ad did not finish, so no undos were added', hintAdAttention: 'Tap to get more hints', hintAdConfirmTitle: 'Get more hints?', hintAdConfirmBody: 'You have no hints left. Watch an ad to add 3 hints for this level?', hintAdGranted: 'This level gained 3 hints', hintAdUnavailable: 'The ad did not finish, so no hints were added', useHint: 'Hint', start: 'Start rescue',
  cancel: 'Cancel', wave: 'Chain', clear: 'CLEAR!', combo: (count: number) => `COMBO ×${count}`, retryNotice: 'The arrangement failed resolution and was reset. Try again.', mainlineDone: 'Level 90 complete—the mainline pauses here for now!', restart: 'Restart level', remaining: 'Remaining:', cats: 'cats', swipe: 'Swipe sideways to see more cats', timerLabel: 'Level time', resultTime: 'Clear time', starsLabel: (count: number) => `${count} stars`,
  failures: 'Failed attempts:', times: '', edit: 'Edit arrangement', completed: 'Everyone is home!', successEyebrow: 'Rescue complete', successEncouragement: 'Great job! Every cat made it home ♡',
  failureTitle: 'Challenge failed', failureEyebrow: 'Try again', failureEncouragement: 'No worries! Change the order and bring the cats home ♡', failureHintAd: 'Watch ad to get 3 hints', keepTrying: 'Keep trying', continueAction: 'Continue',
  noSolutionTitle: 'This arrangement cannot be completed', noSolutionEyebrow: 'No usable hint found', noSolutionEncouragement: 'This placement has no remaining solution. Restart the level to try again.', noSolutionHintAd: 'Watch an ad for hints and restart',
  next: (id: number) => `Go to level ${id}`, levels: 'Level select', hint: 'Tip: clear the support so the cats above can meet.'
}
const ja: Copy = {
  title: 'みんなで帰ろう', goal: (count: number) => `${count} 匹すべてを助けよう`, calm: '早くクリアするほど星が増える',
  tray: '順番に猫を置く', placed: '配置済み', choose: '先頭の猫を盤面に置こう', ready: '準備完了！救出を始めよう',
  cardLabel: (position: number, name: string) => `待機中の${position}匹目：${name}`,
  note: '数字は置いた順番です。消した後にだけ猫が落ちます', fixed: '最初からいる猫', take: '戻す',
  cellLabel: (row: number, column: number) => `${row}行 ${column}列に置く`,
  board: '8 × 8 の猫ボード', undo: 'ひとつ戻す', undoAdAttention: '広告で回数を追加', undoAdConfirmTitle: '戻す回数を追加', undoAdConfirmBody: '戻す回数がありません。広告を見て5回追加しますか？', undoAdConfirmAction: '広告を見る', undoAdGranted: 'このステージに5回分追加しました', undoAdUnavailable: '広告が完了しなかったため追加されません', hintAdAttention: '広告でヒントを追加', hintAdConfirmTitle: 'ヒントを追加', hintAdConfirmBody: 'ヒントがありません。広告を見て3回追加しますか？', hintAdGranted: 'このステージに3回分追加しました', hintAdUnavailable: '広告が完了しなかったためヒントは追加されません', useHint: 'ヒント', start: '救出スタート',
  cancel: 'キャンセル', wave: '連鎖', clear: 'クリア！', combo: (count: number) => `コンボ ×${count}`, retryNotice: '配置の解決に失敗したため、盤面をリセットしました。もう一度試してみてね。', mainlineDone: 'ステージ90クリア！メインラインはここで一休みです。', restart: '最初からやり直す', remaining: '残り', cats: '匹', swipe: '左右にスワイプして猫を見る', timerLabel: 'ステージ時間', resultTime: 'クリアタイム', starsLabel: (count: number) => `${count}つ星`,
  failures: '失敗', times: '回', edit: '配置を修正', completed: 'みんな帰れた！', successEyebrow: '救出成功', successEncouragement: 'すごい！猫たちがみんな帰れたよ ♡',
  failureTitle: 'チャレンジ失敗', failureEyebrow: 'もう一度', failureEncouragement: '大丈夫！順番を変えて、猫たちをおうちへ送ろう ♡', failureHintAd: '広告を見てヒントを3回追加', keepTrying: 'もう一度挑戦', continueAction: '続ける',
  noSolutionTitle: 'この配置では完成できません', noSolutionEyebrow: '使えるヒントがありません', noSolutionEncouragement: 'この配置からは解けないため、ステージを最初からやり直してね。', noSolutionHintAd: '広告を見てヒントを追加して再スタート',
  next: (id: number) => `ステージ${id}へ`, levels: 'ステージ選択', hint: 'ヒント：支えを消すと、上の猫が落ちて揃います。'
}
export const planningCopy: Record<Locale, Copy> = { 'zh-TW': zh, en, ja }
