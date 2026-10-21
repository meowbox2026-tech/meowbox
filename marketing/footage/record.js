// Records MEOW LINE ad footage from the production preview (vite preview on :4173).
// Usage: node record.js <scene>   scenes: l1 | l90fail | l90win
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const BASE = 'http://localhost:4173/'
const L90 = [[6,5],[6,2],[1,1],[7,6],[1,2],[9,5],[1,5],[7,5],[6,3],[4,5],[1,0],[4,4],[6,0],[9,4],[2,4],[9,6],[11,5],[11,3],[2,6],[4,6],[2,5],[1,3],[1,4],[7,4],[6,1],[6,4],[11,4],[1,6],[6,6],[11,6]]
const L90_FAIL = L90.map((p, i) => i === 17 ? L90[29] : i === 29 ? L90[17] : p)
const SCENES = {
  l1: { level: 1, cells: [[4,3],[4,2],[4,1]], dual: false, gap: 450 },
  l90fail: { level: 90, cells: L90_FAIL, dual: true, gap: 140 },
  l90win: { level: 90, cells: L90, dual: true, gap: 140 },
  // Fail-ad attempts on level 1 (each verified in the engine): 0, 1, then 2 combos.
  f1: { level: 1, cells: [[0,0],[7,0],[0,3]], dual: false, gaps: [700, 700, 700] },
  f2: { level: 1, cells: [[4,3],[6,0],[0,0]], dual: false, gaps: [700, 700, 700] },
  f3: { level: 1, cells: [[4,3],[4,2],[6,0]], dual: false, gaps: [700, 1600, 700], pauseBefore: [0, 0, 1400] },
  // Fail ad v2 (20s): level 1 cleared at a readable pace, then level 2 fails twice (1 clear, then 3 clears).
  s1: { level: 1, cells: [[4,3],[4,2],[4,1]], dual: false, gaps: [900, 900, 900] },
  a1: { level: 2, cells: [[1,0],[7,0],[0,2],[7,2]], dual: false, gaps: [900, 900, 900, 900] },
  // Promo 2026-10-11: level 28 clean win (13 waves), level 30 near-miss (swap 9<->17, 2 cats left).
  l28: { level: 28, cells: [[5,4],[2,6],[2,4],[0,1],[2,2],[6,6],[7,3],[5,1],[3,5],[4,2],[7,5],[3,7],[0,3],[1,2],[3,0],[1,5],[6,2],[3,6]], dual: false, gap: 260 },
  // Slow, player-paced level 28 for the voiced promo: thinking pauses before key placements.
  l28slow: { level: 28, cells: [[5,4],[2,6],[2,4],[0,1],[2,2],[6,6],[7,3],[5,1],[3,5],[4,2],[7,5],[3,7],[0,3],[1,2],[3,0],[1,5],[6,2],[3,6]], dual: false,
    gaps: [650,650,650,500,500,500,500,500,500,500,500,500,500,500,500,500,650,1200], pauseBefore: [600,0,0,900,0,0,0,0,0,0,0,0,0,0,0,0,0,900] },
  // Near-miss series #1: level 28, first 17 correct, last blue to (7,7) -> 14 waves, 1 cat left.
  l28near: { level: 28, cells: [[5,4],[2,6],[2,4],[0,1],[2,2],[6,6],[7,3],[5,1],[3,5],[4,2],[7,5],[3,7],[0,3],[1,2],[3,0],[1,5],[6,2],[7,7]], dual: false,
    gaps: [300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,1000], pauseBefore: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1200] },
  // Novice vs expert (2026-10-12): greedy "make a line right away" placements on level 28 -> 7 waves, 12 cats left.
  n28: { level: 28, cells: [[6,2],[2,6],[3,3],[3,7],[3,5],[3,6],[3,0],[6,7],[0,6],[6,6],[7,3],[7,7],[0,7],[2,4],[7,5],[1,5],[0,3],[5,5]], dual: false, gap: 380 },
  // Explainer "common mistake": same as l28slow but the last blue goes to corner (7,7) -> 14 waves, 1 cat left.
  l28miss: { level: 28, cells: [[5,4],[2,6],[2,4],[0,1],[2,2],[6,6],[7,3],[5,1],[3,5],[4,2],[7,5],[3,7],[0,3],[1,2],[3,0],[1,5],[6,2],[7,7]], dual: false,
    gaps: [650,650,650,500,500,500,500,500,500,500,500,500,500,500,500,500,650,1200], pauseBefore: [600,0,0,900,0,0,0,0,0,0,0,0,0,0,0,0,0,900] },
  // Novice vs expert, level 2 (2026-10-12): same first three cats; last white on the top row (4-in-a-row, 2 whites left) vs the diagonal (all clear).
  l2e: { level: 2, cells: [[1,0],[6,0],[6,5],[2,6]], dual: false, gaps: [900,900,900,900], pauseBefore: [500,0,0,1200] },
  l2n: { level: 2, cells: [[1,0],[6,0],[6,5],[3,0]], dual: false, gaps: [900,900,900,900], pauseBefore: [500,0,0,1200] },
  // Novice vs expert, level 17 (2026-10-12): identical first 13 cats; last blue under the left blue column (4-in-a-row, 12 waves, 2 blues left) vs into the gap at (6,4) (13 waves, all clear).
  l17e: { level: 17, cells: [[0,0],[1,2],[2,3],[0,5],[1,5],[3,1],[4,1],[3,6],[4,6],[6,0],[6,1],[6,2],[6,3],[6,4]], dual: false, gaps: [450,450,450,450,450,450,450,450,450,450,450,450,450,900], pauseBefore: [400,0,0,0,0,0,0,0,0,0,0,0,0,1500] },
  l17n: { level: 17, cells: [[0,0],[1,2],[2,3],[0,5],[1,5],[3,1],[4,1],[3,6],[4,6],[6,0],[6,1],[6,2],[6,3],[3,3]], dual: false, gaps: [450,450,450,450,450,450,450,450,450,450,450,450,450,900], pauseBefore: [400,0,0,0,0,0,0,0,0,0,0,0,0,1500] },
  l30near: { level: 30, cells: [[2,2],[4,3],[4,2],[2,4],[5,1],[3,3],[1,2],[6,6],[3,1],[6,7],[7,5],[6,2],[4,6],[0,2],[0,5],[7,2],[1,7],[1,5]], dual: false, gap: 200 },
  a2: { level: 2, cells: [[1,0],[6,0],[6,5],[7,2]], dual: false, gaps: [900, 900, 900, 900], pauseBefore: [0, 0, 0, 2000] }
}

function save(level) {
  const done = Array.from({ length: level - 1 }, (_, i) => i + 1)
  return JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), currentLevel: level,
    completedLevels: done, stars: Object.fromEntries(done.map(n => [n, 3])),
    settings: { music: false, sound: false, haptics: false, language: 'zh-TW' } })
}

async function main() {
  const name = process.argv[2]
  const scene = SCENES[name]
  if (!scene) throw new Error(`unknown scene ${name}`)
  const out = path.join(__dirname, 'frames', name)
  fs.rmSync(out, { recursive: true, force: true })
  fs.mkdirSync(out, { recursive: true })

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 414, height: 736 }, deviceScaleFactor: 1080 / 414 })
  await ctx.addInitScript(s => {
    try {
      localStorage.setItem('meow-box-player-save', s)
      localStorage.setItem('meowbox-tutorial:planning-diagonal-v1', '1')
    } catch {}
  }, save(scene.level))
  const page = await ctx.newPage()
  await page.goto(BASE)
  await page.addStyleTag({ content: '.game-banner-slot{visibility:hidden!important}' })
  await page.getByText('開始遊戲', { exact: true }).click()
  await page.waitForSelector(scene.dual ? '.dual-box__grid' : '.planning-placement-grid')
  await page.waitForTimeout(800)

  const cdp = await ctx.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', async f => {
    const file = path.join(out, `${String(frames.length).padStart(5, '0')}.jpg`)
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'))
    frames.push({ file, t: f.metadata.timestamp })
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920 })
  await page.waitForTimeout(1200)

  const taps = []
  for (const [i, [x, y]] of scene.cells.entries()) {
    if (scene.pauseBefore?.[i]) await page.waitForTimeout(scene.pauseBefore[i])
    const center = await page.evaluate(({ x, y, dual }) => {
      const el = dual
        ? document.querySelectorAll('.dual-box__grid')[x < 6 ? 0 : 1].querySelectorAll('button')[y * 6 + (x % 6)]
        : document.querySelectorAll('.planning-placement-grid .planning-placement-cell')[y * 8 + x]
      const r = el.getBoundingClientRect()
      return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 }
    }, { x, y, dual: scene.dual })
    taps.push({ t: Date.now() / 1000, x: Math.round(center.cx * 1080 / 414), y: Math.round(center.cy * 1080 / 414) })
    await page.evaluate(({ x, y, dual }) => {
      if (dual) {
        const grids = document.querySelectorAll('.dual-box__grid')
        grids[x < 6 ? 0 : 1].querySelectorAll('button')[y * 6 + (x % 6)].click()
      } else {
        document.querySelectorAll('.planning-placement-grid .planning-placement-cell')[y * 8 + x].click()
      }
    }, { x, y, dual: scene.dual })
    await page.waitForTimeout(scene.gaps?.[i] ?? scene.gap)
  }
  await page.waitForSelector('[role=dialog]', { timeout: 60000 })
  await page.waitForTimeout(2500)
  await cdp.send('Page.stopScreencast')
  await browser.close()

  // Build an ffconcat list from real frame timestamps, then encode at 30fps.
  const list = frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 0.1) - f.t).toFixed(4)}`).join('\n')
  const listFile = path.join(out, 'list.txt')
  fs.writeFileSync(listFile, `ffconcat version 1.0\n${list}\nfile '${frames.at(-1).file}'\n`)
  const mp4 = path.join(__dirname, `${name}.mp4`)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=30,scale=1080:1920:flags=lanczos,format=yuv420p,tpad=stop_mode=clone:stop_duration=2', '-c:v', 'libx264', '-crf', '17', mp4])
  const t0 = frames[0].t
  fs.writeFileSync(path.join(__dirname, `${name}.taps.json`), JSON.stringify(taps.map(tp => ({ ...tp, t: +(tp.t - t0).toFixed(3) })), null, 2))
  console.log(name, 'frames', frames.length, 'seconds', (frames.at(-1).t - frames[0].t).toFixed(1), '->', mp4)
}

main().catch(e => { console.error(e); process.exit(1) })
