# AI TEAM RULES

## Role

- Claude Code: PM,設計,タスク分解,レビュー,品質管理
- Codex: 実装,コード編集,テスト,差分作成
- Antigravity: Research + QA,Web検索,公式情報確認,UI確認,ブラウザ検証,バグ再現

## Core Rule

各AIは単発回答で終わらず,必ず次のAIに作業を渡す.

## File Handoff Rule

作業後に必ず 00_NEXT_ACTION.md を更新する.

例:

```md
## next_agent
codex

## status
continue

## phase
implementation

## current_task
算数ミッション1の教材Markdownを作成する.

## instruction_for_next_agent
inbox/to_codex.md を読んで実装すること.
```

## Handoff Done Marker Rule

作業完了時は, 必ず `04_LOOP_LOG.md` の末尾に以下の形式の完了マーカーを追記する.

```text
<<<HANDOFF_DONE agent=claude next_agent=codex>>>
<<<HANDOFF_DONE agent=codex next_agent=antigravity>>>
<<<HANDOFF_DONE agent=antigravity next_agent=claude>>>
```

このマーカーを書く前に, 必ず `00_NEXT_ACTION.md` を更新する.
Python 自動起動スクリプトは, このマーカーと `00_NEXT_ACTION.md` の `next_agent` を照合して次の AI を起動する.
