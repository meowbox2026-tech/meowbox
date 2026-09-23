export interface Strings {
  app: {
    openingBox: string
    organizingBox: string
    hintClaimed: string
    coinClaimed: string
    title: string
  }
  topbar: {
    back: string
    settings: string
    pause: string
    level: string
    levelAria: string
    starsAria: string
    moves: string
  }
  home: {
    brandSub: string
    brandAria: string
    progress: string
    progressAria: string
    collected: string
    start: string
    levels: string
    mainNav: string
  }
  levels: {
    title: string
    subtitle: string
    board: string
    levelAria: string
    lockedSuffix: string
    locked: string
  }
  settings: {
    title: string
    subtitle: string
    musicLabel: string
    soundLabel: string
    hapticsLabel: string
    language: string
    restore: string
    restoreToast: string
    about: string
    aboutToast: string
    backHome: string
    privacy: string
    terms: string
    support: string
  }
  legal: { backToSettings: string; emailCta: string }
  shop: {
    title: string
    subtitle: string
    coinsTab: string
    catsTab: string
    boxesTab: string
    coinsHeading: string
    coinsDesc: string
    claim: string
    testClaimed: string
    disclaimer: string
    catsHeading: string
    catsDesc: string
    use: string
    using: string
    boxesHeading: string
    boxesDesc: string
    newCat: string
    notEnough: string
    newBox: string
    removeAdsTitle: string
    removeAdsDesc: string
    removeAdsToast: string
  }
  collection: {
    title: string
    subtitle: string
    gridLabel: string
    companionUnlocked: string
    unlockPrice: string
    useCat: string
    goShop: string
    using: string
    unlocked: string
    catsTab: string
    boxesTab: string
    specialTab: string
    mysteryName: string
    mysteryHint: string
    note: string
  }
  game: {
    rescue: string
    statusLabel: string
    livesLabel: string
    deadDropNotice: string
    timeLeft: string
    preview: string
    previewThree: string
    previewFour: string
    now: string
    next: string
    soon: string
    later: string
    nowAlt: string
    nextAlt: string
    soonAlt: string
    laterAlt: string
    traitScratch: string
    traitHungry: string
    board: string
    columnAction: string
    ceilingDanger: string
    ceilingSafe: string
    boxTagline: string
    actions: string
    howTo: string
    hintUsed: string
    hintAd: string
    replay: string
    rulesAria: string
    rulesTitle: string
    rule1Title: string
    rule1Desc: string
    rule2Title: string
    rule2Desc: string
    rule3Title: string
    rule3Desc: string
    rule4Title: string
    rule4Desc: string
    rulesFooter: string
    rulesExtra: string
    rulesCta: string
    completedAria: string
    completedTitle: string
    starsAria: string
    summary: string
    summaryLine2: string
    reward: string
    nextLevel: string
    playAgain: string
    backToLevels: string
    partyDone: string
    nextHappiness: string
    failedCeilingAria: string
    failedGenericAria: string
    failedCeilingTitle: string
    failedTimeTitle: string
    failedLivesTitle: string
    failedProgress: string
    ceilingTip: string
    livesTip: string
    otherTip: string
    retry: string
    backCottage: string
    hintTitle: string
    hintDesc: string
    comboSuccess: string
    combo: string
    matchCombo: string
    objectivesLabel: string
    objectiveRescue: string
    objectiveScratch: string
    objectiveFish: string
    patrolCounter: string
    patrolNext: string
    holdLabel: string
    holdEmpty: string
    holdStored: string
    holdAction: string
    noRouteTitle: string
    noRouteTip: string
    tutorialTitle: string
    tutorialIntro: string
    tutorialDemo: string
    tutorialCta: string
    tutorialScratchEffect: string
    traitScratchEffect: string
    tutorialFishEffect: string
    tutorialHoldEffect: string
    tutorialTunnelEffect: string
    tutorialHungryEffect: string
    tutorialPatrolEffect: string
  }
  pause: {
    dialogAria: string
    pausedAlt: string
    title: string
    close: string
    continue: string
    restart: string
    home: string
    settings: string
  }
  result: {
    dialogAria: string
    title: string
    starsAria: string
    perfect: string
    good: string
    rewards: string
    rewardLabel: string
    claim: string
    claimed: string
    claimedLabel: string
    double: string
    doubleClaimedLabel: string
    levelNav: string
    next: string
    replay: string
    nav: string
  }
  daily: {
    giftAlt: string
    title: string
    desc: string
    today: string
    claim: string
    watchAd: string
    loading: string
    tomorrow: string
    gotIt: string
    day: string
    hintReward: string
    coinReward: string
  }
  rewarded: {
    testMode: string
    watchAndClaim: string
    loadingClaim: string
    later: string
    incomplete: string
    unavailable: string
    watchAlt: string
  }
  tray: { label: string; placed: string }
  match3: { board: string; empty: string; cell: string }
}

export type StringVars = Record<string, string | number>

export function format(template: string, vars: StringVars = {}): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{${key}}`).join(String(value))
  }
  return result
}
