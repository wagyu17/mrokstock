# -*- coding: utf-8 -*-
"""
TaCZ AWM Shorts (Video Project 3) — 海外向け英語字幕オーバーレイ。
- 入力 input/raw/Video Project 3.mp4 は読み取り専用。出力は output/ 配下のみ。
- 入力は既に 1080x1920 / 9:16 に編集済み。ゲーム画面(y=608, 1080x705)の
  上下に白い余白があるため、そこへ英語テキストを焼き込むだけ。再構図はしない。
- 上部: 固定タイトル(濃色テキスト)。下部: 場面に同期した英語キャプション(オレンジ箱+白文字)。
- 音声は loudnorm でラウドネス均一化。
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
SRC = "input/raw/Video Project 3.mp4"  # cwd=ROOT 相対（コロン回避）
FONT = "work/font.ttf"

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# 下部キャプション (caption_file, start, end)。動画尺 41.3s。
CAPTIONS = [
    ("work/captions/vp3_c1.txt",  0.0,  5.8),   # 導入・武器紹介
    ("work/captions/vp3_c2.txt",  5.8, 11.8),   # カスタマイズ画面
    ("work/captions/vp3_c3.txt", 11.8, 17.5),   # ADS
    ("work/captions/vp3_c4.txt", 17.5, 23.5),   # スコープ覗き
    ("work/captions/vp3_c5.txt", 23.5, 29.5),   # リロード
    ("work/captions/vp3_c6.txt", 29.5, 35.5),   # ボルトアクション射撃
    ("work/captions/vp3_c7.txt", 35.5, 42.0),   # 誘導
]

TITLE_COLOR = "0x1C1C28"   # 濃いチャコール（白余白に映える）
BOX_COLOR = "0xE0581F"     # オレンジ（銃のオレンジ部に合わせる）
BOX_BORDER = "0x7A2E0F"


def build_vf():
    parts = []
    # 上部固定タイトル（2行）
    parts.append(
        "drawtext=fontfile=%s:textfile=work/captions/vp3_title1.txt:"
        "fontcolor=%s:fontsize=88:x=(w-text_w)/2:y=190" % (FONT, TITLE_COLOR))
    parts.append(
        "drawtext=fontfile=%s:textfile=work/captions/vp3_title2.txt:"
        "fontcolor=%s:fontsize=88:x=(w-text_w)/2:y=300" % (FONT, TITLE_COLOR))
    # タイトル下のオレンジのアクセントバー（ゲーム画面の真上）
    parts.append("drawbox=x=(iw-320)/2:y=476:w=320:h=10:color=%s:t=fill" % BOX_COLOR)
    # 下部キャプション（場面同期・オレンジ箱+白文字）
    for cap_file, start, end in CAPTIONS:
        parts.append(
            "drawtext=fontfile=%s:textfile=%s:"
            "fontcolor=white:fontsize=58:borderw=3:bordercolor=%s:"
            "box=1:boxcolor=%s:boxborderw=32:"
            "x=(w-text_w)/2:y=1545:"
            "enable='between(t,%s,%s)'"
            % (FONT, cap_file, BOX_BORDER, BOX_COLOR, start, end))
    return ",".join(parts)


def run(args):
    print(">", " ".join(str(a) for a in args))
    r = subprocess.run(args, cwd=ROOT, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.stderr.write(r.stderr or "")
        raise SystemExit("ffmpeg failed: rc=%d" % r.returncode)
    return r


def render(out_path, preview=False):
    vf = build_vf()
    if preview:
        vf += ",scale=540:960"
    args = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", SRC,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium",
        "-crf", "30" if preview else "20",
        "-pix_fmt", "yuv420p",
        "-af", "loudnorm=I=-15:TP=-1.5:LRA=11",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        out_path,
    ]
    run(args)
    print("rendered ->", out_path)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "final"
    if mode == "preview":
        render(os.path.join(ROOT, "output", "preview", "vp3_shorts_preview.mp4"),
                preview=True)
    else:
        render(os.path.join(ROOT, "output", "shorts", "tacz_shorts_002.mp4"))


if __name__ == "__main__":
    main()
