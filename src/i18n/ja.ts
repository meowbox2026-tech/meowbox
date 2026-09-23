import type { Strings } from './strings'

export const ja: Strings = {
  app: {
    openingBox: '箱を開けています…',
    organizingBox: '箱を整理しています…',
    hintClaimed: 'ヒント×{amount}をゲット',
    coinClaimed: '🐾 {amount}をゲット',
    title: 'MEOW BOX｜猫落としパズル'
  },
  topbar: {
    back: '戻る', settings: '設定', pause: '一時停止', level: 'レベル',
    levelAria: 'レベル {level}', starsAria: '{stars}スター', moves: '手数'
  },
  home: {
    brandSub: '猫落としパズル', brandAria: 'Meow Box 猫落としパズル',
    progress: '今の進み具合', progressAria: '今の進み具合、レベル {level}',
    collected: '{count}スター集めた', start: 'ゲームスタート', levels: 'レベル', mainNav: 'メインメニュー'
  },
  levels: {
    title: 'レベル選択', subtitle: '猫が増えるほど、幸せも増える！', worldTabs: 'ワールド選択',
    world: 'ワールド {n}', worldSubs: ['あたたかいお家', 'ガーデン', '旅行'],
    worldLocked: 'ワールド1の30ステージをクリアするとワールド2が解放されます',
    board: 'レベル一覧', levelAria: 'レベル {id}', lockedSuffix: '、まだロック中', locked: 'ロック中'
  },
  settings: {
    title: '設定', subtitle: '毎回のプレイをもっとちょうどよく！',
    musicLabel: '音楽', soundLabel: '効果音', hapticsLabel: '振動',
    language: '言語', restore: '購入の復元',
    restoreToast: 'ネイティブの購入復元は準備中です。ストアの商品IDを接続してください。',
    about: 'このゲームについて', aboutToast: 'Meow Box 猫の箱詰めパズル、バージョン 1.0.0。',
    backHome: '⌂　ホームへ戻る', privacy: 'プライバシーポリシー', terms: '利用規約', support: 'サポート'
  },
  legal: { backToSettings: '‹　設定へ戻る', emailCta: 'サポートにメールする' },
  shop: {
    title: 'ショップ', subtitle: 'かわいい猫が増えるほど、毎日が楽しい！',
    coinsTab: 'コイン', catsTab: '猫', boxesTab: '箱',
    coinsHeading: 'Paw Coins', coinsDesc: 'コインでかわいいスタイルを解放！',
    claim: '受け取る', testClaimed: 'テストショップ：{amount} Paw Coinsを追加',
    disclaimer: '正式版では、このボタンは App Store / Google Play の安全な決済に接続されます。',
    catsHeading: '猫スタイル', catsDesc: '個性豊かな猫を集めよう！',
    use: '使う', using: '使用中', boxesHeading: '箱スタイル', boxesDesc: '猫にもっと快適なお家を！',
    newCat: '新しい猫が仲間に加わった！', notEnough: 'Paw Coinが足りないよ、もっとレベルを進めよう！',
    newBox: '新しい箱に着替えた！', removeAdsTitle: '広告を削除',
    removeAdsDesc: 'もっとスムーズで楽しいパズル時間を！',
    removeAdsToast: '正式版ではネイティブストアで購入・復元を行います。'
  },
  collection: {
    title: '猫コレクション', subtitle: '猫を集めるほど、幸せもたまる！', gridLabel: '猫スタイルコレクション',
    companionUnlocked: 'あたたかく癒やされる相棒、毎日の小さな幸せ ♡',
    unlockPrice: '{price} Paw Coinsで解放', useCat: 'この猫を使う', goShop: 'ショップへ',
    using: '使用中', unlocked: '解放済み', catsTab: '🐱 猫', boxesTab: '📦 箱',
    specialTab: '★ スペシャル', mysteryName: 'なぞの猫', mysteryHint: 'Lv.50で解放',
    note: '🐾 遊び続けて、もっとかわいい猫を解放しよう！'
  },
  game: {
    rescue: '{done} / {target} 匹救出', statusLabel: 'ミッションと残り時間', livesLabel: '残りライフ', deadDropNotice: 'その落下は今のクリアルートを閉じるため、操作前に戻りました。盤面の進行は失われません。', timeLeft: '残り時間',
    preview: '次に落ちる2匹', previewThree: '次に落ちる3匹', previewFour: '次に落ちる4匹', now: 'NOW', next: 'NEXT', soon: 'SOON', later: 'LATER',
    nowAlt: '今：{name}', nextAlt: '次：{name}', soonAlt: 'その次：{name}', laterAlt: 'その後：{name}', traitScratch: 'ひっかき', traitHungry: 'くいしんぼ', board: '猫の箱',
    columnAction: '{col}列目、{name}を落とす', ceilingDanger: '⚠ 注意！天井が近いよ',
    ceilingSafe: 'この線を超えないでね', boxTagline: '♡ 幸せいっぱいの箱', actions: 'ゲーム操作',
    howTo: '？ 遊び方', hintUsed: 'この回ではヒント使用済み', hintAd: '▶ 広告ヒント', replay: '↻ もう一度',
    rulesAria: '猫落としの遊び方', rulesTitle: 'タップ、ポトン、ニャー！',
    rule1Title: '列を選ぶ', rule1Desc: 'NOWの猫がその列の一番下の空きに落ちます。NEXTが次の猫です。',
    rule2Title: '同じ猫3匹で消える', rule2Desc: 'タテ・ヨコ・2種のナナメで、3匹以上つながると消えます。',
    rule3Title: '落ちて連鎖', rule3Desc: '上の猫が落ちて、またつながるとコンボ発生！',
    rule4Title: '箱の天井に注意', rule4Desc: '消去と落下の後、最上段に猫が残ると失敗です。',
    rulesFooter: 'このレベル：{time}秒以内に{target}匹救出。最初の落下で計測開始、31以降は機関アニメ中に一時停止します。停止と広告でも止まります。{three}手以内で星3、{two}手以内で星2。',
    rulesExtra: '1回につき広告ヒント1回。失敗後の復活や途中盤面への再開はありません。行き止まりと判定された落下は確定前に戻り、ライフを1つ消費します。3つ使い切ったら最初からやり直します。',
    rulesCta: 'わかった、遊ぼう！', completedAria: 'クリア！', completedTitle: 'レベル {id} クリア！',
    starsAria: '{stars}スター', summary: '{cleared}匹救出 · {score}点',
    summaryLine2: '最高コンボ ×{best} · {moves}回落下', reward: '🐾 {amount} 肉球コインを保存',
    nextLevel: '次へ：{id}', playAgain: 'もう一度、高得点に挑戦', backToLevels: 'レベルへ戻る',
    partyDone: '箱長のパーティーは大成功 ♡', nextHappiness: '次の幸せの箱が待ってるよ ♡',
    failedCeilingAria: '箱がいっぱい', failedGenericAria: 'チャレンジ終了',
    failedCeilingTitle: 'あわわ、箱がいっぱい！',
    failedTimeTitle: '時間切れ、ひと休みしようニャ！', failedLivesTitle: '3つのライフを使い切った', failedProgress: '{cleared} / {target} 匹救出。',
    ceilingTip: '積み方を散らして、余白を作ってみて。', livesTip: 'ライフは、落下が行き止まりになると証明された時だけ減ります。3つ使い切ったらレベルを最初からやり直します。', otherTip: '3匹ラインを探して、猫を連れて帰ろう。',
    retry: 'もう一度ニャ', backCottage: 'お家へ帰る', hintTitle: '猫にのぞいてもらう',
    hintDesc: '視聴後、安全めの列に印をつけます。1回につき1回まで。',
    comboSuccess: 'ニャ！マッチ成功', combo: 'COMBO ×{count}', matchCombo: 'ニャーニャー ×{count}',
    objectivesLabel: 'ステージ目標', objectiveRescue: '{done}/{target}匹救出', objectiveScratch: '爪とぎ {done}/{target}', objectiveFish: 'おやつ {done}/{target}',
    patrolCounter: '{count}回でいたずら猫が移動', patrolNext: '次の封鎖列：{column}列目', holdLabel: 'じゃらしストック', holdEmpty: 'ストック空き', holdStored: '{name}をストック', holdAction: 'ストック',
    noRouteTitle: '安全な落とし場所がない', noRouteTip: 'いたずら猫が使える入口をすべて閉じました。',
    tutorialTitle: 'まず猫と試してみよう', tutorialIntro: '{name}の新しい仕掛けを、得点なしのサンドボックスで試せるよ！', tutorialDemo: 'かわいいデモを見る', tutorialCta: '本番ステージを始める',
    tutorialScratchEffect: 'ガリガリ！', traitScratchEffect: 'ひっかく！', tutorialFishEffect: 'ニャ♡', tutorialHoldEffect: '猫を交換！', tutorialTunnelEffect: '通り抜け！', tutorialHungryEffect: 'おいしい！', tutorialPatrolEffect: 'てくてく～'
  },
  pause: {
    dialogAria: '一時停止メニュー', pausedAlt: 'ゲーム一時停止中', title: '一時停止', close: '一時停止メニューを閉じる',
    continue: 'ゲームを続ける', restart: 'このレベルをやり直す', home: 'ホームへ戻る', settings: '設定'
  },
  result: {
    dialogAria: 'クリア！', title: 'クリア！', starsAria: '{stars}スター',
    perfect: 'パーフェクト！', good: 'すばらしい！星3に挑戦しよう！',
    rewards: 'クリア報酬', rewardLabel: '報酬', claim: '報酬を受け取る', claimed: '受取済み',
    claimedLabel: '報酬受取済み', double: '報酬2倍', doubleClaimedLabel: '2倍報酬受取済み',
    levelNav: 'レベル', next: '次へ', replay: 'もう一度', nav: 'クリア後の操作'
  },
  daily: {
    giftAlt: 'デイリー報酬ギフト', title: 'デイリー報酬', desc: '今日も猫と一緒に、小さな幸せを受け取ろう！',
    today: '今日：{reward}', claim: '受け取る', watchAd: '▶ 広告を見る ×2',
    loading: '報酬を読み込み中…', tomorrow: '明日また来てね、連続報酬が豪華になるよ！', gotIt: 'わかった',
    day: 'Day {n}', hintReward: 'ヒント ×{amount}', coinReward: '🐾 {amount}'
  },
  rewarded: {
    testMode: 'リワード広告テストモード', watchAndClaim: '見て受け取る', loadingClaim: '報酬を読み込み中…',
    later: 'また今度', incomplete: '最後まで見ていないので、報酬は使いません。もう一度お試しください。',
    unavailable: '広告を再生できません。報酬は使っていません。',
    watchAlt: '広告を見て報酬をゲット'
  },
  tray: { label: '猫えらび', placed: '配置済み' },
  match3: { board: 'マッチ3ボード', empty: '空き', cell: '{col}列{row}行、{name}' }
}
