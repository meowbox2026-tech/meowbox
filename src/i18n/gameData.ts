import type { CatSkin } from '../game/types'
import type { Locale } from './locale'
import { toLocale } from './locale'

export const DROP_CAT_NAMES: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    arrogant: '傲嬌', sunny: '陽陽', fishLover: '魚丸', orange: '橘子', white: '奶霜', blue: '小灰',
    alone: '小墨', sleeping: '睡覺', box: '紙箱', mischievous: '淘氣', boss: '老大', sticky: '黏黏'
  },
  en: {
    arrogant: 'Smug', sunny: 'Sunny', fishLover: 'Fishball', orange: 'Tangerine', white: 'Cream', blue: 'Gray',
    alone: 'Inky', sleeping: 'Sleepy', box: 'Boxy', mischievous: 'Naughty', boss: 'Boss', sticky: 'Sticky'
  },
  ja: {
    arrogant: 'ツン', sunny: 'ひなた', fishLover: 'さかなまる', orange: 'みかん', white: 'しろもち', blue: 'グレー',
    alone: 'くろすけ', sleeping: 'ねむねむ', box: 'はこ', mischievous: 'いたずら', boss: 'ボス', sticky: 'ねばねば'
  }
}

export function getDropCatName(type: string, locale: unknown): string {
  return DROP_CAT_NAMES[toLocale(locale)]?.[type] ?? type
}

export const CAT_SKIN_NAMES: Record<Locale, Record<CatSkin, string>> = {
  'zh-TW': {
    orange: '橘貓', black: '黑貓', gray: '灰白貓', white: '白貓',
    calico: '三花貓', siamese: '暹羅貓', ragdoll: '布偶貓'
  },
  en: {
    orange: 'Orange Tabby', black: 'Black Cat', gray: 'Gray-White Cat', white: 'White Cat',
    calico: 'Calico', siamese: 'Siamese', ragdoll: 'Ragdoll'
  },
  ja: {
    orange: '茶トラ', black: '黒猫', gray: 'グレー白猫', white: '白猫',
    calico: '三毛猫', siamese: 'シャム', ragdoll: 'ラグドール'
  }
}

export function getCatSkinName(skin: string, locale: unknown): string {
  const table = CAT_SKIN_NAMES[toLocale(locale)]
  return (table as Record<string, string>)[skin] ?? skin
}

export const BOX_NAMES: Record<Locale, Record<string, string>> = {
  'zh-TW': { classic: '經典紙箱', strawberry: '草莓紙箱', night: '星空紙箱', garden: '花園紙箱' },
  en: { classic: 'Classic Box', strawberry: 'Strawberry Box', night: 'Starry Box', garden: 'Garden Box' },
  ja: { classic: 'クラシックボックス', strawberry: 'いちごボックス', night: '星空ボックス', garden: 'ガーデンボックス' }
}

export function getBoxName(boxId: string, locale: unknown): string {
  return BOX_NAMES[toLocale(locale)]?.[boxId] ?? boxId
}

export const LEVEL_NAMES: Record<Locale, readonly string[]> = {
  'zh-TW': [
    '初次相遇', '疊疊午茶', '斜斜的祕密', '一起回家', '小小整理師', '窗邊陽光',
    '小墨報到', '四色軟糖', '愛心接力', '小屋派對', '魚丸來訪', '魚乾時間',
    '軟墊小山', '雙重驚喜', '下午茶會', '陽陽花園', '左右都可愛', '草地接力',
    '大家集合', '花園野餐', '黏黏的朋友', '愛心滿滿', '雨天紙箱', '小小建築師',
    '彩虹小隊', '旅行第一站', '星光接力', '紙箱大搬家', '最後一塊軟墊', '箱長的派對'
  ],
  en: [
    'First Meeting', 'Stacked Tea Time', 'Slanted Secret', 'Going Home Together', 'Tiny Organizer', 'Window Sunshine',
    'Inky Arrives', 'Four-Color Gummies', 'Heart Relay', 'Cottage Party', 'Fishball Visits', 'Dried Fish Time',
    'Cushion Hill', 'Double Surprise', 'Afternoon Tea', 'Sunny Garden', 'Cute Both Ways', 'Meadow Relay',
    'Everyone Gather', 'Garden Picnic', 'Sticky Friend', 'Full of Love', 'Rainy Box', 'Tiny Architect',
    'Rainbow Team', 'Journey Begins', 'Starlight Relay', 'Big Box Move', 'Last Cushion', "Captain's Party"
  ],
  ja: [
    '初めての出会い', '重なるティータイム', 'ななめの秘密', '一緒に帰ろう', 'ちいさな整理係', '窓辺の日差し',
    'くろすけ登場', '4色グミ', 'ハートリレー', 'おうちパーティー', 'さかなまる来訪', '煮干しタイム',
    'クッションの山', 'ダブルサプライズ', 'アフタヌーンティー', 'ひだまりガーデン', '左右どっちもかわいい', '草原リレー',
    'みんな集合', 'ガーデンピクニック', 'ねばねばフレンズ', '愛がいっぱい', '雨の日の箱', 'ちいさな建築家',
    '虹チーム', '旅行のはじまり', '星空リレー', '箱の大引っ越し', '最後のクッション', '箱長のパーティー'
  ]
}

export function getLevelName(levelId: number, locale: unknown): string {
  return LEVEL_NAMES[toLocale(locale)][levelId - 1] ?? `Lv. ${levelId}`
}

export const LEVEL_GUIDANCE: Record<Locale, readonly string[]> = {
  'zh-TW': [
    '先點第 3 欄，讓三隻橘子相遇！', '把同款貓咪疊在一起，試試直線消除。',
    '階梯上的貓咪可以組成兩種斜線。', '先消除眼前的線，看看重力會帶來什麼。',
    '看好 NEXT，提前替下一隻留一個位置。', '欄位高低不同時，先處理最高的地方。',
    '小墨加入了，記住黑色耳朵的樣子。', '四種貓咪一起來，分欄整理更輕鬆。',
    '讓一次落下帶來兩次喵喵聲。', '小屋派對開始，穩穩累積消除數。',
    '魚丸來訪，留意牠的藍色小魚。', '保持左右空間，魚丸會找到朋友。',
    '軟墊小山很高，先替下一隻留落點。', '連鎖會讓分數快速長大。',
    '下午茶前，先把最高欄位整理好。', '陽陽把花園的陽光帶進紙箱。',
    '左右兩邊都能成線，沒有唯一答案。', '寬一點的箱子可以放心分散貓咪。',
    '第五種貓咪報到，先確認顏色再落下。', '花園野餐需要慢慢看 NEXT。',
    '黏黏在箱子旁邊替你加油。', '愛心連鎖越多，分數越漂亮。',
    '箱子變高了，記得觀察頂端警戒線。', '先整理高欄，再把貓咪送回家。',
    '彩虹小隊要在不同欄位保持平衡。', '旅行開始，沿用你最順手的策略。',
    '星光會在連鎖時亮起來。', '搬家前先留出至少一排空間。',
    '最後一塊軟墊，速度與高度都要顧好。', '箱長的派對，帶 60 隻貓咪回家！'
  ],
  en: [
    'Tap column 3 first and gather three Tangerines!', 'Stack matching cats and try a straight clear.',
    'Cats on the steps can form both diagonals.', 'Clear the line ahead and see what gravity brings.',
    'Watch NEXT and save a spot for the next cat.', 'When columns differ, fix the tallest one first.',
    'Inky joined—remember those black ears.', 'Four cats at once is easier with tidy columns.',
    'Make one drop meow twice.', 'The cottage party begins—stack clears steadily.',
    'Fishball is visiting—watch for the blue fish.', 'Keep room on both sides so Fishball finds friends.',
    'Cushion Hill is tall—save a landing spot first.', 'Chains grow your score fast.',
    'Tidy the tallest column before tea time.', 'Sunny brings garden sunshine into the box.',
    'Both sides can connect—there is no single answer.', 'A wider box is safe for spreading cats out.',
    'A fifth cat arrives—check colors before dropping.', 'A garden picnic needs slow NEXT watching.',
    'Sticky cheers for you beside the box.', 'More heart chains, prettier scores.',
    'The box got taller—watch the top warning line.', 'Tidy tall columns first, then bring cats home.',
    'The rainbow team must balance every column.', 'The journey begins—use your favorite strategy.',
    'Starlight glows during chains.', 'Leave at least one row before the big move.',
    'For the last cushion, mind speed and height.', 'The captain’s party—bring 60 cats home!'
  ],
  ja: [
    'まずは3列目をタップ、みかん3匹を集めよう！', '同じ猫を重ねて、まっすぐ消しを狙おう。',
    '階段の猫で2種のナナメが作れるよ。', '目の前のラインを消して、重力の贈り物を見よう。',
    'NEXTを見て、次の子の場所を空けておこう。', '高さが違うときは、一番高い列から整えよう。',
    'くろすけ登場、黒い耳を覚えてね。', '4種の猫は列を分けて整理すると楽だよ。',
    '1回の落下で2回ニャーと鳴かせよう。', 'おうちパーティー開幕、着実に消去数を積もう。',
    'さかなまる来訪、青いお魚に注目。', '左右に余白を残すと、さかなまるに友達ができるよ。',
    'クッションの山は高い、次の落下点を確保しよう。', '連鎖でスコアがぐんぐん伸びるよ。',
    'ティータイム前に一番高い列を整えよう。', 'ひなたがガーデンの日差しを箱に運ぶよ。',
    '左右どちらでもつながる、正解はひとつじゃないよ。', '広めの箱は猫を散らして置いて安心だよ。',
    '5種目の猫が登場、色を確認してから落とそう。', 'ガーデンピクニックはNEXTをゆっくり見よう。',
    'ねばねばが箱の横で応援してるよ。', 'ハート連鎖が多いほど、スコアがきれいだよ。',
    '箱が高くなった、天井ラインを見ておこう。', '高い列から整えて、猫をお家に連れて帰ろう。',
    '虹チームは列ごとのバランスが大切だよ。', '旅行のはじまり、得意な作戦で行こう。',
    '星空は連鎖のときに輝くよ。', '引っ越し前に少なくとも1段空けておこう。',
    '最後のクッション、速さと高さの両方に注意。', '箱長のパーティー、60匹連れて帰ろう！'
  ]
}

export function getLevelGuidance(levelId: number, locale: unknown): string {
  return LEVEL_GUIDANCE[toLocale(locale)][levelId - 1] ?? ''
}

export const MATCH3_CAT_LABELS: Record<Locale, Record<string, string>> = {
  'zh-TW': { alone: '黑貓', blue: '藍貓', fishLover: '魚魚貓', orange: '橘貓', white: '白貓' },
  en: { alone: 'Black cat', blue: 'Blue cat', fishLover: 'Fish cat', orange: 'Orange cat', white: 'White cat' },
  ja: { alone: '黒猫', blue: '青猫', fishLover: 'さかな猫', orange: '茶トラ', white: '白猫' }
}

export function getMatch3CatLabel(type: string, locale: unknown): string {
  return MATCH3_CAT_LABELS[toLocale(locale)]?.[type] ?? type
}
