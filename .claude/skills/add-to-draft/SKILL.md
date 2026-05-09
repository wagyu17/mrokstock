---
name: add-to-draft
description: SNSの投稿や記事など Claude 関連コンテンツを受け取り、公式ドキュメントで事実確認したうえで、howto_claude/draft.md に新セクションとして追記する。
argument-hint: [追記したい内容またはトピック名]
disable-model-invocation: true
allowed-tools: WebFetch WebSearch Read Edit
---

以下のコンテンツを `howto_claude/draft.md` に追記してください。

## 入力コンテンツ

$ARGUMENTS

## 手順

### Step 1: 事実確認
- 主要な主張を公式ドキュメント（code.claude.com/docs, claude.com/blog, anthropic.com/engineering）で検証する
- 不正確な情報は補正コメント（⚠️）付きで記載する
- 確認できなかった情報は（❓ 未確認）と明記する

### Step 2: draft.md を読む
- `howto_claude/draft.md` の末尾のセクション番号を確認する
- 既存の同トピックのセクションがある場合は、新規追記ではなく既存セクションへの追記を検討する

### Step 3: セクションを作成して追記
末尾の `---` と `## 参考リンク` の間に新セクションを挿入する。以下の形式を守ること:

```
## N. [セクションタイトル]

> 出典: [元の投稿/記事のURL または「手動入力」]

### N.1 [小見出し]
（内容）

### N.2 [小見出し]
（内容）

（必要に応じて小見出しを追加）
```

### Step 4: 完了報告
- 追記したセクション番号とタイトルを報告する
- 補正した情報がある場合は一覧で伝える
