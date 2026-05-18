# -*- coding: utf-8 -*-
"""
TaCZ — 動画プロジェクト7「スカイツリーのスナイパーを別ビルから見上げて倒す」
Shorts（9:16 縦型）編集。
- 入力 input/raw/動画プロジェクト 7.mp4（読み取り専用 / 1920x1080 30fps / 16.6秒）。
- 内容: 夜、別ビルの屋上からスカイツリー型タワーを見上げ、スコープを覗いて
  タワーにいる敵スナイパーを1発で撃破（キルカウント x01）。終盤は夕焼けの
  屋上に倒れた敵スナイパーを映す決着シーン。
- 16:9 を 9:16(1080x1920) へ変換: 背景はぼかし拡大フィル、中央に等倍映像。
- 上部に英語タイトル、下部に場面同期キャプション。キル瞬間に赤フラッシュと
  「TARGET DOWN」スタンプの演出（速度変更なし＝等倍）。
- ゲーム音は録音レベルが低い（mean -50.3dB / max -25.5dB）ため +18dB 増幅。
- 出力は output/ 配下のみ。
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
SRC = "input/raw/動画プロジェクト 7.mp4"  # cwd=ROOT 相対（コロン回避）
FONT = "work/font.ttf"
CAP_DIR = os.path.join(ROOT, "work", "captions")

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# 上部固定タイトル（全編表示）
TITLE1 = "SNIPER ON THE SKYTREE"
TITLE2 = "one shot from the next roof"
KILL = "TARGET DOWN"

# 下部キャプション (filename, text, start, end)。動画尺 16.6s。
CAPTIONS = [
    ("vp7_c1.txt", "Target: a sniper on the Skytree",  0.3,  3.6),
    ("vp7_c2.txt", "Scope in from the next rooftop",    3.6,  5.5),
    ("vp7_c3.txt", "One shot - enemy sniper down",      5.6,  8.6),
    ("vp7_c4.txt", "Enemy sniper neutralized",          8.6, 12.3),
    ("vp7_c5.txt", "Mission complete at sunset",       12.3, 16.6),
]

# キル演出のタイミング（秒）
KILL_FLASH = (5.6, 5.95)   # 赤フラッシュ
KILL_STAMP = (5.6, 8.4)    # TARGET DOWN スタンプ

ACCENT = "0xE0581F"        # オレンジ（差し色）
BOX_COLOR = "0xE0581F"     # キャプション箱
BOX_BORDER = "0x7A2E0F"


def write_caption_files():
    os.makedirs(CAP_DIR, exist_ok=True)
    out = {"vp7_title1.txt": TITLE1, "vp7_title2.txt": TITLE2,
           "vp7_kill.txt": KILL}
    for fname, _, _, _ in CAPTIONS:
        pass
    for fname, text, _, _ in CAPTIONS:
        out[fname] = text
    for fname, text in out.items():
        with open(os.path.join(CAP_DIR, fname), "w", encoding="utf-8") as f:
            f.write(text)


def build_filter(preview=False):
    """16:9→9:16変換（ぼかし背景＋中央映像）＋テロップ＋演出。"""
    parts = []
    # 背景: 拡大して 1080x1920 を覆い、強めにぼかして暗く
    parts.append("[0:v]split=2[bg][fg]")
    parts.append("[bg]scale=1080:1920:force_original_aspect_ratio=increase,"
                 "crop=1080:1920,gblur=sigma=26,eq=brightness=-0.20:"
                 "saturation=0.85[bgb]")
    # 前景: 幅1080に合わせた等倍映像（1080x608）
    parts.append("[fg]scale=1080:-2[fgs]")
    parts.append("[bgb][fgs]overlay=(W-w)/2:(H-h)/2[base]")

    draw = []
    # キル赤フラッシュ
    draw.append("drawbox=x=0:y=0:w=iw:h=ih:color=red@0.24:t=fill:"
                "enable='between(t,%s,%s)'" % KILL_FLASH)
    # 上部タイトル背景の半透明バンド
    draw.append("drawbox=x=0:y=150:w=iw:h=300:color=black@0.45:t=fill")
    draw.append("drawtext=fontfile=%s:textfile=work/captions/vp7_title1.txt:"
                "fontcolor=white:fontsize=80:borderw=3:bordercolor=black:"
                "x=(w-text_w)/2:y=196" % FONT)
    draw.append("drawtext=fontfile=%s:textfile=work/captions/vp7_title2.txt:"
                "fontcolor=%s:fontsize=46:x=(w-text_w)/2:y=320" % (FONT, ACCENT))
    draw.append("drawbox=x=(iw-300)/2:y=398:w=300:h=8:color=%s:t=fill" % ACCENT)
    # キル「TARGET DOWN」スタンプ（映像中央寄り）
    draw.append(
        "drawtext=fontfile=%s:textfile=work/captions/vp7_kill.txt:"
        "fontcolor=white:fontsize=104:borderw=4:bordercolor=black:"
        "box=1:boxcolor=red@0.85:boxborderw=34:"
        "x=(w-text_w)/2:y=720:enable='between(t,%s,%s)'"
        % (FONT, KILL_STAMP[0], KILL_STAMP[1]))
    # 下部キャプション（オレンジ箱+白文字）
    for fname, _, start, end in CAPTIONS:
        draw.append(
            "drawtext=fontfile=%s:textfile=work/captions/%s:"
            "fontcolor=white:fontsize=52:borderw=2:bordercolor=%s:"
            "box=1:boxcolor=%s:boxborderw=28:"
            "x=(w-text_w)/2:y=1486:"
            "enable='between(t,%s,%s)'"
            % (FONT, fname, BOX_BORDER, BOX_COLOR, start, end))
    vchain = "[base]" + ",".join(draw)
    if preview:
        vchain += ",scale=540:960"
    vchain += "[outv]"
    parts.append(vchain)
    return ";".join(parts)


def run(args):
    print(">", " ".join(str(a) for a in args[:6]), "...")
    r = subprocess.run(args, cwd=ROOT, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.stderr.write(r.stderr or "")
        raise SystemExit("ffmpeg failed: rc=%d" % r.returncode)
    return r


def render(out_path, preview=False):
    fc = build_filter(preview=preview)
    args = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", SRC,
        "-filter_complex", fc,
        "-map", "[outv]", "-map", "0:a",
        "-c:v", "libx264", "-preset", "medium",
        "-crf", "30" if preview else "19",
        "-pix_fmt", "yuv420p",
        "-af", "volume=18dB,alimiter=limit=0.95",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        out_path,
    ]
    run(args)
    print("rendered ->", out_path)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "final"
    write_caption_files()
    if mode == "preview":
        render(os.path.join(ROOT, "output", "preview", "vp7_preview.mp4"),
               preview=True)
    else:
        render(os.path.join(ROOT, "output", "shorts",
                             "tacz_vp7_skytree_telop.mp4"))


if __name__ == "__main__":
    main()
