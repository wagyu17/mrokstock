# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## システム概要

陸上競技（長距離）のトレーニング管理システム。Garmin ConnectからエクスポートしたCSVデータを中心に、Excelファイルへの集計・分析と静的Webサイトの生成を行う。

## コマンド

### 通常の更新（日常的に使用）
```
更新.bat
```
以下を順番に実行する:
1. `python scripts\update_excel.py` — `hr_zone_analysis.xlsx` の全分析シートを再構築
2. `python scripts\import_laps.py` — `更新用トレーニングログ/` 内の `activity_*.csv` からラップデータをインポート
3. `python scripts\update_plan.py` — フェーズ計画・週次管理シートを更新

### 静的サイト生成
```
python scripts/build_site.py
```
`training_log_2026.csv` を読み込んで `site/index.html` を生成する（スマホ対応）。

### 初回セットアップ（Excelがない場合）
```
python scripts/build_excel.py
```
`training_log_2026.csv` から `hr_zone_analysis.xlsx` を新規作成する。以降は `update_excel.py` を使う。

## データフロー

```
Garmin Connect
  ↓ CSVエクスポート
training_log_2026.csv          ← メインデータソース（全アクティビティ一覧）
更新用トレーニングログ/         ← ラップデータCSV置き場 (activity_*.csv, Activities*.csv)
  ↓ 更新.bat
hr_zone_analysis.xlsx          ← 分析ハブ（6シート構成）
  └── Garminデータ（貼付用）
  └── ログ（分析ビュー）
  └── 週間集計 + グラフ
  └── 月別集計 + グラフ
  └── ゾーン集計 + 円グラフ
  └── ラップデータ / ポイント練習一覧（import_laps.pyで追記）
  └── フェーズ計画 / 週次管理（update_plan.pyで更新）
  ↓ build_site.py
site/index.html                ← スマホ対応ダッシュボード（Chart.js使用）
```

## 心拍ゾーン定義（最大心拍 187bpm）

| ゾーン | 心拍数 | 目的 |
|--------|--------|------|
| Z1 | < 112 bpm | 積極的回復 |
| Z2 | 112–130 bpm | 有酸素基礎 |
| Z3 | 131–149 bpm | 有酸素能力向上（LT1付近） |
| Z4 | 150–168 bpm | 乳酸閾値（LT2） |
| Z5 | 169+ bpm | VO2max |

※ `build_excel.py` / `update_excel.py` の `MAX_HR = 187` と `zone_of()` 関数、`build_site.py` の `ZONE_DEF` リストに直接記述されており、変更時は3ファイル同期が必要。

## 重要な設定箇所

- **レース日程**: `scripts/update_plan.py` の `RACE_DATE` / `NEAR_RACE` を更新
- **週間スケジュール**: `scripts/build_site.py` の `SCHEDULE` 辞書（月〜日の練習内容）
- **自己ベスト**: `scripts/build_site.py` の `pb_rows` リスト（サイトのPBテーブル）
- **シーズン開始**: `scripts/update_plan.py` の `SEASON_START`（フェーズ計算の起点）

## ファイル構成

| パス | 用途 |
|------|------|
| `training_log_2026.csv` | Garminアクティビティ一覧（メインデータ） |
| `hr_zone_analysis.xlsx` | 分析・管理の中心ファイル |
| `site/index.html` | スマホ用ダッシュボード（生成物） |
| `固定データ/トレーニング計画_2026.md` | シーズン目標・フェーズ計画（参照用） |
| `トレーニング理論/` | 生理学・トレーニング理論のドキュメント群 |
| `分析ログ/` | 過去の分析スクリプトと出力結果 |
| `更新用トレーニングログ/` | Garminからダウンロードしたラップデータ置き場 |

## 依存ライブラリ

`openpyxl`（Excel操作）のみ。`build_site.py` は標準ライブラリのみ使用。

## データ解釈上の注意

### Garminの気温データは信頼しない

Garmin Forerunner 等の手首装着型デバイスが記録する気温（CSV内 `平均気温` / `最低気温` / `最高気温`、fit内 `temperature`）は**体温・直射日光・腕の血流の影響を受けて実測気温より高めに出る**ため、**条件比較・気温補正の根拠として使用しない**こと。

- 過去セッション同士の比較や「暑熱下効率」評価をする場合、ユーザーから別途提供される実気象データ（気象庁・現地気温計など）を優先する
- ユーザーが口頭で示した気温（例: 「20.3℃でやった」）を優先採用する
- 単独の参考情報としてのみ言及可能だが、`Garmin計測の気温` であることを明記する

### 有益な結論が出た場合の追記ルール

分析・対話の中で**選手の身体状態・走力・適応・戦略について有益な結論や知見**が得られた場合は、必ず以下に追記して未来の参照を可能にすること:

| 追記先 | 用途 |
|---|---|
| `アーカイブ/トレーニングログ_全記録.md` | セッション実績・データ分析・主観報告・生理学的解釈 |
| `claude_file/5_10_training_plan.md`（または現行のレース計画書） | レース戦略・ピーキング判定・出走判断・タイム予想 |

追記対象の例:
- 主観報告から得られた身体状態の特徴（例: 乳酸再利用感覚、フォーム改善、ANS応答パターン）
- データから明らかになった構造的特徴（例: ストライド/ピッチの分解、HR天井、適応タイムライン）
- レース戦略への含意（例: ペース戦略、kick判断基準、DNS判断ライン）
- 過去セッションとの比較結論（例: PB-prep期との効率比較・気温補正後の解釈）

「会話の中で有益と判断した時点で即追記」が原則。後でまとめて書こうとせず、判明した時点で記録する。
