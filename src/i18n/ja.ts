import type { Strings } from './strings'

export const ja: Strings = {
  app: {
    openingGame: 'ゲームを準備しています…',
    organizingGame: '盤面を整えています…',
    title: 'MEOW LINE｜猫を落としてつなぐパズル'
  },
  topbar: {
    back: '戻る', settings: '設定', pause: '一時停止',
    levelAria: 'レベル {level}', starsAria: '{stars}スター', moves: '手数'
  },
  home: {
    brandAria: 'Meow Line｜猫を落としてつなぐパズル',
    start: 'ゲームスタート', levels: 'レベル', mainNav: 'メインメニュー'
  },
  levels: {
    title: 'レベル選択',
    board: 'レベル一覧', levelAria: 'レベル {id}', lockedSuffix: '、まだロック中', locked: 'ロック中'
  },
  settings: {
    title: '設定',
    musicLabel: '音楽', soundLabel: '効果音', hapticsLabel: '振動',
    language: '言語',
    about: 'このゲームについて', aboutToast: 'Meow Line｜猫を落としてつなぐパズル、バージョン 1.0.0。',
    backHome: 'ホームへ戻る', privacy: 'プライバシーポリシー', terms: '利用規約', support: 'サポート'
  },
  legal: { backToSettings: '‹　設定へ戻る', emailCta: 'サポートにメールする' },
  ads: {
    dialogAria: '広告再生中', title: '広告再生中', description: 'ブラウザのテストでは最長30秒をシミュレーションします。正式な全画面広告の再生時間と閉じ方はAdMobが管理します。', remaining: '残り {seconds} 秒', ready: '広告がまもなく終了します'
  },
  game: {
    rescue: '{done} / {target} 匹救出', statusLabel: 'ステージ状態', timeLeft: '時間メモ',
    preview: '次に落ちる2匹', previewThree: '次に落ちる3匹', previewFour: '次に落ちる4匹', now: 'NOW', next: 'NEXT', soon: 'SOON', later: 'LATER',
    nowAlt: '今：{name}', nextAlt: '次：{name}', soonAlt: 'その次：{name}', laterAlt: 'その後：{name}', traitScratch: 'ひっかき', traitHungry: 'くいしんぼ', board: '猫落としパズル盤',
    columnAction: '{col}列目、{name}を落とす', ceilingDanger: '⚠ 注意！天井が近いよ',
    ceilingSafe: 'この線を超えないでね', lineTagline: '♡ 落として、つないで、ニャー', actions: 'ゲーム操作',
    howTo: '？ 遊び方', hintUsed: 'この回ではヒント使用済み', replay: '↻ もう一度',
    rulesAria: 'Meow Lineの遊び方', rulesTitle: 'タップ、ポトン、ニャー！',
    rule1Title: '列を選ぶ', rule1Desc: 'NOWの猫がその列の一番下の空きに落ちます。NEXTが次の猫です。',
    rule2Title: '同じ猫3匹で消える', rule2Desc: 'タテ・ヨコ・2種のナナメで、3匹以上つながると消えます。',
    rule3Title: '落ちて連鎖', rule3Desc: '上の猫が落ちて、またつながるとコンボ発生！',
    rule4Title: '盤面の上に注意', rule4Desc: '消去と落下の後、最上段に猫が残ると失敗です。',
    rulesCta: 'わかった、遊ぼう！', completedAria: 'クリア！', completedTitle: 'レベル {id} クリア！',
    starsAria: '{stars}スター', summary: '{cleared}匹救出 · {score}点',
    summaryLine2: '最高コンボ ×{best} · {moves}回落下',
    nextLevel: '次へ：{id}', playAgain: 'もう一度、高得点に挑戦', backToLevels: 'レベルへ戻る',
    partyDone: 'ニャーパーティー大成功 ♡', nextHappiness: '次の連鎖が待ってるよ ♡',
    failedCeilingAria: '盤面がいっぱい', failedGenericAria: 'チャレンジ終了',
    failedCeilingTitle: 'あわわ、盤面がいっぱい！',
    failedTimeTitle: '時間切れ、ひと休みしようニャ！', failedProgress: '{cleared} / {target} 匹救出。',
    ceilingTip: '積み方を散らして、余白を作ってみて。', otherTip: '3匹ラインを探して、猫を連れて帰ろう。',
    retry: 'もう一度ニャ', backCottage: 'お家へ帰る',
    comboSuccess: 'ニャ！マッチ成功', combo: 'COMBO ×{count}', matchCombo: 'ニャーニャー ×{count}',
    objectivesLabel: 'ステージ目標', objectiveRescue: '{done}/{target}匹救出', objectiveScratch: '爪とぎ {done}/{target}', objectiveFish: 'おやつ {done}/{target}',
    patrolCounter: '{count}回でいたずら猫が移動', patrolNext: '次の封鎖列：{column}列目', holdLabel: 'じゃらしストック', holdEmpty: 'ストック空き', holdStored: '{name}をストック', holdAction: 'ストック',
    noRouteTitle: '安全な落とし場所がない', noRouteTip: 'いたずら猫が使える入口をすべて閉じました。',
    tutorialTitle: 'まず猫と試してみよう', tutorialIntro: '{name}の新しい仕掛けを、得点なしのサンドボックスで試せるよ！', tutorialDemo: 'かわいいデモを見る', tutorialCta: '本番ステージを始める',
    tutorialScratchEffect: 'ガリガリ！', traitScratchEffect: 'ひっかく！', tutorialFishEffect: 'ニャ♡', tutorialHoldEffect: '猫を交換！', tutorialTunnelEffect: '通り抜け！', tutorialHungryEffect: 'おいしい！', tutorialPatrolEffect: 'てくてく～'
  },
  pause: {
    dialogAria: '一時停止メニュー', pausedAlt: 'ゲーム一時停止中', title: '一時停止', close: '一時停止メニューを閉じる',
    continue: 'ゲームを続ける', restart: 'このレベルをやり直す', home: 'ホーム', settings: '設定'
  },
  tray: { label: '猫えらび', placed: '配置済み' },
  match3: { board: 'マッチ3ボード', empty: '空き', cell: '{col}列{row}行、{name}' }
}
