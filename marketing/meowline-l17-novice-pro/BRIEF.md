---
workflow: general-video
flow: automation
storyboard: no
message: "第 17 關，新手跟老手只差最後一隻藍貓：湊直排 4 連（12 連鎖剩 2 隻），塞進右邊的空格（13 連鎖全清）。"
destination: TikTok / Reels / Shorts / paid social
aspect: "9:16"
language: zh-TW
length: 44.6s
---

## Intent

「新手和老手對照」series (2026-10-12). Replaces the level-2 cut, which the user felt
underestimated viewers. Level 17 keeps a full board but a single, readable difference.

## Engine facts (planningEngine, level 17)

- 12 blue cats total. First 13 placements identical (official solution).
- Novice: last blue at (3,3) under the blue column (3,0..2) -> 4-line. Blues (5,4),(7,4) never
  get a third -> 12 waves, 2 left.
- Expert: last blue in the gap (6,4) -> (5,4),(6,4),(7,4) clears as wave 13 of 13, all clear.

## Build

`python3 tools/build.py` → `index.html`. Footage `l17n` / `l17e` (marketing/footage/record.js).
Stills in `assets/stills/` (hook: result dialogs; why: just after the last placement, 8.995s / 9.025s).
Voice: macOS `say -v Meijia -r 200` from `assets/vo/lines.txt`. BGM/pop: Pixabay Content License.
