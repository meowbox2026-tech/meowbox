import type { Locale } from '../../i18n/locale'

const zh = {
  retries: (count: number) => `中途重試剩 ${count} 次`,
  resume: '從中斷處修改（用 1 次）', restart: '整關重來', ad: '看廣告，多重試 1 次',
  adDescription: '完成觀看後，可保留目前盤面，再修改一次自己放下、尚未消除的貓咪。',
  exhausted: '2 次免費重試已用完。可以整關重來，或看廣告再修改一次。',
  noCats: '自己放的貓已全部消除，沒有可移動的貓咪，請整關重來。',
  editing: '點自己放的貓拿回，再點空格放下',
  hint: '保留已消除成果，只能調整自己放下、尚未消除的貓咪。',
  tray: '剩下可調整的貓咪',
  rule: '連鎖中斷後，每關有 2 次中途修改機會，只能移動自己放下且尚未消除的貓。用完仍失敗，可整關重來或看廣告多重試 1 次。沒有可移動的貓時只能重來。首次成功 3 星，失敗 1 次後成功 2 星，其餘 1 星。'
}
const en: typeof zh = {
  retries: count => `${count} retries left`,
  resume: 'Edit from here (use 1)', restart: 'Restart level', ad: 'Watch ad for 1 retry',
  adDescription: 'Finish watching to keep this board and edit your surviving placed cats once more.',
  exhausted: 'Both free retries are used. Restart the level or watch an ad for one more retry.',
  noCats: 'All your placed cats have cleared. No cats remain editable. Restart the level.',
  editing: 'Take back your placed cat, then tap an empty cell',
  hint: 'Keep cleared progress. Only your surviving placed cats can move.',
  tray: 'Your remaining cats',
  rule: 'Each level has 2 retries from the stopped board. Move only your surviving placed cats. After both retries, restart or watch an ad for 1 more retry. Restart if none of your cats remain. First try: 3 stars; after 1 failure: 2; otherwise: 1.'
}
const ja: typeof zh = {
  retries: count => `途中からの再挑戦：残り${count}回`,
  resume: 'ここから修正（1回使用）', restart: '最初からやり直す', ad: '広告を見てもう1回',
  adDescription: '最後まで見ると、今の盤面を保ったまま、自分が置いた残りの猫をもう一度修正できます。',
  exhausted: '無料の再挑戦2回を使いました。最初からやり直すか、広告を見てもう1回修正できます。',
  noCats: '自分が置いた猫はすべて消えたため、動かせる猫がいません。最初からやり直してください。',
  editing: '自分が置いた猫を戻して、空きマスに置こう',
  hint: '消した成果を保ち、自分が置いた残りの猫だけ動かせます。',
  tray: '修正できる残りの猫',
  rule: '途中からの修正は各ステージ2回。自分が置いた、まだ消えていない猫だけ動かせます。使い切ったら最初からやり直すか、広告でもう1回。動かせる猫がいなければ最初から。失敗0回で星3つ、1回で星2つ、それ以外は星1つ。'
}
export const planningRetryCopy: Record<Locale, typeof zh> = { 'zh-TW': zh, en, ja }
