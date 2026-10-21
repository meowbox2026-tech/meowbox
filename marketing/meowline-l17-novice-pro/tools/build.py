"""Generates index.html for the level-17 novice vs expert promo.

Engine facts (planningEngine, level 17): twelve blue cats in total. Same first 13 placements.
Novice puts the last blue at (3,3) under the blue column (3,0..2) -> a 4-line; blues (5,4),(7,4)
are never completed -> 12 waves, 2 left. Expert puts it in the gap (6,4) -> (5,4),(6,4),(7,4) is
the 13th and final wave, all clear.
Run: python3 tools/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
NOV, EXP = "assets/footage/l17n.mp4", "assets/footage/l17e.mp4"
TAPS = {NOV: json.loads((ROOT / "assets/footage/l17n.taps.json").read_text()),
        EXP: json.loads((ROOT / "assets/footage/l17e.taps.json").read_text())}
VO_DUR = {"v01": 3.14, "v02": 2.54, "v03": 5.43, "v04": 2.94, "v05": 5.28, "v06": 3.75,
          "v07": 4.14, "v08": 4.96}


def cell(x, y):
    return 120 + 121 * x, 504 + 121 * y


BEATS = [
    {"id": "hook", "kind": "split", "dur": 3.6, "vo": ("v01", 0.15)},
    {"id": "s1", "kind": "full", "src": EXP, "m": (0.9, 8.6, 2.6), "vo": ("v02", 0.2)},
    {"id": "n1", "kind": "full", "src": NOV, "m": (8.6, 8.95, 0.09), "vo": ("v03", 0.1)},
    {"id": "n1b", "kind": "full", "src": NOV, "m": (8.95, 9.15, 0.12)},
    {"id": "n2", "kind": "full", "src": NOV, "m": (9.15, 16.9, 1.6)},
    {"id": "n3", "kind": "full", "src": NOV, "m": (16.9, 17.3, 0.12), "vo": ("v04", -1.2)},
    {"id": "e1", "kind": "full", "src": EXP, "m": (8.6, 8.95, 0.09), "vo": ("v05", 0.1)},
    {"id": "e1b", "kind": "full", "src": EXP, "m": (8.95, 9.15, 0.12)},
    {"id": "e2", "kind": "full", "src": EXP, "m": (9.15, 17.2, 1.6), "vo": ("v06", 3.4)},
    {"id": "e3", "kind": "full", "src": EXP, "m": (17.2, 18.0, 0.35)},
    {"id": "why", "kind": "split", "dur": 5.4, "vo": ("v07", 0.3), "why": True},
    {"id": "end", "kind": "end", "dur": 6.0, "vo": ("v08", 0.4)},
]
t = 0.0
for b in BEATS:
    if b["kind"] == "full":
        m0, m1, rate = b["m"]
        b["dur"] = round((m1 - m0) / rate, 3)
    b["t0"] = round(t, 3)
    t += b["dur"]
TOTAL = round(t, 2)
AT = {b["id"]: b["t0"] for b in BEATS}
VO_AT = {b["vo"][0]: round(b["t0"] + b["vo"][1], 3) for b in BEATS if "vo" in b}


def comp(src, media_t):
    for b in BEATS:
        if b["kind"] == "full" and b["src"] == src:
            m0, m1, rate = b["m"]
            if m0 <= media_t < m1:
                return round(b["t0"] + (media_t - m0) / rate, 3)
    return None


TAP_N_LAST = comp(NOV, TAPS[NOV][-1]["t"])
TAP_E_LAST = comp(EXP, TAPS[EXP][-1]["t"])

CAPTIONS = [
    (VO_AT["v01"], AT["s1"], "第 17 關，新手跟老手<br>只差最後一隻貓"),
    (VO_AT["v02"], AT["n1"], "前面 13 隻<br>兩個人放得一模一樣"),
    (VO_AT["v03"], TAP_N_LAST - 0.2, "最後一隻藍貓<br>新手：接在這排下面"),
    (TAP_N_LAST - 0.2, AT["n2"] + 0.3, "湊成 4 隻一排<br>看起來超順"),
    (VO_AT["v04"], AT["e1"], "連鎖 <span class='hi'>12</span> 次<br>還是剩這兩隻藍貓"),
    (VO_AT["v05"], TAP_E_LAST - 0.4, "老手：右邊兩隻藍貓<br>中間剛好缺一格"),
    (TAP_E_LAST - 0.4, AT["e2"] + 0.3, "最後一隻，塞進去"),
    (VO_AT["v06"], AT["why"], "最後一下剛好就是這三隻<br><span class='hi'>13</span> 連鎖，全部清光"),
    (VO_AT["v07"], VO_AT["v07"] + 2.1, "藍貓要剛好 3 隻一組"),
    (VO_AT["v07"] + 2.1, AT["end"], "湊成 4 連<br>右邊兩隻就少了一個伴"),
]
LABELS = [("lbl-s", AT["s1"], AT["n1"], "▶▶ 前 13 隻一樣", "ink"), ("lbl-n", AT["n1"], AT["e1"], "新手", "novice"),
          ("lbl-e", AT["e1"], AT["why"], "老手", "pro")]


def cam(at, s, focus, target, dur):
    tx = min(0, max(1080 - 1080 * s, target[0] - s * focus[0]))
    ty = min(0, max(1920 - 1920 * s, target[1] - s * focus[1]))
    return (round(at, 3), s, round(tx, 1), round(ty, 1), round(dur, 3))


FULL = ((540, 960), (540, 960))
ZONE = ((700, 760), (540, 820))
CAMS = {
    "camE": [cam(AT["s1"], 1.0, *FULL, 0.01), cam(AT["e1"], 1.0, *FULL, 0.01), cam(AT["e1"] + 0.3, 1.45, *ZONE, 1.0),
             cam(AT["e2"] + 0.3, 1.0, *FULL, 0.6), cam(AT["e3"], 1.6, cell(6, 4), (540, 900), 0.5)],
    "camN": [cam(AT["n1"], 1.0, *FULL, 0.01), cam(AT["n1"] + 0.3, 1.45, *ZONE, 1.0),
             cam(AT["n2"] + 0.3, 1.0, *FULL, 0.6), cam(AT["n3"], 1.6, cell(6, 4), (540, 900), 0.5)],
}


def oval(cx, cy, w, h=88):
    return (f"M {cx - w} {cy - 10} C {cx - w} {cy - h}, {cx + w - 25} {cy - h - 6}, {cx + w} {cy - 10} "
            f"C {cx + w + 12} {cy + h - 18}, {cx - 96} {cy + h + 4}, {cx - w + 10} {cy + 40} "
            f"C {cx - w - 15} {cy + 10}, {cx - w + 15} {cy - h + 18}, {cx - w + 80} {cy - h + 6}")


def circle(cx, cy, r=70):
    return (f"M {cx - r} {cy - 10} C {cx - r} {cy - r}, {cx + r} {cy - r - 6}, {cx + r + 2} {cy} "
            f"C {cx + r} {cy + r}, {cx - r + 10} {cy + r + 4}, {cx - r - 4} {cy + 8} "
            f"C {cx - r - 6} {cy - 30}, {cx - 20} {cy - r - 8}, {cx + 10} {cy - r - 6}")


def line(a, b, ext=70):
    (x1, y1), (x2, y2) = a, b
    dx, dy = x2 - x1, y2 - y1
    n = (dx * dx + dy * dy) ** 0.5
    ux, uy = dx / n * ext, dy / n * ext
    return f"M {x1 - ux} {y1 - uy} C {x1 + dx * 0.3} {y1 + dy * 0.3 + 6}, {x1 + dx * 0.7} {y1 + dy * 0.7 - 6}, {x2 + ux} {y2 + uy}"


def vring(cx, y0, y1, w=78):
    """Tall hand-drawn loop around a vertical run of cells."""
    return (f"M {cx - 10} {y0 - w} C {cx + w} {y0 - w - 6}, {cx + w + 8} {y1 - 40}, {cx + w - 6} {y1 + 20} "
            f"C {cx + w - 14} {y1 + w}, {cx - w} {y1 + w + 6}, {cx - w - 4} {y1} "
            f"C {cx - w - 10} {y0 + 60}, {cx - w + 6} {y0 - w + 10}, {cx + 30} {y0 - w - 4}")


COL4 = vring(cell(3, 0)[0], cell(3, 0)[1], cell(3, 3)[1])
COL3 = vring(cell(3, 0)[0], cell(3, 0)[1], cell(3, 2)[1])
ROW = oval(cell(6, 4)[0], cell(6, 4)[1], 190)
LONE = [circle(*cell(5, 4)), circle(*cell(7, 4))]
MARKS = [
    ("m-col4", "camN", COL4, TAP_N_LAST + 0.35, AT["n2"] + 0.4),
    ("m-lone1", "camN", LONE[0], AT["n3"] + 0.6, AT["e1"]),
    ("m-lone2", "camN", LONE[1], AT["n3"] + 0.9, AT["e1"]),
    ("m-gap", "camE", ROW, AT["e1"] + 1.9, AT["e2"] + 0.4),
    ("m-final", "camE", ROW, AT["e3"] + 0.4, AT["why"]),
]
WHY_MARKS = [
    ("w-col4", "l", COL4, 0.9), ("w-lone1", "l", LONE[0], 1.5), ("w-lone2", "l", LONE[1], 1.7),
    ("w-col3", "r", COL3, 0.9), ("w-row", "r", ROW, 1.5),
]


def video(vid, src, start, dur, m0, rate, track):
    r = "" if rate == 1 else f' data-playback-rate="{rate}"'
    return (f'<video id="{vid}" src="{src}" data-start="{start}" data-duration="{dur}" '
            f'data-media-start="{m0}"{r} data-track-index="{track}" playsinline muted></video>')


def cam_block(cam_id, src, track):
    vids = "\n        ".join(video(f"{b['id']}-v", src, b["t0"], b["dur"], b["m"][0], b["m"][2], track)
                             for b in BEATS if b["kind"] == "full" and b["src"] == src)
    paths = "\n          ".join(f'<path id="{m}" pathLength="1" d="{d}" />' for m, c, d, _, _ in MARKS if c == cam_id)
    tap = "tapN" if cam_id == "camN" else "tapE"
    return (f'<div class="cam" id="{cam_id}">\n        {vids}\n'
            f'        <svg class="mark" viewBox="0 0 1080 1920" aria-hidden="true">\n          {paths}\n        </svg>\n'
            f'        <div class="tap" id="{tap}"><div class="tap-ring" id="{tap}-ring"></div><div class="tap-dot" id="{tap}-dot"></div></div>\n      </div>')


def split_blocks():
    out = []
    for b in BEATS:
        if b["kind"] != "split":
            continue
        win = f'{b["t0"]},{round(b["t0"] + b["dur"], 3)}'
        stats = ""
        if b.get("why"):
            stats = ('<span class="stat sl">4 連 ＋ <b>落單 2 隻</b></span>'
                     '<span class="stat sr">3 ＋ 3 <b>剛剛好</b></span>')
        panels = []
        for side in ("l", "r"):
            marks = ""
            if b.get("why"):
                marks = ('<svg class="mark" viewBox="0 0 1080 1920" aria-hidden="true">'
                         + "".join(f'<path id="{mid}" pathLength="1" d="{d}" />' for mid, s, d, _ in WHY_MARKS if s == side)
                         + "</svg>")
            still = f'assets/stills/{b["id"]}-{side}.jpg'
            panels.append(f'      <div class="panel {side}" data-win="{win}"><div class="screen">'
                          f'<img src="{still}" alt="" />{marks}</div></div>')
        out.append(f'<div id="{b["id"]}" class="clip split" data-start="{b["t0"]}" data-duration="{b["dur"]}" data-track-index="2">\n'
                   f'        <span class="split-lbl l">新手</span><span class="split-lbl r">老手</span>\n        {stats}\n      </div>\n'
                   + "\n".join(panels))
    return "\n      ".join(out)


def html_lists():
    caps = "\n".join(
        f'      <div id="c{i:02d}" class="clip" data-start="{round(a, 3)}" data-duration="{round(e - a, 3)}" data-track-index="3">'
        f'<div class="cap"><span>{txt}</span></div></div>' for i, (a, e, txt) in enumerate(CAPTIONS))
    labels = "\n".join(
        f'      <div id="{lid}" class="clip" data-start="{a}" data-duration="{round(e - a, 3)}" data-track-index="4">'
        f'<span class="who {tone}">{txt}</span></div>' for lid, a, e, txt, tone in LABELS)
    vo = "\n".join(
        f'      <audio id="vo-{vid}" src="assets/vo/{vid}.wav" data-start="{at}" data-duration="{VO_DUR[vid]}" '
        f'data-volume="1" data-track-index="{20 + i}"></audio>' for i, (vid, at) in enumerate(VO_AT.items()))
    taps = [TAP_N_LAST, TAP_E_LAST]
    pops = "\n".join(
        f'      <audio id="pop{i}" src="assets/audio/andressamd-pop-click-576326.mp3" data-start="{tp}" '
        f'data-duration="0.35" data-volume="0.7" data-track-index="{12 + i}"></audio>' for i, tp in enumerate(taps))
    return caps, labels, vo, pops


def js():
    lines = []
    for cid, moves in CAMS.items():
        lines.append(f'tl.set("#{cid}", {{ transformOrigin: "0 0", x: 0, y: 0, scale: 1 }}, 0);')
        for at, s, x, y, dur in moves:
            ease = "none" if dur > 2 else "power2.inOut"
            lines.append(f'tl.to("#{cid}", {{ scale: {s}, x: {x}, y: {y}, duration: {dur}, ease: "{ease}" }}, {at});')
    # Each camera only shows during its own beats.
    for cid, src in (("camN", NOV), ("camE", EXP)):
        lines.append(f'tl.set("#{cid}", {{ opacity: 0 }}, 0);')
        for b in BEATS:
            if b["kind"] == "full" and b["src"] == src:
                lines.append(f'tl.set("#{cid}", {{ opacity: 1 }}, {b["t0"]});')
                lines.append(f'tl.set("#{cid}", {{ opacity: 0 }}, {round(b["t0"] + b["dur"], 3)});')
    marks = [(m, d, h) for m, _, _, d, h in MARKS]
    marks += [(m, AT["why"] + d, AT["end"]) for m, _, _, d in WHY_MARKS]
    for mid, draw, hide in marks:
        lines += [f'tl.set("#{mid}", {{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}, 0);',
                  f'tl.set("#{mid}", {{ opacity: 1 }}, {round(draw, 3)});',
                  f'tl.to("#{mid}", {{ strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" }}, {round(draw, 3)});',
                  f'tl.to("#{mid}", {{ opacity: 0, duration: 0.12, ease: "none" }}, {round(hide - 0.12, 3)});']
    return "\n      ".join(lines)


def tap_list(src):
    return json.dumps([{"t": c, "x": tp["x"], "y": tp["y"]} for tp in TAPS[src] if (c := comp(src, tp["t"])) is not None])


def build():
    caps, labels, vo, pops = html_lists()
    reps = {
        "{{COMP_ID}}": "main", "{{TOTAL}}": str(TOTAL),
        "{{CAM_N}}": cam_block("camN", NOV, 0), "{{CAM_E}}": cam_block("camE", EXP, 1),
        "{{SPLITS}}": split_blocks(), "{{CAPTIONS}}": caps, "{{LABELS}}": labels,
        "{{END_START}}": str(AT["end"]), "{{END_DUR}}": str(BEATS[-1]["dur"]),
        "{{BGM_AUTOMATION}}": json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [
            {"t": 0, "v": 0.3}, {"t": round(TOTAL - 1.2, 2), "v": 0.3}, {"t": TOTAL, "v": 0}]}]}),
        "{{VO}}": vo, "{{POPS}}": pops, "{{TAPS_N}}": tap_list(NOV), "{{TAPS_E}}": tap_list(EXP), "{{JS}}": js(),
    }
    html = (ROOT / "tools/index.template.html").read_text()
    for k, v in reps.items():
        html = html.replace(k, v)
    (ROOT / "index.html").write_text(html)
    print("total", TOTAL)
    for b in BEATS:
        print(b["id"], b["t0"], b["dur"])


if __name__ == "__main__":
    build()
