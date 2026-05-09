---
tags: [陸上, ハブ]
date: 2026-03-25
---

# Training Hub

> **現在のフェーズ:** Phase 4 — レースシーズン（2026-03 現在）
> **目標:** 800m 1'52"50（PB: 1'55"39）by April 2026

---

## フォルダ構成

```
Training/
├── README.md          ← このファイル（ナビゲーションハブ）
└── Logs/
    └── YYYY/
        └── MM/
            └── YYYY-MM-DD_{title}.md   ← Garmin インポート済みログ
```

---

## クイックナビゲーション

| リンク | 説明 |
|--------|------|
| [[2026_annual_training_plan]] | 年間マクロ計画・フェーズ定義 |
| [[running_physiology_knowledge]] | 運動生理学リサーチ集約ノート |
| [Training/Logs/](Training/Logs/) | Garmin インポート済みトレーニングログ |

### 使用テンプレート

| テンプレート | 用途 |
|-------------|------|
| [[Templates/Meso Plan]] | 4週間メソサイクル計画 |
| [[Templates/Exercise Physiology Research]] | DeepResearch 知見の整理 |
| [[Templates/Daily Note]] | デイリーレビュー（練習ログリンク含む） |

---

## ワークフロー

```
1. Garmin Connect でアクティビティを同期
        ↓
2. Activities.csv をエクスポート（または FIT ファイルをダウンロード）
        ↓
3. garmin_import.py で Obsidian ログノートを自動生成
   > python garmin_import.py Activities.csv
        ↓
4. 生成された Training/Logs/YYYY/MM/YYYY-MM-DD_{title}.md を開く
   - ## Plan / ## Check / ## Action を手動で記入
   - RPE・怪我メモを追加
        ↓
5. 毎週日曜：週次レビュー（Meso Plan の週次チェック項目を確認）
        ↓
6. brain_query.py でAI分析（傾向・疲労・ペース推移）
        ↓
7. 必要に応じて Notion へ書き戻し（write-back）
```

---

## Phase 4 — レースシーズン概要（2026-03）

| 項目 | 内容 |
|------|------|
| **フェーズ期間** | 2026-03 〜 2026-04 |
| **主目標** | 800m 1'52"50 達成 |
| **練習の重点** | レースペース維持・スピードシャープニング・テーパー |
| **週間距離目安** | 40〜55 km（レース週は削減） |
| **キーセッション** | 200m / 400m インターバル、600m レースペース、LSD |
| **注意点** | オーバートレーニング防止・怪我予防・睡眠優先 |

### 現在のメソサイクル

- [[]] ← 現在のメソサイクルノートをリンク

---

## ログ集計（手動更新 or brain_query.py で自動）

| 月 | 累計距離 (km) | セッション数 | 備考 |
|----|--------------|--------------|------|
| 2026-01 | | | |
| 2026-02 | | | |
| 2026-03 | | | Phase 4 開始 |
| 2026-04 | | | 目標レース |

---

*[[HOME]] | [[2026_annual_training_plan]]*
