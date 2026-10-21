---
workflow: general-video
flow: automation
storyboard: no
message: "第 28 關最後消掉的三隻白貓，一開始根本不在那裡——第 2、3 步是在幫最後一步鋪路。"
destination: TikTok / Reels / Shorts / paid social
aspect: "9:16"
language: zh-TW
length: 56.5s
---

## Intent

Explainer for level 28 steps 2 and 3 (2026-10-12), built to show the game is deeper than it looks.
Hook = the final wave first (open loop), then rewind to steps 2–3, then follow each white cat down.

## Engine facts (official solution, one group per wave)

- Step 3 white at (2,4) forms a row with (1,4),(3,4), but wave 1 clears cat 9 under the right
  white, so the row breaks immediately.
- Wave 3: cat 2 (blue, step 2) clears with the whole blue group; column 2 loses 3 cats and the
  middle white drops to the bottom row.
- Right white drops in waves 1, 3, 8; left white drops in wave 12; the row re-forms at row 8
  and clears in wave 13.
- "每關都有一次提示" matches the shipped game (README).

## Build

`python3 tools/build.py` → `index.html`. Footage `l28slow` (marketing/footage/record.js).
Voice: macOS `say -v Meijia -r 200` from `assets/vo/lines.txt`. BGM/pop: Pixabay Content License.
