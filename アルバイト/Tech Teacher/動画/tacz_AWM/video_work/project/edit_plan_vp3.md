# 編集方針 — TaCZ AWM Shorts #002（Video Project 3）

## 素材
- `input/raw/Video Project 3.mp4`（ユーザーが追加した編集済みエクスポート）
- 1080x1920 / 9:16 / 30fps / h264+aac / 41.3秒
- 内容: TaCZ Accuracy International AWM（スナイパーライフル）のプレイ。
  既に縦型(9:16)に構図済みで、ゲーム画面(1080x705, 上端 y=608)の上下に白い余白がある。
- 元動画は読み取り専用。出力・中間生成物はすべて `video_work/` 配下。

## 依頼内容
「英語圏の人向けで編集」→ 既に構図・カット済みのため、**再構図はせず英語テキスト
レイヤーの追加**を主作業とした。上下の白余白がキャプション用に空けてあるため、
そこへ英語の固定タイトルと場面同期キャプションを焼き込む。

## レイアウト（1080x1920）
- ゲーム画面: y=608〜1312（1080x705）。クロップせず一切隠さない。
- 上部白余白(0〜607): 固定タイトル2行 + オレンジのアクセントバー。
- 下部余白(1313〜1919): 場面同期の英語キャプション（オレンジ箱+白文字）。
- 照準・キーボード表示(左上)・残弾(右下)・ホットバーは字幕で一切隠していない。

## テキスト構成
- 固定タイトル: `REALISTIC GUNS / IN MINECRAFT`（濃チャコール #1C1C28）
- 下部キャプション（オレンジ #E0581F 箱・白文字）:
  | 時刻 | キャプション | 場面 |
  |------|------|------|
  | 0.0–5.8s | TaCZ: AWM Sniper Rifle | 屋上・武器紹介 |
  | 5.8–11.8s | Customize Your Weapon | アタッチメント画面 |
  | 11.8–17.5s | Right Click to Aim | ADS |
  | 17.5–23.5s | Steady Through the Scope | スコープ覗き |
  | 23.5–29.5s | Press R to Reload | リロード |
  | 29.5–35.5s | One Heavy Shot at a Time | ボルトアクション射撃 |
  | 35.5–41.3s | Follow for the Full Guide | 誘導 |

## 音声
- 元動画 Video Project 3.mp4 のゲーム音は**録音レベルが非常に低い**
  （mean -59.9dB / peak -31dB）。無音ではなく、低レベルで収録されている。
- 英語AIナレーションを生成し、ゲーム音と合成（`tacz_shorts_002_narrated.mp4`）。
  - TTS: edge-tts（無料・APIキー不要）、声 `en-US-AriaNeural`（女性・クリア）。
  - 7セグメントを生成し字幕タイミングに同期 → `work/voice/narration_vp3_en.wav`。
  - ゲーム音は固定ゲイン +24dB で増幅（loudnorm は動的＆積分基準で無音区間が
    持ち上がらないため不採用）。ナレーションは +7dB。
  - ナレーション中は `sidechaincompress` でゲーム音をダッキング。
  - 仕上げに `alimiter` でピーク制御。最終 -13.9 LUFS。
  - 注: 元素材の一部区間（例 14–17秒付近）はゲーム音自体がほぼ無音のため
    増幅しても音は出ない（素材側の問題で復元不可）。
- BGMは未追加（`input/music/` が空。指示書の禁止事項に準拠）。

## 成果物
- `output/shorts/tacz_shorts_002.mp4` — 字幕版（音声ほぼ無音）/ 1080x1920 / 41.4秒
- `output/shorts/tacz_shorts_002_narrated.mp4` — **英語ナレーション版（推奨）** / 41.3秒
- `output/preview/vp3_shorts_preview.mp4` — 540x960 低容量プレビュー

## 再実行方法
```
python scripts/make_vp3_shorts.py final     # 字幕焼き込み
python scripts/make_narration.py            # 英語ナレーション生成(edge-tts)
python scripts/mix_vp3_audio.py             # ナレーションをミックス
```
- キャプション文言は `work/captions/vp3_*.txt`、タイミングは `make_vp3_shorts.py` の
  `CAPTIONS` を編集。
- ナレーション文言・声は `make_narration.py` の `SEGMENTS` / `VOICE` を編集。
- edge-tts のエンドポイントは接続が断続的。`make_narration.py` は生成済み
  セグメントをスキップして再開するので、全7本揃うまで再実行すればよい。

## 次に検討できる改善
- **ゲーム音（銃声・リロード音）**: 元動画にゲーム音が無い。CapCut等で
  ゲーム音ありに再書き出しすれば、`mix_vp3_audio.py` を改修して
  ナレーション＋ゲーム音のダッキング合成が可能。
- 利用許可済みBGM（`input/music/` に置けば合成可）。
