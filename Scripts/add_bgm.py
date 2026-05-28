"""
add_bgm.py — カット済み動画フォルダに BGM を一括ミックスする

使い方:
    python add_bgm.py <動画フォルダ> <BGMファイル> [オプション]

例:
    python add_bgm.py ./clips ./bgm/lofi.mp3
    python add_bgm.py D:/動画/マイクラ D:/BGM/lofi.mp3 --bgm-vol 0.25
    python add_bgm.py ./clips ./bgm.mp3 --game-vol 0.8 --bgm-vol 0.3 --fade 3
"""

import argparse
import subprocess
import sys
from pathlib import Path

VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".avi"}


def get_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True, text=True, check=True,
    )
    return float(result.stdout.strip())


def add_bgm(
    video: Path,
    bgm: Path,
    output: Path,
    bgm_vol: float,
    game_vol: float,
    fade_sec: float,
) -> None:
    duration = get_duration(video)
    fade_start = max(0.0, duration - fade_sec)

    filter_complex = (
        f"[0:a]volume={game_vol}[game];"
        f"[1:a]volume={bgm_vol},afade=t=in:st=0:d=1,"
        f"afade=t=out:st={fade_start:.2f}:d={fade_sec}[bgm];"
        f"[game][bgm]amix=inputs=2:duration=first[out]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", str(video),
        "-stream_loop", "-1", "-i", str(bgm),
        "-filter_complex", filter_complex,
        "-map", "0:v",
        "-map", "[out]",
        "-c:v", "copy",
        "-shortest",
        str(output),
    ]
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="カット済み動画フォルダに BGM を一括ミックス（ffmpeg 必須）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("input_dir", help="カット済み動画フォルダのパス")
    parser.add_argument("bgm_file", help="BGM ファイルのパス（mp3 / wav / aac）")
    parser.add_argument(
        "--bgm-vol", type=float, default=0.3, metavar="VOL",
        help="BGM 音量  0.0–1.0  (デフォルト: 0.3)",
    )
    parser.add_argument(
        "--game-vol", type=float, default=1.0, metavar="VOL",
        help="ゲーム音声音量  0.0–1.0  (デフォルト: 1.0)",
    )
    parser.add_argument(
        "--fade", type=float, default=2.0, metavar="SEC",
        help="BGM フェードアウト秒数  (デフォルト: 2.0)",
    )
    parser.add_argument(
        "--output-dir", metavar="DIR",
        help="出力先フォルダ  (省略時: <input_dir>/bgm_added/)",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    bgm = Path(args.bgm_file)
    output_dir = Path(args.output_dir) if args.output_dir else input_dir / "bgm_added"

    if not input_dir.is_dir():
        sys.exit(f"エラー: フォルダが見つかりません → {input_dir}")
    if not bgm.is_file():
        sys.exit(f"エラー: BGM ファイルが見つかりません → {bgm}")

    output_dir.mkdir(parents=True, exist_ok=True)

    videos = sorted(f for f in input_dir.iterdir() if f.suffix.lower() in VIDEO_EXTS)
    if not videos:
        sys.exit(f"エラー: 動画ファイルが 0 本 → {input_dir}")

    print(f"対象: {len(videos)} 本  BGM: {bgm.name}  出力先: {output_dir}")
    print(f"  ゲーム音声: {args.game_vol:.0%}  BGM: {args.bgm_vol:.0%}  フェードアウト: {args.fade}s\n")

    ok = fail = 0
    for i, video in enumerate(videos, 1):
        out = output_dir / video.name
        print(f"[{i}/{len(videos)}] {video.name} ...", end=" ", flush=True)
        try:
            add_bgm(video, bgm, out, args.bgm_vol, args.game_vol, args.fade)
            print("完了")
            ok += 1
        except subprocess.CalledProcessError:
            print("失敗")
            fail += 1

    print(f"\n完了: {ok} 本成功 / {fail} 本失敗  →  {output_dir}")


if __name__ == "__main__":
    main()
