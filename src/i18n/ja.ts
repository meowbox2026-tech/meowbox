import type { Strings } from './strings'

export const ja: Strings = {
  app: {
    openingBox: '箱を開けています…',
    organizingBox: '箱を整理しています…',
    title: 'MEOW BOX｜猫の箱詰めパズル'
  },
  topbar: {
    back: '戻る', settings: '設定', pause: '一時停止', level: 'レベル',
    levelAria: 'レベル {level}', starsAria: '{stars}スター', moves: '手数'
  },
  home: {
    brandSub: '猫の箱詰めパズル', brandAria: 'Meow Box 猫の箱詰めパズル',
    progress: '今の進み具合', progressAria: '今の進み具合、レベル {level}',
    collected: '{count}スター集めた', start: 'ゲームスタート', levels: 'レベル', mainNav: 'メインメニュー'
  },
  levels: {
    title: 'レベル選択', subtitle: '1〜25面、猫をゆっくり並べよう！',
    board: 'レベル一覧', levelAria: 'レベル {id}', lockedSuffix: '、まだロック中', locked: 'ロック中'
  },
  settings: {
    title: '設定', subtitle: '毎回のプレイをもっとちょうどよく！',
    musicLabel: '音楽', soundLabel: '効果音', hapticsLabel: '振動',
    language: '言語',
    about: 'このゲームについて', aboutToast: 'Meow Box 猫の箱詰めパズル、バージョン 1.0.0。',
    backHome: '⌂　ホームへ戻る', privacy: 'プライバシーポリシー', terms: '利用規約', support: 'サポート'
  },
  legal: { backToSettings: '‹　設定へ戻る', emailCta: 'サポートにメールする' },
  ads: {
    dialogAria: '広告再生中', title: '広告再生中', description: '広告が終わるまでお待ちください。', remaining: '残り {seconds} 秒', ready: '広告がまもなく終了します'
  },
  game: {
    rescue: '{done} / {target} 匹救出', statusLabel: 'ステージ状態', timeLeft: '時間メモ',
    preview: '次に落ちる2匹', previewThree: '次に落ちる3匹', previewFour: '次に落ちる4匹', now: 'NOW', next: 'NEXT', soon: 'SOON', later: 'LATER',
    nowAlt: '今：{name}', nextAlt: '次：{name}', soonAlt: 'その次：{name}', laterAlt: 'その後：{name}', traitScratch: 'ひっかき', traitHungry: 'くいしんぼ', board: '猫の箱',
    columnAction: '{col}列目、{name}を落とす', ceilingDanger: '⚠ 注意！天井が近いよ',
    ceilingSafe: 'この線を超えないでね', boxTagline: '♡ 幸せいっぱいの箱', actions: 'ゲーム操作',
    howTo: '？ 遊び方', hintUsed: 'この回ではヒント使用済み', replay: '↻ もう一度',
    rulesAria: '猫落としの遊び方', rulesTitle: 'タップ、ポトン、ニャー！',
    rule1Title: '列を選ぶ', rule1Desc: 'NOWの猫がその列の一番下の空きに落ちます。NEXTが次の猫です。',
    rule2Title: '同じ猫3匹で消える', rule2Desc: 'タテ・ヨコ・2種のナナメで、3匹以上つながると消えます。',
    rule3Title: '落ちて連鎖', rule3Desc: '上の猫が落ちて、またつながるとコンボ発生！',
    rule4Title: '箱の天井に注意', rule4Desc: '消去と落下の後、最上段に猫が残ると失敗です。',
    rulesCta: 'わかった、遊ぼう！', completedAria: 'クリア！', completedTitle: 'レベル {id} クリア！',
    starsAria: '{stars}スター', summary: '{cleared}匹救出 · {score}点',
    summaryLine2: '最高コンボ ×{best} · {moves}回落下',
    nextLevel: '次へ：{id}', playAgain: 'もう一度、高得点に挑戦', backToLevels: 'レベルへ戻る',
    partyDone: '箱長のパーティーは大成功 ♡', nextHappiness: '次の幸せの箱が待ってるよ ♡',
    failedCeilingAria: '箱がいっぱい', failedGenericAria: 'チャレンジ終了',
    failedCeilingTitle: 'あわわ、箱がいっぱい！',
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
    continue: 'ゲームを続ける', restart: 'このレベルをやり直す', home: 'ホームへ戻る', settings: '設定'
  },
  tray: { label: '猫えらび', placed: '配置済み' },
  match3: { board: 'マッチ3ボード', empty: '空き', cell: '{col}列{row}行、{name}' }
}
