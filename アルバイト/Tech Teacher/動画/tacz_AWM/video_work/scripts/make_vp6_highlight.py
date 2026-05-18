# -*- coding: utf-8 -*-
"""
TaCZ — 動画プロジェクト6（20 RU vs 20 US 都市銃撃戦）ハイライト編集。
- 入力 input/raw/動画プロジェクト 6.mp4（読み取り専用 / 1920x1080 30fps / 約140秒）。
- 元動画は前半95秒が街のフライト、後半が屋上での銃撃戦、末尾にゲームメニュー。
- 4セグメントを抽出・連結し約68秒のハイライトへ凝縮（戦闘中心）。
- 上部に英語タイトルカード、下部に場面同期の英語キャプションを焼き込む。
- ゲーム音は録音レベルが低い（mean -46.8dB / max -17.2dB）ため +14dB 増幅。
- 1パスで カット+連結+テロップ+音声増幅 を実行。出力は output/ 配下のみ。
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
SRC = "input/raw/動画プロジェクト 6.mp4"  # cwd=ROOT 相対（コロン回避）
FONT = "work/font.ttf"
CAP_DIR = os.path.join(ROOT, "work", "captions")

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

# 元動画から抽出するセグメント (src_start, src_end)。連結順 = 出力順。
SEGMENTS = [
    (0.0,    9.0),   # 街の全景・establishing
    (38.0,  47.0),   # 摩天楼の谷を飛行
    (78.0,  87.0),   # 屋上広場へ降下・部隊配置
    (95.0, 136.0),   # 屋上での銃撃戦（本編）
]
# → 出力タイムライン 0-9 / 9-18 / 18-27 / 27-68（合計 68秒）

# 上部固定タイトル（出力 0-9秒のみ表示）
TITLE1 = "20 RUSSIANS  vs  20 AMERICANS"
TITLE2 = "TaCZ GUN WAR  -  MINECRAFT"

# 下部キャプション (filename, text, out_start, out_end)
CAPTIONS = [
    ("vp6_c1.txt", "A megacity rebuilt block by block",     0.4,  9.0),
    ("vp6_c2.txt", "8,742 blocks reshaped into a war zone", 9.0, 18.0),
    ("vp6_c3.txt", "Two squads deploy across the rooftops", 18.0, 27.0),
    ("vp6_c4.txt", "RUSSIAN UNIT opens fire - AK rifles",   27.0, 37.0),
    ("vp6_c5.txt", "US UNIT pushes back hard",              37.0, 47.0),
    ("vp6_c6.txt", "Tracers tear across the skyline",       47.0, 57.0),
    ("vp6_c7.txt", "Last squad standing takes the city",    57.0, 65.0),
    ("vp6_c8.txt", "Who wins?  Follow for Part 2",          65.0, 68.0),
]

TITLE_COLOR = "white"
ACCENT = "0xE0581F"        # オレンジ（TaCZ 系の差し色）
BOX_COLOR = "0xE0581F"     # キャプション箱
BOX_BORDER = "0x7A2E0F"
GAME_GAIN = "14dB"         # ゲーム音の増幅量


def write_caption_files():
    os.makedirs(CAP_DIR, exist_ok=True)
    with open(os.path.join(CAP_DIR, "vp6_title1.txt"), "w", encoding="utf-8") as f:
        f.write(TITLE1)
    with open(os.path.join(CAP_DIR, "vp6_title2.txt"), "w", encoding="utf-8") as f:
        f.write(TITLE2)
    for fname, text, _, _ in CAPTIONS:
        with open(os.path.join(CAP_DIR, fname), "w", encoding="utf-8") as f:
            f.write(text)


def build_filter(preview=False):
    """カット+連結+テロップ+音声を1つの filter_complex で構築。"""
    parts = []
    vlabels = []
    # 各セグメントを trim で切り出す
    for i, (s, e) in enumerate(SEGMENTS):
        parts.append("[0:v]trim=%s:%s,setpts=PTS-STARTPTS[v%d]" % (s, e, i))
        parts.append("[0:a]atrim=%s:%s,asetpts=PTS-STARTPTS[a%d]" % (s, e, i))
        vlabels.append("[v%d][a%d]" % (i, i))
    # 連結
    parts.append("%sconcat=n=%d:v=1:a=1[cv][ca]"
                 % ("".join(vlabels), len(SEGMENTS)))

    # テロップchain（[cv] -> [outv]）
    draw = []
    # タイトル背景の半透明バンド
    draw.append("drawbox=x=0:y=0:w=iw:h=250:color=black@0.5:t=fill:"
                "enable='lt(t,9)'")
    draw.append("drawtext=fontfile=%s:textfile=work/captions/vp6_title1.txt:"
                "fontcolor=%s:fontsize=84:x=(w-text_w)/2:y=52:"
                "enable='lt(t,9)'" % (FONT, TITLE_COLOR))
    draw.append("drawtext=fontfile=%s:textfile=work/captions/vp6_title2.txt:"
                "fontcolor=%s:fontsize=52:x=(w-text_w)/2:y=158:"
                "enable='lt(t,9)'" % (FONT, ACCENT))
    draw.append("drawbox=x=(iw-360)/2:y=232:w=360:h=8:color=%s:t=fill:"
                "enable='lt(t,9)'" % ACCENT)
    # 下部キャプション（オレンジ箱+白文字）
    for fname, _, start, end in CAPTIONS:
        draw.append(
            "drawtext=fontfile=%s:textfile=work/captions/%s:"
            "fontcolor=white:fontsize=54:borderw=2:bordercolor=%s:"
            "box=1:boxcolor=%s:boxborderw=26:"
            "x=(w-text_w)/2:y=905:"
            "enable='between(t,%s,%s)'"
            % (FONT, fname, BOX_BORDER, BOX_COLOR, start, end))
    vchain = "[cv]" + ",".join(draw)
    if preview:
        vchain += ",scale=960:540"
    vchain += "[outv]"
    parts.append(vchain)

    # 音声: ゲーム音を増幅しリミッタで頭打ち
    parts.append("[ca]volume=%s,alimiter=limit=0.95[outa]" % GAME_GAIN)
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
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-preset", "medium",
        "-crf", "30" if preview else "19",
        "-pix_fmt", "yuv420p",
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
        render(os.path.join(ROOT, "output", "preview", "vp6_preview.mp4"),
               preview=True)
    else:
        render(os.path.join(ROOT, "output", "longform",
                             "tacz_vp6_battle_telop.mp4"))


if __name__ == "__main__":
    main()
