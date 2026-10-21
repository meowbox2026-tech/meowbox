"""Generates index.html for the level-28 novice vs expert promo.

All timing lives here: footage segments, split screens, camera, markers, captions,
voiceover and tap cursors. Run: python3 tools/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
NOVICE = "assets/footage/n28.mp4"
EXPERT = "assets/footage/l28slow.mp4"
TAPS = {
    NOVICE: json.loads((ROOT / "assets/footage/n28.taps.json").read_text()),
    EXPERT: json.loads((ROOT / "assets/footage/l28slow.taps.json").read_text()),
}
VO_DUR = {"v01": 3.68, "v02": 5.27, "v03": 1.75, "v04": 6.21, "v05": 3.52, "v06": 2.59,
          "v07": 2.32, "v08": 2.10, "v09": 1.60, "v10": 3.31, "v11": 4.93}


def cell(x, y):
    """Centre of board cell (x, y) in the 1080x1920 footage frame."""
    return 120 + 121 * x, 504 + 121 * y


# Beats in order. kind: "full" (one source in its camera layer) or "split" (both sources).
BEATS = [
    {"id": "hook", "kind": "split", "dur": 4.0, "left": (12.20, 0.025), "right": (21.50, 0.025),
     "vo": ("v01", 0.2), "stats": False},
    {"id": "n1", "kind": "full", "src": NOVICE, "m": (1.0, 7.9, 1.3), "vo": ("v02", 0.1)},
    {"id": "n2", "kind": "full", "src": NOVICE, "m": (7.9, 12.4, 1.0), "vo": ("v03", 2.6)},
    {"id": "n3", "kind": "full", "src": NOVICE, "m": (12.4, 12.9, 0.075), "vo": ("v04", 0.2)},
    {"id": "e1", "kind": "full", "src": EXPERT, "m": (0.3, 1.7, 0.36), "vo": ("v05", 0.15)},
    {"id": "e2", "kind": "full", "src": EXPERT, "m": (1.7, 2.42, 0.26), "vo": ("v06", 0.1)},
    {"id": "e3", "kind": "full", "src": EXPERT, "m": (2.42, 3.15, 0.7)},
    {"id": "e3b", "kind": "full", "src": EXPERT, "m": (3.15, 3.4, 0.1), "vo": ("v07", 0.1)},
    {"id": "e4", "kind": "full", "src": EXPERT, "m": (3.4, 12.95, 2.2)},
    {"id": "e5", "kind": "full", "src": EXPERT, "m": (12.95, 21.3, 1.3), "vo": ("v08", 1.0)},
    {"id": "e6", "kind": "full", "src": EXPERT, "m": (22.0, 23.6, 0.6), "vo": ("v09", 0.3)},
    {"id": "cmp", "kind": "split", "dur": 4.2, "left": (14.0, 0.025), "right": (23.6, 0.025),
     "vo": ("v10", 0.2), "stats": True},
    {"id": "end", "kind": "end", "dur": 5.8, "vo": ("v11", 0.3)},
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
DUR = {b["id"]: b["dur"] for b in BEATS}
VO_AT = {b["vo"][0]: round(b["t0"] + b["vo"][1], 3) for b in BEATS if "vo" in b}


def to_comp(src, media_t):
    for b in BEATS:
        if b["kind"] == "full" and b["src"] == src:
            m0, m1, rate = b["m"]
            if m0 <= media_t < m1:
                return round(b["t0"] + (media_t - m0) / rate, 3)
    return None


CAPTIONS = [
    (VO_AT["v01"], AT["n1"], "同樣是第 28 關<br>新手跟老手差這麼多"),
    (VO_AT["v02"], VO_AT["v02"] + 2.6, "新手的直覺：<br>看到同色，就先湊成一排"),
    (VO_AT["v02"] + 2.6, AT["n2"] + 2.5, "放完看起來<br>到處都連好了"),
    (VO_AT["v03"], AT["n3"], "結果，連鎖 7 次就停了"),
    (VO_AT["v04"], VO_AT["v04"] + 1.3, "還剩 <span class='hi'>12</span> 隻"),
    (VO_AT["v04"] + 1.3, AT["e1"], "一次只消一組，貓往下掉<br>湊好的排就散了"),
    (VO_AT["v05"], AT["e2"], "老手先想：消完以後<br>上面的貓會掉到哪"),
    (VO_AT["v06"], AT["e3"], "第一隻咖啡貓放這裡<br>當第一個引爆點"),
    (VO_AT["v07"], AT["e4"], "這排白貓<br>故意留到最後才消"),
    (VO_AT["v08"], VO_AT["v08"] + 2.6, "一直連，一直連，還沒停"),
    (VO_AT["v09"], AT["cmp"], "<span class='hi'>13</span> 連鎖，一隻不剩"),
    (VO_AT["v10"], AT["end"], "差別只在：有沒有先想好<br>貓會掉到哪"),
]
LABELS = [("lbl-n", AT["n1"], AT["e1"], "新手"), ("lbl-e", AT["e1"], AT["cmp"], "老手")]


def cam_moves(at, s, focus, target, dur):
    fx, fy = focus
    tx = min(0, max(1080 - 1080 * s, target[0] - s * fx))
    ty = min(0, max(1920 - 1920 * s, target[1] - s * fy))
    return {"at": round(at, 3), "s": s, "x": round(tx, 1), "y": round(ty, 1), "dur": round(dur, 3)}


CAMS = {
    "camN": [
        cam_moves(AT["n1"], 1.04, (540, 940), (540, 960), DUR["n1"] + DUR["n2"]),
        cam_moves(AT["n3"], 1.0, (540, 960), (540, 960), 0.5),
    ],
    "camE": [
        cam_moves(AT["e1"], 1.7, (540, 300), (540, 640), 0.01),
        cam_moves(AT["e1"] + 0.4, 1.0, (540, 960), (540, 960), DUR["e1"] - 0.6),
        cam_moves(AT["e2"], 1.9, cell(5, 4), (540, 860), 0.6),
        cam_moves(AT["e3"], 1.9, cell(2, 4), (540, 860), 0.6),
        cam_moves(AT["e4"], 1.0, (540, 960), (540, 960), 0.6),
        cam_moves(AT["e5"] + 0.6, 1.06, (540, 940), (540, 960), DUR["e5"] - 0.8),
        cam_moves(AT["e6"], 1.0, (540, 960), (540, 960), 0.4),
    ],
}

x1, y1 = cell(6, 3); x2, y2 = cell(4, 5)
cx, cy = cell(2, 4)
MARKS = [
    ("m-diag", f"M {x1 + 70} {y1 - 70} C {x1 - 20} {y1 + 30}, {x2 + 40} {y2 - 50}, {x2 - 72} {y2 + 66}",
     VO_AT["v06"] + 1.0, AT["e3"]),
    ("m-white", f"M {cx - 200} {cy - 10} C {cx - 200} {cy - 90}, {cx + 175} {cy - 96}, {cx + 200} {cy - 10} "
                f"C {cx + 212} {cy + 70}, {cx - 96} {cy + 92}, {cx - 190} {cy + 40} C {cx - 215} {cy + 10}, {cx - 185} {cy - 70}, {cx - 120} {cy - 82}",
     VO_AT["v07"] + 0.5, AT["e4"]),
]


def video(vid, src, start, dur, m0, rate, track):
    r = "" if rate == 1 else f' data-playback-rate="{rate}"'
    return (f'<video id="{vid}" src="{src}" data-start="{start}" data-duration="{dur}" '
            f'data-media-start="{m0}"{r} data-track-index="{track}" playsinline muted></video>')


def full_videos(src, track):
    return "\n        ".join(video(f"{b['id']}-v", src, b["t0"], b["dur"], b["m"][0], b["m"][2], track)
                             for b in BEATS if b["kind"] == "full" and b["src"] == src)


def split_blocks():
    out = []
    for b in BEATS:
        if b["kind"] != "split":
            continue
        stats = ""
        if b["stats"]:
            stats = ('<span class="stat sl" id="{0}-sl">連鎖 7 次<br><b>剩 12 隻</b></span>'
                     '<span class="stat sr" id="{0}-sr">連鎖 13 次<br><b>全部清光</b></span>').format(b["id"])
        win = f'{b["t0"]},{round(b["t0"] + b["dur"], 3)}'
        out.append(
            f'<div id="{b["id"]}" class="clip split" data-start="{b["t0"]}" data-duration="{b["dur"]}" data-track-index="2">\n'
            f'        <span class="split-lbl l">新手</span><span class="split-lbl r">老手</span>\n'
            f'        {stats}\n      </div>\n'
            f'      <div class="panel l" data-win="{win}">{video(b["id"] + "-l", NOVICE, b["t0"], b["dur"], b["left"][0], b["left"][1], 5)}</div>\n'
            f'      <div class="panel r" data-win="{win}">{video(b["id"] + "-r", EXPERT, b["t0"], b["dur"], b["right"][0], b["right"][1], 6)}</div>')
    return "\n      ".join(out)


def caption_tags():
    return "\n".join(
        f'      <div id="c{i:02d}" class="clip" data-start="{round(a, 3)}" data-duration="{round(b - a, 3)}" data-track-index="3">'
        f'<div class="cap"><span>{txt}</span></div></div>' for i, (a, b, txt) in enumerate(CAPTIONS))


def label_tags():
    return "\n".join(
        f'      <div id="{lid}" class="clip" data-start="{a}" data-duration="{round(b - a, 3)}" data-track-index="4">'
        f'<span class="who">{txt}示範</span></div>' for lid, a, b, txt in LABELS)


def vo_tags():
    return "\n".join(
        f'      <audio id="vo-{vid}" src="assets/vo/{vid}.wav" data-start="{at}" data-duration="{VO_DUR[vid]}" '
        f'data-volume="1" data-track-index="{20 + i}"></audio>' for i, (vid, at) in enumerate(VO_AT.items()))


def pop_tags():
    taps = [to_comp(NOVICE, TAPS[NOVICE][0]["t"]), to_comp(EXPERT, TAPS[EXPERT][0]["t"]),
            to_comp(EXPERT, TAPS[EXPERT][2]["t"]), to_comp(EXPERT, TAPS[EXPERT][17]["t"])]
    return "\n".join(
        f'      <audio id="pop{i}" src="assets/audio/andressamd-pop-click-576326.mp3" data-start="{t}" '
        f'data-duration="0.35" data-volume="0.7" data-track-index="{12 + i}"></audio>' for i, t in enumerate(taps) if t)


def bgm_automation():
    low, high = 0.3, 0.6
    pts = [{"t": 0, "v": low}, {"t": round(AT["e4"], 2), "v": low}, {"t": round(AT["e4"] + 0.3, 2), "v": high},
           {"t": round(VO_AT["v08"] - 0.3, 2), "v": high}, {"t": round(VO_AT["v08"], 2), "v": low},
           {"t": round(TOTAL - 1.2, 2), "v": low}, {"t": TOTAL, "v": 0}]
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": pts}]})


def js_cams():
    lines = []
    for cam, moves in CAMS.items():
        lines.append(f'tl.set("#{cam}", {{ transformOrigin: "0 0", x: 0, y: 0, scale: 1 }}, 0);')
        for m in moves:
            ease = "none" if m["dur"] > 2 else "power2.inOut"
            lines.append(f'tl.to("#{cam}", {{ scale: {m["s"]}, x: {m["x"]}, y: {m["y"]}, duration: {m["dur"]}, ease: "{ease}" }}, {m["at"]});')
    return "\n      ".join(lines)


def js_marks():
    lines = []
    for mid, _, draw, hide in MARKS:
        lines += [f'tl.set("#{mid}", {{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}, 0);',
                  f'tl.set("#{mid}", {{ opacity: 1 }}, {round(draw, 3)});',
                  f'tl.to("#{mid}", {{ strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" }}, {round(draw, 3)});',
                  f'tl.to("#{mid}", {{ opacity: 0, duration: 0.15, ease: "none" }}, {round(hide - 0.15, 3)});']
    return "\n      ".join(lines)


def tap_list(src):
    return json.dumps([{"t": c, "x": tp["x"], "y": tp["y"]} for tp in TAPS[src]
                       if (c := to_comp(src, tp["t"])) is not None])


def build():
    tpl = (ROOT / "tools/index.template.html").read_text()
    reps = {
        "{{COMP_ID}}": "main", "{{TOTAL}}": str(TOTAL),
        "{{NOVICE_VIDEOS}}": full_videos(NOVICE, 0), "{{EXPERT_VIDEOS}}": full_videos(EXPERT, 1),
        "{{NOVICE_START}}": str(AT["n1"]), "{{NOVICE_DUR}}": str(round(AT["e1"] - AT["n1"], 3)),
        "{{EXPERT_START}}": str(AT["e1"]), "{{EXPERT_DUR}}": str(round(AT["cmp"] - AT["e1"], 3)),
        "{{MARK_PATHS}}": "\n".join(f'          <path id="{m}" pathLength="1" d="{d}" />' for m, d, _, _ in MARKS),
        "{{SPLITS}}": split_blocks(), "{{CAPTIONS}}": caption_tags(), "{{LABELS}}": label_tags(),
        "{{END_START}}": str(AT["end"]), "{{END_DUR}}": str(DUR["end"]),
        "{{BGM_AUTOMATION}}": bgm_automation(), "{{VO}}": vo_tags(), "{{POPS}}": pop_tags(),
        "{{TAPS_N}}": tap_list(NOVICE), "{{TAPS_E}}": tap_list(EXPERT),
        "{{CAM_JS}}": js_cams(), "{{MARKS_JS}}": js_marks(),
        "{{CMP_START}}": str(AT["cmp"]),
    }
    html = tpl
    for k, v in reps.items():
        html = html.replace(k, v)
    (ROOT / "index.html").write_text(html)
    print("total", TOTAL)
    for b in BEATS:
        print(b["id"], b["t0"], b["dur"])


if __name__ == "__main__":
    build()
