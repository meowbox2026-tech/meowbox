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
    '彩虹小隊', '旅行第一站', '星光接力', '紙箱大搬家', '最後一塊軟墊', '箱長的派對',
    '花園初見', '露珠排隊', '風鈴小徑', '葉影藏貓', '午後花圃', '蜜蜂來信',
    '草葉迷宮', '小徑轉彎', '藤蔓接力', '花園派對', '雨後彩虹', '水窪倒影',
    '蘑菇小屋', '露營時間', '風箏追逐', '星夜花園', '月光階梯', '螢火蟲晚會',
    '夜色紙箱', '花影滿箱', '春日大整理', '四季輪轉', '落葉迷陣', '果實豐收',
    '小徑大集合', '花園守護者', '彩燈連鎖', '祕密溫室', '最後的花瓣', '花園箱長',
    '旅行起點', '車窗小憩', '行李箱邊', '海風來信', '港口排隊', '山路轉彎', '小島探險', '燈塔晚餐', '森林車站', '月台集合',
    '雙隧道入口', '旅行手帳', '雨衣與魚乾', '星空車廂', '遠方的箱子', '搗蛋貓報到', '四格預告', '行李大整理', '隧道追逐', '風景換頁',
    '旅行小站', '跨海大橋', '貓咪護照', '雲端休息站', '森林出口', '巡邏路線', '夜車連鎖', '最後一段路', '終點前的魚乾', '旅行箱長'
  ],
  en: [
    'First Meeting', 'Stacked Tea Time', 'Slanted Secret', 'Going Home Together', 'Tiny Organizer', 'Window Sunshine',
    'Inky Arrives', 'Four-Color Gummies', 'Heart Relay', 'Cottage Party', 'Fishball Visits', 'Dried Fish Time',
    'Cushion Hill', 'Double Surprise', 'Afternoon Tea', 'Sunny Garden', 'Cute Both Ways', 'Meadow Relay',
    'Everyone Gather', 'Garden Picnic', 'Sticky Friend', 'Full of Love', 'Rainy Box', 'Tiny Architect',
    'Rainbow Team', 'Journey Begins', 'Starlight Relay', 'Big Box Move', 'Last Cushion', "Captain's Party",
    'Garden Arrival', 'Dewdrop Queue', 'Wind Chime Path', 'Cats in the Leaves', 'Afternoon Flowerbed', 'Bee Mail',
    'Grass Maze', 'Turning Path', 'Vine Relay', 'Garden Party', 'Rainbow After Rain', 'Puddle Reflections',
    'Mushroom Cottage', 'Campout Time', 'Kite Chase', 'Starlit Garden', 'Moonlit Steps', 'Firefly Night',
    'Night Box', 'Flower Shadows', 'Spring Cleaning', 'Four Seasons', 'Fallen Leaf Maze', 'Fruit Harvest',
    'Pathway Gathering', 'Garden Guardian', 'Lantern Chain', 'Secret Greenhouse', 'Last Petal', 'Garden Captain',
    'Journey Start', 'Window Nap', 'Beside the Luggage', 'Letter from the Sea', 'Harbor Queue', 'Mountain Turn', 'Island Adventure', 'Lighthouse Dinner', 'Forest Station', 'Platform Gathering',
    'Twin Tunnel Gate', 'Travel Journal', 'Raincoat and Fish', 'Starlit Carriage', 'The Far Box', 'Naughty Cat Arrives', 'Four-Slot Preview', 'Luggage Tidy-Up', 'Tunnel Chase', 'Turning Scenery',
    'Little Travel Stop', 'Across the Bridge', 'Cat Passport', 'Cloud Rest Stop', 'Forest Exit', 'Patrol Route', 'Night Train Chain', 'The Last Stretch', 'Fish at the Finish', 'Travel Captain'
  ],
  ja: [
    '初めての出会い', '重なるティータイム', 'ななめの秘密', '一緒に帰ろう', 'ちいさな整理係', '窓辺の日差し',
    'くろすけ登場', '4色グミ', 'ハートリレー', 'おうちパーティー', 'さかなまる来訪', '煮干しタイム',
    'クッションの山', 'ダブルサプライズ', 'アフタヌーンティー', 'ひだまりガーデン', '左右どっちもかわいい', '草原リレー',
    'みんな集合', 'ガーデンピクニック', 'ねばねばフレンズ', '愛がいっぱい', '雨の日の箱', 'ちいさな建築家',
    '虹チーム', '旅行のはじまり', '星空リレー', '箱の大引っ越し', '最後のクッション', '箱長のパーティー',
    'ガーデン到着', '露の行列', '風鈴の小道', '葉かげの猫', '午後の花壇', 'ハチのお便り',
    '草むら迷路', '曲がり道', 'つる草リレー', 'ガーデンパーティー', '雨上がりの虹', '水たまりの影',
    'きのこのお家', 'キャンプタイム', 'たこ追い', '星空ガーデン', '月明かりの階段', 'ホタルの夜',
    '夜色ボックス', '花影いっぱい', '春の大整理', '四季めぐり', '落ち葉迷路', '実りの収穫',
    '小道に集合', 'ガーデンガーディアン', '灯りの連鎖', '秘密の温室', '最後の花びら', 'ガーデン箱長',
    '旅のはじまり', '窓辺のひと休み', '荷物のとなり', '海風の手紙', '港の行列', '山道のカーブ', '島の冒険', '灯台ディナー', '森の駅', 'ホームに集合',
    'ツイン・トンネル', '旅の手帳', 'レインコートとおやつ', '星空の車両', '遠くの箱', 'いたずら猫登場', '4枠プレビュー', '荷物の大整理', 'トンネル追走', '変わる景色',
    '旅の小さな駅', '海の橋', '猫パスポート', '雲の休憩所', '森の出口', '巡回ルート', '夜汽車の連鎖', '最後の道のり', '終点のおやつ', '旅の箱長'
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
    '最後一塊軟墊，速度與高度都要顧好。', '箱長的派對，帶 60 隻貓咪回家！',
    '花園世界開始：三隻貓連線旁的貓抓板要用爪爪慢慢拆掉。', '露珠排隊，先替下一隻留一條安全路。',
    '風鈴會讓節奏變快，記得看第三隻貓。', '葉影裡的貓咪顏色很接近，慢慢確認。',
    '午後花圃要兼顧高欄與連鎖，不要只看眼前。', '蜜蜂來信：消除魚乾所在格的貓咪，就能把魚乾收進目標。',
    '草葉迷宮裡，三隻提示能幫你預留轉彎位置。', '小徑轉彎，先放低最高的那一欄。',
    '藤蔓接力需要連續安排，別把好位置塞滿。', '花園派對，三步預判比盲目連消更穩。',
    '逗貓棒登場：空位會前移，有貓時只交換現在與暫存。', '水窪倒影會讓欄高變化，保持左右平衡。',
    '蘑菇小屋的空間更緊，優先清除最高的連線。', '露營時間有限，看到三連線就果斷落下。',
    '風箏追逐，第三隻提示是安排連鎖的關鍵。', '雙層抓板與愛抓抓貓登場：愛抓抓一次能削兩層。',
    '月光階梯要控制落點高度，避免連續堆同一欄。', '螢火蟲晚會，善用顏色提示找出下一組。',
    '夜色紙箱的貓咪更多，先整理兩側再處理中央。', '花影滿箱，連鎖與空間要一起顧好。',
    '隧道登場：入口只會把貓送到指定出口，出口被封就不能投放。', '四季輪轉會考驗記憶，三隻提示都要看完。',
    '落葉迷陣，保留低處空間才能接住好牌。', '果實豐收，目標提高但每次連鎖都很重要。',
    '小徑大集合，讓不同顏色分層落下比較穩。', '花園守護者，預留兩步空間再開始大連鎖。',
    '彩燈連鎖是後段挑戰，先穩住高度再加速。', '祕密溫室的顏色很多，依提示邊框確認貓咪。',
    '最後的花瓣，時間與高度都不能放鬆。', '花園箱長，帶回 94 隻貓咪完成世界 2！',
    '貪吃貓登場：消除牠時，還會收集上下左右一格的魚乾。', '車窗小憩，讓同款貓咪在低處相遇。', '行李箱旁保留一條空欄，方便連鎖。', '海風關卡要同時顧好高度與魚乾。', '港口排隊，先看清三步後再落下。', '山路轉彎，隧道出口也要留空。', '小島探險，別把所有貓咪堆在同一側。', '燈塔晚餐：抓板需要分波慢慢處理。', '森林車站考驗多種類的預判。', '月台集合，讓左右兩側維持呼吸。',
    '雙隧道入口：每次只會穿過一組隧道。', '旅行手帳，逗貓棒可以保留難處理的貓。', '雨衣與魚乾，貪吃貓的鄰格也能收集。', '星空車廂，先清最高欄再追連鎖。', '遠方的箱子，記得檢查剩餘目標。', '搗蛋貓報到：四格預覽加上每四次落下巡邏一次。', '四格預告：現在與後三隻都要一起規劃。', '行李大整理，保留兩個轉圜落點。', '隧道追逐，出口被封時入口也不能用。', '風景換頁，讓不同貓種分散落下。',
    '旅行小站，先穩住盤面再處理魚乾。', '跨海大橋，兩側高度差會影響連鎖。', '貓咪護照：特性跟著貓，不改配對種類。', '雲端休息站，逗貓棒只在成功落下後解鎖。', '森林出口，留意四格預覽中的能力標記。', '巡邏路線，倒數 1 次時先準備替代欄。', '夜車連鎖，固定機關位置也能用不同順序破解。', '最後一段路，目標與魚乾要同時完成。', '終點前的魚乾，貪吃貓可補到鄰近一格。', '旅行箱長：完成救援、抓板與魚乾三項目標！'
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
    'For the last cushion, mind speed and height.', 'The captain’s party—bring 60 cats home!',
    'World 2 begins: scratch posts beside a match need a few cute paw hits.', 'Dewdrop Queue: save a safe lane for the next cat.',
    'Wind Chimes speed up the rhythm—check the third preview.', 'The cats blend into the leaves, so confirm the color slowly.',
    'The afternoon flowerbed needs height control and chains.', 'Bee Mail: clear the cat on a fish treat to collect it.',
    'The grass maze rewards planning around the three previews.', 'On the turning path, lower the tallest column first.',
    'Vine Relay needs a sequence—do not fill every good spot.', 'At the garden party, predict three steps before dropping.',
    'The teaser arrives: an empty hold advances the preview; a filled hold swaps only NOW.', 'Puddle Reflections shift the heights, so balance both sides.',
    'The mushroom cottage is tight—clear the tallest line first.', 'Campout Time is short; drop decisively when a line appears.',
    'Kite Chase: the third preview is the key to a chain.', 'Double-layer posts and scratch cats arrive: a scratch cat removes two layers at once.',
    'Moonlit Steps need careful heights; avoid stacking one lane.', 'Firefly Night: use the color accents to find the next group.',
    'The Night Box has more cats—tidy both sides before center.', 'Flower Shadows demand chain and space control together.',
    'Tunnels arrive: an entry sends the cat to its named exit, which must stay open.', 'Four Seasons tests memory—read all three previews.',
    'Fallen Leaf Maze: preserve low space to catch good cats.', 'Fruit Harvest raises the target; every chain matters.',
    'Pathway Gathering is steadier when colors land in layers.', 'Garden Guardian: save two rows before a big chain.',
    'Lantern Chain is a late challenge—stabilize height, then speed up.', 'Secret Greenhouse has many colors; trust the preview borders.',
    'The Last Petal leaves no room for relaxing about time or height.', 'Garden Captain: bring 94 cats home to clear World 2!',
    'Hungry cats arrive: when one clears, they also collect an orthogonal fish treat.', 'Window Nap rewards low, tidy stacks.', 'Leave a breathing lane beside the luggage.', 'Sea Breeze asks you to watch height and fish together.', 'At the harbor, plan three drops before tapping.', 'On the mountain turn, keep tunnel exits open.', 'The island is easier when cats stay balanced on both sides.', 'Lighthouse Dinner introduces patient scratch-post waves.', 'Forest Station tests planning across many cat types.', 'Platform Gathering: keep both edges available.',
    'Twin Tunnel Gate: each drop travels through only one tunnel.', 'The travel journal is a good place to use the teaser hold.', 'Raincoat and Fish: hungry cats collect an orthogonal neighbor.', 'The starlit carriage rewards clearing the tallest lane first.', 'The Far Box: check every remaining objective.', 'Naughty Cat arrives with a four-drop patrol and a four-cat preview.', 'Four-Slot Preview shows NOW plus three future cats.', 'Tidy luggage while keeping two recovery lanes.', 'Tunnel Chase: a blocked exit also blocks its entry.', 'Turning Scenery rewards spreading different cat types.',
    'At the little stop, stabilize the board before chasing fish.', 'The bridge makes left-right height differences matter.', 'Cat Passport: traits follow cats and never change matching.', 'Cloud Rest Stop: hold unlocks again after a successful drop.', 'At the forest exit, read the ability labels in the preview.', 'Patrol Route: prepare an alternate lane when the counter reaches one.', 'Night Train Chain: fixed mechanics still allow varied solutions.', 'The last stretch asks for objectives and height control together.', 'The final fish is easiest with a hungry cat beside it.', 'Travel Captain: complete rescue, scratch-post, and fish objectives!'
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
    '最後のクッション、速さと高さの両方に注意。', '箱長のパーティー、60匹連れて帰ろう！',
    'ワールド2開始。マッチのそばの爪とぎを、猫の爪で少しずつ壊そう。', '露の行列、次の猫の安全な道を空けよう。',
    '風鈴でリズムアップ、3匹目のプレビューを確認。', '葉かげの猫は色が似ているから、ゆっくり見分けよう。',
    '午後の花壇は高さと連鎖の両方を意識してね。', 'ハチのお便り、おやつのマスの猫を消すと集められるよ。',
    '草むら迷路は3匹のプレビューで曲がり道を先読み。', '曲がり道は一番高い列から低くしよう。',
    'つる草リレーは順番が大事、良い場所を埋めすぎないで。', 'ガーデンパーティーは3手先を見て落とそう。',
    'じゃらし登場。空のストックはプレビューを進め、入っていればNOWだけ交換するよ。', '水たまりの影で高さが変わる、左右を保ってね。',
    'きのこのお家は狭い、一番高いラインを優先して消そう。', 'キャンプタイムは短め、3つ揃ったら迷わず落とそう。',
    'たこ追いは3匹目のプレビューが連鎖の鍵。', '二層の爪とぎと爪とぎ猫が登場、爪とぎ猫なら一度に2層削れるよ。',
    '月明かりの階段は高さを管理、同じ列に積み続けないで。', 'ホタルの夜は色のアクセントで次の組を探そう。',
    '夜色ボックスは猫が多い、中央より先に両側を整えよう。', '花影いっぱい、連鎖と空間を一緒に管理しよう。',
    'トンネル登場。入口から指定の出口へ進み、出口が閉じていれば落とせないよ。', '四季めぐりは記憶力勝負、3匹全部を見てね。',
    '落ち葉迷路は低い空間を残して良い猫を受け止めよう。', '実りの収穫は目標アップ、毎回の連鎖が大切。',
    '小道に集合は色ごとに段を分けると安定するよ。', 'ガーデンガーディアンは2段分空けてから大連鎖。',
    '灯りの連鎖は後半戦、高さを安定させてから加速。', '秘密の温室は色が多い、プレビューの枠色を信じよう。',
    '最後の花びら、時間と高さの両方に注意。', 'ガーデン箱長、94匹を連れてワールド2クリア！',
    'くいしんぼ登場。消えると上下左右1マスのおやつも集めるよ。', '窓辺のひと休みは低く整えてね。', '荷物の横に呼吸できる列を残そう。', '海風は高さとおやつを一緒に見るステージ。', '港の行列は3手先を考えて落とそう。', '山道のカーブはトンネル出口を空けておこう。', '島の冒険は左右のバランスが大切。', '灯台ディナーは爪とぎを波ごとにゆっくり削ろう。', '森の駅は多い猫種の先読みを試すよ。', 'ホームに集合、両端に余白を残してね。',
    'ツイン・トンネルは1回の落下で1組だけ通過するよ。', '旅の手帳では、難しい猫をストックしておけるよ。', 'レインコートとおやつ、くいしんぼは上下左右1マスも集めるよ。', '星空の車両は一番高い列から整えよう。', '遠くの箱では残りの目標を確認してね。', 'いたずら猫は4回落とすごとに巡回し、4枠プレビューも表示するよ。', '4枠プレビューはNOWと未来3匹を表示するよ。', '荷物の大整理、復帰できる列を2つ残そう。', 'トンネル追走、出口が閉じると入口も使えないよ。', '変わる景色は猫種を分散すると安定するよ。',
    '旅の小さな駅、おやつより先に盤面を安定させよう。', '海の橋は左右の高さ差が連鎖に影響するよ。', '猫パスポート、特性は猫について配対を変えないよ。', '雲の休憩所、成功して落とした後にストックが解禁されるよ。', '森の出口ではプレビューの能力表示を確認。', '巡回ルート、残り1回なら代わりの列を準備しよう。', '夜汽車の連鎖、固定された機関でも順番は変えられるよ。', '最後の道のりは目標と高さを同時に管理。', '終点のおやつはくいしんぼを隣に落とすと集めやすいよ。', '旅の箱長、救出・爪とぎ・おやつを全部達成しよう！'
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
