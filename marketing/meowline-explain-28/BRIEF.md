---
workflow: general-video
flow: automation
storyboard: no
message: "關卡解說 #28：三個重點（找引爆點／連好的排先留著／最後一隻補完整排），附錯誤示範。"
destination: TikTok / Reels / Shorts / YouTube
aspect: "9:16"
language: zh-TW
length: 62.2s
---

## Intent

Series format "關卡解說" (2026-10-12). Level 28 unchanged in the game. Structure:
hook (13 combos, how?) → three numbered points → common mistake → correct cascade → recap card
with "你卡在哪一關？留言告訴我" so comments pick the next episode.

## Engine facts (src/game/core/planningEngine.ts, level 28)

- One group clears per wave; groups touched by cats that just fell are prioritized.
- Cat 1 at (5,4) completes the diagonal (6,3)-(5,4)-(4,5): first wave.
- Cat 3 at (2,4) completes the white row (1..3,4); the same three cats clear in the last wave.
- Cat 18 at (3,6) completes the blue row; at corner (7,7) instead: 14 waves, that blue is the only cat left.

## Build

`python3 tools/build.py` → `index.html`. Footage via `marketing/footage/record.js` scenes `l28slow`, `l28miss`.
Voice: macOS `say -v Meijia -r 200` from `assets/vo/lines.txt` (synthetic; human recording can replace).
BGM and pop click: Pixabay Content License.
