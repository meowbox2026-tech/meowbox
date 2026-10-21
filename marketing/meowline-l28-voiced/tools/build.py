"""Generates index.html for the voiced level-28 promo.

Every timing lives here so footage segments, tap cursor, camera, marker strokes,
captions and voiceover stay in sync. Run: python3 tools/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
FOOTAGE = "assets/footage/l28slow.mp4"
TAPS = json.loads((ROOT / "assets/footage/l28slow.taps.json").read_text())


def cell(x, y):
    """Centre of board cell (x, y) in the 1080x1920 footage frame."""
    return 120 + 121 * x, 504 + 121 * y


# (media_start, media_end, playback_rate): laid end to end from t=0.
SEGMENTS = [
    (0.30, 0.94, 0.20),   # hook: board before the first tap
    (0.94, 1.30, 0.06),   # rules
    (1.30, 1.70, 0.066),  # tray / order
    (1.70, 1.85, 0.10),   # tap 1 (orange) in slow motion
    (1.85, 2.42, 0.10),   # hold on tap 1 while explaining
    (2.42, 3.15, 0.70),   # taps 2 and 3
    (3.15, 3.40, 0.045),  # hold on the white row
    (3.40, 11.30, 1.60),  # middle placements
    (11.30, 12.70, 0.70), # thinking pause before the last cat
    (12.70, 12.95, 0.35), # tap 18 (blue)
    (12.95, 13.00, 0.025),# hold: "好，開始！"
    (13.00, 20.30, 1.00), # cascade, real speed
    (20.30, 21.30, 0.40), # final wave in slow motion
    (22.00, 24.00, 0.66), # result screen
]

TIMELINE = []
t = 0.0
for m0, m1, rate in SEGMENTS:
    dur = round((m1 - m0) / rate, 3)
    TIMELINE.append({"t0": round(t, 3), "dur": dur, "m0": m0, "m1": m1, "rate": rate})
    t += dur
FOOTAGE_END = round(t, 3)
END_DUR = 5.6
TOTAL = round(FOOTAGE_END + END_DUR, 2)


def to_comp(media_t):
    for s in TIMELINE:
        if s["m0"] <= media_t < s["m1"]:
            return round(s["t0"] + (media_t - s["m0"]) / s["rate"], 3)
    return None


def seg_start(i):
    return TIMELINE[i]["t0"]


# Voiceover: (id, start, caption chunks [(start, end, text)]).
VO_DUR = {"v01": 2.81, "v02": 5.70, "v03": 5.88, "v04": 6.69, "v05": 5.67, "v06": 4.30,
          "v07": 4.67, "v08": 2.89, "v09": 2.29, "v10": 1.73, "v11": 4.55}
S = seg_start
VO = [
    ("v01", S(0) + 0.2),
    ("v02", S(1) + 0.1),
    ("v03", S(2) + 0.1),
    ("v04", S(3) + 0.1),
    ("v05", S(5) + 0.6),
    ("v06", S(7) + 0.2),
    ("v07", S(8) + 0.1),
    ("v08", S(11) + 0.35),
    ("v09", S(12) + 0.05),
    ("v10", S(13) + 0.45),
    ("v11", FOOTAGE_END + 0.35),
]
VO_AT = dict(VO)
CAPTIONS = [
    (VO_AT["v01"], VO_AT["v01"] + 1.4, "第 28 關，18 隻貓"),
    (VO_AT["v01"] + 1.4, S(1), "一隻都不能剩"),
    (VO_AT["v02"], VO_AT["v02"] + 3.3, "同一種貓<br>三隻連成一線就會消掉"),
    (VO_AT["v02"] + 3.3, S(2), "直的、橫的、斜的都可以"),
    (VO_AT["v03"], VO_AT["v03"] + 2.9, "貓要照上面的順序<br>全部放完"),
    (VO_AT["v03"] + 2.9, S(3), "才會一起結算<br>每一步都要先想好"),
    (VO_AT["v04"], VO_AT["v04"] + 2.0, "第一隻咖啡貓，我放這裡"),
    (VO_AT["v04"] + 2.0, S(5), "跟旁邊兩隻斜斜連成一條<br>等一下就是第一個引爆點"),
    (VO_AT["v05"], S(7), "白貓放中間，跟左右連成一排<br>但不會馬上消，先記住這排"),
    (VO_AT["v06"], S(8), "我一直在想：上面消掉以後<br>貓會掉到哪裡"),
    (VO_AT["v07"], VO_AT["v07"] + 3.0, "最後一隻藍貓補這裡<br>下面整排就接起來了"),
    (VO_AT["v07"] + 3.0, S(11), "好，開始！"),
    (VO_AT["v08"], VO_AT["v08"] + 3.1, "連起來了！一直連，還沒停！"),
    (VO_AT["v09"], S(13), "最後消掉的<br>就是剛剛那排白貓！"),
    (VO_AT["v10"], FOOTAGE_END, "<span class='hi'>13</span> 連鎖，全部清光"),
]

# Camera: (time, scale, focus point in footage, screen target). scale 1 = full frame.
CAM = [
    (0.0, 1.0, (540, 960), (540, 960), 0.0),
    (S(0), 1.06, (540, 940), (540, 960), S(1) - 0.2),
    (S(2), 1.7, (540, 300), (540, 640), 0.7),
    (S(3), 1.9, cell(5, 4), (540, 860), 0.7),
    (S(5), 1.9, cell(2, 4), (540, 860), 0.6),
    (S(7), 1.0, (540, 960), (540, 960), 0.6),
    (S(8), 1.6, cell(4, 6), (540, 900), 0.7),
    (S(11), 1.0, (540, 960), (540, 960), 0.6),
    (S(11) + 0.7, 1.06, (540, 940), (540, 960), S(12) - S(11) - 0.8),
    (S(12), 1.9, cell(2, 7), (540, 1000), 0.6),
    (S(13), 1.0, (540, 960), (540, 960), 0.5),
]

# Marker strokes drawn inside the camera layer: (id, path, draw_at, hide_at).
x1, y1 = cell(6, 3); x2, y2 = cell(4, 5)
cx2, cy2 = cell(2, 4)
rx0, ry = cell(2, 6); rx1, _ = cell(6, 6)
wx, wy = cell(2, 7)
MARKS = [
    ("m-diag", f"M {x1 + 70} {y1 - 70} C {x1 - 20} {y1 + 30}, {x2 + 40} {y2 - 50}, {x2 - 72} {y2 + 66}",
     VO_AT["v04"] + 2.3, S(5)),
    ("m-white", f"M {cx2 - 200} {cy2 - 10} C {cx2 - 200} {cy2 - 90}, {cx2 + 175} {cy2 - 96}, {cx2 + 200} {cy2 - 10} "
                f"C {cx2 + 212} {cy2 + 70}, {cx2 - 96} {cy2 + 92}, {cx2 - 190} {cy2 + 40} C {cx2 - 215} {cy2 + 10}, {cx2 - 185} {cy2 - 70}, {cx2 - 120} {cy2 - 82}",
     VO_AT["v05"] + 2.2, S(7)),
    ("m-row", f"M {rx0 - 70} {ry + 72} C {rx0 + 120} {ry + 60}, {rx1 - 100} {ry + 64}, {rx1 + 70} {ry + 56}",
     VO_AT["v07"] + 1.6, S(11)),
    ("m-final", f"M {wx - 250} {wy - 10} C {wx - 250} {wy - 90}, {wx + 220} {wy - 96}, {wx + 250} {wy - 10} "
                f"C {wx + 266} {wy + 70}, {wx - 120} {wy + 92}, {wx - 236} {wy + 40} C {wx - 270} {wy + 10}, {wx - 230} {wy - 70}, {wx - 150} {wy - 82}",
     S(12) + 0.15, S(13)),
]

# Tap cursor: footage taps mapped into composition time (only where readable).
TAP_TIMES = [{"t": to_comp(tp["t"]), "x": tp["x"], "y": tp["y"]} for tp in TAPS]
POP_TAPS = [TAP_TIMES[i] for i in (0, 1, 2, 17)]


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
    pts = [{"t": 0, "v": 0.32}]
    pts += [{"t": round(S(11) + 3.4, 2), "v": 0.32}, {"t": round(S(11) + 3.8, 2), "v": 0.6},
            {"t": round(S(12) - 0.2, 2), "v": 0.6}, {"t": round(S(12) + 0.1, 2), "v": 0.32},
            {"t": round(TOTAL - 1.2, 2), "v": 0.32}, {"t": TOTAL, "v": 0}]
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": pts}]})


def cam_js():
    lines = ['tl.set("#cam", { transformOrigin: "0 0", x: 0, y: 0, scale: 1 }, 0);']
    for at, s, (fx, fy), (txp, typ), dur in CAM[1:]:
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
    print("total", TOTAL, "footage end", FOOTAGE_END)
    for i, s in enumerate(TIMELINE):
        print(i, s)


if __name__ == "__main__":
    build()
