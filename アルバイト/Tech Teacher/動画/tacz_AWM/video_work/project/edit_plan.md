# 編集方針 — TaCZ AWM Shorts

## 素材
- `input/raw/tacz_001.mp4`（元: `2026-05-15 23-54-18.mp4` のコピー）
- 1920x1080 / 60fps / h264+aac / 83.65秒 / 13.4MB
- 内容: TaCZ の Accuracy International AWM（スナイパーライフル）紹介プレイ
- 元動画は読み取り専用。出力・中間生成物はすべて `video_work/` 配下に保存。

## 環境
- `ffmpeg` / `ffprobe` は未インストールだったため、`winget install Gyan.FFmpeg`（v8.1.1）で導入。
  - 実体: `C:\Users\tomot\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-8.1.1-full_build\bin`
  - winget 導入直後は PATH 反映にシェル再起動が必要なため、スクリプトでは絶対パス指定。
- `python` 3.13 を使用。編集は `scripts/make_shorts.py` で自動化。

## 成果物
- `output/shorts/tacz_shorts_001.mp4` — 1080x1920 / 9:16 / 60fps / 約29秒 / 5.37MB

## 構成（7セグメント・全部 tacz_001.mp4 から抽出）
| 順 | 元時刻 | 尺 | 用途 | 字幕 |
|----|--------|----|------|------|
| 1 | 08.5–12.5 | 4.0s | フック | Realistic guns in Minecraft? |
| 2 | 16.5–20.0 | 3.5s | 武器紹介 | TaCZ - AWM Sniper Rifle |
| 3 | 53.0–56.5 | 3.5s | ADS | Right Click: Aim |
| 4 | 59.5–64.0 | 4.5s | 射撃 | Left Click: Fire |
| 5 | 64.0–68.0 | 4.0s | リロード | R: Reload |
| 6 | 24.5–30.0 | 5.5s | カスタム | Customize Your Scope |
| 7 | 73.0–77.0 | 4.0s | 誘導 | Full TaCZ guide on my channel |

詳細は `edit_decisions.csv` / `highlight_candidates.csv` を参照。

## 9:16 化の方針（重要）
TaCZ は OBS の Input Overlay（キーボード=左上 / マウス）と残弾表示（右下）、
照準（中央）が画面四隅・中央に散っている。単純なセンタークロップでは
キーボード表示と残弾が切れてしまうため、**クロップせず**に以下の構成とした。

- 1080x1920 キャンバス
- 背景: 元映像を拡大してぼかし（boxblur）+ 暗め（eq）
- 前景: 元16:9映像を 1080幅（1080x608）に縮小し、上端 y=470 に配置
- 字幕: ゲーム画面の下（y=1190）に焼き込み。白文字+黒縁+半透明黒ボックス
- → キーボード表示・マウス表示・照準・残弾をすべて保持。字幕は何も隠さない。

## 音声
- ゲーム音（射撃音含む）をそのまま使用。
- `loudnorm=I=-15:TP=-1.5` でラウドネス均一化、ピーク -1.5dB に制限。
- BGM・AI音声は未追加（後述）。

## 未実施・次に必要な素材
- **BGM**: `input/music/` が空。著作権が明確な素材が無いため未追加（指示書の禁止事項に準拠）。
  利用許可済みBGMを `input/music/` に置けば `audio_mix_plan.md` の方針でミックス可能。
- **AI音声ナレーション**: TTS の CLI/サービスが未設定のため未生成。
  原稿のみ `narration_script_en.md` に作成済み。TTS設定があれば `work/voice/narration_en.wav` を生成し合成可能。
- **長尺動画**: 素材が1本（84秒）のみで、導入/前提MOD/操作解説を順に見せる尺・章構成に足りないため未作成。
  長尺化には「MOD導入画面」「前提MOD一覧」「弾薬入手」「各操作の個別カット」等の追加録画が必要。
- **複数動画ハイライト**: 録画が1本のみのため、複数連結・クロスフェードは今回は対象外。

## 再実行方法
```
python scripts/make_shorts.py
```
セグメントの時刻・字幕は `make_shorts.py` の `SEGMENTS` を編集。
