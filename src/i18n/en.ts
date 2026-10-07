import type { Strings } from './strings'

export const en: Strings = {
  app: {
    openingGame: 'Getting the game ready…',
    organizingGame: 'Tidying the board…',
    title: 'MEOW LINE｜Cat Drop Match Puzzle'
  },
  topbar: {
    back: 'Back', settings: 'Settings', pause: 'Pause',
    levelAria: 'Level {level}', starsAria: '{stars} stars', moves: 'Moves'
  },
  home: {
    brandAria: 'Meow Line Cat Drop Match Puzzle',
    start: 'Start Game', levels: 'Levels', mainNav: 'Main menu'
  },
  levels: {
    title: 'Levels',
    board: 'Level list', worldsLabel: 'World selection', worldLabel: 'World {world}',
    worldAria: 'World {world}, levels {start} to {end}', worldRange: 'Levels {start}–{end}',
    worldLocked: 'Locked', worldHint: 'World {world} · Levels {start}–{end}',
    levelAria: 'Level {id}', lockedSuffix: ', locked', locked: 'Locked'
  },
  settings: {
    title: 'Settings',
    musicLabel: 'Music', soundLabel: 'Sound', hapticsLabel: 'Haptics',
    language: 'Language',
    backHome: 'Back Home', privacy: 'Privacy Policy', privacyOptions: 'Privacy options',
    privacyOptionsOpened: 'Privacy options opened', privacyOptionsUnavailable: 'Privacy options are currently unavailable',
    terms: 'Terms of Service', support: 'Support'
  },
  legal: { backToSettings: '‹　Back to Settings', emailCta: 'Email Support' },
  ads: {
    dialogAria: 'Advertisement playing', title: 'Advertisement playing', description: 'The browser test simulates up to 30 seconds; live full-screen ad duration and dismissal are controlled by AdMob.', remaining: '{seconds}s remaining', ready: 'The ad is ending'
  },
  game: {
    rescue: 'Rescued {done} / {target}', statusLabel: 'Level status', timeLeft: 'Time note',
    preview: 'Next two cats', previewThree: 'Next three cats', previewFour: 'Next four cats', now: 'NOW', next: 'NEXT', soon: 'SOON', later: 'LATER',
    nowAlt: 'Now: {name}', nextAlt: 'Next: {name}', soonAlt: 'Soon: {name}', laterAlt: 'Later: {name}', traitScratch: 'Scratch', traitHungry: 'Hungry', board: 'Cat drop board',
    columnAction: 'Column {col}, drop {name}', ceilingDanger: '⚠ Careful! Almost at the top',
    ceilingSafe: 'Stay below this line', lineTagline: '♡ Drop, match, meow', actions: 'Game actions',
    howTo: '? How to Play', hintUsed: 'Hint used this round', replay: '↻ Retry',
    rulesAria: 'How to play Meow Line', rulesTitle: 'Tap, drop, meow!',
    rule1Title: 'Pick a column', rule1Desc: 'The NOW cat falls to the lowest empty slot. NEXT is up after that.',
    rule2Title: 'Match 3 of a kind', rule2Desc: 'Horizontal, vertical, or either diagonal—3 or more in a row clears.',
    rule3Title: 'Drops chain again', rule3Desc: 'Cats above fall down, and new lines trigger a Combo!',
    rule4Title: 'Watch the top', rule4Desc: 'If any cat still fills the top row after clears and drops, you fail.',
    rulesCta: 'Got it, let’s play!', completedAria: 'Level complete!', completedTitle: 'Level {id} complete!',
    starsAria: '{stars} stars', summary: 'Rescued {cleared} · {score} pts',
    summaryLine2: 'Best Combo ×{best} · {moves} drops',
    nextLevel: 'Next: {id}', playAgain: 'Play again for a high score', backToLevels: 'Back to Levels',
    partyDone: 'The meow party is complete ♡', nextHappiness: 'The next chain is waiting ♡',
    failedCeilingAria: 'Board is full', failedGenericAria: 'Challenge over',
    failedCeilingTitle: 'Oh no, the board is full!',
    failedTimeTitle: 'Time’s up—take a breather, meow!', failedProgress: 'Rescued {cleared} / {target} cats.',
    ceilingTip: 'Try spreading stacks to leave more room.', otherTip: 'Look for lines of three—your cats are waiting.',
    retry: 'Try again, meow', backCottage: 'Back to Cottage',
    comboSuccess: 'Meow! Matched', combo: 'COMBO ×{count}', matchCombo: 'Meow ×{count}',
    objectivesLabel: 'Level objectives', objectiveRescue: 'Rescue {done}/{target}', objectiveScratch: 'Scratch posts {done}/{target}', objectiveFish: 'Fish treats {done}/{target}',
    patrolCounter: 'Patrol moves in {count}', patrolNext: 'Next blocked lane: {column}', holdLabel: 'Cat teaser hold', holdEmpty: 'Empty hold', holdStored: 'Stored {name}', holdAction: 'Hold',
    noRouteTitle: 'No safe route', noRouteTip: 'The naughty cat has closed every reachable entrance.',
    tutorialTitle: 'Try it with the cats first', tutorialIntro: 'The new mechanic in {name} is a no-score sandbox—feel free to explore!', tutorialDemo: 'Play the cute demo', tutorialCta: 'Start the real level',
    tutorialScratchEffect: 'Scratch!', traitScratchEffect: 'Scratchy!', tutorialFishEffect: 'Nom ♡', tutorialHoldEffect: 'Swap a cat!', tutorialTunnelEffect: 'Through we go!', tutorialHungryEffect: 'Yum!', tutorialPatrolEffect: 'Run-run!'
  },
  pause: {
    dialogAria: 'Pause menu', pausedAlt: 'Game paused', title: 'Paused', close: 'Close pause menu',
    continue: 'Continue', restart: 'Restart Level', home: 'Home', settings: 'Settings'
  },
  tray: { label: 'Cat picker', placed: 'Placed' },
  match3: { board: 'Match-3 board', empty: 'Empty', cell: 'Column {col}, row {row}, {name}' }
}
