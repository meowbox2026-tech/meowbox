# Mobile artwork integration QA

## Comparison target

- Source visual truth: `/Users/studio.vv/Desktop/meowbox/Codex 圖像 2026年9月17日 上午01_40_31.png` (home reference, 941 × 1672 px), plus `/Users/studio.vv/Desktop/meowbox/public/assets/start.png` (the supplied start-button artwork, 400 × 400 px).
- Level-completion visual truth: `/var/folders/1p/1qxlvx0d6fj9ndnk4fkpjnp40000gn/T/TemporaryItems/NSIRD_screencaptureui_7T3X5U/截圖 2026-09-17 03.22.56.png` and `/var/folders/1p/1qxlvx0d6fj9ndnk4fkpjnp40000gn/T/TemporaryItems/NSIRD_screencaptureui_lf0yXt/截圖 2026-09-17 03.23.18.png` (reward and post-level states shown in the supplied comparison).
- Implementation: in-app Browser, `http://127.0.0.1:5173/`, home state, 390 × 844 CSS px at device scale factor 1. The browser-rendered screenshot was captured in the active in-app Browser session during this QA run; the browser API exposes it as a session image rather than a writable local file.
- Normalization: the reference is a 0.563 portrait composition while the target phone viewport is a taller 0.462 composition. Comparison used the same app-owned home state, with the full supplied `start.png` and the four supplied navigation PNGs evaluated at their visible, uncropped artwork bounds rather than comparing browser chrome or the differing outer aspect ratios.

## Full-view comparison evidence

The final 390 × 844 capture shows the supplied `meowlogo`, `schedule`, `start`, `levelmap`, `collect`, `dailyrewards`, and `store` artwork over the matching room background. The start label is centred in the open visual space before the built-in play glyph, and each bottom entry keeps a readable Traditional Chinese label without clipping.

## Focused comparison evidence

The start-control and four-entry navigation region were inspected against the source image at the same interaction state. Their visual surfaces are now the supplied PNGs, not CSS approximations; HTML labels remain layered above the art for accessibility and localisation. No focused crop was needed beyond those asset-bearing controls because their whole visible bounds are present in the full mobile capture.

## Findings and iteration history

### Iteration 1 — fixed

- [P1] Major controls used generic CSS button surfaces instead of the supplied game art.
  - Location: home screen, game action bar, pause and reward states.
  - Fix: introduced `ArtworkButton` for semantic text over supplied PNG artwork; applied `start.png`, the four home navigation assets, gameplay controls, pause panel, reward visuals, top-bar controls, title sign, progress card, stars, and treasure.
- [P2] Copy and font treatment were mixed-language and depended on system font availability.
  - Location: primary navigation and screen titles.
  - Fix: bundled the Traditional Chinese Huninn rounded font and changed visible core navigation and page copy to clear Traditional Chinese.

### Iteration 2 — final review

No actionable P0, P1, or P2 differences remain for the requested asset-and-font pass.

### Iteration 3 — background and life artwork

- Re-encoded the five 1080 × 1920 room backgrounds as high-quality WebP (`cwebp -q 92 -m 6 -sharp_yuv`): each is now about 200–272 KB instead of 3.5–4.5 MB, while the source dimensions and visual composition remain unchanged. The source PNG backgrounds were removed after decode and visual checks.
- Replaced the home life counter's CSS approximation with the supplied `/assets/life.png`; the numeric value and Traditional Chinese status remain HTML layered over the artwork.
- Rechecked the home and game views in a 390 × 844 mobile viewport and confirmed the converted backgrounds load without console errors.

### Iteration 4 — single-screen level completion

- Compared the supplied completion screenshots: the reward area and the three post-level actions belong on one completion view. Replaced the old claim-then-navigation conditional with a dedicated `ResultModal` that keeps both groups visible together.
- Wired the supplied `levelselect.png`, `nextlevel.png`, and `replay.png` button artwork into the same modal. Claiming a reward now disables the two reward choices in place, while `關卡`, `下一關`, and `重玩` remain available without opening a second result screen.
- Verified the flow at 390 × 844: finishing a row level opens one compact result card, all five actions are visible, claiming the reward stays on that card, and `下一關` advances directly to the next puzzle.

### Iteration 5 — level card, pause actions, and shop grid

- Replaced the game top-bar CSS level pill with the supplied `levelcard.png`; the level number and `關卡` copy remain HTML layered over the transparent artwork.
- Rebuilt the pause panel as one semantic artwork surface using `paused.png`. `暫停`, `繼續遊戲`, `重新開始本關`, `回到主頁`, and `設定` are visible HTML labels, and their hit areas track the artwork bounds. `設定` now routes directly to the settings screen.
- Updated the shop tabs, Paw Coin heading, and coin-pack cards to use the supplied `coins.png`, `collect.png`, and `gift.png` artwork. The four purchase cards keep their existing test-safe add-coins callbacks while matching the rounded mobile grid.
- Added component tests for the level-card image and pause-panel labels/actions. The 390 × 844 browser pass covered the top-bar card, pause-to-settings navigation, and all three shop tabs; no new console errors were emitted after disabling Phaser's unused global audio mixer.

## Required fidelity surfaces

- Fonts and typography: Huninn is bundled as a local WOFF2 and used through the global cute-font stack. Titles and action labels use heavier scale, short line height, and brown/cream contrast appropriate to the reference.
- Spacing and layout rhythm: the home layout remains inside a 390 × 844 phone viewport; the start control, progress card, and bottom navigation retain tap-safe spacing. A 360 × 740 check showed no clipped home labels.
- Colors and visual tokens: key controls now inherit their colour, highlights, radii, paw marks, and shadows from the supplied raster assets rather than a substitute gradient.
- Image quality and asset fidelity: supplied PNGs are rendered at their natural composition with transparent canvas padding accounted for. No visible reference button was replaced with inline SVG or CSS-drawn art.
- Copy and content: primary labels are understandable Traditional Chinese. The text remains HTML rather than baked into the asset so it is readable by assistive technology and can later follow the selected language.

## Interaction and browser checks

- Start button opens the game.
- Completing a level opens one result view containing the reward controls and all three navigation buttons; claiming a reward does not switch to a second result view.
- Pause opens the supplied `paused.png` panel; Continue closes it and restores the game.
- Game action buttons expose Undo, Hint, Rotate, and Auto Place; the Auto Place reward modal opens and closes successfully with the supplied watch-ad artwork.
- The home navigation opens the level and settings views; daily rewards open with the supplied gift art.
- Browser console errors: none (`[]`).

## Follow-up polish

- [P3] If a later visual pass targets a specific device model, tune only vertical offsets against that exact device screenshot; the supplied reference uses a shorter 0.563 portrait aspect than current iPhone-class 0.462 screens.

final result: passed
