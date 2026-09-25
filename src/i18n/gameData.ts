import type { CatSkin } from '../game/types'
import type { Locale } from './locale'
import { toLocale } from './locale'
import { EXTENDED_LEVEL_GUIDANCE, EXTENDED_LEVEL_NAMES } from './planningLevelCopy'

export const DROP_CAT_NAMES: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    arrogant: '傲嬌', sunny: '陽陽', fishLover: '魚丸', orange: '橘子', white: '奶霜', blue: '小灰',
    alone: '小墨', sleeping: '睡覺', box: '躲貓', mischievous: '淘氣', boss: '老大', sticky: '黏黏'
  },
  en: {
    arrogant: 'Smug', sunny: 'Sunny', fishLover: 'Fishball', orange: 'Tangerine', white: 'Cream', blue: 'Gray',
    alone: 'Inky', sleeping: 'Sleepy', box: 'Hidey', mischievous: 'Naughty', boss: 'Boss', sticky: 'Sticky'
  },
  ja: {
    arrogant: 'ツン', sunny: 'ひなた', fishLover: 'さかなまる', orange: 'みかん', white: 'しろもち', blue: 'グレー',
    alone: 'くろすけ', sleeping: 'ねむねむ', box: 'かくれんぼ', mischievous: 'いたずら', boss: 'ボス', sticky: 'ねばねば'
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
  'zh-TW': { classic: '經典棋盤', strawberry: '草莓棋盤', night: '星空棋盤', garden: '花園棋盤' },
  en: { classic: 'Classic Board', strawberry: 'Strawberry Board', night: 'Starry Board', garden: 'Garden Board' },
  ja: { classic: 'クラシック盤面', strawberry: 'いちご盤面', night: '星空盤面', garden: 'ガーデン盤面' }
}

export function getBoxName(boxId: string, locale: unknown): string {
  return BOX_NAMES[toLocale(locale)]?.[boxId] ?? boxId
}

const BASE_LEVEL_NAMES: Record<Locale, readonly string[]> = {
  'zh-TW': [
    '初次相遇', '疊疊午茶', '斜斜的祕密', '一起回家', '小小整理師', '窗邊陽光',
    '小墨報到', '四色軟糖', '愛心接力', '小屋派對', '魚丸來訪', '魚乾時間',
    '軟墊小山', '雙重驚喜', '下午茶會', '陽陽花園', '左右都可愛', '草地接力',
    '大家集合', '花園野餐', '黏黏的朋友', '愛心滿滿', '雨天連線', '小小建築師',
    '彩虹小隊', '長柱回聲', '落差雙井', '等待的交叉', '折線回路', '中央匯流'
  ],
  en: [
    'First Meeting', 'Stacked Tea Time', 'Slanted Secret', 'Going Home Together', 'Tiny Organizer', 'Window Sunshine',
    'Inky Arrives', 'Four-Color Gummies', 'Heart Relay', 'Cottage Party', 'Fishball Visits', 'Dried Fish Time',
    'Cushion Hill', 'Double Surprise', 'Afternoon Tea', 'Sunny Garden', 'Cute Both Ways', 'Meadow Relay',
    'Everyone Gather', 'Garden Picnic', 'Sticky Friend', 'Full of Love', 'Rainy Line', 'Tiny Architect',
    'Rainbow Team', 'Pillar Echo', 'Twin Wells', 'The Waiting Cross', 'Zigzag Loop', 'Central Convergence'
  ],
  ja: [
    '初めての出会い', '重なるティータイム', 'ななめの秘密', '一緒に帰ろう', 'ちいさな整理係', '窓辺の日差し',
    'くろすけ登場', '4色グミ', 'ハートリレー', 'おうちパーティー', 'さかなまる来訪', '煮干しタイム',
    'クッションの山', 'ダブルサプライズ', 'アフタヌーンティー', 'ひだまりガーデン', '左右どっちもかわいい', '草原リレー',
    'みんな集合', 'ガーデンピクニック', 'ねばねばフレンズ', '愛がいっぱい', '雨の日のライン', 'ちいさな建築家',
    '虹チーム', '長柱のこだま', '段差の双井', '待つ交差点', '折れ線ルート', '中央合流'
  ]
}

export const LEVEL_NAMES: Record<Locale, readonly string[]> = {
  'zh-TW': [...BASE_LEVEL_NAMES['zh-TW'], ...EXTENDED_LEVEL_NAMES['zh-TW']],
  en: [...BASE_LEVEL_NAMES.en, ...EXTENDED_LEVEL_NAMES.en],
  ja: [...BASE_LEVEL_NAMES.ja, ...EXTENDED_LEVEL_NAMES.ja]
}

export function getLevelName(levelId: number, locale: unknown): string {
  return LEVEL_NAMES[toLocale(locale)][levelId - 1] ?? `Lv. ${levelId}`
}

const BASE_LEVEL_GUIDANCE: Record<Locale, readonly string[]> = {
  'zh-TW': [
    '先點第 3 欄，讓三隻橘子相遇！', '把同款貓咪疊在一起，試試直線消除。',
    '階梯上的貓咪可以組成兩種斜線。', '先消除眼前的線，看看重力會帶來什麼。',
    '看好 NEXT，提前替下一隻留一個位置。', '欄位高低不同時，先處理最高的地方。',
    '小墨加入了，記住黑色耳朵的樣子。', '四種貓咪一起來，分欄整理更輕鬆。',
    '讓一次落下帶來兩次喵喵聲。', '小屋派對開始，穩穩累積消除數。',
    '魚丸來訪，留意牠的藍色小魚。', '保持左右空間，魚丸會找到朋友。',
    '軟墊小山很高，先替下一隻留落點。', '連鎖會讓分數快速長大。',
    '下午茶前，先把最高欄位整理好。', '陽陽帶來轉向：橫、直、斜線都要看。',
    '左右交錯，先找能打開下一段的位置。', '三段接力，預判落下後的新線。',
    '鏡像會誤導，花色和方向都要確認。', '18 隻托盤貓大集合，安排多段連鎖。',
    '第 21 關加入右側直線分支，先確認斜線與直線的交接。', '第 22 關左右兩側交錯，不能只看最上面的連線。',
    '第 23 關斜線分支會延後出現，先記住支撐位置。', '第 24 關三條路線合流，安排順序比追求單次消除重要。',
    '第 25 關是 21 隻托盤貓的收尾，保留空格給最後一段連鎖。',
    '長柱落下後會形成新線，先看支撐再放置。', '左右兩井的高度不同，注意落下距離。',
    '落下連鎖完成前，先不要追下一組線。', '橫、斜、直線折返，保留下一個轉折點。',
    '左右兩條路線最後會在中央匯流，安排好順序。'
  ],
  en: [
    'Tap column 3 first and gather three Tangerines!', 'Stack matching cats and try a straight clear.',
    'Cats on the steps can form both diagonals.', 'Clear the line ahead and see what gravity brings.',
    'Watch NEXT and save a spot for the next cat.', 'When columns differ, fix the tallest one first.',
    'Inky joined—remember those black ears.', 'Four cats at once is easier with tidy columns.',
    'Make one drop meow twice.', 'The cottage party begins—stack clears steadily.',
    'Fishball is visiting—watch for the blue fish.', 'Keep room on both sides so Fishball finds friends.',
    'Cushion Hill is tall—save a landing spot first.', 'Chains grow your score fast.',
    'Tidy the tallest column before tea time.', 'Sunny brings a turn: watch horizontal, vertical, and diagonal lines.',
    'The sides cross; find the move that opens the next section.', 'Three-stage relay: predict the line after each drop.',
    'The mirror can mislead; check both color and direction.', 'An 18-cat tray asks for several planned chains.',
    'Level 21 adds a right-side branch; check where the diagonal meets the straight line.', 'Level 22 crosses both sides, so do not watch only the top match.',
    'Level 23 delays a diagonal branch; remember the support before placing.', 'Level 24 merges three routes, so order matters more than one big clear.',
    'Level 25 closes the chapter with 21 tray cats; save room for the final chain.',
    'Watch the support before placing—the pillar makes a new line after it falls.', 'The two wells have different heights; watch how far each side drops.',
    'Let the falling cascade finish before chasing the next line.', 'Follow the horizontal, diagonal, and vertical turns; save the next corner.',
    'Two routes meet in the centre, so plan their order.'
  ],
  ja: [
    'まずは3列目をタップ、みかん3匹を集めよう！', '同じ猫を重ねて、まっすぐ消しを狙おう。',
    '階段の猫で2種のナナメが作れるよ。', '目の前のラインを消して、重力の贈り物を見よう。',
    'NEXTを見て、次の子の場所を空けておこう。', '高さが違うときは、一番高い列から整えよう。',
    'くろすけ登場、黒い耳を覚えてね。', '4種の猫は列を分けて整理すると楽だよ。',
    '1回の落下で2回ニャーと鳴かせよう。', 'おうちパーティー開幕、着実に消去数を積もう。',
    'さかなまる来訪、青いお魚に注目。', '左右に余白を残すと、さかなまるに友達ができるよ。',
    'クッションの山は高い、次の落下点を確保しよう。', '連鎖でスコアがぐんぐん伸びるよ。',
    'ティータイム前に一番高い列を整えよう。', 'ひなたが方向転換を教えるよ。タテ・ヨコ・ナナメを見よう。',
    '左右が交差するよ。次の組を開く場所を探そう。', '3段リレー、落下後の新しいラインを予測してね。',
    '鏡写しに惑わされないで、色と方向を確認しよう。', '18匹のトレイ集合、何段もの連鎖を組み立てよう。',
    '21面は右側に直線の分岐が登場、ナナメとの合流を確認しよう。', '22面は左右が交差するよ、上のラインだけを見ないでね。',
    '23面はナナメの分岐が遅れて現れる、支えの位置を覚えておこう。', '24面は3本の道が合流するよ、一度の大消しより順番が大切。',
    '25面はトレイ21匹の締めくくり、最後の連鎖のために空きを残そう。',
    '長い柱が落ちて新しいラインになるよ、支えを見てから置こう。', '左右の井戸で高さが違うよ、落下距離に注目。',
    '落下連鎖が終わるまで、次のラインを追わずに待とう。', 'ヨコ・ナナメ・タテの折り返し、次の角を残しておこう。',
    '左右のルートが中央で合流するよ、順番を考えてね。'
  ]
}

export const LEVEL_GUIDANCE: Record<Locale, readonly string[]> = {
  'zh-TW': [...BASE_LEVEL_GUIDANCE['zh-TW'], ...EXTENDED_LEVEL_GUIDANCE['zh-TW']],
  en: [...BASE_LEVEL_GUIDANCE.en, ...EXTENDED_LEVEL_GUIDANCE.en],
  ja: [...BASE_LEVEL_GUIDANCE.ja, ...EXTENDED_LEVEL_GUIDANCE.ja]
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
