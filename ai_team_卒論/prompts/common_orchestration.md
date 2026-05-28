# Common Orchestration Rules

このAIチームは、卒論テーマを小さなtodoに分解し、Claude Code・Codex・Antigravity が同じ作業拠点を共有しながら順番に作業するための仕組みです。

## 固定の作業拠点

- AI_TEAM_ROOT: `C:\Users\tomot\Desktop\management\ai_team_卒論`
- prompts: `C:\Users\tomot\Desktop\management\ai_team_卒論\prompts`
- inbox: `C:\Users\tomot\Desktop\management\ai_team_卒論\inbox`
- outbox: `C:\Users\tomot\Desktop\management\ai_team_卒論\outbox`

## 最初に読むファイル

1. `mission.md`
2. `state.md`
3. `00_THESIS_THEME.md`
4. `task_queue.md`
5. 自分のrole prompt
6. 自分宛てのinbox
7. 他AIの直近outbox

## 連携ルール

- Claude Code はPM、研究計画、章立て、レビュー、次アクション整理を担当する
- Codex は実装、実験補助ツール、データ整理、図表生成を担当する
- Antigravity は先行研究調査、関連技術調査、Web確認、QA、検証観点整理を担当する
- 1回の作業は小さく区切る
- 作業結果は必ず `outbox/<agent>_latest.md` に書く
- 他AIへの依頼は `inbox/to_<agent>.md` に、目的・対象ファイル・完了条件を短く書く
- 過去の実験データや材料は `experiments/past_data` または `materials` に整理する
- STOPが必要な場合は `stop.md` に理由を書く

## 禁止事項

- 認証情報、`.env`、APIキー、個人情報を読む・書く・表示すること
- 目的外の大規模リファクタリング
- 出典不明の主張を卒論本文に入れること
- 同じ失敗を3回以上繰り返すこと
