# -*- coding: utf-8 -*-
"""
TaCZ ALL Snipers Shorts — 注意点.md 準拠 v3

変更点 (v3):
  - 字幕: AWM / M95 / M700 / M107 / Kar98k 各ライフル対応
  - タイトル: "ALL TaCZ Snipers"
  - CTA画像: 最後 8秒間 (t=50-58) ゲーム映像の上にオーバーレイ
  - ナレーション: 各ライフルに対応して再生成

使い方:
    cd <video_work>
    python scripts/make_dp2_shorts.py          # フル出力
    python scripts/make_dp2_shorts.py preview   # 半サイズ確認
    python scripts/make_dp2_shorts.py regen     # ナレ強制再生成 + フル出力
"""

import asyncio
import os
import subprocess
import sys

# ──────────────────────────────────────────────────────────────
# パス設定
# ──────────────────────────────────────────────────────────────
ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC     = os.path.join(ROOT, "input", "raw", "動画プロジェクト 2.mp4")
BGM     = os.path.join(ROOT, "input", "bgm", "Machine_Gun_Roll.mp3")
CTA_IMG = os.path.join(ROOT, "tmp", "cta_sniper_guide.png")
FONT    = "work/font.ttf"
NARR    = os.path.join(ROOT, "work", "voice", "dp2_narr_v4.wav")
OUT     = os.path.join(ROOT, "output", "shorts", "tacz_shorts_003.mp4")
OUT_PRE = os.path.join(ROOT, "output", "preview", "dp2_preview.mp4")

FFBIN   = (
    r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-8.1.1-full_build\bin"
)
FFMPEG  = os.path.join(FFBIN, "ffmpeg.exe")

# ──────────────────────────────────────────────────────────────
# 編集パラメータ
# ──────────────────────────────────────────────────────────────
TRIM_START = 0.0
TRIM_END   = 58.0
TOTAL_DUR  = TRIM_END - TRIM_START

CTA_START  = 50.0   # CTA画像の表示開始秒
CTA_END    = 58.0   # CTA画像の表示終了秒
CTA_FADE   = 0.8    # フェードイン秒数

BGM_VOL   = 0.12
GAME_GAIN = "10dB"
NARR_GAIN = "4dB"

# ── キャンバス & レイアウト ──────────────────────────────────
CANVAS_W, CANVAS_H = 1080, 1920
FG_W  = 1080
FG_H  = int(FG_W * 9 / 16)          # = 607 → ffmpegは偶数丸め → 608
FG_Y  = (CANVAS_H - FG_H) // 2      # = 656

TITLE_Y = FG_Y - 90                  # = 566
CAP_Y   = min(FG_Y + FG_H + 25, CANVAS_H - 140)  # = 689

CTA_W   = 960   # CTA画像の表示幅 (中央配置)

# ── 色 ────────────────────────────────────────────────────────
TITLE_COLOR  = "0xFFE800"
TITLE_BORDER = "0xCC0000"
CAP_COLOR    = "white"
CAP_BORDER   = "0x000000"

# ──────────────────────────────────────────────────────────────
# 字幕 (8段階 + CTA期間は画像で表現)
# ──────────────────────────────────────────────────────────────
CAPTIONS = [
    (0.3,  5.0,  "work/captions/dp2_c1.txt"),   # ALL snipers in TaCZ
    (5.0,  12.5, "work/captions/dp2_c2.txt"),   # AWM — bolt action
    (12.5, 20.0, "work/captions/dp2_c3.txt"),   # M95 — semi auto
    (20.0, 27.5, "work/captions/dp2_c4.txt"),   # M700 — clean tap
    (27.5, 35.0, "work/captions/dp2_c5.txt"),   # M107 — heavy shot
    (35.0, 42.5, "work/captions/dp2_c6.txt"),   # Springfield — precision
    (42.5, 50.0, "work/captions/dp2_c7.txt"),   # Kar98k — classic feel
    (50.0, 57.5, "work/captions/dp2_c8.txt"),   # Full guide — link below
]

# ──────────────────────────────────────────────────────────────
# ナレーション
# ──────────────────────────────────────────────────────────────
VOICE      = "en-US-GuyNeural"
VOICE_RATE = "-8%"

NARR_SEGS = [
    (1,  0.3,  "All TaCZ snipers, tested."),
    (2,  5.0,  "AWM. Bolt action king."),
    (3, 12.5,  "M95. Semi-auto beast."),
    (4, 20.0,  "M700. Clean one tap."),
    (5, 27.5,  "M107. Heavy hitter."),
    (6, 35.0,  "Springfield. Long range precision."),
    (7, 42.5,  "Kar98k. Classic sniper."),
    (8, 50.0,  "Full sniper guide, link in description."),
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
        print("[narr] v3 already exists, skip.")
        return
    print("[narr] Generating (%s, rate=%s)..." % (VOICE, VOICE_RATE))
    seg_paths = []
    for seg_id, start, text in NARR_SEGS:
        mp3 = os.path.join(voice_dir, "dp2_v3_seg%d.mp3" % seg_id)
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
      [0:v],[0:a] = ゲーム動画
      [1:a]       = BGM
      [2:a]       = ナレーション WAV
      [3:v]       = CTA PNG (static, loop=1)

    映像パイプライン:
      [0:v] → scale+pad(黒帯) → drawtext(タイトル) → drawtext×7(字幕)
           → overlay(CTA画像, t=50-58, フェードイン) → [vout]

    音声パイプライン:
      ゲーム音[0:a] + BGM[1:a] + ナレ[2:a] → サイドチェーン → [aout]
    """
    parts = []

    # ── 映像: 黒帯レイアウト ──────────────────────────────────
    parts.append(
        "[0:v]scale=%d:-2,pad=%d:%d:0:%d:black[padded]"
        % (FG_W, CANVAS_W, CANVAS_H, FG_Y)
    )

    # ── タイトル (常時表示, 黄色+赤縁) ──────────────────────
    parts.append(
        "[padded]drawtext=fontfile=%s:textfile=work/captions/dp2_title1.txt:"
        "fontcolor=%s:fontsize=76:borderw=5:bordercolor=%s:"
        "x=(w-text_w)/2:y=%d[titled]"
        % (FONT, TITLE_COLOR, TITLE_BORDER, TITLE_Y)
    )

    # ── 字幕 (ゲーム映像直下, 白文字+黒縁) ──────────────────
    cur = "titled"
    for i, (start, end, capfile) in enumerate(CAPTIONS):
        nxt = "c%d" % i
        parts.append(
            "[%s]drawtext=fontfile=%s:textfile=%s:"
            "fontcolor=%s:fontsize=64:borderw=5:bordercolor=%s:"
            "x=(w-text_w)/2:y=%d:enable='between(t,%s,%s)'[%s]"
            % (cur, FONT, capfile,
               CAP_COLOR, CAP_BORDER, CAP_Y,
               start, end, nxt)
        )
        cur = nxt

    # ── CTA画像オーバーレイ (t=CTA_START-CTA_END, フェードイン) ──
    # PNG を CTA_W 幅にスケール、フェードイン適用
    cta_x = (CANVAS_W - CTA_W) // 2
    # CTA画像はゲーム映像の中央に配置
    # CTA高さ = CTA_W * 9/16 ≈ 540px; 中央Y = FG_Y + (FG_H-540)//2 = 690
    cta_y = FG_Y + 34  # 映像上端より少し下げて自然に収める

    parts.append(
        "[3:v]scale=%d:-2,"
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

    # ── 音声: ナレーション > ゲーム音 > BGM ──────────────────
    fade_out_st = TOTAL_DUR - 3.5
    parts.append("[0:a]volume=%s[game]" % GAME_GAIN)
    parts.append(
        "[1:a]volume=%.2f,afade=t=in:st=0:d=2,"
        "afade=t=out:st=%.1f:d=3[bgm]"
        % (BGM_VOL, fade_out_st)
    )
    parts.append("[2:a]volume=%s,asplit=2[v_mix][v_sc]" % NARR_GAIN)
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
    # CTA_START からの表示時間分だけ画像ループ
    cta_dur = CTA_END - CTA_START + 2

    args = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        # [0] ゲーム動画
        "-ss", str(TRIM_START), "-t", str(TOTAL_DUR), "-i", SRC,
        # [1] BGM (ループ)
        "-stream_loop", "-1", "-t", str(TOTAL_DUR + 5), "-i", BGM,
        # [2] ナレーション
        "-i", NARR,
        # [3] CTA PNG (静止画ループ)
        "-loop", "1", "-t", str(cta_dur), "-i", CTA_IMG,
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
    missing = [p for p in (SRC, BGM, CTA_IMG) if not os.path.exists(p)]
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
