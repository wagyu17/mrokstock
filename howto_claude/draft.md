# Claude / Codex 活用・設定メモ (draft)

## 1. スマホからの Git 同期設定 (2026-05-10 追加)

スマホの Claude アプリから `/git` と入力するだけで、PC側のリポジトリを GitHub へプッシュする仕組み。

### 仕組み
- **スキル定義**: `.agents/skills/git-sync/SKILL.md`
- **実行スクリプト**: `Scripts/git-sync.ps1`
- **動作内容**: `git add -A` -> `git commit` (自動メッセージ) -> `git push`

### 使い方
Claude とのチャット欄に以下のように入力する：
- `/git`
- 「git同期」
- 「pushして」

### 注意点
- 100MBを超えるファイルがある場合、GitHubに拒否されるためエラーになる。その場合はPC側でファイルを削除し、履歴をリセットする必要がある。
- このコマンドは Claude のインターフェース上でのみ有効（通常のターミナルでは動作しない）。
