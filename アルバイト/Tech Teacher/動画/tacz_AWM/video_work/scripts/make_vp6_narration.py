# -*- coding: utf-8 -*-
"""
動画プロジェクト6 ハイライト — 英語AIナレーション生成（edge-tts）。
- 各セグメントを Microsoft Edge のニューラル音声で生成し、出力タイムライン
  （68秒）に同期した1本の wav work/voice/narration_vp6_en.wav を作る。
- 無料・APIキー不要。ネット接続のみ必要。
- 声: en-US-GuyNeural（男性・落ち着いた語り。戦況実況に合う）。
- edge-tts のエンドポイントは断続的。生成済みセグメントはスキップして再開する。
"""
import asyncio
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # video_work/
VOICE_DIR = os.path.join(ROOT, "work", "voice")
OUT_WAV = os.path.join(VOICE_DIR, "narration_vp6_en.wav")

FFBIN = r"C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
FFMPEG = os.path.join(FFBIN, "ffmpeg.exe")

VOICE = "en-US-GuyNeural"   # 男性・落ち着いた語り
RATE = "+0%"
TOTAL_DUR = 68.0            # ハイライト尺(秒)

# (id, start_sec, text) — テロップ・出力タイムラインに整合
SEGMENTS = [
    (1,  0.5, "Twenty Russian soldiers face twenty American soldiers in a ruined city."),
    (2,  9.4, "This megacity was rebuilt block by block into a battlefield."),
    (3, 18.4, "Both squads take position across the rooftops."),
    (4, 27.4, "The Russian unit opens fire with A K rifles."),
    (5, 37.4, "The American unit pushes back, trading shots across the plaza."),
    (6, 47.4, "Tracers and muzzle flashes tear across the skyline."),
    (7, 57.2, "Only one squad will be left standing."),
    (8, 63.3, "Who takes the city? Follow for the next battle."),
]


async def tts_segment(seg_id, text, out_path, retries=20):
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
        path = os.path.join(VOICE_DIR, "vp6_seg%d.mp3" % seg_id)
        ok = await tts_segment(seg_id, text, path)
        if not ok:
            missing.append(seg_id)
        seg_paths.append((seg_id, start, path))
        await asyncio.sleep(1.2)
    if missing:
        print("未生成セグメント %s — 再実行で続きから取得します。" % missing)
        raise SystemExit(2)
    build_timed_track(seg_paths)
    print("DONE -> %s" % OUT_WAV)


if __name__ == "__main__":
    asyncio.run(main_async())
