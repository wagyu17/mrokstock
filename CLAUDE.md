# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このリポジトリについて

Claude Code の使い方・設定・Tips を蓄積する個人ナレッジベース。ソフトウェアプロジェクトではなく、Markdown ドキュメントの管理が主目的。

## ディレクトリ構成

```
management/
├── howto_claude/        # Claude Code の使い方まとめドキュメント
│   └── draft.md         # メインドキュメント（随時追記中）
└── .claude/
    └── settings.local.json
```

## ドキュメント編集ルール

- `howto_claude/draft.md` が唯一のメインドキュメント。新しい Claude 関連の情報はここに追記する。
- セクション番号は末尾に追記する形で採番（既存番号は変えない）。
- 情報を追加する際は **公式ドキュメント（code.claude.com/docs）で事実確認**してから記載する。投稿・ブログ等の二次情報は検証後に補正コメント付きで記載。
- 日本語で記述する。

## 許可済み Web アクセス先

`settings.local.json` で以下を事前承認済み:
- `WebSearch`
- `WebFetch(domain:www.instagram.com)`
- `WebFetch(domain:shiftb.dev)`
