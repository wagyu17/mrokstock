# Claude（Claude Code）の使い方まとめ

## 1. Claudeとは

Claudeは Anthropic が開発する大規模言語モデル（LLM）。
本ドキュメントでは特に開発者向けCLIツール **Claude Code** にフォーカスする。

- **Claude Code**: ターミナル上で動作するAIエージェント。自然言語で指示して、複数ツールを横断しながらファイルを書き換える/コードを書くことを得意とする。
- 提供形態: CLI / デスクトップアプリ（Mac・Windows）/ Webアプリ（claude.ai/code）/ IDE拡張（VS Code, JetBrains）。
- 利用には Anthropic の Pro プラン（$20/月）または Max プラン（$60/月〜）が必要。

---

## 2. 基本的な使い方

### インストール・起動
1. ターミナルで `claude` コマンドを起動
2. プロジェクトのルートで `/init` を実行 → `CLAUDE.md` が自動生成される（プロジェクト固有の指示・規約を書く場所）

### 基本操作
| 操作 | 内容 |
|---|---|
| 自然言語で指示 | 「Reactでログインフォームを作って」など日本語OK |
| `/help` | ヘルプ |
| `/clear` | コンテキストをリセット |
| `/init` | CLAUDE.md 生成 |
| `/config` | テーマ・モデル等の設定 |
| `! <cmd>` | シェルコマンドをセッション内で実行 |

### 効率を上げる5つのコツ
1. **CLAUDE.md にプロジェクト規約を書く** … 毎回の説明が不要になる
2. **`ultrathink`** … 「ultrathink」と指示すると Claude がより深く思考して高品質な回答を返す
3. **Hooks** … 特定タイミングで自動実行（例: テスト完了時にサウンドを鳴らす）
4. **スラッシュコマンド/スキル** … 繰り返す作業を再利用可能な形で定義
5. **MCP サーバー** … 外部ツール（GitHub, Notion, Pencil 等）と接続して操作の幅を広げる

---

## 3. スキル・カスタムコマンドで自動化

Claude Code は **スキル**と**カスタムコマンド** をサポート。
「毎回やる一連の流れ」をファイルとして定義し、再利用できる。

### ディレクトリ構成例
```
.claude/
  skills/
    feed-pencil-design/SKILL.md   # デザイン生成スキル
  commands/
    instagram-post.md             # 投稿処理コマンド
scripts/
  instagram_post.py               # API呼び出しスクリプト
```

### スキル置き場所の使い分け
- プロジェクト依存しない汎用スキル → `~/.claude/skills/`（ユーザー全体）
- プロジェクト固有の手順 → `<project>/.claude/skills/`

---

## 4. 実運用のテクニック（ぶべ氏のSNS自動化事例より）

Instagram 投稿の完全自動化（Pencil MCP × Meta Graph API）の事例から学べる運用ノウハウ:

- **ハブとしてのClaude Code**: デザイン生成（Pencil MCP）と API 呼び出し（Meta Graph API）を1つのエージェントに統合する。
- **フィードバックループを残す**: キャプション生成後、**投稿直前だけ人間が確認**する工程を意図的に残し、意図しない発信を防止。
- **MCP の活用**: 公式 MCP 設定で Pencil MCP を有効化 → AI から直接デザイン操作が可能に。

---

## 5. Instagram「@bube.code」（ぶべコード）について

> ※ Instagram は認証が必要なため投稿本文の直接取得はできず、以下は公開プロフィール／関連記事（ShiftB等）からの抽出情報

### アカウント概要
- **アカウント名**: ぶべコード｜1日1分で学ぶWebフロントエンド（@bube.code）
- **フォロワー**: 約8,300（SNS全体で30,000超）
- **発信者**: 立川修平氏（ぶべ）— React/Next.js 特化スクール **ShiftB** 主宰
- **経歴**: 大手メーカー → IT ベンチャー → 独立 → 法人化
- **コンセプト**: 1日1分で学べる Web フロントエンド／AI駆動開発の実践情報

### 発信されているClaude関連トピック
- Claude Code を中心とした **AI駆動開発（バイブコーディング）** の実践
- **Claude Code × Pencil MCP × Meta Graph API** による Instagram 投稿の完全自動化
- カスタムスキル／コマンドの作り方
- フロントエンド（React・Next.js）開発における Claude Code の使い方

### 関連リソース
- ShiftB 記事「Claude Code で Instagram 投稿を完全自動化する方法」
  https://shiftb.dev/articles/instagram-automation-claude-code
- Threads（@bube.code）でも同様のAI開発系トピックを発信

---

## 6. 【特集】Claude Code "Auto Mode" 完全ガイド

> @bube.code 投稿（2026年4月公開）の内容を **公式ドキュメントで事実確認・補正** してまとめたもの。

### 6.1 Auto Mode とは
Anthropic が **2026年3月24日** にリサーチプレビューとして公開し、4月までに Max / Team / Enterprise / API へ展開された新しい permission mode。
（投稿の「4月公開」は厳密には3月だが、Maxユーザー向け展開は4月のため概ね正しい）

- **Claude が確認なしでツールを実行する**
- ただし**別の分類器モデル（classifier）が事前にアクションを審査** し、危険なものをブロック
- `bypassPermissions`（= `--dangerously-skip-permissions`）とは**別物**:
  - bypass: 何もチェックしない
  - auto: バックグラウンド分類器でチェックあり

### 6.2 6つの permission mode 一覧

| モード | 確認なしで実行する範囲 | 用途 |
|---|---|---|
| `default` | 読み取りのみ | 慎重な作業 |
| `acceptEdits` | 読み取り + ファイル編集 + `mkdir`/`mv`/`cp`等 | コードのイテレーション |
| `plan` | 読み取りのみ（編集禁止） | 設計検討 |
| **`auto`** | **すべて（背後で安全チェック）** | **長時間タスク、確認疲れの軽減** |
| `dontAsk` | 事前承認ツールのみ | CI / スクリプト |
| `bypassPermissions` | すべて（チェックなし） | 隔離コンテナ・VM限定 |

※ どのモードでも **保護パス**（`.git`/`.claude`/`.bashrc`/`.mcp.json` 等）への書き込みは自動承認されない

### 6.3 設定方法（3通り）

**① CLIフラグで起動**
```bash
claude --permission-mode auto
```

**② settings.json で永続化**（`~/.claude/settings.json`）
```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```
※ 投稿の `"defaultMode": "auto"` 直書きは誤り。正しくは `permissions` オブジェクトの中

**③ セッション中に Shift+Tab で切替**
- 通常サイクル: `default` → `acceptEdits` → `plan`
- auto モードは **要件を満たしたアカウントのみ** サイクルに登場（初回はオプトインプロンプト）

### 6.4 利用要件（重要）
- **プラン**: Max / Team / Enterprise / API（**Pro では使えない**）
- **モデル**:
  - Team / Enterprise / API → Sonnet 4.6 / Opus 4.6 / Opus 4.7
  - Max → **Opus 4.7 のみ**
- **プロバイダ**: Anthropic API のみ（Bedrock / Vertex / Foundry は不可）
- **管理者**: Team / Enterprise は管理者が事前に有効化
- **バージョン**: Claude Code v2.1.83 以降

### 6.5 分類器がデフォルトでブロックする操作
- `curl | bash` 形式のコード DL & 実行
- 機密データの外部送信
- 本番デプロイ・マイグレーション
- クラウドストレージの一括削除
- IAM / リポジトリ権限付与
- 共有インフラの変更
- セッション開始前から存在したファイルの破壊的削除
- `main` への直接 push、force push

### 6.6 デフォルトで許可される操作
- 作業ディレクトリ内のローカルファイル操作
- lockfile / manifest 記載の依存インストール
- `.env` の読み取りと対応 API への送信
- 読み取り専用 HTTP リクエスト
- 開始時のブランチまたは Claude が作ったブランチへの push

### 6.7 会話で境界を伝えられる
「push しないで」「レビューが終わるまでデプロイ待って」と伝えると、分類器がそれをブロック信号として扱う。
ただし**コンテキスト圧縮で消えると無効になる** → 確実にしたいなら `permissions.deny` ルールを追加。

### 6.8 止めたいとき / フォールバック挙動
- **3回連続 or 累計20回ブロック** されると auto mode が一時停止し、通常の確認モードに戻る
- 通知 + `/permissions` の "Recently denied" タブから `r` キーで個別承認できる
- ヘッドレス（`-p`）での連続ブロックはセッション中断

### 6.9 向いている / 向いていない作業

**向いている**
- 長時間の自動化タスク
- 信頼できる方向性のリファクタ
- ローカル環境でのコード生成・編集主体の作業

**向いていない**
- センシティブな操作（本番DB・課金・公開API）
- レビュー必須の重要な変更
- Pro プランや非対応モデル使用時（そもそも使えない）

### 6.10 投稿との差分まとめ
| 投稿の主張 | 検証結果 |
|---|---|
| 2026年4月公開 | ⚠️ 正確には2026年3月24日。Max展開は4月 |
| 確認ダイアログがほぼ消える | ✅ ただし保護パス・分類器ブロック時は表示 |
| 裏でAI分類器が危険操作だけブロック | ✅ 正確 |
| `--dangerously-skip-permissions` とは別物 | ✅ 正確 |
| `claude --permission-mode auto` で起動 | ✅ 正確 |
| `~/.claude/settings.json` に `defaultMode: "auto"` | ⚠️ 正しくは `permissions.defaultMode` |
| Shift+Tab で切替 | ✅ ただし要件を満たしたアカウントのみ |

---

## 7. /skills（スキル）完全ガイド

### 7.1 スキルとは

Claude Code の能力を拡張するプラグイン機構。`SKILL.md` に手順を書くと Claude のツールキットに追加される。

- `/skill-name` で直接呼び出す、または Claude が文脈から自動判断して使う
- 「毎回チャットに同じ手順を貼り付ける」「CLAUDE.md が手順書化してきた」なら スキルに切り出す時期
- `.claude/commands/` の旧カスタムコマンドとは完全互換（スキルが優先）

---

### 7.2 スキルの格納場所

| 場所 | パス | 有効範囲 |
|---|---|---|
| 個人（全プロジェクト共通） | `~/.claude/skills/<name>/SKILL.md` | 自分の全プロジェクト |
| プロジェクト固有 | `.claude/skills/<name>/SKILL.md` | そのプロジェクトのみ |
| Enterprise | managed settings で配布 | 組織全ユーザー |
| プラグイン | `<plugin>/skills/<name>/SKILL.md` | プラグイン有効環境 |

同名スキルがある場合: **Enterprise > 個人 > プロジェクト** の順で上書き。
ファイルを追加・編集するとセッション再起動なしにリアルタイム反映（新規ディレクトリ作成時のみ再起動が必要）。

---

### 7.3 ディレクトリ構成

```
~/.claude/skills/
└── my-skill/
    ├── SKILL.md          # 必須：メイン指示書
    ├── reference.md      # 詳細リファレンス（必要時のみ読み込み）
    ├── examples/
    │   └── sample.md     # 期待する出力例
    └── scripts/
        └── helper.py     # Claude が実行できるスクリプト
```

**SKILL.md は500行以内**を推奨。詳細は別ファイルに切り出して SKILL.md から参照する。

---

### 7.4 SKILL.md の基本構造

```yaml
---
name: explain-code
description: コードをビジュアル図と例えで説明する。「これどう動く？」に使う
---

コードを説明するときは以下を必ず含める:

1. **アナロジー**: 日常のものに例える
2. **ASCII図**: フロー・構造・関係を図示
3. **ステップ解説**: 何が起きるか順番に説明
4. **落とし穴**: よくある誤解を1つ挙げる
```

**呼び出し**: `How does this code work?` と聞けば自動発動、または `/explain-code src/auth.ts` で直接呼び出し。

---

### 7.5 frontmatter 全フィールド一覧

| フィールド | 説明 |
|---|---|
| `name` | スラッシュコマンド名（省略時はディレクトリ名）|
| `description` | Claude がいつ使うか判断する説明文（**必須推奨**）|
| `when_to_use` | トリガーとなるフレーズなど追加ヒント |
| `argument-hint` | 補完時に表示される引数ヒント（例: `[issue番号]`）|
| `arguments` | 名前付き引数の定義（`$name` で参照）|
| `disable-model-invocation` | `true` にすると Claude が自動使用しない（手動専用）|
| `user-invocable` | `false` にすると `/` メニューに表示しない（Claude専用知識）|
| `allowed-tools` | スキル実行中に確認なしで使えるツール |
| `model` | このスキル実行中に使うモデル |
| `effort` | 思考量 `low/medium/high/xhigh/max` |
| `context` | `fork` でサブエージェントとして実行 |
| `agent` | `context: fork` 時のエージェント種別 |
| `paths` | スキルが自動有効になるファイルパターン（glob）|

---

### 7.6 引数の使い方

```yaml
---
name: fix-issue
description: GitHub Issue を修正する
disable-model-invocation: true
---

GitHub Issue $ARGUMENTS を修正してください。

1. Issue の内容を読む
2. 修正を実装する
3. テストを書く
4. コミットを作る
```

`/fix-issue 123` → `$ARGUMENTS` が `123` に展開される。

**複数引数**:
```
$ARGUMENTS[0]  # 第1引数（$0 と同じ）
$ARGUMENTS[1]  # 第2引数（$1 と同じ）
```

`/migrate-component SearchBar React Vue`
→ `$0=SearchBar` `$1=React` `$2=Vue`

---

### 7.7 呼び出し制御（誰が使うか）

| 設定 | ユーザー呼出 | Claude自動 | コンテキストへの読込 |
|---|---|---|---|
| デフォルト | ✅ | ✅ | description 常時、本文は呼出時 |
| `disable-model-invocation: true` | ✅ | ✗ | 読み込まれない |
| `user-invocable: false` | ✗ | ✅ | description 常時、本文は呼出時 |

**使い分け例**:
- `/deploy`, `/commit` → `disable-model-invocation: true`（Claude が勝手にデプロイするのを防ぐ）
- `legacy-system-context`（背景知識）→ `user-invocable: false`（Claude だけが参照）

---

### 7.8 ツール権限の事前承認

```yaml
---
name: commit
description: 変更をステージしてコミットする
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

`allowed-tools` に書いたツールは、このスキル実行中だけ確認なしで実行できる。

---

### 7.9 動的コンテキストの注入（シェル実行）

`` !`command` `` 構文でスキルが Claude に渡る**前**にシェルコマンドを実行し、出力を埋め込める:

```yaml
---
name: pr-summary
description: PR の変更をサマリーする
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## PRコンテキスト
- diff: !`gh pr diff`
- コメント: !`gh pr view --comments`
- 変更ファイル: !`gh pr diff --name-only`

## タスク
このPRをサマリーしてください
```

複数行コマンドは ` ```! ` ブロックで:

````
```!
node --version
git status --short
```
````

---

### 7.10 サブエージェントとして実行（context: fork）

`context: fork` を付けると、スキルが**独立したサブエージェント**として動く（会話履歴なし）。

```yaml
---
name: deep-research
description: トピックを徹底調査する
context: fork
agent: Explore
---

$ARGUMENTS を徹底的に調査してください:

1. Glob と Grep で関連ファイルを探す
2. コードを読んで分析する
3. 具体的なファイル参照付きで所見をまとめる
```

`agent` に指定できる値: `Explore`, `Plan`, `general-purpose`, またはカスタムサブエージェント名。

---

### 7.11 実践：最初のスキルを作る手順

```bash
# 1. ディレクトリ作成
mkdir -p ~/.claude/skills/my-skill

# 2. SKILL.md を作成
cat > ~/.claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: （ここに Claude がいつ使うかを書く）
---

（ここに指示を書く）
EOF

# 3. Claude Code で確認
# 「What skills are available?」と聞く、または /my-skill で呼び出す
```

---

### 7.12 トラブルシューティング

| 症状 | 対処 |
|---|---|
| スキルが自動発動しない | `description` にユーザーが使いそうなキーワードを入れる |
| スキルが多すぎる場面で発動しない | `description` を短く・具体的にする（1536文字上限あり） |
| 不要な場面で発動する | `description` を絞るか `disable-model-invocation: true` |
| コンテキスト圧縮後に効かなくなった | 再度 `/skill-name` で呼び直す |

---

## 8. 学習ステップ提案

1. `claude` インストール → `/init` で CLAUDE.md 作成
2. 簡単なコード生成タスクで挙動を確認
3. `ultrathink` を使った深い設計相談を試す
4. プロジェクトに合わせた **スラッシュコマンド** を1つ作る
5. **MCP サーバー** を1つ追加（GitHub MCP など簡単なものから）
6. **Hooks** で自動化（テスト後通知、コミット前チェックなど）
7. 慣れたらスキルでワークフロー全体を自動化（ぶべ氏のSNS自動化が好例）

---

## 9. セッションの継続・再開

### 9.1 よくある疑問：「チャット履歴が消えた？」

VS Code のターミナルで `claude` と打つたびに会話が最初からになるのは**仕様どおりの動作**。
ただし**セッションは自動保存**されており、コマンドで再開できる。

---

### 9.2 再開コマンド（3通り）

**① 直前の会話をすぐ再開（最もよく使う）**
```bash
claude --continue
```

**② セッション一覧から選んで再開**
```bash
claude --resume
```
↑ キーボードで選択できるピッカーが開く

**③ セッション中に別の会話へ切替**
```
/resume
```

---

### 9.3 セッションに名前をつける（推奨）

```bash
# 起動時に名前をつける
claude -n auth-refactor

# セッション中に名前をつける
/rename auth-refactor

# 名前で直接再開
claude --resume auth-refactor
```

名前をつけておくと複数の作業を並行しているときに探しやすい。

---

### 9.4 セッションピッカーのキーボードショートカット

| キー | 操作 |
|---|---|
| `↑` / `↓` | セッション移動 |
| `Space` | 内容をプレビュー |
| `Enter` | 再開 |
| `/` | 検索 |
| `Ctrl+R` | セッション名を変更 |
| `Ctrl+A` | 全プロジェクトのセッションを表示 |
| `Ctrl+B` | 現在のブランチのセッションに絞る |
| `Esc` | ピッカーを閉じる |

---

### 9.5 注意点

- セッションは**プロジェクトディレクトリごと**に管理される。VS Code で同じフォルダを開いてから `claude` を起動すれば、そのフォルダのセッション履歴が `--resume` で出てくる。
- セッションが非常に大きい場合、再開時に「全履歴を読み込む」か「要約から再開する」か選択できる（Bedrock / Vertex / Foundry では非対応）。
- `claude -p`（ヘッドレス）で起動したセッションはピッカーに表示されないが、セッションIDを直接渡せば再開可能: `claude --resume <session-id>`

---

## 参考リンク

- [Claude Code 公式: claude.ai/code](https://claude.ai/code)
- [Claude Code を初めて使う人向けの実践ガイド (Zenn)](https://zenn.dev/hokuto_tech/articles/86d1edb33da61a)
- [Claude Codeの使い方完全ガイド (カゴヤ)](https://www.kagoya.jp/howto/engineer/hpc/use-claudecode/)
- [Claude CodeでInstagram投稿を完全自動化する方法 (ShiftB)](https://shiftb.dev/articles/instagram-automation-claude-code)
- [@bube.code (Instagram)](https://www.instagram.com/bube.code/)
- [Choose a permission mode (Claude Code 公式)](https://code.claude.com/docs/en/permission-modes)
- [Auto mode for Claude Code (Anthropic Blog)](https://claude.com/blog/auto-mode)
- [Claude Code auto mode: a safer way to skip permissions (Anthropic Engineering)](https://www.anthropic.com/engineering/claude-code-auto-mode)
- [Extend Claude with skills (Claude Code 公式)](https://code.claude.com/docs/en/skills)
- [Common workflows — Resume previous conversations (Claude Code 公式)](https://code.claude.com/docs/en/common-workflows)

---

*draft — 取得元: WebFetch (shiftb.dev) + WebSearch。Instagram 本体は認証必須のため投稿本文未取得。*
