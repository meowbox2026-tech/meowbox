import type { Locale } from '../../i18n/locale'

const zh = {
  title: '一起回家', goal: (count: number) => `救出全部 ${count} 隻貓咪`, calm: '不限時間・先排好再開始',
  tray: '依序放置貓咪', placed: '已安排', choose: '把最前面的貓放進棋盤', ready: '都排好了！準備開始救援',
  cardLabel: (position: number, name: string) => `第 ${position} 隻待放貓咪：${name}`,
  note: '數字是放置順序；只有消除後貓咪才會掉落', fixed: '原有貓咪', take: '拿回',
  cellLabel: (row: number, column: number) => `放在第 ${row} 排、第 ${column} 欄`,
  board: '8 × 8 貓咪棋盤', undo: '撤銷上一步', useHint: '提示', hintUsed: '提示已標出下一隻貓咪的推薦位置', start: '開始救援', rules: '玩法說明',
  rulesTitle: '先安排，再看連鎖', rule1: '依照卡片由左到右，把最前面的貓放進棋盤。貓咪會直接放在你點的位置，數字標示放置順序。',
  rule2: '放下後卡片會消失；每局只有 1 次撤銷機會，可收回最新一隻。安排時不消除也不掉落，原有貓咪不能移動。',
  rule3: '全部放好才按開始。同款橫、直或斜線連續 3 隻以上會消除；同時有多組時，先消除較早放置貓咪所在的那一組，一次只處理一組。',
  rule4: (count: number) => `只有直接疊在被消除貓咪上方、失去支撐的那一串會掉落；中間隔著空格的貓不會跟著掉。再形成三連就繼續，救出全部 ${count} 隻便過關。`,
  rule5: '沒有倒數。連鎖停住才算失敗；每局 1 次撤銷、每關 1 次提示，提示之後可接獎勵廣告。每關有 2 次中途重試，只能移動自己放下且還沒消除的貓。',
  close: '知道了', wave: '連鎖', failed: '再調整一下', remaining: '還有', cats: '隻貓咪', swipe: '左右滑動看更多貓咪',
  failures: '失敗', times: '次', edit: '修改配置', completed: '全部回家了！',
  next: (id: number) => `前往第 ${id} 關`, levels: '返回關卡', reward: '+50 貓掌幣', hint: '小提示：先消掉支撐，上面的貓才會落到一起。'
}
type Copy = typeof zh
const en: Copy = {
  title: 'Home together', goal: (count: number) => `Rescue all ${count} cats`, calm: 'No timer · Arrange, then start',
  tray: 'Place cats in order', placed: 'Placed', choose: 'Place the first cat on the board', ready: 'All set! Start the rescue',
  cardLabel: (position: number, name: string) => `Waiting cat ${position}: ${name}`,
  note: 'Numbers show placement order; cats fall only after clearing', fixed: 'Starting cat', take: 'Take back',
  cellLabel: (row: number, column: number) => `Place at row ${row}, column ${column}`,
  board: '8 × 8 cat board', undo: 'Undo', useHint: 'Hint', hintUsed: 'The hint marked the recommended spot for the next cat', start: 'Start rescue', rules: 'How to play',
  rulesTitle: 'Arrange, then watch the chain', rule1: 'Place the cards from left to right. The first cat goes exactly where you tap. Numbers show placement order.',
  rule2: 'A card disappears after placement. Each round has one undo for the latest cat. Nothing clears or falls while arranging.',
  rule3: 'Place all cats, then start. Lines of 3 or more match horizontally, vertically or diagonally. If several groups are ready, the group containing an earlier placed cat clears first, one group at a time.',
  rule4: (count: number) => `Only cats stacked directly on a cleared support fall. A gap breaks the stack; other cats stay in place. New matches continue the chain. Rescue all ${count} cats to win.`,
  rule5: 'No timer. A stopped chain counts as one failure. Each level has one undo and one hint; the hint can connect to a rewarded ad later. Each level has 2 checkpoint retries for your surviving placed cats.',
  close: 'Got it', wave: 'Chain', failed: 'Try another arrangement', remaining: 'Remaining:', cats: 'cats', swipe: 'Swipe sideways to see more cats',
  failures: 'Failed attempts:', times: '', edit: 'Edit arrangement', completed: 'Everyone is home!',
  next: (id: number) => `Go to level ${id}`, levels: 'Level select', reward: '+50 Paw Coins', hint: 'Tip: clear the support so the cats above can meet.'
}
const ja: Copy = {
  title: 'みんなで帰ろう', goal: (count: number) => `${count} 匹すべてを助けよう`, calm: '時間制限なし・並べてからスタート',
  tray: '順番に猫を置く', placed: '配置済み', choose: '先頭の猫を盤面に置こう', ready: '準備完了！救出を始めよう',
  cardLabel: (position: number, name: string) => `待機中の${position}匹目：${name}`,
  note: '数字は置いた順番です。消した後にだけ猫が落ちます', fixed: '最初からいる猫', take: '戻す',
  cellLabel: (row: number, column: number) => `${row}行 ${column}列に置く`,
  board: '8 × 8 の猫ボード', undo: 'ひとつ戻す', useHint: 'ヒント', hintUsed: '次の猫のおすすめ位置をヒントで表示しました', start: '救出スタート', rules: '遊び方',
  rulesTitle: '並べて、連鎖を見よう', rule1: 'カードを左から順に置きます。先頭の猫はタップしたマスに入り、数字が配置順を示します。',
  rule2: '置いたカードは消え、各ラウンド1回だけ最後の猫を戻せます。配置中は消去も落下も起きません。',
  rule3: '全員を置いてからスタート。同じ猫が縦・横・斜めに3匹以上並びます。複数の組がある時は、先に置いた猫を含む組から1組ずつ消えます。',
  rule4: (count: number) => `消えた猫の真上につながって積まれた猫だけ落ちます。間に空きマスがあれば落ちません。また揃うと連鎖し、${count}匹すべて助ければクリア。`,
  rule5: '時間制限なし。連鎖が止まると失敗です。各ステージ1回の取り消しとヒントがあり、ヒントは今後リワード広告につなげられます。各ステージ2回、消えていない自分の猫を途中から修正できます。',
  close: 'わかった', wave: '連鎖', failed: '並べ方を変えてみよう', remaining: '残り', cats: '匹', swipe: '左右にスワイプして猫を見る',
  failures: '失敗', times: '回', edit: '配置を修正', completed: 'みんな帰れた！',
  next: (id: number) => `ステージ${id}へ`, levels: 'ステージ選択', reward: '+50 肉球コイン', hint: 'ヒント：支えを消すと、上の猫が落ちて揃います。'
}
export const planningCopy: Record<Locale, Copy> = { 'zh-TW': zh, en, ja }
