import type { Locale } from '../../i18n/locale'

const zh = {
  title: '一起回家', goal: (count: number) => `救出全部 ${count} 隻貓咪`, calm: '不限時間・先排好再開始',
  tray: '本關全部貓咪', placed: '已安排', choose: '選一隻貓，再點棋盤格子', ready: '都排好了！準備開始救援',
  note: '數字是放置順序；只有消除後貓咪才會掉落', fixed: '原有貓咪', take: '拿回',
  cellLabel: (row: number, column: number) => `放在第 ${row} 排、第 ${column} 欄`,
  board: '8 × 8 貓咪棋盤', undo: '撤銷上一步', clear: '全部拿回', start: '開始救援', rules: '玩法說明',
  rulesTitle: '先安排，再看連鎖', rule1: '選一隻貓，再點棋盤上的格子。貓咪會直接放在你點的位置，數字標示放置順序。',
  rule2: '安排時不消除，也不會自己掉落。點已放的貓可拿回，也能撤銷；原有貓咪不能移動。',
  rule3: '全部放好才按開始。同款橫、直或斜線連續 3 隻以上會消除；同時有多組時，先消除較早放置貓咪所在的那一組，一次只處理一組。',
  rule4: (count: number) => `只有直接疊在被消除貓咪上方、失去支撐的那一串會掉落；中間隔著空格的貓不會跟著掉。再形成三連就繼續，救出全部 ${count} 隻便過關。`,
  rule5: '沒有倒數。連鎖停住才算失敗；每關有 2 次中途重試，只能移動自己放下且還沒消除的貓。用完後可整關重來，或看廣告多重試 1 次。',
  close: '知道了', wave: '連鎖', failed: '再調整一下', remaining: '還有', cats: '隻貓咪', swipe: '左右滑動看更多貓咪',
  failures: '失敗', times: '次', edit: '修改配置', completed: '全部回家了！',
  next: (id: number) => `前往第 ${id} 關`, levels: '返回關卡', reward: '+50 貓掌幣', hint: '小提示：先消掉支撐，上面的貓才會落到一起。'
}
type Copy = typeof zh
const en: Copy = {
  title: 'Home together', goal: (count: number) => `Rescue all ${count} cats`, calm: 'No timer · Arrange, then start',
  tray: 'All cats for this puzzle', placed: 'Placed', choose: 'Choose a cat, then tap a board cell', ready: 'All set! Start the rescue',
  note: 'Numbers show placement order; cats fall only after clearing', fixed: 'Starting cat', take: 'Take back',
  cellLabel: (row: number, column: number) => `Place at row ${row}, column ${column}`,
  board: '8 × 8 cat board', undo: 'Undo', clear: 'Take all back', start: 'Start rescue', rules: 'How to play',
  rulesTitle: 'Arrange, then watch the chain', rule1: 'Choose a cat and a board cell. It goes exactly where you tap. Numbers show placement order.',
  rule2: 'No clearing or falling while arranging. Tap a placed cat to take it back, or undo. Starting cats stay fixed.',
  rule3: 'Place all cats, then start. Lines of 3 or more match horizontally, vertically or diagonally. If several groups are ready, the group containing an earlier placed cat clears first, one group at a time.',
  rule4: (count: number) => `Only cats stacked directly on a cleared support fall. A gap breaks the stack; other cats stay in place. New matches continue the chain. Rescue all ${count} cats to win.`,
  rule5: 'No timer. A stopped chain counts as one failure. Each level has 2 checkpoint retries for your surviving placed cats. After that, restart or watch an ad for 1 more retry.',
  close: 'Got it', wave: 'Chain', failed: 'Try another arrangement', remaining: 'Remaining:', cats: 'cats', swipe: 'Swipe sideways to see more cats',
  failures: 'Failed attempts:', times: '', edit: 'Edit arrangement', completed: 'Everyone is home!',
  next: (id: number) => `Go to level ${id}`, levels: 'Level select', reward: '+50 Paw Coins', hint: 'Tip: clear the support so the cats above can meet.'
}
const ja: Copy = {
  title: 'みんなで帰ろう', goal: (count: number) => `${count} 匹すべてを助けよう`, calm: '時間制限なし・並べてからスタート',
  tray: 'このステージの猫', placed: '配置済み', choose: '猫を選んで、盤面のマスをタップ', ready: '準備完了！救出を始めよう',
  note: '数字は置いた順番です。消した後にだけ猫が落ちます', fixed: '最初からいる猫', take: '戻す',
  cellLabel: (row: number, column: number) => `${row}行 ${column}列に置く`,
  board: '8 × 8 の猫ボード', undo: 'ひとつ戻す', clear: 'すべて戻す', start: '救出スタート', rules: '遊び方',
  rulesTitle: '並べて、連鎖を見よう', rule1: '猫を選んで盤面のマスをタップ。猫はタップした場所に置かれます。数字は置いた順番です。',
  rule2: '配置中は消えず、落ちません。置いた猫をタップすると戻せます。最初からいる猫は動かせません。',
  rule3: '全員を置いてからスタート。同じ猫が縦・横・斜めに3匹以上並びます。複数の組がある時は、先に置いた猫を含む組から1組ずつ消えます。',
  rule4: (count: number) => `消えた猫の真上につながって積まれた猫だけ落ちます。間に空きマスがあれば落ちません。また揃うと連鎖し、${count}匹すべて助ければクリア。`,
  rule5: '時間制限なし。連鎖が止まると失敗です。各ステージ2回、消えていない自分の猫を途中から修正できます。使い切ったら最初から、または広告でもう1回。',
  close: 'わかった', wave: '連鎖', failed: '並べ方を変えてみよう', remaining: '残り', cats: '匹', swipe: '左右にスワイプして猫を見る',
  failures: '失敗', times: '回', edit: '配置を修正', completed: 'みんな帰れた！',
  next: (id: number) => `ステージ${id}へ`, levels: 'ステージ選択', reward: '+50 肉球コイン', hint: 'ヒント：支えを消すと、上の猫が落ちて揃います。'
}
export const planningCopy: Record<Locale, Copy> = { 'zh-TW': zh, en, ja }
