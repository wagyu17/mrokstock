# ai_team_卒論

静圧空気スピンドルのエンドミル加工シミュレーション高度化に関する卒業論文を、3AI体制で進めるワークスペース。

## 研究テーマ

静圧空気スピンドルを用いたエンドミル加工時の回転軸振れおよび加工精度に関する数値的・実験的研究

## AI役割分担

| Agent | 役割 | 主な作業 |
|---|---|---|
| **Claude Code** | PM・設計 | 研究計画、Fortran修正のロジック設計、論文構成、レビュー |
| **Codex** | 実装 | Fortranコード修正、Python/HTMLツール、データ処理、図表生成 |
| **Antigravity** | リサーチ・QA | 先行研究調査、引用確認、可視化ツールの動作検証 |

## フォルダ構成

```
ai_team_卒論/
│
├── 管理ファイル（3AI共通）
│   ├── 00_THESIS_THEME.md      卒論テーマ・研究概要
│   ├── 00_NEXT_ACTION.md       次のアクション
│   ├── 01_RESEARCH_PLAN.md     研究計画・フェーズ別スケジュール
│   ├── 01_RULES.md             ルール
│   ├── 02_PROJECT_CONTEXT.md   プロジェクト背景・AI役割
│   ├── 03_AGENT_STATUS.md      各AIの状態
│   ├── 05_DATA_INVENTORY.md    データ一覧
│   ├── mission.md              ミッション定義
│   ├── state.md                現在の状態
│   └── task_queue.md           タスクキュー
│
├── prompts/         各AIの役割プロンプト
├── inbox/           他AIへの依頼
├── outbox/          各AIの作業報告
├── research/        先行研究・関連技術・調査メモ
├── experiments/     実験データ・手順・結果・分析
├── materials/       ★ 引き継ぎ資料・実験データ・数値解析結果（メイン）
├── thesis/          卒論本文・章ドラフト・図表
├── logs/            実行ログ
├── lock/            排他制御
└── archive/         アーカイブ
```

## 最初にやること（各AI）

### Claude Code
1. `mission.md` → `state.md` → `02_PROJECT_CONTEXT.md` を読む
2. `materials/実験・数値解析結果（claude）/CLAUDE.md` を読む（コード全体像）
3. `inbox/to_claude.md` の依頼を確認する

### Codex
1. `mission.md` → `state.md` を読む
2. `materials/実験・数値解析結果（claude）/AGENTS.md` を読む（コード全体像）
3. `inbox/to_codex.md` の依頼を確認する

### Antigravity
1. `mission.md` → `state.md` → `00_THESIS_THEME.md` を読む
2. `materials/実験・数値解析結果（claude）/thesis_summary.txt` を読む（前任者の論文要旨）
3. `inbox/to_antigravity.md` の依頼を確認する

## 現在のフェーズ

```
Phase 1 [████████████] 完了   環境構築・前任者モデル再現
Phase 2 [████████████] 完了   アニメーション出力・可視化ツール
Phase 3 [            ] 次     y 方向たわみ追加 ← 今ここ
Phase 4 [            ]        全条件計算・実験比較
Phase 5 [            ]        考察・論文執筆
```
