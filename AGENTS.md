# MeowBox project instructions

## Cloudflare deployment facts

- The user identifies the Cloudflare setup as `cloudflare2k7`; do not confuse it with Supabase or Vercel.
- On 2026-09-26, the supplied Cloudflare dashboard URL opened Pages project `meowbox`, the only Pages project listed in that account. Its public URL is `https://meowbox.pages.dev`, and its GitHub repository is `vvstudiocode/meowbox`.
- Keep `cloudflare2k7` and the dashboard project name `meowbox` distinct. Before changing Cloudflare settings, verify the exact project in the supplied dashboard instead of guessing from either name.
- Git deployment is already connected. Production branch `main` has automatic deployments enabled.
- `GAME_CONTENT_SIGNING_PRIVATE_KEY` is saved as an encrypted secret in the `meowbox` Production environment, but encryption/storage does not prove the value is valid. The local private key matches the public key bundled in the app, and local `npm run build` succeeds.
- Cloudflare deployment for commit `9a5ee6acdffdfac68229b22dd020b54492358bb2` was triggered on 2026-09-26, cloned the repo and installed dependencies, then failed in `scripts/content/publishGameContent.mjs` at `createPrivateKey` with `ERR_OSSL_UNSUPPORTED`. TypeScript and Vite passed; no deployment was published. Treat the Production secret value/format as invalid until verified.
- Do not retry this failed deployment before the user re-enters the exact local PEM into the `meowbox` Production secret `GAME_CONTENT_SIGNING_PRIVATE_KEY`. The secret is a signing credential: never ask the user to paste it into chat, and leave credential entry/submission to the user. After they save it, they can retry commit `9a5ee6a` in Cloudflare. Do not create a new key unless the local key is lost or a deliberate key rotation is planned.
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
