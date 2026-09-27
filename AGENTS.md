# MeowBox project instructions

## Cloudflare deployment facts

- The user identifies the Cloudflare setup as `cloudflare2k7`; do not confuse it with Supabase or Vercel.
- On 2026-09-27, the supplied Cloudflare dashboard URL opened Pages project `meowbox`, the only Pages project listed in that account. Its public URL is `https://meowbox.pages.dev`, and its GitHub repository is `meowbox2026-tech/meowbox`.
- Keep `cloudflare2k7` and the dashboard project name `meowbox` distinct. Before changing Cloudflare settings, verify the exact project in the supplied dashboard instead of guessing from either name.
- Git deployment is already connected. Production branch `main` has automatic deployments enabled.
- Production signing was repaired and verified on 2026-09-26. The full existing PEM (including BEGIN/END markers) was saved as a single-line literal `\n`-escaped value in `meowbox` Production secret `GAME_CONTENT_SIGNING_PRIVATE_KEY`; the publisher already normalizes that representation.
- Retrying commit `7f807d0de5800def5c451e85cb45c19d0edaad05` succeeded as deployment `8e2d485e-6e7b-459e-96bb-d04e3df445ff`. Earlier `ERR_OSSL_UNSUPPORTED` builds are historical, not the current deployment status. No application-code change was needed.
- Live `https://meowbox.pages.dev/game-content/manifest.json` version 1 was verified with the app's embedded public key; RSA-PSS signature and both SHA-256 hashes passed, with 90 levels and 30 theme fields. Preserve the current key pair. The editor selection observed during diagnosis excluded PEM markers, but the previously saved secret could not be read, so its exact corruption is not proven.
- Security follow-up: a native editor's automatic tool snapshot included the private key in this private task transcript. The clipboard was overwritten and the editor closed. Do not share that transcript; coordinate key rotation with an iOS public-key update before treating this key as suitable for long-term production use. Never silently rotate the key or print it in diagnostics.
- The working tree had staged and unstaged changes on 2026-09-26. Inspect and scope changes before committing or pushing; never push the entire working tree by assumption.
- The signing secret is configured only for Production. Handle Preview builds separately; do not copy the Production signing key into Preview without an explicit security decision.
- After the 2026-09-26 transfer, the system clipboard was replaced with the public Cloudflare settings URL. This was session cleanup; never assume the clipboard still contains that URL.

## Remote content and App Store boundary

- The iOS app downloads signed JSON level and theme data that fit its existing schema. Keep game logic and rendering code inside the app bundle.
- Never use Cloudflare content updates to download or execute JavaScript, HTML, CSS, scripts, or app bundles.
- Apple Guideline 2.5.2 prohibits downloading or executing code that introduces or changes app features or functionality. The current JSON-only approach is lower risk and appears consistent with a content-only update, but never guarantee App Review approval. A signature does not make remote code updates compliant.

## File-size guard

- Keep every new or substantially modified source, style, test, and asset-manifest file at or below 500 lines.
- When a file approaches 450 lines, split the next responsibility into a focused module before adding more code.
- Keep CSS split by responsibility. `src/styles/game.css` is an import manifest; do not append gameplay rules directly to it.
- Existing legacy files above the limit are not a reason to add more code to them. If a future change touches one, extract a focused module as part of that change.

## MeowBox motion and media

- Keep generated sprite sheets in `public/assets/animations/` and downloaded audio in `public/assets/audio/`, with source/license notes beside them.
- Prefer Phaser/React/CSS timing and tween composition over generating a new video for a small gameplay reaction.
- Image generation belongs in a separate normal ChatGPT conversation when the user wants to preserve Codex usage; do not replace that workflow with Codex image generation.
