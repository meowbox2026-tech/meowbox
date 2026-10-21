---
workflow: general-video
flow: automation
storyboard: no
message: "同樣是第 28 關：新手看到同色就湊一排（7 連鎖剩 12 隻），老手先想貓會掉到哪（13 連鎖全清）。"
destination: TikTok / Reels / Shorts / paid social
aspect: "9:16"
language: zh-TW
length: 54.1s
---

## Intent

「新手和老手對照」series, episode 1 (2026-10-12). Level 28 is unchanged game content.

## Footage (production web build, marketing/footage/record.js)

- `n28` novice: greedy rule "put each cat where it makes the longest same-colour line right now,
  lowest row first". Engine result: 7 waves, 12 cats left. Recorded at 380ms per tap.
- `l28slow` expert: official solution, 13 waves, 0 left.

## Build

`python3 tools/build.py` → `index.html`. Voice: macOS `say -v Meijia -r 200` from `assets/vo/lines.txt`.
BGM and pop click: Pixabay Content License.
