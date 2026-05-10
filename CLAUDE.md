# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際の指針を提供する。

## このリポジトリについて

`C:\Users\tomot\Desktop\management` は、ユーザーの全プロジェクト・ノート・スクリプトを集約した**個人ナレッジマネジメントの統合ディレクトリ（Monorepo）**。ソフトウェアプロジェクトではなく、Markdown ドキュメントの管理が主目的。Obsidian Vault としても機能し、Google Drive 経由でスマホと双方向同期、GitHub (`wagyu17/mrok.git`) で SSOT として管理されている。

## 必読ファイル（作業前に必ず参照）

新しいタスクに入る前に、以下を前提知識として読むこと。

- **[USER_CONTEXT.md](./USER_CONTEXT.md)** — ユーザーの基本情報・使用環境・進行中プロジェクト・AI 利用ルール。最初に必ず読む。
- **[AI_Hub.md](./AI_Hub.md)** — 複数 AI（Claude / Codex / Gemini / ChatGPT / Antigravity）の使い分けと、GitHub を中心とした同期ワークフロー。
- **[HOME.md](./HOME.md)** — Obsidian 上の入口（各エリアへのナビゲーション）。

## ディレクトリ構成

```
management/
├── AI_Hub.md             # 複数 AI の統合ハブ
├── USER_CONTEXT.md       # ユーザー前提情報（AI 向け）
├── HOME.md               # Obsidian の入口
├── CLAUDE.md             # 本ファイル（Claude Code 用）
├── AGENTS.md             # Codex 用の同等ファイル
├── _Gem_Knowledge_*.md   # Gemini 向けに統合した領域別ナレッジ（陸上/就活/大学/マイクラ/その他）
│
├── 陸上/                 # 陸上競技：トレーニング計画・ログ・大会調整
├── 就活/                 # 就職活動（アクセンチュア他）の分析・選考対策
├── 東京理科大学/         # 学業・講義ノート・卒論
├── アルバイト/           # マイクラ開発（ONELIFE）等のアルバイト
├── IT/                   # AI ツール活用ナレッジ・自動化スクリプト
├── Study/                # 学習全般（語学等）
├── Ideas/                # アイデア・メモ
├── Schedule/             # スケジュール管理
├── Inbox/                # 未分類メモ（読書ログ・教養・英語勉強 等）
├── Templates/            # Obsidian 用テンプレート（Daily Note, Meso Plan 等）
├── Scripts/              # ユーティリティスクリプト（例: merge_vault_for_gemini.py）
│
├── .obsidian/            # Obsidian 設定
├── .claude/              # Claude Code 設定（settings.local.json 含む）
└── .codex/               # Codex 設定
```

各サブディレクトリには同名の `.md`（例: `陸上.md`）が入口ファイルとして併設されている（Obsidian のフォルダノート規約）。

## コミュニケーションの原則

USER_CONTEXT.md の指針に従う：

- **客観性と事実ベース**：根拠のない励ましや表面的なポジティブさは不要。データ・事実に基づく現実的かつ客観的な分析を提供する。
- **思考プロセスの提示**：結論だけでなく「なぜその結論に至ったか」を、根拠となる理論（力学・生理学・ソフトウェア工学など）とともに論理的に明示する。
- **日本語で記述**する。

## ワークフロー

### 1. 作業ディレクトリの選び方
全体ツリーが大きく AI の精度が低下するため、**タスク対象のサブディレクトリ直下に降りてから作業する**（例: 陸上の計画なら `陸上/` 配下を中心に読む）。横断タスクのときのみ root から扱う。

### 2. SSOT の徹底
- 全情報は `management/` 配下の Markdown に集約する。チャットログに重要な決定事項を残さず、必ず該当 `.md` に追記・保存する。
- 作業開始時は `git pull`、完了時は `git commit && git push` で GitHub を最新に保つ（別デバイス／別 AI が編集している可能性があるため）。

### 3. ドキュメント編集ルール
- 既存ファイルの編集を優先し、新規作成は最小限。
- 情報を追加する際は **公式ドキュメント等で事実確認**してから記載する。二次情報（ブログ・SNS 等）は検証後に補正コメント付きで残す。
- 既存の見出し番号・章番号は変えず、追記する形で採番する。

## 許可済み Web アクセス先

`.claude/settings.local.json` で以下を事前承認済み：
- `WebSearch`
- `WebFetch(domain:www.instagram.com)`
- `WebFetch(domain:shiftb.dev)`

その他のドメインに対する `WebFetch` はユーザー確認が必要。
