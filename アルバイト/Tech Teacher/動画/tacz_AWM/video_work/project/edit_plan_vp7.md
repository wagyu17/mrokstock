# 編集方針 — TaCZ スカイツリースナイパー（動画プロジェクト7 / Shorts）

## 素材
- `input/raw/動画プロジェクト 7.mp4`（読み取り専用）
- 1920x1080 / 16:9 / 30fps / h264+aac / 16.6秒
- 内容: 夜、別ビルの屋上から東京スカイツリー型のタワーを見上げ、TaCZ の
  スナイパーライフルでスコープを覗き、タワーにいる敵スナイパーを1発で撃破
  （キルカウント x01）。終盤は夕焼けの屋上に倒れた敵スナイパーを映す決着。
- 出力・中間生成物はすべて `video_work/` 配下。

## 依頼内容と方針
「スカイツリーにいるスナイパーを別ビルから見上げて倒す」/「Shorts用」。
→ 16:9 を **9:16(1080x1920) 縦型**へ変換。背景はぼかし拡大フィル、中央に
  等倍の映像（速度変更なし＝等倍）。英語テロップとキル演出を追加。

## タイムライン（元動画＝出力、カットなし16.6秒）
| 時刻 | 内容 |
|------|------|
| 0.0–3.5s | 夜・タワーを見上げ・銃を構える |
| 3.5–5.5s | スコープを覗き照準 |
| 5.6s | キルショット（キルカウント x01・残弾 005→004） |
| 5.6–12.3s | スコープ越しの余韻 |
| 12.3–16.6s | 夕焼けの屋上・倒れた敵スナイパー（決着） |

## レイアウト（1080x1920）
- 背景: 元映像を拡大して全面を覆い `gblur` でぼかし・暗く（-0.20）。
- 前景: 元映像を幅1080の等倍（1080x608）で中央配置。HUD（残弾・キル
  カウント）をクロップで失わないよう fit-width を採用。
- 上部: 英語タイトル2行＋オレンジのアクセントバー（全編表示）。
- 下部: 場面同期の英語キャプション（オレンジ箱+白文字）。

## テキスト構成（英語テロップ）
- 固定タイトル: `SNIPER ON THE SKYTREE` / `one shot from the next roof`
- 下部キャプション:
  | 時刻 | キャプション |
  |------|------|
  | 0.3–3.6s | Target: a sniper on the Skytree |
  | 3.6–5.5s | Scope in from the next rooftop |
  | 5.6–8.6s | One shot - enemy sniper down |
  | 8.6–12.3s | Enemy sniper neutralized |
  | 12.3–16.6s | Mission complete at sunset |

## キル演出（速度変更なし）
- 5.6–5.95s: 画面全体に赤フラッシュ（red@0.24）。
- 5.6–8.4s: 中央に `TARGET DOWN` スタンプ（赤箱+白文字・大）。

## 音声
- 元動画のゲーム音は録音レベルが非常に低い（mean -50.3dB / max -25.5dB）。
  銃声は収録されているため `volume=+18dB` で増幅し `alimiter` で頭打ち。
- 英語ナレーション: edge-tts、声 `en-US-GuyNeural`。動画尺16.6秒に詰め込み
  すぎないよう4セグメント・間を確保。
- BGM: `input/bgm/Mr_Wick.mp3` を `-16dB` で背景化。
- ナレーション中はゲーム音・BGM を `sidechaincompress` でダッキング。
- ナレーション版の最終ラウドネス: mean -18.8dB / peak -0.4dB。

## 成果物
- `output/shorts/tacz_vp7_skytree_telop.mp4` — **テロップ版**（英語字幕＋
  増幅ゲーム音）/ 1080x1920 / 16.6秒
- `output/shorts/tacz_vp7_skytree_narrated.mp4` — **ナレーション＋BGM版**
  （別mp4・推奨）/ 1080x1920 / 16.6秒
- `output/preview/vp7_preview.mp4` — 540x960 低容量プレビュー

## 再実行方法
```
python scripts/make_vp7_shorts.py preview     # プレビュー確認
python scripts/make_vp7_shorts.py final       # テロップ版（縦型 Shorts）
python scripts/make_vp7_narration.py          # 英語ナレーション生成(edge-tts)
python scripts/mix_vp7_audio.py               # ナレ＋BGM版
```
- テロップ文言・演出タイミングは `make_vp7_shorts.py` の `CAPTIONS` /
  `KILL_FLASH` / `KILL_STAMP`。
- ナレーション文言・声は `make_vp7_narration.py` の `SEGMENTS` / `VOICE`。
