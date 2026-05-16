# -*- coding: utf-8 -*-
"""
TaCZ AWM Shorts auto-editor.
- 元動画は読み取り専用。出力は output/ 配下のみ。
- 9:16(1080x1920)。ぼかし背景 + 16:9ゲーム画面を上寄せ配置。
  -> キーボード表示(左上)・残弾(右下)・照準(中央)を一切クロップしない。
- 字幕は画面下部(ゲーム画面の下)に焼き込み。白文字+黒縁+半透明ボックス。
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
RAW = os.path.join(ROOT, "input", "raw", "tacz_001.mp4")
FONT = "work/font.ttf"  # ROOT を cwd にして相対指定（コロン回避）

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# (id, start, end, use, caption)
SEGMENTS = [
    ("A", 8.5, 12.5, "hook",      "Realistic guns in Minecraft?"),
    ("F", 16.5, 20.0, "showcase", "TaCZ - AWM Sniper Rifle"),
    ("B", 53.0, 56.5, "ads",      "Right Click: Aim"),
    ("C", 59.5, 64.0, "fire",     "Left Click: Fire"),
    ("D", 64.0, 68.0, "reload",   "R: Reload"),
    ("E", 24.5, 30.0, "customize","Customize Your Scope"),
    ("G", 73.0, 77.0, "outro",    "Full TaCZ guide on my channel"),
]

# レイアウト定数
CANVAS_W, CANVAS_H = 1080, 1920
FG_W = 1080            # ゲーム画面の幅(16:9 -> 高さ608)
FG_Y = 470             # ゲーム画面の上端Y
CAP_Y = 1190           # 字幕Y(ゲーム画面 470-1078 の下)


def run(args):
    print(">", " ".join(str(a) for a in args))
    r = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.stderr.write(r.stderr or "")
        raise SystemExit("ffmpeg failed: rc=%d" % r.returncode)
    return r


def build_segment(seg_id, start, end, caption, out_path):
    dur = round(end - start, 3)
    cap_file = "work/captions/seg_%s.txt" % seg_id
    with open(os.path.join(ROOT, cap_file), "w", encoding="utf-8") as f:
        f.write(caption)

    vf = (
        "[0:v]split=2[bg][fg];"
        # 背景: 画面を埋めてぼかし+暗め
        "[bg]scale=%d:%d:force_original_aspect_ratio=increase,"
        "crop=%d:%d,boxblur=22:2,eq=brightness=-0.12:saturation=1.1[bgb];"
        # 前景: ゲーム画面を1080幅へ
        "[fg]scale=%d:-2,setsar=1[fgs];"
        "[bgb][fgs]overlay=x=(W-w)/2:y=%d[comp];"
        # 字幕焼き込み
        "[comp]drawtext=fontfile=%s:textfile=%s:reload=0:"
        "fontcolor=white:fontsize=58:borderw=6:bordercolor=black@1.0:"
        "box=1:boxcolor=black@0.45:boxborderw=24:"
        "x=(w-text_w)/2:y=%d[v]"
        % (CANVAS_W, CANVAS_H, CANVAS_W, CANVAS_H, FG_W, FG_Y, FONT, cap_file, CAP_Y)
    )

    args = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-ss", str(start), "-i", RAW, "-t", str(dur),
        "-filter_complex", vf,
        "-map", "[v]", "-map", "0:a",
        "-r", "60",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
        "-af", "loudnorm=I=-15:TP=-1.5:LRA=11",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-video_track_timescale", "60000",
        out_path,
    ]
    run(args)
    return dur


def main():
    seg_dir = os.path.join(ROOT, "work", "clips")
    os.makedirs(seg_dir, exist_ok=True)
    list_path = os.path.join(seg_dir, "concat_list.txt")
    total = 0.0
    with open(list_path, "w", encoding="utf-8") as lf:
        for seg_id, start, end, use, caption in SEGMENTS:
            out = os.path.join(seg_dir, "seg_%s.mp4" % seg_id)
            d = build_segment(seg_id, start, end, caption, out)
            total += d
            lf.write("file '%s'\n" % out.replace("\\", "/"))
            print("  seg %s (%s): %.2fs -> %s" % (seg_id, use, d, out))

    final = os.path.join(ROOT, "output", "shorts", "tacz_shorts_001.mp4")
    run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
         "-f", "concat", "-safe", "0", "-i", list_path,
         "-c", "copy", "-movflags", "+faststart", final])
    print("DONE total=%.2fs -> %s" % (total, final))


if __name__ == "__main__":
    main()
