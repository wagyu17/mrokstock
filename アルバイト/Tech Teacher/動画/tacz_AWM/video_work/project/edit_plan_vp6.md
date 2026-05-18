# 編集方針 — TaCZ 都市銃撃戦（動画プロジェクト6）

## 素材
- `input/raw/動画プロジェクト 6.mp4`（読み取り専用）
- 1920x1080 / 16:9 / 30fps / h264+aac / 約140秒
- 内容: TaCZ 銃Mod を入れた Minecraft の巨大都市マップ。20体のロシア兵
  （RU Unit・オリーブ迷彩・AK 装備）と 20体のアメリカ兵（US Unit・赤）が
  屋上で交戦する。
- 構成: 前半 約95秒は街のフライト（全景・摩天楼の谷・屋上広場）、
  後半 約95〜137秒が屋上での銃撃戦、末尾 約137〜140秒はゲームメニュー。
- 出力・中間生成物はすべて `video_work/` 配下。

## 依頼内容と方針
「ロシア兵20 vs アメリカ兵20・街の上での銃対戦。テロップと編集。
ナレーションとBGMは別mp4」。
→ 前半フライトが冗長なため**ハイライト凝縮**を採用。4セグメントを抽出・
  連結し約68秒へ。英語テロップを焼き込み、ナレーション＋BGM版は別ファイル。

## カット構成（元動画 → 出力タイムライン）
| # | 元動画の区間 | 出力区間 | 内容 |
|---|------|------|------|
| S1 | 0.0–9.0s | 0–9s | 街の全景・establishing |
| S2 | 38.0–47.0s | 9–18s | 摩天楼の谷を飛行 |
| S3 | 78.0–87.0s | 18–27s | 屋上広場へ降下・部隊配置 |
| S4 | 95.0–136.0s | 27–68s | 屋上での銃撃戦（本編） |

合計 68秒。末尾のゲームメニュー（137秒〜）はカット。

## テキスト構成（英語テロップ）
- 上部タイトルカード（出力 0–9秒のみ・半透明黒バンド）:
  `20 RUSSIANS vs 20 AMERICANS` / `TaCZ GUN WAR - MINECRAFT`（オレンジ）
- 下部キャプション（オレンジ箱 #E0581F・白文字・y=905）:
  | 出力時刻 | キャプション |
  |------|------|
  | 0.4–9.0s | A megacity rebuilt block by block |
  | 9.0–18.0s | 8,742 blocks reshaped into a war zone |
  | 18.0–27.0s | Two squads deploy across the rooftops |
  | 27.0–37.0s | RUSSIAN UNIT opens fire - AK rifles |
  | 37.0–47.0s | US UNIT pushes back hard |
  | 47.0–57.0s | Tracers tear across the skyline |
  | 57.0–65.0s | Last squad standing takes the city |
  | 65.0–68.0s | Who wins? Follow for Part 2 |

## 音声
- 元動画のゲーム音は録音レベルが低い（mean -46.8dB / max -17.2dB）。
  銃声・着弾音は収録されているため `volume=+14dB` で増幅し `alimiter` で頭打ち。
- 英語ナレーション: edge-tts（無料・APIキー不要）、声 `en-US-GuyNeural`
  （男性・落ち着いた語り）。8セグメントを出力タイムラインに同期。
- BGM: `input/bgm/Mr_Wick.mp3`（mean -14.8dB）を `-16dB` で背景化。
- ナレーション中はゲーム音・BGM の両方を `sidechaincompress` でダッキング。
- 最終ラウドネス: ナレーション版 mean -20.1dB / peak -0.3dB。

## 成果物
- `output/longform/tacz_vp6_battle_telop.mp4` — **テロップ版**（英語字幕＋
  増幅ゲーム音）/ 1920x1080 / 68秒
- `output/longform/tacz_vp6_battle_narrated.mp4` — **ナレーション＋BGM版**
  （別mp4・推奨）/ 1920x1080 / 68秒
- `output/preview/vp6_preview.mp4` — 960x540 低容量プレビュー

## 再実行方法
```
python scripts/make_vp6_highlight.py preview   # プレビュー確認
python scripts/make_vp6_highlight.py final     # テロップ版（Output A）
python scripts/make_vp6_narration.py           # 英語ナレーション生成(edge-tts)
python scripts/mix_vp6_audio.py                # ナレ＋BGM版（Output B）
```
- カット区間・テロップ文言は `make_vp6_highlight.py` の `SEGMENTS` / `CAPTIONS`。
- ナレーション文言・声・タイミングは `make_vp6_narration.py` の `SEGMENTS` / `VOICE`。
- edge-tts のエンドポイントは断続的。`make_vp6_narration.py` は生成済み
  セグメントをスキップして再開するので、全8本揃うまで再実行すればよい。

## 次に検討できる改善
- 戦闘区間（S4）にズームやスローを加えると山場が強調できる。
- RU/US の各兵に矢印やマーカーを当てると「20 vs 20」がより伝わる。
- 撃破数のカウンター表示（テロップ）でスコア感を出せる。
