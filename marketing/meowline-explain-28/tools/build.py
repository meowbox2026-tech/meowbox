"""Generates index.html for the level-28 explainer ("關卡解說 #28").

All timings live here so footage segments, tap cursor, camera, marker strokes,
section labels, captions and voiceover stay in sync. Run: python3 tools/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
SOURCES = {
    "A": "assets/footage/l28slow.mp4",  # official solution
    "B": "assets/footage/l28miss.mp4",  # last blue in the corner: 1 cat left
}
TAPS = {src: json.loads((ROOT / path.replace(".mp4", ".taps.json")).read_text()) for src, path in SOURCES.items()}


def cell(x, y):
    """Centre of board cell (x, y) in the 1080x1920 footage frame."""
    return 120 + 121 * x, 504 + 121 * y


def rate_for(m0, m1, dur):
    return round((m1 - m0) / dur, 4)


# (source, media_start, media_end, playback_rate): laid end to end from t=0.
SEGMENTS = [
    ("A", 13.00, 16.30, 1.0),                    # 0 hook: cascade opening
    ("A", 0.30, 0.90, 0.15),                     # 1 title over the untouched board
    ("A", 0.90, 1.80, rate_for(0.9, 1.8, 2.9)),  # 2 point 1: approach tap 1
    ("A", 1.80, 2.42, rate_for(1.8, 2.42, 3.65)),# 3 point 1: hold on tap 1
    ("A", 2.42, 3.15, 0.70),                     # 4 point 2: taps 2 and 3
    ("A", 3.15, 3.40, rate_for(3.15, 3.4, 10.7)),# 5 point 2: hold on the white row
    ("A", 3.40, 11.30, 1.60),                    # 6 middle placements
    ("A", 11.30, 12.70, 0.60),                   # 7 point 3: thinking pause
    ("A", 12.70, 12.95, 0.35),                   # 8 point 3: tap 18
    ("A", 12.95, 13.00, rate_for(12.95, 13.0, 2.42)),  # 9 hold on the blue row
    ("B", 12.30, 13.10, 0.50),                   # 10 mistake: last blue to the corner
    ("B", 13.10, 22.00, 3.00),                   # 11 mistake: cascade at 3x
    ("B", 22.00, 22.90, rate_for(22.0, 22.9, 2.43)),   # 12 mistake: one cat left
    ("A", 13.00, 20.30, 1.50),                   # 13 correct: cascade
    ("A", 20.30, 21.30, 0.40),                   # 14 correct: final wave slow
    ("A", 22.00, 23.50, 0.66),                   # 15 result screen
]

TIMELINE = []
_t = 0.0
for src, m0, m1, rate in SEGMENTS:
    dur = round((m1 - m0) / rate, 3)
    TIMELINE.append({"src": src, "t0": round(_t, 3), "dur": dur, "m0": m0, "m1": m1, "rate": rate})
    _t += dur
FOOTAGE_END = round(_t, 3)
CARD_DUR = 9.6
TOTAL = round(FOOTAGE_END + CARD_DUR, 2)


def S(i):
    return TIMELINE[i]["t0"]


def to_comp(src, media_t):
    """First composition time showing media_t of src (taps only appear once)."""
    for s in TIMELINE:
        if s["src"] == src and s["m0"] <= media_t < s["m1"] and s["rate"] < 2:
            return round(s["t0"] + (media_t - s["m0"]) / s["rate"], 3)
    return None


VO_DUR = {"e01": 3.05, "e02": 3.65, "e03": 6.24, "e04": 5.28, "e05": 5.83, "e06": 4.08,
          "e07": 5.14, "e08": 4.06, "e09": 4.65, "e10": 4.45, "e11": 3.41}
CARD = FOOTAGE_END
VO = {
    "e01": S(0) + 0.1, "e02": S(1) + 0.1, "e03": S(2) + 0.1, "e04": S(4) + 0.15,
    "e05": S(5) + 4.6, "e06": S(6) + 0.1, "e07": S(7) + 0.06, "e08": S(10) + 0.5,
    "e09": S(13) + 2.6, "e10": CARD + 0.35, "e11": CARD + 5.2,
}

CAPTIONS = [
    (VO["e01"], S(1), "第 28 關，<span class='hi'>13</span> 連鎖全清<br>怎麼做到的？"),
    (VO["e02"], S(2), "關卡解說<br>三個重點，一次講完"),
    (VO["e03"], VO["e03"] + 2.1, "第一個重點：找引爆點"),
    (VO["e03"] + 2.1, VO["e03"] + 3.9, "第一隻咖啡貓，放這裡"),
    (VO["e03"] + 3.9, S(4), "斜斜連成一條<br>結算一開始就會先消"),
    (VO["e04"], VO["e04"] + 2.4, "第二個重點<br>連好的排，可以先留著"),
    (VO["e04"] + 2.4, VO["e05"], "白貓放中間<br>三隻已經連成一排"),
    (VO["e05"], VO["e05"] + 3.0, "結算時一次只消一組<br>剛掉下來接上的先消"),
    (VO["e05"] + 3.0, S(6), "所以這排<br>會一路被往後排"),
    (VO["e06"], S(7), "中間照順序放<br>先想消掉以後貓會掉到哪"),
    (VO["e07"], VO["e07"] + 2.1, "第三個重點<br>最後一隻藍貓"),
    (VO["e07"] + 2.1, S(10), "要補在這裡<br>下面整排藍貓才會接起來"),
    (VO["e08"], VO["e08"] + 1.9, "如果把它丟到角落呢？"),
    (VO["e08"] + 1.9, S(13), "前面一樣一路連<br>最後就剩這一隻"),
    (VO["e09"], VO["e09"] + 1.0, "放對的話"),
    (VO["e09"] + 1.0, VO["e09"] + 3.6, "最後一波<br>就是剛剛那排白貓"),
    (VO["e09"] + 3.6, CARD, "<span class='hi'>13</span> 連鎖，全清"),
]

# Section labels above the captions: (start, end, text, tone).
SECTIONS = [
    (S(2), S(4), "重點 1｜找引爆點", ""),
    (S(4), S(6), "重點 2｜連好的排先留著", ""),
    (S(7), S(10), "重點 3｜最後一隻補完整排", ""),
    (S(10), S(13), "錯誤示範", "bad"),
    (S(13), S(15), "正確解法", "good"),
]

# Camera: (time, scale, focus point in footage, screen target, duration).
CAM = [
    (S(0), 1.05, (540, 940), (540, 960), S(1) - 0.1),
    (S(1), 1.0, (540, 960), (540, 960), 0.3),
    (S(2), 1.9, cell(5, 4), (540, 860), 0.7),
    (S(4), 1.9, cell(2, 4), (540, 860), 0.6),
    (S(4) + 0.7, 2.0, cell(2, 4), (540, 860), S(6) - S(4) - 0.8),
    (S(6), 1.0, (540, 960), (540, 960), 0.6),
    (S(7), 1.6, cell(4, 6), (540, 900), 0.7),
    (S(10), 1.5, cell(6, 6), (540, 900), 0.5),
    (S(11), 1.0, (540, 960), (540, 960), 0.4),
    (S(12), 1.9, cell(7, 7), (700, 1000), 0.5),
    (S(13), 1.0, (540, 960), (540, 960), 0.5),
    (S(14), 1.9, cell(2, 7), (540, 1000), 0.6),
    (S(15), 1.0, (540, 960), (540, 960), 0.5),
]


def oval(cx, cy, half_w):
    """Hand-drawn oval around a horizontal run of cells centred on (cx, cy)."""
    w = half_w
    return (f"M {cx - w} {cy - 10} C {cx - w} {cy - 90}, {cx + w - 25} {cy - 96}, {cx + w} {cy - 10} "
            f"C {cx + w + 12} {cy + 70}, {cx - 96} {cy + 92}, {cx - w + 10} {cy + 40} "
            f"C {cx - w - 15} {cy + 10}, {cx - w + 15} {cy - 70}, {cx - w + 80} {cy - 82}")


x1, y1 = cell(6, 3); x2, y2 = cell(4, 5)
rx0, ry = cell(2, 6); rx1, _ = cell(6, 6)
MARKS = [
    ("m-diag", f"M {x1 + 70} {y1 - 70} C {x1 - 20} {y1 + 30}, {x2 + 40} {y2 - 50}, {x2 - 72} {y2 + 66}",
     VO["e03"] + 4.0, S(4)),
    ("m-white", oval(*cell(2, 4), 200), VO["e04"] + 2.6, S(6)),
    ("m-row", f"M {rx0 - 70} {ry + 72} C {rx0 + 120} {ry + 60}, {rx1 - 100} {ry + 64}, {rx1 + 70} {ry + 56}",
     S(9) + 0.3, S(10)),
    ("m-miss", oval(*cell(7, 7), 85), S(12) + 0.15, S(13)),
    ("m-final", oval(*cell(2, 7), 250), S(14) + 0.15, S(15)),
]

TAP_TIMES = []
for src, taps in TAPS.items():
    for i, tp in enumerate(taps):
        if src == "B" and i != len(taps) - 1:
            continue
        t = to_comp(src, tp["t"])
        if t is not None:
            TAP_TIMES.append({"t": t, "x": tp["x"], "y": tp["y"]})
TAP_TIMES.sort(key=lambda tp: tp["t"])
POP_TAPS = [tp for tp in TAP_TIMES if tp["t"] < S(6) or tp["t"] > S(7)]


def video_tags():
    out = []
    for i, s in enumerate(TIMELINE):
        rate = "" if s["rate"] == 1 else f' data-playback-rate="{s["rate"]}"'
        out.append(f'        <video id="seg{i:02d}" src="{SOURCES[s["src"]]}" data-start="{s["t0"]}" data-duration="{s["dur"]}" '
                   f'data-media-start="{s["m0"]}"{rate} data-track-index="0" playsinline muted></video>')
    return "\n".join(out)


def timed_divs(prefix, items, track, inner):
    return "\n".join(
        f'      <div id="{prefix}{i:02d}" class="clip {prefix}" data-start="{round(a, 3)}" data-duration="{round(b - a, 3)}" '
        f'data-track-index="{track}">{inner(*rest)}</div>'
        for i, (a, b, *rest) in enumerate(items))


def vo_tags():
    return "\n".join(
        f'      <audio id="vo-{vid}" src="assets/vo/{vid}.wav" data-start="{round(at, 3)}" data-duration="{VO_DUR[vid]}" '
        f'data-volume="1" data-track-index="{20 + i}"></audio>'
        for i, (vid, at) in enumerate(VO.items()))


def pop_tags():
    return "\n".join(
        f'      <audio id="pop{i}" src="assets/audio/andressamd-pop-click-576326.mp3" data-start="{tp["t"]}" '
        f'data-duration="0.35" data-volume="0.6" data-track-index="{40 + i}"></audio>'
        for i, tp in enumerate(POP_TAPS))


def bgm_automation():
    low, high = 0.28, 0.55
    pts = [{"t": 0, "v": low},
           {"t": round(S(12) + 0.3, 2), "v": low}, {"t": round(S(13), 2), "v": high},
           {"t": round(VO["e09"] - 0.3, 2), "v": high}, {"t": round(VO["e09"], 2), "v": low},
           {"t": round(TOTAL - 1.2, 2), "v": low}, {"t": TOTAL, "v": 0}]
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": pts}]})


def cam_js():
    lines = ['tl.set("#cam", { transformOrigin: "0 0", x: 0, y: 0, scale: 1 }, 0);']
    for at, s, (fx, fy), (txp, typ), dur in CAM:
        tx = min(0, max(1080 - 1080 * s, txp - s * fx))
        ty = min(0, max(1920 - 1920 * s, typ - s * fy))
        ease = "none" if dur > 2 else "power2.inOut"
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


def card_cues():
    """Recap lines land with the voiceover; the CTA block lands with e11."""
    e10 = VO["e10"]
    return json.dumps({"p1": round(e10 + 1.3, 2), "p2": round(e10 + 2.3, 2), "p3": round(e10 + 3.3, 2),
                       "cta": round(VO["e11"] - 0.2, 2)})


def build():
    tpl = (ROOT / "tools/index.template.html").read_text()
    html = (tpl.replace("{{COMP_ID}}", "main")
            .replace("{{TOTAL}}", str(TOTAL))
            .replace("{{VIDEOS}}", video_tags())
            .replace("{{MARK_PATHS}}", "\n".join(
                f'          <path id="{mid}" pathLength="1" d="{d}" />' for mid, d, _, _ in MARKS))
            .replace("{{SECTIONS}}", timed_divs("sec", SECTIONS, 2,
                                                lambda txt, tone: f'<div class="sec-box"><span class="{tone}">{txt}</span></div>'))
            .replace("{{CAPTIONS}}", timed_divs("cap", CAPTIONS, 3,
                                                lambda txt: f'<div class="cap-box"><span>{txt}</span></div>'))
            .replace("{{FOOTAGE_END}}", str(FOOTAGE_END))
            .replace("{{SERIES_IN}}", str(S(1)))
            .replace("{{CARD_START}}", str(CARD))
            .replace("{{CARD_DUR}}", str(CARD_DUR))
            .replace("{{CARD_CUES}}", card_cues())
            .replace("{{BGM_AUTOMATION}}", bgm_automation())
            .replace("{{VO}}", vo_tags())
            .replace("{{POPS}}", pop_tags())
            .replace("{{TAPS}}", json.dumps(TAP_TIMES))
            .replace("{{CAM_JS}}", cam_js())
            .replace("{{MARKS_JS}}", marks_js()))
    (ROOT / "index.html").write_text(html)
    print("total", TOTAL, "footage end", FOOTAGE_END)
    for i, s in enumerate(TIMELINE):
        print(i, s)
    print("vo", {k: round(v, 2) for k, v in VO.items()})


if __name__ == "__main__":
    build()
