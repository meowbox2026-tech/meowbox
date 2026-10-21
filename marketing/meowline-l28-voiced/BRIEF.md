---
workflow: general-video
flow: automation
storyboard: no
message: "實際玩一次第 28 關：邊放邊講為什麼放這裡，最後 13 連鎖全清——換你試試看。"
destination: TikTok / Reels / Shorts / paid social
aspect: "9:16"
language: zh-TW
length: 54.5s
---

## Intent

Revision 2026-10-11: level 28 only, voiced player commentary (why each key cat goes where it
goes), slower pacing, camera moves, no "共 90 關". Style: creator screen recording — plain
captions, finger-tap indicator, hand-drawn marker strokes, quiet end card.

Engine facts used in the script (src/game/core/planningEngine.ts, level 28 official solution):
- Cat 1 (brown, type `orange`) at (5,4) completes the diagonal (6,3)-(5,4)-(4,5): wave 1.
- Cat 3 (white) at (2,4) is cleared in the very last wave, with (1,7),(3,7).
- Cat 18 (blue) at (3,6) completes the blue row (2..6, 6): wave 3.
- 13 clear waves, 0 cats left.

## Build

`python3 tools/build.py` regenerates `index.html` from `tools/index.template.html`;
all segment, caption, voiceover, camera and marker timings live in `tools/build.py`.
Footage: `marketing/footage/record.js` scene `l28slow`.
Voiceover: macOS `say -v Meijia -r 200` from `assets/vo/lines.txt` (v11 at -r 195).

## Notes

- BGM and pop click: Pixabay Content License. Voice is synthetic (Meijia, zh-TW); the brand
  name "Meow Line" is pronounced imperfectly — a human recording of lines.txt can replace it.
