import type { Locale } from '../../i18n/locale'

const zh = {
  title: '一起回家', goal: (count: number) => `救出全部 ${count} 隻貓咪`, calm: '不限時間・先排好再開始',
  tray: '依序放置貓咪', placed: '已安排', choose: '把最前面的貓放進棋盤', ready: '都排好了！準備開始救援', conditions: '本關條件', conditionHint: '設計路線摘要；交叉格只算一次，其他可解路線也算對', horizontalLine: '橫連', verticalLine: '直連', diagonalLine: '斜連', clearCount: '清除格', gravityCount: '落下波', mergedGroup: '8 向合併',
  cardLabel: (position: number, name: string) => `第 ${position} 隻待放貓咪：${name}`,
  note: '數字是放置順序；只有消除後貓咪才會掉落', fixed: '原有貓咪', take: '拿回',
  cellLabel: (row: number, column: number) => `放在第 ${row} 排、第 ${column} 欄`,
  board: '8 × 8 貓咪棋盤', undo: '撤銷上一步', useHint: '提示', hintUsed: '提示已標出下一隻貓咪的推薦位置', start: '開始救援', rules: '玩法說明',
  rulesTitle: '先安排，再看連鎖', rule1: '依照卡片由左到右，把最前面的貓放進棋盤。貓咪會直接放在你點的位置，數字標示放置順序。',
  rule2: '放下後卡片會消失；每局只有 1 次撤銷機會，可收回最新一隻。安排時不消除也不掉落，原有貓咪不能移動。',
  rule3: '全部放好才按開始。同款橫、直或斜線連續 3 隻以上會形成消除群；同色符合連線的格子若以 8 向相連，會合併成同一群，交叉不拆開。多群同時存在時，包含最小放置數字的群先消除，一次只處理一群。',
  rule4: (count: number) => `只有直接疊在被消除貓咪上方、失去支撐的那一串會掉落；中間隔著空格的貓不會跟著掉。再形成三連就繼續，救出全部 ${count} 隻便過關。`,
  rule5: '沒有倒數。每關 3 條生命；第 1–20 關若點擊後已證明本關無解會立即扣 1 條，其他完整配置結算失敗也會扣 1 條。扣後清空配置重新試，沒有半盤接續或影片復原；每次配置 1 次撤銷、每關 1 次提示。',
  close: '知道了', wave: '連鎖', failed: '本次配置失敗', failedTip: '三條生命已用完。這次錯誤配置不保留半盤，只能重新開始本關或返回選關。', placementFailed: '點擊判定失敗', placementFailedTip: '這個位置已被證明會讓本關無解。三條生命已用完，不能保留錯誤半盤，只能重新開始本關或返回選關。', placementRetryNotice: (lives: number) => `這個位置會讓本關無解，扣除 1 條生命，已重置配置，還剩 ${lives} 條。`, retryNotice: (lives: number) => `配置結算失敗，扣除 1 條生命，已重置配置，還剩 ${lives} 條。`, checkingPlacement: '正在確認這個位置是否仍可解⋯', livesLabel: '生命', mainlineDone: '第 25 關完成，主線暫告一段落！', restart: '整關重來', remaining: '還有', cats: '隻貓咪', swipe: '左右滑動看更多貓咪',
  failures: '失敗', times: '次', edit: '修改配置', completed: '全部回家了！',
  next: (id: number) => `前往第 ${id} 關`, levels: '返回關卡', reward: '+50 貓掌幣', hint: '小提示：先消掉支撐，上面的貓才會落到一起。'
}
type Copy = typeof zh
const en: Copy = {
  title: 'Home together', goal: (count: number) => `Rescue all ${count} cats`, calm: 'No timer · Arrange, then start',
  tray: 'Place cats in order', placed: 'Placed', choose: 'Place the first cat on the board', ready: 'All set! Start the rescue', conditions: 'Level conditions', conditionHint: 'Route summary; crossings count once, any safe route also wins', horizontalLine: 'Horizontal', verticalLine: 'Vertical', diagonalLine: 'Diagonal', clearCount: 'Cleared cells', gravityCount: 'Drop waves', mergedGroup: '8-way merge',
  cardLabel: (position: number, name: string) => `Waiting cat ${position}: ${name}`,
  note: 'Numbers show placement order; cats fall only after clearing', fixed: 'Starting cat', take: 'Take back',
  cellLabel: (row: number, column: number) => `Place at row ${row}, column ${column}`,
  board: '8 × 8 cat board', undo: 'Undo', useHint: 'Hint', hintUsed: 'The hint marked the recommended spot for the next cat', start: 'Start rescue', rules: 'How to play',
  rulesTitle: 'Arrange, then watch the chain', rule1: 'Place the cards from left to right. The first cat goes exactly where you tap. Numbers show placement order.',
  rule2: 'A card disappears after placement. Each round has one undo for the latest cat. Nothing clears or falls while arranging.',
  rule3: 'Place all cats, then start. Lines of 3 or more match horizontally, vertically or diagonally. Matching cells of the same type that touch in any of 8 directions merge into one group, including crossings. If several groups are ready, the group containing the smallest placement number clears first, one group at a time.',
  rule4: (count: number) => `Only cats stacked directly on a cleared support fall. A gap breaks the stack; other cats stay in place. New matches continue the chain. Rescue all ${count} cats to win.`,
  rule5: 'No timer. Each level has 3 lives; on levels 1–20, a click that is proven to make the level unsolvable spends one immediately, while a failed complete arrangement spends one after resolution. The arrangement is cleared for a fresh retry—there is no half-board revive or ad restore. Each attempt has one undo and each level has one hint.',
  close: 'Got it', wave: 'Chain', failed: 'This arrangement failed', failedTip: 'All three lives are gone. The failed arrangement is not resumed from a half-cleared board; restart the level or return to level select.', placementFailed: 'Placement judged unsolvable', placementFailedTip: 'This position was proven to make the level unsolvable. All three lives are gone; restart the level or return to level select.', placementRetryNotice: (lives: number) => `This position makes the level unsolvable. One life spent; the arrangement was reset. ${lives} remain.`, retryNotice: (lives: number) => `The arrangement failed resolution. One life spent; the arrangement was reset. ${lives} remain.`, checkingPlacement: 'Checking whether this position keeps the level solvable…', livesLabel: 'Lives', mainlineDone: 'Level 25 complete—the mainline pauses here for now!', restart: 'Restart level', remaining: 'Remaining:', cats: 'cats', swipe: 'Swipe sideways to see more cats',
  failures: 'Failed attempts:', times: '', edit: 'Edit arrangement', completed: 'Everyone is home!',
  next: (id: number) => `Go to level ${id}`, levels: 'Level select', reward: '+50 Paw Coins', hint: 'Tip: clear the support so the cats above can meet.'
}
const ja: Copy = {
  title: 'みんなで帰ろう', goal: (count: number) => `${count} 匹すべてを助けよう`, calm: '時間制限なし・並べてからスタート',
  tray: '順番に猫を置く', placed: '配置済み', choose: '先頭の猫を盤面に置こう', ready: '準備完了！救出を始めよう', conditions: 'この面の条件', conditionHint: '解法の概要・交差は1回だけ、他の安全な解法も正解', horizontalLine: 'ヨコ', verticalLine: 'タテ', diagonalLine: 'ナナメ', clearCount: '消去マス', gravityCount: '落下波', mergedGroup: '8方向合流',
  cardLabel: (position: number, name: string) => `待機中の${position}匹目：${name}`,
  note: '数字は置いた順番です。消した後にだけ猫が落ちます', fixed: '最初からいる猫', take: '戻す',
  cellLabel: (row: number, column: number) => `${row}行 ${column}列に置く`,
  board: '8 × 8 の猫ボード', undo: 'ひとつ戻す', useHint: 'ヒント', hintUsed: '次の猫のおすすめ位置をヒントで表示しました', start: '救出スタート', rules: '遊び方',
  rulesTitle: '並べて、連鎖を見よう', rule1: 'カードを左から順に置きます。先頭の猫はタップしたマスに入り、数字が配置順を示します。',
  rule2: '置いたカードは消え、各ラウンド1回だけ最後の猫を戻せます。配置中は消去も落下も起きません。',
  rule3: '全員を置いてからスタート。同じ猫が縦・横・斜めに3匹以上並ぶと消去群になります。同じ猫の群れが8方向でつながっていれば交差を分けず1つの群れです。複数の群れがある時は、最も小さい配置番号を含む群れから1つずつ消えます。',
  rule4: (count: number) => `消えた猫の真上につながって積まれた猫だけ落ちます。間に空きマスがあれば落ちません。また揃うと連鎖し、${count}匹すべて助ければクリア。`,
  rule5: '時間制限なし。各ステージは3ライフで、1～20ではタップが解けないと証明された時点で1つ減り、それ以外は全て配置しても消し切れない時に減ります。配置は空に戻して再挑戦し、途中盤面の復元や広告での救済はありません。各試行1回の取り消し、各ステージ1回のヒントがあります。',
  close: 'わかった', wave: '連鎖', failed: 'この配置は失敗', failedTip: '3つのライフを使い切りました。途中の盤面は再開せず、ステージを最初からやり直すか選択画面へ戻ります。', placementFailed: '配置判定に失敗', placementFailedTip: 'この場所ではステージを解けないことが証明されました。ライフを使い切ったため、最初からやり直すか選択画面へ戻ります。', placementRetryNotice: (lives: number) => `この場所では解けません。ライフを1つ使い、配置をリセットしました。残り${lives}つです。`, retryNotice: (lives: number) => `配置の解決に失敗しました。ライフを1つ使い、配置をリセットしました。残り${lives}つです。`, checkingPlacement: 'この位置で解けるか確認中⋯', livesLabel: 'ライフ', mainlineDone: 'ステージ25クリア！メインラインはここで一休みです。', restart: '最初からやり直す', remaining: '残り', cats: '匹', swipe: '左右にスワイプして猫を見る',
  failures: '失敗', times: '回', edit: '配置を修正', completed: 'みんな帰れた！',
  next: (id: number) => `ステージ${id}へ`, levels: 'ステージ選択', reward: '+50 肉球コイン', hint: 'ヒント：支えを消すと、上の猫が落ちて揃います。'
}
export const planningCopy: Record<Locale, Copy> = { 'zh-TW': zh, en, ja }
