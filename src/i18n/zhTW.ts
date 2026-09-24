import type { Strings } from './strings'

export const zhTW: Strings = {
  app: {
    openingGame: '正在準備遊戲…',
    organizingGame: '正在整理棋盤…',
    title: 'MEOW LINE｜貓咪落下連線'
  },
  topbar: {
    back: '返回', settings: '設定', pause: '暫停',
    levelAria: '關卡 {level}', starsAria: '{stars} 顆星', moves: '步數'
  },
  home: {
    brandSub: '貓咪落下連線解謎', brandAria: 'Meow Line 喵序｜貓咪落下連線解謎',
    start: '開始遊戲', levels: '關卡', mainNav: '主選單'
  },
  levels: {
    title: '關卡選擇',
    board: '關卡清單', levelAria: '第 {id} 關', lockedSuffix: '，尚未解鎖', locked: '未解鎖'
  },
  settings: {
    title: '設定',
    musicLabel: '音樂', soundLabel: '音效', hapticsLabel: '震動',
    language: '語言',
    about: '關於遊戲', aboutToast: 'Meow Line 喵序｜貓咪落下連線解謎，目前版本 1.0.0。',
    backHome: '回到主頁', privacy: '隱私權政策', terms: '服務條款', support: '客服支援'
  },
  legal: { backToSettings: '‹　返回設定', emailCta: '寄信給客服' },
  ads: {
    dialogAria: '廣告播放中', title: '廣告播放中', description: '瀏覽器測試會模擬最長 30 秒；正式全螢幕廣告的播放時間與關閉方式由 AdMob 控制。', remaining: '還剩 {seconds} 秒', ready: '廣告即將結束'
  },
  game: {
    rescue: '救出 {done} / {target}', statusLabel: '關卡狀態', timeLeft: '時間提示',
    preview: '待落下的兩隻貓咪', previewThree: '待落下的三隻貓咪', previewFour: '待落下的四隻貓咪', now: 'NOW', next: 'NEXT', soon: 'SOON', later: 'LATER',
    nowAlt: '現在：{name}', nextAlt: '下一隻：{name}', soonAlt: '再下一隻：{name}', laterAlt: '之後：{name}', traitScratch: '愛抓抓', traitHungry: '貪吃', board: '貓咪落下棋盤',
    columnAction: '第 {col} 欄，放下{name}', ceilingDanger: '⚠ 小心！快到頂端了',
    ceilingSafe: '別超過這條線喔', lineTagline: '♡ 落下、連線、喵喵連鎖', actions: '遊戲操作',
    howTo: '？ 玩法說明', hintUsed: '本局提示已使用', replay: '↻ 重玩',
    rulesAria: '貓咪落下連線玩法', rulesTitle: '一點、一落、一聲喵！',
    rule1Title: '點選一欄', rule1Desc: 'NOW 的貓咪會落到那一欄最下方的空位。NEXT 是下一隻。',
    rule2Title: '三隻同款連線', rule2Desc: '橫向、直向、兩種斜向，連續 3 隻以上一起消除。',
    rule3Title: '掉落再連鎖', rule3Desc: '上方貓咪往下掉，再連線就觸發 Combo！',
    rule4Title: '留意棋盤頂端', rule4Desc: '消除與掉落結束後，仍有貓咪佔到最上排就失敗。',
    rulesCta: '知道了，來玩喵！', completedAria: '過關囉！', completedTitle: '第 {id} 關完成！',
    starsAria: '{stars} 顆星', summary: '救出 {cleared} 隻 · {score} 分',
    summaryLine2: '最佳 Combo ×{best} · 落下 {moves} 次',
    nextLevel: '下一關：{id}', playAgain: '再玩一次，挑戰高分', backToLevels: '返回關卡',
    partyDone: '喵喵派對完成了 ♡', nextHappiness: '下一段連鎖等你發現 ♡',
    failedCeilingAria: '棋盤滿了', failedGenericAria: '挑戰結束',
    failedCeilingTitle: '哎呀，棋盤滿了！',
    failedTimeTitle: '時間到，休息一下喵！', failedProgress: '已救出 {cleared} / {target} 隻貓咪。',
    ceilingTip: '試試分散堆疊，留出更多空間。', otherTip: '再找找三連線，貓咪等你帶牠們回家。',
    retry: '再試一次喵', backCottage: '回溫馨小屋',
    comboSuccess: '喵！配對成功', combo: 'COMBO ×{count}', matchCombo: '喵喵 ×{count}',
    objectivesLabel: '本關目標', objectiveRescue: '救出 {done}/{target}', objectiveScratch: '抓板 {done}/{target}', objectiveFish: '魚乾 {done}/{target}',
    patrolCounter: '{count} 次後搗蛋貓移動', patrolNext: '下一個封鎖欄：第 {column} 欄', holdLabel: '逗貓棒暫存', holdEmpty: '暫存空位', holdStored: '已暫存{name}', holdAction: '暫存',
    noRouteTitle: '沒有安全落點', noRouteTip: '搗蛋貓封住了所有可以使用的入口。',
    tutorialTitle: '先和貓咪試玩一下', tutorialIntro: '{name} 的新機制不會計分，放心摸索！', tutorialDemo: '看可愛示範', tutorialCta: '開始正式關卡',
    tutorialScratchEffect: '爪爪！', traitScratchEffect: '抓抓！', tutorialFishEffect: '喵♡', tutorialHoldEffect: '換一隻！', tutorialTunnelEffect: '穿過去！', tutorialHungryEffect: '好吃！', tutorialPatrolEffect: '跑跑～'
  },
  pause: {
    dialogAria: '暫停選單', pausedAlt: '遊戲已暫停', title: '暫停', close: '關閉暫停選單',
    continue: '繼續遊戲', restart: '重新開始本關', home: '首頁', settings: '設定'
  },
  tray: { label: '貓咪選擇區', placed: '已放入' },
  match3: { board: '三消棋盤', empty: '空格', cell: '第{col}欄第{row}列，{name}' }
}
