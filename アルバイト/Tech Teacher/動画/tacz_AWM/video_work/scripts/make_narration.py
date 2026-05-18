# -*- coding: utf-8 -*-
"""
TaCZ AWM Shorts #002 — 英語AIナレーション生成（edge-tts）。
- Microsoft Edge のニューラル音声で各セグメントを生成し、字幕タイミングに
  合わせて 41.4秒のナレーショントラック work/voice/narration_vp3_en.wav を作る。
- 無料・APIキー不要。ネット接続のみ必要。
- 声: en-US-AriaNeural（女性・クリア）。
"""
import asyncio
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
VOICE_DIR = os.path.join(ROOT, "work", "voice")
OUT_WAV = os.path.join(VOICE_DIR, "narration_vp3_en.wav")

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

VOICE = "en-US-AriaNeural"   # 女性・クリア
RATE = "+0%"                 # 話速（必要なら "-5%" 等で微調整）
TOTAL_DUR = 41.4             # 動画尺(秒)

# (id, start_sec, text) — 字幕セグメントに整合
SEGMENTS = [
    (1,  0.3, "This is TaCZ, a realistic gun mod for Minecraft."),
    (2,  6.0, "Open the gunsmith table to customize your weapon."),
    (3, 12.0, "Right click to aim down the scope."),
    (4, 17.7, "Hold steady and line up your target."),
    (5, 23.7, "Press R to reload."),
    (6, 29.7, "The A W M is bolt action, one heavy shot at a time."),
    (7, 35.7, "Follow for the full TaCZ beginner guide."),
]


async def tts_segment(seg_id, text, out_path, retries=20):
    """edge-tts のエンドポイントは接続が断続的なためリトライする。
    生成済み(非空)ファイルがあればスキップ（再開対応）。"""
    import edge_tts
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        print("  seg %d -> 既存をスキップ" % seg_id)
        return True
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
            await communicate.save(out_path)
            if os.path.getsize(out_path) > 0:
                print("  seg %d -> OK (試行 %d)" % (seg_id, attempt))
                return True
            raise RuntimeError("empty output")
        except Exception as e:  # noqa: BLE001
            last_err = e
            if os.path.exists(out_path) and os.path.getsize(out_path) == 0:
                os.remove(out_path)
            print("  seg %d 失敗 (試行 %d/%d)" % (seg_id, attempt, retries))
            await asyncio.sleep(min(2.0 + attempt, 8.0))
    print("  seg %d 全試行失敗: %s" % (seg_id, last_err))
    return False


def run(args):
    r = subprocess.run(args, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.stderr.write(r.stderr or "")
        raise SystemExit("ffmpeg failed: rc=%d" % r.returncode)
    return r


def build_timed_track(seg_paths):
    """各セグメント音声を開始秒に配置し、TOTAL_DUR の1本に合成。"""
    args = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
            "-f", "lavfi", "-t", str(TOTAL_DUR),
            "-i", "anullsrc=r=48000:cl=stereo"]
    for _, _, path in seg_paths:
        args += ["-i", path]
    parts = []
    labels = ["[0:a]"]
    for idx, (seg_id, start, path) in enumerate(seg_paths, start=1):
        delay = int(round(start * 1000))
        parts.append("[%d:a]aresample=48000,aformat=channel_layouts=stereo,"
                      "adelay=%d|%d[a%d]" % (idx, delay, delay, idx))
        labels.append("[a%d]" % idx)
    parts.append("%samix=inputs=%d:normalize=0:duration=longest[mix]"
                  % ("".join(labels), len(labels)))
    args += ["-filter_complex", ";".join(parts),
             "-map", "[mix]", "-t", str(TOTAL_DUR),
             "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", OUT_WAV]
    run(args)


async def main_async():
    os.makedirs(VOICE_DIR, exist_ok=True)
    seg_paths = []
    missing = []
    print("TTS 生成中（edge-tts, voice=%s）..." % VOICE)
    for seg_id, start, text in SEGMENTS:
        path = os.path.join(VOICE_DIR, "vp3_seg%d.mp3" % seg_id)
        ok = await tts_segment(seg_id, text, path)
        if not ok:
            missing.append(seg_id)
        seg_paths.append((seg_id, start, path))
        await asyncio.sleep(1.2)  # 連続接続による切断を避ける
    if missing:
        print("未生成セグメント %s — 再実行で続きから取得します。" % missing)
        raise SystemExit(2)
    build_timed_track(seg_paths)
    print("DONE -> %s" % OUT_WAV)


if __name__ == "__main__":
    asyncio.run(main_async())
