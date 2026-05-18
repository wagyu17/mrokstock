# -*- coding: utf-8 -*-
"""
TaCZ Machine Gun vs Warden Shorts v1

使い方:
    python scripts/make_mg_shorts.py          # フル出力
    python scripts/make_mg_shorts.py preview   # 半サイズ確認
    python scripts/make_mg_shorts.py regen     # ナレ強制再生成 + フル出力
"""

import asyncio, os, subprocess, sys

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW     = os.path.join(ROOT, "input", "raw")
SRC1    = os.path.join(RAW, "2026-05-18 00-46-50.mp4")   # M249
SRC2    = os.path.join(RAW, "2026-05-18 00-48-06.mp4")   # RPK
SRC3    = os.path.join(RAW, "2026-05-18 00-48-37.mp4")   # M134
SRC4    = os.path.join(RAW, "2026-05-18 00-49-01.mp4")   # FN EVOL YS
BGM     = os.path.join(ROOT, "input", "bgm", "Machine_Gun_Roll.mp3")
CTA_IMG = os.path.join(ROOT, "tmp", "cta_sniper_guide.png")
FONT    = "work/font.ttf"
NARR    = os.path.join(ROOT, "work", "voice", "mg_narr_v2.wav")
OUT     = os.path.join(ROOT, "output", "shorts", "tacz_shorts_004.mp4")
OUT_PRE = os.path.join(ROOT, "output", "preview", "mg_preview.mp4")

FFBIN  = (
    r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-8.1.1-full_build\bin"
)
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# ── クリップ設定 (SS=開始秒, DUR=使用秒数) ──────────────────
M249_SS, M249_DUR = 1.5, 13.0   # 0s はGame Menu
RPK_SS,  RPK_DUR  = 4.0, 11.0   # 0-4s はGame Menu
M134_SS, M134_DUR = 5.5, 10.0   # 0-5s はGame Menu+スポーン
EVOL_SS, EVOL_DUR = 5.5, 10.0   # 0-5s はGame Menu+スポーン

TOTAL_DUR = M249_DUR + RPK_DUR + M134_DUR + EVOL_DUR  # 44.0

# ── CTA ─────────────────────────────────────────────────────
CTA_START = TOTAL_DUR - 5.0   # 39.0 (ナレ被り回避)
CTA_END   = TOTAL_DUR          # 44.0
CTA_FADE  = 0.8

BGM_VOL   = 0.12
GAME_GAIN = "10dB"
NARR_GAIN = "4dB"

# ── キャンバス ───────────────────────────────────────────────
CANVAS_W, CANVAS_H = 1080, 1920
FG_W  = 1080
FG_H  = int(FG_W * 9 / 16)        # 607 → 608
FG_Y  = (CANVAS_H - FG_H) // 2    # 656
TITLE_Y = FG_Y - 90               # 566
CAP_Y   = min(FG_Y + FG_H + 25, CANVAS_H - 140)  # 689
CTA_W   = 960

TITLE_COLOR  = "0xFFE800"
TITLE_BORDER = "0xCC0000"
CAP_COLOR    = "white"
CAP_BORDER   = "0x000000"

# ── 字幕 (累積タイムライン) ─────────────────────────────────
_t1 = M249_DUR               # 14.0
_t2 = _t1 + RPK_DUR          # 26.0
_t3 = _t2 + M134_DUR         # 38.0

CAPTIONS = [
    (0.3,        _t1,             "work/captions/mg_c2.txt"),  # M249 — full auto
    (_t1,        _t2,             "work/captions/mg_c3.txt"),  # RPK — sustained fire
    (_t2,        _t3,             "work/captions/mg_c4.txt"),  # M134 — minigun
    (_t3,        CTA_START,       "work/captions/mg_c5.txt"),  # FN EVOL YS — heavy
    (CTA_START,  CTA_END - 0.5,   "work/captions/mg_c6.txt"),  # Full guide — link below
]

# ── ナレーション ────────────────────────────────────────────
VOICE      = "en-US-GuyNeural"
VOICE_RATE = "-8%"

NARR_SEGS = [
    (1,  0.3,              "M249. Full auto powerhouse."),
    (2,  _t1 + 0.3,        "RPK. Sustained fire."),
    (3,  _t2 + 0.3,        "M134. The minigun."),
    (4,  _t3 + 0.3,        "FN Evol YS. Heavy hitter."),
    (5,  CTA_START + 0.3,  "Full guide, link in description."),
]


# ──────────────────────────────────────────────────────────────
# ユーティリティ
# ──────────────────────────────────────────────────────────────
def run(args):
    print("  $", " ".join(str(a) for a in args[:6]), "...")
    r = subprocess.run(
        args, cwd=ROOT, capture_output=True,
        text=True, encoding="utf-8", errors="replace",
    )
    if r.returncode != 0:
        sys.stderr.write((r.stderr or "")[-3000:])
        raise SystemExit("ffmpeg error rc=%d" % r.returncode)
    return r


# ──────────────────────────────────────────────────────────────
# Phase 1: ナレーション生成
# ──────────────────────────────────────────────────────────────
async def tts_seg(seg_id, text, out_path, retries=15):
    import edge_tts
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        print("  seg%d: cached" % seg_id)
        return True
    for attempt in range(1, retries + 1):
        try:
            comm = edge_tts.Communicate(text, VOICE, rate=VOICE_RATE)
            await comm.save(out_path)
            if os.path.getsize(out_path) > 0:
                print("  seg%d: OK (attempt %d)" % (seg_id, attempt))
                return True
            raise RuntimeError("empty output")
        except Exception as e:
            if os.path.exists(out_path):
                os.remove(out_path)
            print("  seg%d: retry %d/%d — %s" % (seg_id, attempt, retries, e))
            await asyncio.sleep(min(2.5 + attempt, 8.0))
    return False


async def build_narration():
    voice_dir = os.path.join(ROOT, "work", "voice")
    os.makedirs(voice_dir, exist_ok=True)
    if os.path.exists(NARR) and os.path.getsize(NARR) > 0:
        print("[narr] already exists, skip.")
        return
    print("[narr] Generating (%s, rate=%s)..." % (VOICE, VOICE_RATE))
    seg_paths = []
    for seg_id, start, text in NARR_SEGS:
        mp3 = os.path.join(voice_dir, "mg_v2_seg%d.mp3" % seg_id)
        if not await tts_seg(seg_id, text, mp3):
            raise SystemExit("TTS failed seg %d" % seg_id)
        seg_paths.append((seg_id, start, mp3))
        await asyncio.sleep(1.0)

    ffargs = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
              "-f", "lavfi", "-t", str(TOTAL_DUR),
              "-i", "anullsrc=r=48000:cl=stereo"]
    for _, _, p in seg_paths:
        ffargs += ["-i", p]
    filt_parts, labels = [], ["[0:a]"]
    for idx, (_, start, _) in enumerate(seg_paths, start=1):
        delay = int(round(start * 1000))
        filt_parts.append(
            "[%d:a]aresample=48000,aformat=channel_layouts=stereo,"
            "adelay=%d|%d[a%d]" % (idx, delay, delay, idx)
        )
        labels.append("[a%d]" % idx)
    filt_parts.append(
        "%samix=inputs=%d:normalize=0:duration=longest[mix]"
        % ("".join(labels), len(labels))
    )
    ffargs += ["-filter_complex", ";".join(filt_parts),
               "-map", "[mix]", "-t", str(TOTAL_DUR),
               "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", NARR]
    run(ffargs)
    print("[narr] DONE -> %s" % NARR)


# ──────────────────────────────────────────────────────────────
# Phase 2: 映像レンダリング
# ──────────────────────────────────────────────────────────────
def build_filter_complex(preview=False):
    """
    入力:
      [0] M249, [1] RPK, [2] M134, [3] FN EVOL YS
      [4:a] BGM, [5:a] ナレーション WAV, [6:v] CTA PNG
    """
    parts = []

    # ── 映像: 4クリップ fps統一 & concat ─────────────────────
    for i in range(4):
        parts.append("[%d:v]fps=30,setpts=PTS-STARTPTS[v%d]" % (i, i))
    parts.append("[v0][v1][v2][v3]concat=n=4:v=1:a=0[vraw]")

    # ── 音声: 4クリップ concat ────────────────────────────────
    for i in range(4):
        parts.append("[%d:a]aresample=48000,asetpts=PTS-STARTPTS[a%d]" % (i, i))
    parts.append("[a0][a1][a2][a3]concat=n=4:v=0:a=1[agame_raw]")

    # ── 映像: 黒帯レイアウト ──────────────────────────────────
    parts.append(
        "[vraw]scale=%d:-2,pad=%d:%d:0:%d:black[padded]"
        % (FG_W, CANVAS_W, CANVAS_H, FG_Y)
    )

    # ── タイトル (常時表示) ───────────────────────────────────
    parts.append(
        "[padded]drawtext=fontfile=%s:textfile=work/captions/mg_title.txt:"
        "fontcolor=%s:fontsize=72:borderw=5:bordercolor=%s:"
        "x=(w-text_w)/2:y=%d[titled]"
        % (FONT, TITLE_COLOR, TITLE_BORDER, TITLE_Y)
    )

    # ── 字幕 ──────────────────────────────────────────────────
    cur = "titled"
    for i, (start, end, capfile) in enumerate(CAPTIONS):
        nxt = "c%d" % i
        parts.append(
            "[%s]drawtext=fontfile=%s:textfile=%s:"
            "fontcolor=%s:fontsize=64:borderw=5:bordercolor=%s:"
            "x=(w-text_w)/2:y=%d:enable='between(t,%s,%s)'[%s]"
            % (cur, FONT, capfile, CAP_COLOR, CAP_BORDER, CAP_Y, start, end, nxt)
        )
        cur = nxt

    # ── CTA画像オーバーレイ ──────────────────────────────────
    cta_x = (CANVAS_W - CTA_W) // 2
    cta_y = FG_Y + 34
    parts.append(
        "[6:v]scale=%d:-2,"
        "fade=t=in:st=0:d=%s:alpha=1[cta_faded]"
        % (CTA_W, CTA_FADE)
    )
    parts.append(
        "[%s][cta_faded]overlay=x=%d:y=%d:"
        "enable='between(t,%s,%s)'[cta_comp]"
        % (cur, cta_x, cta_y, CTA_START, CTA_END)
    )
    cur = "cta_comp"

    if preview:
        parts.append("[%s]scale=540:960[vout]" % cur)
    else:
        parts.append("[%s]copy[vout]" % cur)

    # ── 音声 ──────────────────────────────────────────────────
    fade_out_st = TOTAL_DUR - 3.5
    parts.append("[agame_raw]volume=%s[game]" % GAME_GAIN)
    parts.append(
        "[4:a]volume=%.2f,afade=t=in:st=0:d=2,"
        "afade=t=out:st=%.1f:d=3[bgm]"
        % (BGM_VOL, fade_out_st)
    )
    parts.append("[5:a]volume=%s,asplit=2[v_mix][v_sc]" % NARR_GAIN)
    parts.append(
        "[game][v_sc]sidechaincompress="
        "threshold=0.015:ratio=4:attack=20:release=300[duck]"
    )
    parts.append(
        "[duck][bgm][v_mix]amix=inputs=3:normalize=0:duration=first,"
        "alimiter=limit=0.95[aout]"
    )

    return ";".join(parts)


def render(preview=False):
    out_path = OUT_PRE if preview else OUT
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    fc = build_filter_complex(preview)
    cta_dur = CTA_END - CTA_START + 2

    clips = [
        (SRC1, M249_SS, M249_DUR),
        (SRC2, RPK_SS,  RPK_DUR),
        (SRC3, M134_SS, M134_DUR),
        (SRC4, EVOL_SS, EVOL_DUR),
    ]

    args = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error"]
    for src, ss, dur in clips:
        args += ["-ss", str(ss), "-t", str(dur + 0.5), "-i", src]
    args += ["-stream_loop", "-1", "-t", str(TOTAL_DUR + 5), "-i", BGM]
    args += ["-i", NARR]
    args += ["-loop", "1", "-t", str(cta_dur), "-i", CTA_IMG]
    args += [
        "-filter_complex", fc,
        "-map", "[vout]",
        "-map", "[aout]",
        "-r", "30",
        "-c:v", "libx264", "-preset", "medium",
        "-crf", "28" if preview else "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-shortest",
        "-movflags", "+faststart",
        out_path,
    ]
    label = "preview" if preview else "final"
    print("[render] %s (%ds) → %s" % (label, int(TOTAL_DUR), out_path))
    run(args)
    print("[render] DONE -> %s" % out_path)


# ──────────────────────────────────────────────────────────────
# エントリーポイント
# ──────────────────────────────────────────────────────────────
async def main_async():
    mode = sys.argv[1] if len(sys.argv) > 1 else "final"
    missing = [p for p in (SRC1, SRC2, SRC3, SRC4, BGM, CTA_IMG) if not os.path.exists(p)]
    if missing:
        raise SystemExit("Missing files:\n" + "\n".join(missing))
    if mode == "regen" and os.path.exists(NARR):
        os.remove(NARR)
        print("[narr] removed for regeneration")
        mode = "final"
    await build_narration()
    render(preview=(mode == "preview"))


if __name__ == "__main__":
    asyncio.run(main_async())
