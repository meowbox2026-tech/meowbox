import type { Strings } from './strings'

export const zhTW: Strings = {
  app: {
    openingBox: '正在打開紙箱…',
    organizingBox: '正在整理紙箱…',
    hintClaimed: '已領取提示 ×{amount}',
    coinClaimed: '已領取 🐾 {amount}',
    title: 'MEOW BOX｜貓咪落下消除'
  },
  topbar: {
    back: '返回', settings: '設定', pause: '暫停', level: '關卡',
    levelAria: '關卡 {level}', starsAria: '{stars} 顆星', moves: '步數'
  },
  home: {
    brandSub: '貓咪落下消除', brandAria: 'Meow Box 貓咪落下消除',
    progress: '目前進度', progressAria: '目前進度，第 {level} 關',
    collected: '已蒐集 {count} 顆星星', start: '開始遊戲', levels: '關卡', mainNav: '主選單'
  },
  levels: {
    title: '關卡選擇', subtitle: '更多貓咪，更多幸福！', worldTabs: '世界選擇',
    world: '世界 {n}', worldSubs: ['溫馨小屋', '花園', '旅行'],
    worldLocked: '完成世界 1 的 30 關後解鎖世界 2',
    board: '關卡清單', levelAria: '第 {id} 關', lockedSuffix: '，尚未解鎖', locked: '未解鎖'
  },
  settings: {
    title: '設定', subtitle: '讓每一次遊玩都更剛好！',
    musicLabel: '音樂', musicDesc: '陪伴拼圖時光的輕鬆背景音樂',
    soundLabel: '音效', soundDesc: '每一個可愛動作都有回應',
    hapticsLabel: '震動', hapticsDesc: '放好貓咪時的小小提示',
    language: '語言', restore: '恢復購買項目',
    restoreToast: '原生購買恢復服務已預留，需接上商店商品 ID。',
    about: '關於遊戲', aboutToast: 'Meow Box 貓咪裝箱拼圖，目前版本 1.0.0。',
    backHome: '⌂　回到主頁', privacy: '隱私權政策', terms: '服務條款', support: '客服支援'
  },
  legal: { backToSettings: '‹　返回設定', emailCta: '寄信給客服' },
  shop: {
    title: '商店', subtitle: '更多可愛貓咪，更多快樂日常！',
    coinsTab: '金幣', catsTab: '貓咪', boxesTab: '紙箱',
    coinsHeading: 'Paw Coins', coinsDesc: '金幣能解鎖更多可愛造型！',
    claim: '領取', testClaimed: '測試商店：已加入 {amount} Paw Coins',
    disclaimer: '正式上架時，這些按鈕將接到 App Store / Google Play 的安全付款流程。',
    catsHeading: '貓咪造型', catsDesc: '收集每一隻獨一無二的貓咪！',
    use: '使用', using: '使用中', boxesHeading: '紙箱造型', boxesDesc: '替貓咪準備更舒適的小屋！',
    newCat: '新貓咪已加入收藏！', notEnough: 'Paw Coin 不夠，先多闖幾關吧！',
    newBox: '已換上新的紙箱外觀！', removeAdsTitle: '移除廣告',
    removeAdsDesc: '享受更順暢、更愉快的拼圖體驗！',
    removeAdsToast: '正式版會使用原生商店完成購買與 Restore Purchases。'
  },
  collection: {
    title: '貓咪收藏', subtitle: '收集更多貓咪，累積更多幸福！', gridLabel: '貓咪外觀收藏',
    companionUnlocked: '溫暖又療癒的陪伴，是每一天的小確幸 ♡',
    unlockPrice: '需要 {price} Paw Coins 解鎖', useCat: '使用這隻貓', goShop: '前往商店',
    using: '使用中', unlocked: '已解鎖', catsTab: '🐱 貓咪', boxesTab: '📦 箱子',
    specialTab: '★ 特別系列', mysteryName: '神祕貓', mysteryHint: 'Lv.50 解鎖',
    note: '🐾 持續遊玩，解鎖更多可愛貓咪！'
  },
  game: {
    rescue: '救出 {done} / {target}', statusLabel: '關卡任務與時間', timeLeft: '剩餘時間',
    overtime: '加賽 {count} 次', preview: '待落下的兩隻貓咪', previewThree: '待落下的三隻貓咪', previewFour: '待落下的四隻貓咪', now: 'NOW', next: 'NEXT', soon: 'SOON', later: 'LATER',
    nowAlt: '現在：{name}', nextAlt: '下一隻：{name}', soonAlt: '再下一隻：{name}', laterAlt: '之後：{name}', traitScratch: '愛抓抓', traitHungry: '貪吃', board: '貓咪紙箱',
    columnAction: '第 {col} 欄，放下{name}', ceilingDanger: '⚠ 小心！快到頂端了',
    ceilingSafe: '別超過這條線喔', boxTagline: '♡ 一箱小幸福', actions: '遊戲操作',
    howTo: '？ 玩法說明', hintUsed: '本局提示已使用', hintAd: '▶ 廣告提示', replay: '↻ 重玩',
    rulesAria: '貓咪落下玩法', rulesTitle: '一點、一落、一聲喵！',
    rule1Title: '點選一欄', rule1Desc: 'NOW 的貓咪會落到那一欄最下方的空位。NEXT 是下一隻。',
    rule2Title: '三隻同款連線', rule2Desc: '橫向、直向、兩種斜向，連續 3 隻以上一起消除。',
    rule3Title: '掉落再連鎖', rule3Desc: '上方貓咪往下掉，再連線就觸發 Combo！',
    rule4Title: '留意箱子頂端', rule4Desc: '消除與掉落結束後，仍有貓咪佔到最上排就失敗。',
    rulesFooter: '本關：{time} 秒內救出 {target} 隻。首次落下開始計時；31 關起機關動畫會暫停倒數，暫停與廣告停表。{three} 次內三星，{two} 次內兩星。',
    rulesExtra: '每局可看廣告提示一次、復活一次。碰頂復活清掉底排（不計消除數）；時間到可加賽 3 次落下，加賽仍不能碰頂。',
    rulesCta: '知道了，來玩喵！', completedAria: '過關囉！', completedTitle: '第 {id} 關完成！',
    starsAria: '{stars} 顆星', summary: '救出 {cleared} 隻 · {score} 分',
    summaryLine2: '最佳 Combo ×{best} · 落下 {moves} 次', reward: '🐾 {amount} 貓掌幣已存入',
    nextLevel: '下一關：{id}', playAgain: '再玩一次，挑戰高分', backToLevels: '返回關卡',
    partyDone: '箱長的派對完成了 ♡', nextHappiness: '下一箱幸福正在等你 ♡',
    failedCeilingAria: '紙箱裝滿了', failedGenericAria: '挑戰結束',
    failedCeilingTitle: '哎呀，紙箱裝滿了！', failedMovesTitle: '額外落下次數用完了',
    failedTimeTitle: '時間到，休息一下喵！', failedProgress: '已救出 {cleared} / {target} 隻貓咪。',
    ceilingTip: '試試分散堆疊，留出更多空間。', otherTip: '再找找三連線，貓咪等你帶牠們回家。',
    reviveCeiling: '▶ 看廣告，清除底部一排', reviveMoves: '▶ 看廣告，再給 3 次落下',
    retry: '再試一次喵', backCottage: '回溫馨小屋', hintTitle: '讓貓咪幫你看一眼',
    hintDesc: '完成觀看後，標出一個較安全的欄位。本局限一次。', reviveTitle: '再挑戰一次喵',
    reviveCeilingDesc: '清除底部一排，其餘貓咪向下移；不增加消除數。每局限復活一次。',
    reviveMovesDesc: '獲得 3 次額外落下，不再倒數；碰頂仍失敗。每局限復活一次。',
    comboSuccess: '喵！配對成功', combo: 'COMBO ×{count}', matchCombo: '喵喵 ×{count}',
    objectivesLabel: '本關目標', objectiveRescue: '救出 {done}/{target}', objectiveScratch: '抓板 {done}/{target}', objectiveFish: '魚乾 {done}/{target}',
    patrolCounter: '{count} 次後搗蛋貓移動', patrolNext: '下一個封鎖欄：第 {column} 欄', holdLabel: '逗貓棒暫存', holdEmpty: '暫存空位', holdStored: '已暫存{name}', holdAction: '暫存',
    noRouteTitle: '沒有安全落點', noRouteTip: '搗蛋貓封住了所有可以使用的入口。',
    tutorialTitle: '先和貓咪試玩一下', tutorialIntro: '{name} 的新機制不會計分，放心摸索！', tutorialDemo: '看可愛示範', tutorialCta: '開始正式關卡',
    tutorialScratchEffect: '爪爪！', traitScratchEffect: '抓抓！', tutorialFishEffect: '喵♡', tutorialHoldEffect: '換一隻！', tutorialTunnelEffect: '穿過去！', tutorialHungryEffect: '好吃！', tutorialPatrolEffect: '跑跑～'
  },
  pause: {
    dialogAria: '暫停選單', pausedAlt: '遊戲已暫停', title: '暫停', close: '關閉暫停選單',
    continue: '繼續遊戲', restart: '重新開始本關', home: '回到主頁', settings: '設定'
  },
  result: {
    dialogAria: '過關囉！', title: '過關囉！', starsAria: '{stars} 顆星',
    perfect: '太完美了！', good: '完成得很棒，再挑戰三星吧！',
    rewards: '過關獎勵', rewardLabel: '獎勵', claim: '領取獎勵', claimed: '已領取',
    claimedLabel: '已領取獎勵', double: '雙倍獎勵', doubleClaimedLabel: '雙倍獎勵已領取',
    levelNav: '關卡', next: '下一關', replay: '重玩', nav: '過關後操作'
  },
  daily: {
    giftAlt: '每日獎勵禮物', title: '每日獎勵', desc: '今天也和貓咪一起，收下這份小確幸吧！',
    today: '今日可領：{reward}', claim: '領取獎勵', watchAd: '▶ 看廣告 ×2',
    loading: '獎勵載入中…', tomorrow: '明天再回來，連續獎勵會更豐富！', gotIt: '知道了',
    day: 'Day {n}', hintReward: '提示 ×{amount}', coinReward: '🐾 {amount}'
  },
  rewarded: {
    testMode: '獎勵廣告測試模式', watchAndClaim: '觀看並領取', loadingClaim: '載入獎勵中…',
    later: '暫時不用', incomplete: '尚未完成觀看，沒有使用獎勵次數。可以再試一次。',
    unavailable: '廣告暫時無法播放，請稍後再試。獎勵次數沒有扣除。',
    watchAlt: '觀看廣告可獲得獎勵'
  },
  tray: { label: '貓咪選擇區', placed: '已放入' },
  match3: { board: '三消棋盤', empty: '空格', cell: '第{col}欄第{row}列，{name}' }
}
