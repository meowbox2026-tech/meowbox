"""Generates index.html for near-miss series #1 (level 28, last cat misplaced), cut for X.

All timings live here. Run: python3 tools/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
FOOTAGE = "assets/footage/l28near.mp4"
TAPS = json.loads((ROOT / "assets/footage/l28near.taps.json").read_text())


def cell(x, y):
    """Centre of board cell (x, y) in the 1080x1920 footage frame."""
    return 120 + 121 * x, 504 + 121 * y


# (media_start, media_end, playback_rate): laid end to end from t=0.
# X autoplays muted: no voiceover, captions carry the story, result first.
SEGMENTS = [
    (17.20, 17.35, 0.065), # 0 hook: the one cat left
    (6.20, 7.45, 0.42),    # 1 board full, one cat still in the tray
    (7.45, 7.75, 0.30),    # 2 last blue cat into the corner, slow
    (7.75, 16.90, 1.25),   # 3 cascade up to COMBO x14
    (16.90, 17.35, 0.18),  # 4 one cat left, held
    (17.60, 18.80, 1.00),  # 5 fail screen
]

TIMELINE = []
t = 0.0
for m0, m1, rate in SEGMENTS:
    dur = round((m1 - m0) / rate, 3)
    TIMELINE.append({"t0": round(t, 3), "dur": dur, "m0": m0, "m1": m1, "rate": rate})
    t += dur
FOOTAGE_END = round(t, 3)
END_DUR = 3.8
TOTAL = round(FOOTAGE_END + END_DUR, 2)


def S(i):
    return TIMELINE[i]["t0"]


def to_comp(media_t, first=1):
    for s in TIMELINE[first:]:
        if s["m0"] <= media_t < s["m1"]:
            return round(s["t0"] + (media_t - s["m0"]) / s["rate"], 3)
    return None


X14 = to_comp(16.8)
LONE = round(S(4) + (17.2 - 16.9) / 0.18, 3)
VO = []
VO_DUR = {}
CAPTIONS = [
    (0.1, S(1), "就差這一隻。"),
    (S(1), S(1) + 1.6, "第 28 關，放到剩最後一隻"),
    (S(1) + 1.6, S(3), "想說丟角落應該沒差吧"),
    (S(3) + 0.3, S(3) + 2.9, "同色 3 隻連一線就會消"),
    (S(3) + 2.9, X14 - 0.1, "消完掉下來，又繼續連⋯⋯"),
    (X14 - 0.1, LONE - 0.2, "<span class='hi'>14</span> 連鎖欸！"),
    (LONE - 0.2, S(5), "結果就剩牠一隻。"),
]

CORNER = cell(7, 7)
# Camera: (time, scale, focus point in footage, screen target, duration).
CAM = [
    (0.0, 2.0, CORNER, (700, 1000), 0.0),
    (S(1), 1.0, (540, 960), (540, 960), 0.0),
    (S(1) + 1.4, 1.6, (840, 1230), (620, 1000), 0.7),
    (S(3) + 0.2, 1.0, (540, 960), (540, 960), 0.5),
    (S(3) + 0.8, 1.06, (540, 940), (540, 960), X14 - S(3) - 1.0),
    (LONE - 0.55, 2.0, CORNER, (700, 1000), 0.6),
    (S(5), 1.0, (540, 960), (540, 960), 0.4),
]

cx, cy = CORNER
LOOP = (f"M {cx - 70} {cy - 20} C {cx - 66} {cy - 80}, {cx + 60} {cy - 84}, {cx + 72} {cy - 6} "
        f"C {cx + 80} {cy + 62}, {cx - 40} {cy + 82}, {cx - 72} {cy + 18} C {cx - 80} {cy - 30}, {cx - 40} {cy - 70}, {cx + 4} {cy - 76}")
MARKS = [
    ("m-hook", LOOP, 0.35, S(1)),
    ("m-lone", LOOP, LONE, S(5)),
]

TAP_TIMES = [{"t": to_comp(tp["t"]), "x": tp["x"], "y": tp["y"]} for tp in TAPS]
POP_TAPS = [TAP_TIMES[-1]]


def video_tags():
    out = []
    for i, s in enumerate(TIMELINE):
        rate = "" if s["rate"] == 1 else f' data-playback-rate="{s["rate"]}"'
        out.append(f'        <video id="seg{i:02d}" src="{FOOTAGE}" data-start="{s["t0"]}" data-duration="{s["dur"]}" '
                   f'data-media-start="{s["m0"]}"{rate} data-track-index="0" playsinline muted></video>')
    return "\n".join(out)


def caption_tags():
    return "\n".join(
        f'      <div id="c{i:02d}" class="clip" data-start="{round(a, 3)}" data-duration="{round(b - a, 3)}" data-track-index="3">'
        f'<div class="cap"><span>{txt}</span></div></div>'
        for i, (a, b, txt) in enumerate(CAPTIONS))


def vo_tags():
    return "\n".join(
        f'      <audio id="vo-{vid}" src="assets/vo/{vid}.wav" data-start="{round(at, 3)}" data-duration="{VO_DUR[vid]}" '
        f'data-volume="1" data-track-index="{20 + i}"></audio>'
        for i, (vid, at) in enumerate(VO))


def pop_tags():
    return "\n".join(
        f'      <audio id="pop{i}" src="assets/audio/andressamd-pop-click-576326.mp3" data-start="{tp["t"]}" '
        f'data-duration="0.35" data-volume="0.7" data-track-index="{12 + i}"></audio>'
        for i, tp in enumerate(POP_TAPS))


def bgm_automation():
    pts = [{"t": 0, "v": 0.55}, {"t": round(TOTAL - 1.0, 2), "v": 0.55}, {"t": TOTAL, "v": 0}]
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": pts}]})


def cam_js():
    lines = ['tl.set("#cam", { transformOrigin: "0 0" }, 0);']
    for at, s, (fx, fy), (txp, typ), dur in CAM:
        tx = min(0, max(1080 - 1080 * s, txp - s * fx))
        ty = min(0, max(1920 - 1920 * s, typ - s * fy))
        ease = "none" if dur > 2 else "power2.inOut"
        if dur == 0:
            lines.append(f'tl.set("#cam", {{ scale: {s}, x: {round(tx, 1)}, y: {round(ty, 1)} }}, {round(at, 3)});')
            continue
        lines.append(f'tl.to("#cam", {{ scale: {s}, x: {round(tx, 1)}, y: {round(ty, 1)}, duration: {round(dur, 3)}, ease: "{ease}" }}, {round(at, 3)});')
    return "\n      ".join(lines)


def marks_js():
    lines = []
    for mid, _, draw, hide in MARKS:
        lines.append(f'tl.set("#{mid}", {{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}, 0);')
        lines.append(f'tl.set("#{mid}", {{ opacity: 1 }}, {round(draw, 3)});')
        lines.append(f'tl.to("#{mid}", {{ strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" }}, {round(draw, 3)});')
        lines.append(f'tl.to("#{mid}", {{ opacity: 0, duration: 0.15, ease: "none" }}, {round(hide - 0.15, 3)});')
    return "\n      ".join(lines)


def build():
    tpl = (ROOT / "tools/index.template.html").read_text()
    html = (tpl.replace("{{COMP_ID}}", "main").replace("{{TOTAL}}", str(TOTAL))
            .replace("{{VIDEOS}}", video_tags())
            .replace("{{MARK_PATHS}}", "\n".join(
                f'          <path id="{mid}" pathLength="1" d="{d}" />' for mid, d, _, _ in MARKS))
            .replace("{{CAPTIONS}}", caption_tags())
            .replace("{{END_START}}", str(FOOTAGE_END))
            .replace("{{END_DUR}}", str(END_DUR))
            .replace("{{BGM_AUTOMATION}}", bgm_automation())
            .replace("{{VO}}", vo_tags())
            .replace("{{POPS}}", pop_tags())
            .replace("{{TAPS}}", json.dumps([tp for tp in TAP_TIMES if tp["t"] is not None]))
            .replace("{{CAM_JS}}", cam_js())
            .replace("{{MARKS_JS}}", marks_js()))
    (ROOT / "index.html").write_text(html)
    print("total", TOTAL, "footage end", FOOTAGE_END, "x14", X14, "lone", LONE)
    for i, s in enumerate(TIMELINE):
        print(i, s)


if __name__ == "__main__":
    build()
