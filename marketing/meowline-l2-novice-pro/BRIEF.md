---
workflow: general-video
flow: automation
storyboard: no
message: "第 2 關，新手跟老手只差最後一隻貓：湊 4 連反而浪費一隻（剩 2 隻），3＋3 剛好全清。"
destination: TikTok / Reels / Shorts / paid social
aspect: "9:16"
language: zh-TW
length: 35.5s
---

## Intent

「新手和老手對照」series, simpler replacement for the level-28 cut (2026-10-12): the user found
level 28 too hard to follow, so this uses level 2 (4 cats, one differing placement).

## Engine facts (planningEngine, level 2)

- Six whites total: four on the board, two in the tray. First three placements identical.
- Novice: last white at (3,0) -> 4-in-a-row on top clears together; (3,5),(1,7) left alone.
  3 waves, 2 left.
- Expert: last white at (2,6) -> top 3 + diagonal (3,5),(2,6),(1,7). 4 waves, all clear.

## Build

`python3 tools/build.py` → `index.html`. Footage `l2n` / `l2e` (marketing/footage/record.js).
Split screens use stills in `assets/stills/` (extracted from the footage at 5.636s / 7.25s / 8.2s).
Voice: macOS `say -v Meijia -r 200` from `assets/vo/lines.txt`. BGM/pop: Pixabay Content License.
