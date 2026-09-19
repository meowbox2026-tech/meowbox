import type { Strings } from './strings'

export const en: Strings = {
  app: {
    openingBox: 'Opening the box…',
    organizingBox: 'Tidying the box…',
    hintClaimed: 'Claimed hints ×{amount}',
    coinClaimed: 'Claimed 🐾 {amount}',
    title: 'MEOW BOX｜Cat Drop Puzzle'
  },
  topbar: {
    back: 'Back', settings: 'Settings', pause: 'Pause', level: 'Level',
    levelAria: 'Level {level}', starsAria: '{stars} stars', moves: 'Moves'
  },
  home: {
    brandSub: 'Cat Drop Puzzle', brandAria: 'Meow Box Cat Drop Puzzle',
    progress: 'Progress', progressAria: 'Progress, level {level}',
    collected: 'Collected {count} stars', start: 'Start Game', levels: 'Levels', mainNav: 'Main menu'
  },
  levels: {
    title: 'Levels', subtitle: 'More cats, more happiness!', worldTabs: 'Worlds',
    world: 'World {n}', worldSubs: ['Cozy Cottage', 'Garden', 'Journey'],
    board: 'Level list', levelAria: 'Level {id}', lockedSuffix: ', locked', locked: 'Locked'
  },
  settings: {
    title: 'Settings', subtitle: 'Make every play session just right!',
    musicLabel: 'Music', musicDesc: 'Relaxed background music for puzzle time',
    soundLabel: 'Sound', soundDesc: 'A cute response to every action',
    hapticsLabel: 'Haptics', hapticsDesc: 'A tiny nudge when a cat lands',
    language: 'Language', restore: 'Restore Purchases',
    restoreToast: 'Native restore is reserved; connect your store product IDs.',
    about: 'About', aboutToast: 'Meow Box Cat Packing Puzzle, version 1.0.0.',
    backHome: '⌂　Back Home', privacy: 'Privacy Policy', terms: 'Terms of Service', support: 'Support'
  },
  legal: { backToSettings: '‹　Back to Settings', emailCta: 'Email Support' },
  shop: {
    title: 'Shop', subtitle: 'More cute cats, more happy days!',
    coinsTab: 'Coins', catsTab: 'Cats', boxesTab: 'Boxes',
    coinsHeading: 'Paw Coins', coinsDesc: 'Coins unlock more cute styles!',
    claim: 'Claim', testClaimed: 'Test shop: added {amount} Paw Coins',
    disclaimer: 'At launch, these buttons will use the App Store / Google Play secure payment flow.',
    catsHeading: 'Cat Styles', catsDesc: 'Collect every unique cat!',
    use: 'Use', using: 'In use', boxesHeading: 'Box Styles', boxesDesc: 'Make a cozier home for your cats!',
    newCat: 'A new cat joined your collection!', notEnough: 'Not enough Paw Coins—clear more levels!',
    newBox: 'New box style equipped!', removeAdsTitle: 'Remove Ads',
    removeAdsDesc: 'Enjoy a smoother, happier puzzle time!',
    removeAdsToast: 'The release build will use the native store with Restore Purchases.'
  },
  collection: {
    title: 'Cat Collection', subtitle: 'Collect more cats, gather more happiness!', gridLabel: 'Cat style collection',
    companionUnlocked: 'A warm, healing companion—your daily little joy ♡',
    unlockPrice: 'Needs {price} Paw Coins to unlock', useCat: 'Use this cat', goShop: 'Go to Shop',
    using: 'In use', unlocked: 'Unlocked', catsTab: '🐱 Cats', boxesTab: '📦 Boxes',
    specialTab: '★ Special', mysteryName: 'Mystery Cat', mysteryHint: 'Unlocks at Lv.50',
    note: '🐾 Keep playing to unlock more cute cats!'
  },
  game: {
    rescue: 'Rescued {done} / {target}', statusLabel: 'Mission and time', timeLeft: 'Time left',
    overtime: 'Overtime: {count} drops', preview: 'Next two cats', now: 'NOW', next: 'NEXT',
    nowAlt: 'Now: {name}', nextAlt: 'Next: {name}', board: 'Cat box',
    columnAction: 'Column {col}, drop {name}', ceilingDanger: '⚠ Careful! Almost at the top',
    ceilingSafe: 'Stay below this line', boxTagline: '♡ a box of happiness', actions: 'Game actions',
    howTo: '? How to Play', hintUsed: 'Hint used this round', hintAd: '▶ Ad Hint', replay: '↻ Retry',
    rulesAria: 'How to play Cat Drop', rulesTitle: 'Tap, drop, meow!',
    rule1Title: 'Pick a column', rule1Desc: 'The NOW cat falls to the lowest empty slot. NEXT is up after that.',
    rule2Title: 'Match 3 of a kind', rule2Desc: 'Horizontal, vertical, or either diagonal—3 or more in a row clears.',
    rule3Title: 'Drops chain again', rule3Desc: 'Cats above fall down, and new lines trigger a Combo!',
    rule4Title: 'Watch the top', rule4Desc: 'If any cat still fills the top row after clears and drops, you fail.',
    rulesFooter: 'This level: rescue {target} cats in {time}s. The clock starts on your first drop and keeps running through chain animations; pause and ads stop it. {three} drops for 3 stars, {two} for 2 stars.',
    rulesExtra: 'One ad hint and one revive per round. Ceiling revive clears the bottom row (no rescue count); time-up grants 3 bonus drops, but the top still fails you.',
    rulesCta: 'Got it, let’s play!', completedAria: 'Level complete!', completedTitle: 'Level {id} complete!',
    starsAria: '{stars} stars', summary: 'Rescued {cleared} · {score} pts',
    summaryLine2: 'Best Combo ×{best} · {moves} drops', reward: '🐾 {amount} Paw Coins saved',
    nextLevel: 'Next: {id}', playAgain: 'Play again for a high score', backToLevels: 'Back to Levels',
    partyDone: 'The captain’s party is complete ♡', nextHappiness: 'The next box of happiness awaits ♡',
    failedCeilingAria: 'Box is full', failedGenericAria: 'Challenge over',
    failedCeilingTitle: 'Oh no, the box is full!', failedMovesTitle: 'Out of bonus drops',
    failedTimeTitle: 'Time’s up—take a breather, meow!', failedProgress: 'Rescued {cleared} / {target} cats.',
    ceilingTip: 'Try spreading stacks to leave more room.', otherTip: 'Look for lines of three—your cats are waiting.',
    reviveCeiling: '▶ Watch ad, clear the bottom row', reviveMoves: '▶ Watch ad, get 3 more drops',
    retry: 'Try again, meow', backCottage: 'Back to Cottage', hintTitle: 'Let a cat take a peek',
    hintDesc: 'After watching, a safer column is marked. Once per round.', reviveTitle: 'One more try, meow',
    reviveCeilingDesc: 'Clears the bottom row and shifts cats down; no rescue count. One revive per round.',
    reviveMovesDesc: 'Get 3 bonus drops with no timer; the top still fails you. One revive per round.',
    comboSuccess: 'Meow! Matched', combo: 'COMBO ×{count}', matchCombo: 'Meow ×{count}'
  },
  pause: {
    dialogAria: 'Pause menu', pausedAlt: 'Game paused', title: 'Paused', close: 'Close pause menu',
    continue: 'Continue', restart: 'Restart Level', home: 'Back Home', settings: 'Settings'
  },
  result: {
    dialogAria: 'Level complete!', title: 'Level Complete!', starsAria: '{stars} stars',
    perfect: 'Purr-fect!', good: 'Nicely done—go for three stars!',
    rewards: 'Level rewards', rewardLabel: 'Reward', claim: 'Claim Reward', claimed: 'Claimed',
    claimedLabel: 'Reward claimed', double: 'Double Reward', doubleClaimedLabel: 'Double reward claimed',
    levelNav: 'Levels', next: 'Next', replay: 'Replay', nav: 'After-level actions'
  },
  daily: {
    giftAlt: 'Daily reward gift', title: 'Daily Reward', desc: 'A little joy with your cats, every day!',
    today: 'Today: {reward}', claim: 'Claim', watchAd: '▶ Watch Ad ×2',
    loading: 'Loading reward…', tomorrow: 'Come back tomorrow for a richer streak!', gotIt: 'Got it',
    day: 'Day {n}', hintReward: 'Hints ×{amount}', coinReward: '🐾 {amount}'
  },
  rewarded: {
    testMode: 'Rewarded-ad test mode', watchAndClaim: 'Watch & Claim', loadingClaim: 'Loading reward…',
    later: 'Maybe later', incomplete: 'Not fully watched—no reward used. Please try again.',
    unavailable: 'Ads are unavailable right now. No reward was used.',
    watchAlt: 'Watch an ad to earn a reward'
  },
  tray: { label: 'Cat picker', placed: 'Placed' },
  match3: { board: 'Match-3 board', empty: 'Empty', cell: 'Column {col}, row {row}, {name}' }
}
