# -*- coding: utf-8 -*-
"""
TaCZ AWM Shorts #002 — ゲーム音 + 英語ナレーションをミックスして最終版を出力。
- 入力: output/shorts/tacz_shorts_002.mp4（字幕焼き込み済み・ゲーム音あり）
       + work/voice/narration_vp3_en.wav（タイミング済みナレーション）
- 元のゲーム音は録音レベルが非常に低い（mean -59.9dB / peak -31dB）ため大きく増幅。
- ナレーション中はゲーム音を sidechaincompress で自動的に下げる（ダッキング）。
  → 銃声・リロード音などのゲーム音を残しつつ、ナレーションを聞き取りやすくする。
- 映像は再エンコードせずコピー。音声のみ差し替え。
- 出力: output/shorts/tacz_shorts_002_narrated.mp4
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
VIDEO = os.path.join(ROOT, "output", "shorts", "tacz_shorts_002.mp4")
NARR = os.path.join(ROOT, "work", "voice", "narration_vp3_en.wav")
OUT = os.path.join(ROOT, "output", "shorts", "tacz_shorts_002_narrated.mp4")

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# 方針: loudnorm は積分ラウドネス基準＆動的ゲインのため、無音区間で
# ゲーム音が持ち上がらない。代わりに固定ゲインで一様に増幅する。
# [0:a]=ゲーム音: +24dB 固定増幅（元 mean -59.9dB / peak -31dB → peak約-7dB）
# [1:a]=ナレーション: +7dB（元 -20.6 LUFS → 前に出す）
# voice を asplit で複製（合成用 / ダッキングのサイドチェイン用）。
# ナレーション中はゲーム音を sidechaincompress で下げ、最後に alimiter で頭打ち。
GAME_GAIN = "24dB"
VOICE_GAIN = "7dB"
FILTER = (
    "[0:a]volume=%s[game];"
    "[1:a]volume=%s,asplit=2[v_mix][v_sc];"
    "[game][v_sc]sidechaincompress="
    "threshold=0.03:ratio=6:attack=20:release=300[duck];"
    "[duck][v_mix]amix=inputs=2:normalize=0:duration=first,"
    "alimiter=limit=0.95[mix]"
) % (GAME_GAIN, VOICE_GAIN)


def main():
    for p in (VIDEO, NARR):
        if not os.path.exists(p):
            raise SystemExit("not found: %s" % p)
    args = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", VIDEO, "-i", NARR,
        "-filter_complex", FILTER,
        "-map", "0:v", "-map", "[mix]",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        OUT,
    ]
    r = subprocess.run(args, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.stderr.write(r.stderr or "")
        raise SystemExit("ffmpeg failed: rc=%d" % r.returncode)
    print("DONE -> %s" % OUT)


if __name__ == "__main__":
    main()
