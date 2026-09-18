# MeowBox project instructions

## File-size guard

- Keep every new or substantially modified source, style, test, and asset-manifest file at or below 500 lines.
- When a file approaches 450 lines, split the next responsibility into a focused module before adding more code.
- Keep CSS split by responsibility. `src/styles/game.css` is an import manifest; do not append gameplay rules directly to it.
- Existing legacy files above the limit are not a reason to add more code to them. If a future change touches one, extract a focused module as part of that change.

## MeowBox motion and media

- Keep generated sprite sheets in `public/assets/animations/` and downloaded audio in `public/assets/audio/`, with source/license notes beside them.
- Prefer Phaser/React/CSS timing and tween composition over generating a new video for a small gameplay reaction.
- Image generation belongs in a separate normal ChatGPT conversation when the user wants to preserve Codex usage; do not replace that workflow with Codex image generation.
