"""Generates index.html for the level-28 "why steps 2 and 3" explainer.

Engine facts (planningEngine, official solution; one group clears per wave, 0.71s per wave in
the recording starting at media 12.75s):
  wave 1  cat 9 (brown, under the right white) clears -> right white drops (3,4)->(3,5)
  wave 3  cat 2 + whole blue group clears; column 2 loses 3 -> middle white (cat 3) drops to (2,7)
  wave 8  cat 12 clears -> right white reaches (3,7)
  wave 12 column 1 fish clear -> left white drops (1,4)->(1,7); the row re-forms
  wave 13 the three whites clear.
Run: python3 tools/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
FOOTAGE = "assets/footage/l28slow.mp4"
TAPS = json.loads((ROOT / "assets/footage/l28slow.taps.json").read_text())
VO_DUR = {"v01": 5.45, "v02": 5.95, "v03": 4.47, "v04": 4.41, "v05": 6.72, "v06": 3.17,
          "v07": 4.77, "v08": 1.73, "v09": 3.09, "v10": 6.94}
WAVE0, WAVE_STEP = 12.75, 0.712


def wave(k, gravity=False):
    """Media time a wave starts clearing (or starts dropping, with gravity=True)."""
    return WAVE0 + (k - 1) * WAVE_STEP + (0.4 if gravity else 0)


def cell(x, y):
    return 120 + 121 * x, 504 + 121 * y


BEATS = [
    {"id": "hook", "m": (20.90, 21.62, 0.125), "vo": ("v01", 0.1)},
    {"id": "b2", "m": (2.30, 3.15, 0.2), "vo": ("v02", 0.15)},
    {"id": "b2h", "m": (3.15, 3.40, 0.13)},
    {"id": "b3", "m": (3.40, 4.40, 0.22), "vo": ("v03", 0.1)},
    {"id": "b4", "m": (4.40, 12.60, 3.0)},
    {"id": "b5", "m": (12.60, 13.45, 0.18), "vo": ("v04", 0.2)},
    {"id": "b6", "m": (13.45, 14.95, 0.21), "vo": ("v05", 0.1)},
    {"id": "b7", "m": (14.95, 18.40, 1.0), "vo": ("v06", 0.3)},
    {"id": "b7b", "m": (18.40, 20.20, 1.4)},
    {"id": "b8", "m": (20.20, 21.75, 0.22), "vo": ("v07", 0.6)},
    {"id": "b9", "m": (22.00, 24.00, 0.33), "vo": ("v08", 0.3)},
]
t = 0.0
for b in BEATS:
    m0, m1, rate = b["m"]
    b["t0"], b["dur"] = round(t, 3), round((m1 - m0) / rate, 3)
    t += b["dur"]
END_START, END_DUR = round(t, 3), 7.6
TOTAL = round(END_START + END_DUR, 2)
AT = {b["id"]: b["t0"] for b in BEATS}
AT["end"] = END_START
VO_AT = {b["vo"][0]: round(b["t0"] + b["vo"][1], 3) for b in BEATS if "vo" in b}
VO_AT["v09"] = round(AT["b9"] + 2.3, 3)
VO_AT["v10"] = round(END_START + 0.3, 3)


def comp(media_t, beat_ids=None):
    """Composition time of a media time (first matching beat, optionally restricted)."""
    for b in BEATS:
        if beat_ids and b["id"] not in beat_ids:
            continue
        m0, m1, rate = b["m"]
        if m0 <= media_t < m1:
            return round(b["t0"] + (media_t - m0) / rate, 3)
    return None


CAPTIONS = [
    (VO_AT["v01"], VO_AT["v01"] + 2.8, "第 28 關最後一下<br>消掉的是這三隻白貓"),
    (VO_AT["v01"] + 2.8, AT["b2"], "可是牠們一開始<br>根本不在這裡"),
    (VO_AT["v02"], VO_AT["v02"] + 2.7, "第 2 步：藍貓放最下面"),
    (VO_AT["v02"] + 2.7, AT["b3"], "第 3 步：白貓放中間<br>跟左右連成一排"),
    (VO_AT["v03"], VO_AT["v03"] + 2.0, "看起來馬上就會消，對吧？"),
    (VO_AT["v03"] + 2.0, AT["b4"], "其實，這排一結算<br>就會被拆散"),
    (AT["b4"], AT["b5"], "其他貓照解法放好"),
    (VO_AT["v04"], VO_AT["v04"] + 2.6, "第一波：右邊白貓底下的<br>咖啡貓先消掉"),
    (VO_AT["v04"] + 2.6, AT["b6"], "右邊這隻就掉下去了"),
    (VO_AT["v05"], VO_AT["v05"] + 3.3, "第 2 步那隻藍貓<br>跟整串藍貓一起消掉"),
    (VO_AT["v05"] + 3.3, AT["b7"], "中間一次少了三隻<br>白貓直接掉到最底"),
    (VO_AT["v06"], AT["b8"], "右邊這隻又掉了兩次<br>跟中間會合"),
    (VO_AT["v07"], VO_AT["v07"] + 2.2, "最後，左邊這隻也掉下來"),
    (VO_AT["v07"] + 2.2, AT["b9"], "三隻剛好在最底排<br>重新連成一排"),
    (VO_AT["v08"], VO_AT["v09"], "<span class='hi'>13</span> 連鎖，全部清光"),
    (VO_AT["v09"], END_START, "原來第 2、3 步<br>是在幫最後一步鋪路"),
]
LABELS = [("lbl-rw", AT["b2"], AT["b4"], "◀◀ 倒回第 2 步"), ("lbl-ff", AT["b4"], AT["b5"], "▶▶ 快轉"),
          ("lbl-go", AT["b5"], AT["b9"], "開始結算")]


def cam(at, s, focus, target, dur):
    tx = min(0, max(1080 - 1080 * s, target[0] - s * focus[0]))
    ty = min(0, max(1920 - 1920 * s, target[1] - s * focus[1]))
    return (round(at, 3), s, round(tx, 1), round(ty, 1), round(dur, 3))


COL = (362, 1170)
CAM = [
    cam(0, 1.9, cell(2, 7), (540, 960), 0.01),
    cam(0.05, 2.0, cell(2, 7), (540, 960), AT["b2"] - 0.1),
    cam(AT["b2"], 1.7, (362, 1110), (540, 880), 0.01),
    cam(AT["b4"], 1.0, (540, 960), (540, 960), 0.5),
    cam(AT["b5"], 1.8, (450, 1050), (540, 880), 0.6),
    cam(AT["b6"], 1.45, COL, (540, 880), 0.6),
    cam(AT["b9"], 1.0, (540, 960), (540, 960), 0.4),
]


def oval(cx, cy, w=200):
    return (f"M {cx - w} {cy - 10} C {cx - w} {cy - 90}, {cx + w - 25} {cy - 96}, {cx + w} {cy - 10} "
            f"C {cx + w + 12} {cy + 70}, {cx - 96} {cy + 92}, {cx - w + 10} {cy + 40} "
            f"C {cx - w - 15} {cy + 10}, {cx - w + 15} {cy - 70}, {cx - 120} {cy - 82}")


def circle(cx, cy, r=72):
    return (f"M {cx - r} {cy - 10} C {cx - r} {cy - r}, {cx + r} {cy - r - 6}, {cx + r + 2} {cy} "
            f"C {cx + r} {cy + r}, {cx - r + 10} {cy + r + 4}, {cx - r - 4} {cy + 8} C {cx - r - 6} {cy - 30}, {cx - 20} {cy - r - 8}, {cx + 10} {cy - r - 6}")


def arrow(x, y1, y2):
    return f"M {x} {y1} C {x - 6} {(y1 + y2) / 2}, {x + 6} {(y1 + y2) / 2}, {x} {y2} M {x - 26} {y2 - 34} L {x} {y2} L {x + 26} {y2 - 34}"


def box(x0, y0, x1, y1):
    return f"M {x0 + 30} {y0} L {x1 - 20} {y0 + 4} C {x1} {y0 + 8}, {x1 + 4} {y0 + 30}, {x1} {y0 + 50} L {x1 - 4} {y1 - 20} C {x1 - 6} {y1}, {x1 - 30} {y1 + 4}, {x0 + 20} {y1} C {x0} {y1 - 4}, {x0 - 4} {y1 - 30}, {x0 + 2} {y1 - 50} L {x0} {y0 + 24} C {x0 + 2} {y0 + 4}, {x0 + 14} {y0}, {x0 + 40} {y0 - 2}"


tap2, tap3 = comp(TAPS[1]["t"]), comp(TAPS[2]["t"])
rx, ry = cell(3, 4)
mx, my = cell(2, 4)
MARKS = [
    ("m-hook", oval(*cell(2, 7)), comp(20.98, ["hook"]) + 0.35, AT["b2"]),
    ("m-blue", circle(*cell(2, 6)), tap2 + 0.3, AT["b4"]),
    ("m-row", oval(*cell(2, 4)), tap3 + 0.5, AT["b4"]),
    ("m-arr-r", arrow(rx + 78, ry - 40, ry + 140), comp(wave(1, True), ["b5"]) + 0.1, AT["b6"] + 0.6),
    ("m-col2", box(mx - 68, cell(2, 5)[1] - 68, mx + 68, cell(2, 7)[1] + 68), comp(wave(3), ["b6"]), comp(wave(3, True), ["b6"]) + 0.3),
    ("m-arr-m", arrow(mx - 64, my - 40, cell(2, 7)[1] + 20), comp(wave(3, True), ["b6"]) + 0.25, AT["b7"] + 0.8),
    ("m-final", oval(*cell(2, 7)), comp(wave(12, True), ["b8"]) + 0.6, AT["b9"]),
]


def tags():
    videos = "\n".join(
        f'        <video id="seg-{b["id"]}" src="{FOOTAGE}" data-start="{b["t0"]}" data-duration="{b["dur"]}" '
        f'data-media-start="{b["m"][0]}" data-playback-rate="{b["m"][2]}" data-track-index="0" playsinline muted></video>'
        for b in BEATS)
    caps = "\n".join(
        f'      <div id="c{i:02d}" class="clip" data-start="{round(a, 3)}" data-duration="{round(e - a, 3)}" data-track-index="3">'
        f'<div class="cap"><span>{txt}</span></div></div>' for i, (a, e, txt) in enumerate(CAPTIONS))
    labels = "\n".join(
        f'      <div id="{lid}" class="clip" data-start="{a}" data-duration="{round(e - a, 3)}" data-track-index="5">'
        f'<span class="who">{txt}</span></div>' for lid, a, e, txt in LABELS)
    vo = "\n".join(
        f'      <audio id="vo-{vid}" src="assets/vo/{vid}.wav" data-start="{at}" data-duration="{VO_DUR[vid]}" '
        f'data-volume="1" data-track-index="{20 + i}"></audio>' for i, (vid, at) in enumerate(VO_AT.items()))
    pops = "\n".join(
        f'      <audio id="pop{i}" src="assets/audio/andressamd-pop-click-576326.mp3" data-start="{tp}" '
        f'data-duration="0.35" data-volume="0.7" data-track-index="{12 + i}"></audio>' for i, tp in enumerate([tap2, tap3]))
    return videos, caps, labels, vo, pops


def bgm():
    low, high = 0.28, 0.6
    pts = [(0, low), (AT["b4"], low), (AT["b4"] + 0.3, high), (AT["b5"] - 0.2, high), (AT["b5"] + 0.1, low),
           (AT["b7b"] - 0.1, low), (AT["b7b"] + 0.2, high), (AT["b8"] + 0.3, high), (AT["b8"] + 0.6, low),
           (TOTAL - 1.2, low), (TOTAL, 0)]
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(a, 2), "v": v} for a, v in pts]}]})


def js():
    cam_lines = ['tl.set("#cam", { transformOrigin: "0 0", x: 0, y: 0, scale: 1 }, 0);']
    for at, s, x, y, dur in CAM:
        ease = "none" if dur > 2 else "power2.inOut"
        cam_lines.append(f'tl.to("#cam", {{ scale: {s}, x: {x}, y: {y}, duration: {dur}, ease: "{ease}" }}, {at});')
    mark_lines = []
    for mid, _, draw, hide in MARKS:
        mark_lines += [f'tl.set("#{mid}", {{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}, 0);',
                       f'tl.set("#{mid}", {{ opacity: 1 }}, {round(draw, 3)});',
                       f'tl.to("#{mid}", {{ strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" }}, {round(draw, 3)});',
                       f'tl.to("#{mid}", {{ opacity: 0, duration: 0.15, ease: "none" }}, {round(hide - 0.15, 3)});']
    return "\n      ".join(cam_lines), "\n      ".join(mark_lines)


def build():
    videos, caps, labels, vo, pops = tags()
    cam_js, marks_js = js()
    taps = [{"t": tap2, "x": TAPS[1]["x"], "y": TAPS[1]["y"]}, {"t": tap3, "x": TAPS[2]["x"], "y": TAPS[2]["y"]}]
    reps = {
        "{{COMP_ID}}": "main", "{{TOTAL}}": str(TOTAL), "{{VIDEOS}}": videos,
        "{{MARK_PATHS}}": "\n".join(f'          <path id="{m}" pathLength="1" d="{d}" />' for m, d, _, _ in MARKS),
        "{{LABELS}}": labels, "{{CAPTIONS}}": caps, "{{END_START}}": str(END_START), "{{END_DUR}}": str(END_DUR),
        "{{BGM_AUTOMATION}}": bgm(), "{{VO}}": vo, "{{POPS}}": pops, "{{TAPS}}": json.dumps(taps),
        "{{CAM_JS}}": cam_js, "{{MARKS_JS}}": marks_js,
    }
    html = (ROOT / "tools/index.template.html").read_text()
    for k, v in reps.items():
        html = html.replace(k, v)
    (ROOT / "index.html").write_text(html)
    print("total", TOTAL)
    for b in BEATS:
        print(b["id"], b["t0"], b["dur"])
    for m in MARKS:
        print(m[0], round(m[2], 2), round(m[3], 2))


if __name__ == "__main__":
    build()
