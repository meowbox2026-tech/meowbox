export interface Strings {
  app: {
    openingGame: string
    organizingGame: string
    title: string
  }
  topbar: {
    back: string
    settings: string
    pause: string
    levelAria: string
    starsAria: string
    moves: string
  }
  home: {
    brandSub: string
    brandAria: string
    start: string
    levels: string
    mainNav: string
  }
  levels: {
    title: string
    board: string
    levelAria: string
    lockedSuffix: string
    locked: string
  }
  settings: {
    title: string
    musicLabel: string
    soundLabel: string
    hapticsLabel: string
    language: string
    about: string
    aboutToast: string
    backHome: string
    privacy: string
    terms: string
    support: string
  }
  legal: { backToSettings: string; emailCta: string }
  ads: {
    dialogAria: string
    title: string
    description: string
    remaining: string
    ready: string
  }
  game: {
    rescue: string
    statusLabel: string
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
    lineTagline: string
    actions: string
    howTo: string
    hintUsed: string
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
    rulesCta: string
    completedAria: string
    completedTitle: string
    starsAria: string
    summary: string
    summaryLine2: string
    nextLevel: string
    playAgain: string
    backToLevels: string
    partyDone: string
    nextHappiness: string
    failedCeilingAria: string
    failedGenericAria: string
    failedCeilingTitle: string
    failedTimeTitle: string
    failedProgress: string
    ceilingTip: string
    otherTip: string
    retry: string
    backCottage: string
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
