# 03_AGENT_STATUS

各AIの直近状態をここに集約します。作業したAIは自分の行を更新してください。

## Agent Status

| Agent | Status | Last Action | Current Task | Blocker | Last Updated |
|---|---|---|---|---|---|
| Claude Code | DONE | E3+E4 BLOCKED判定 + D5 Codex指示投入済み | human成果物待ち | none | 2026-05-26 |
| Codex | DONE | humanフェーズ readiness 確認。H1未記入/H2未チェック/バックアップ未作成を確認 | 実機操作は人間待ち | none | 2026-05-26 |
| Antigravity | IDLE | D2 操作カードの仕様リサーチ | 待機中 | none | 2026-05-26 |
| Human | NEXT | Minecraft Education上のM0構築フェーズ | M0実構築 + H1座標記入 + バックアップ作成 | none | 2026-05-26 |

## Current Lock Summary

- Lock Status: UNLOCKED
- Locked By: none
- Locked Task: none

## Handoff Summary

Orchestratorからhumanフェーズが指定されたため、Codexがreadinessを確認。H1/H2/バックアップ成果物は未完了のため、次は人間が `inbox/to_human.md` に従ってMinecraft Education上でM0を実構築し、H1座標を記入する。

## Open Issues

- C3 (UD教科書体+フォント拡大+ボックス拡大+ひらがな統一) は未実装。PDF はプレビュー版扱い
- D3 (自由マイクラ遊びへの送り出し方) は orchestrator スキップで保留中
- D4 (NG ワード集) は未着手
- D5 は Codex 指示投入済み・未実行
- E1 (進捗統合ドキュメント) は未着手
- E2-E4 は A2-A7 完了まで BLOCKED
- 対象プロジェクト `C:\Users\tomot\Desktop\マイクラ開発` は Git 管理外
