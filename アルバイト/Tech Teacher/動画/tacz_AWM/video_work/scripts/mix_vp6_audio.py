# -*- coding: utf-8 -*-
"""
動画プロジェクト6 ハイライト — ナレーション＋BGM版（別mp4）を出力。
- 入力: output/longform/tacz_vp6_battle_telop.mp4（テロップ焼き込み済み・
        ゲーム音 +14dB 増幅済み）
       + work/voice/narration_vp6_en.wav（タイミング済み英語ナレーション）
       + input/bgm/Mr_Wick.mp3（BGM）
- ゲーム音とBGMはナレーション中に sidechaincompress で自動的に下げる（ダッキング）。
- 映像は再エンコードせずコピー。音声のみ差し替え。
- 出力: output/longform/tacz_vp6_battle_narrated.mp4
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
VIDEO = os.path.join(ROOT, "output", "longform", "tacz_vp6_battle_telop.mp4")
NARR = os.path.join(ROOT, "work", "voice", "narration_vp6_en.wav")
BGM = os.path.join(ROOT, "input", "bgm", "Mr_Wick.mp3")
OUT = os.path.join(ROOT, "output", "longform", "tacz_vp6_battle_narrated.mp4")

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# [0:a]=ゲーム音（既に +14dB 増幅済み）
# [1:a]=ナレーション（+6dB で前に出す。3分岐: 合成用 + 2系統のダッキング用）
# [2:a]=BGM（Mr_Wick mean -14.8dB → -16dB で背景に下げ、さらにダッキング）
# ナレーション中はゲーム音・BGMの両方を下げ、最後に alimiter で頭打ち。
FILTER = (
    "[2:a]atrim=0:69,asetpts=PTS-STARTPTS,aresample=48000,"
    "aformat=channel_layouts=stereo,volume=-16dB[bgm];"
    "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=6dB,"
    "asplit=3[v_mix][v_scg][v_scb];"
    "[0:a]aresample=48000,aformat=channel_layouts=stereo[game];"
    "[game][v_scg]sidechaincompress="
    "threshold=0.05:ratio=5:attack=20:release=350[gd];"
    "[bgm][v_scb]sidechaincompress="
    "threshold=0.05:ratio=8:attack=20:release=350[bd];"
    "[gd][bd][v_mix]amix=inputs=3:normalize=0:duration=first,"
    "alimiter=limit=0.95[mix]"
)


def main():
    for p in (VIDEO, NARR, BGM):
        if not os.path.exists(p):
            raise SystemExit("not found: %s" % p)
    args = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", VIDEO, "-i", NARR, "-i", BGM,
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
