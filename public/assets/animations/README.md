# MeowBox cat animation assets

The idle, running, legacy paw, and top-edge hide-and-seek sheets were generated
in the separate ChatGPT image conversation, then placed in the frame grids used
by the game:

- `cat-idle-sheet.png` — 4×2 frames, breathing / blinking / ear and tail motion
- `cat-run-sheet.png` — 4×2 frames, a cat running across the screen
- `cat-paw-sheet.png` — legacy 4×1 source frames; retained for reference only
- `cat-peek-top-sheet.png` — 8×1 transparent frames; a shy cat peeks from the
  top edge, blinks, and ducks back without a box or a jump
- `cat-long-paw.png` — one 941×1672 transparent RGBA orange-and-white tabby
  forearm edited from a user-provided image in the separate ChatGPT
  conversation; the paw is at the lower end and CSS can rotate it for all four
  directions

The game uses CSS frame timing and React triggers, so these assets can be
replaced later without changing the gameplay logic.
