# Common Orchestration Rules

このAIチームは、Claude Code・Codex・Antigravity が同じ作業拠点を共有しながら順番に作業するための仕組みです。

## 固定の作業拠点

- AI_TEAM_ROOT: `C:\Users\tomot\Desktop\management\ai_team`
- prompts: `C:\Users\tomot\Desktop\management\ai_team\prompts`
- inbox: `C:\Users\tomot\Desktop\management\ai_team\inbox`
- outbox: `C:\Users\tomot\Desktop\management\ai_team\outbox`

プロジェクトごとに対象リポジトリや初期設定は変わりますが、3つのAIが `ai_team` と `prompts` を参照し、inbox/outbox経由で連携する根幹は変えません。

## 最初に読むファイル

1. `mission.md`
2. `state.md`
3. `task_queue.md`
4. 自分のrole prompt
5. 自分宛てのinbox
6. 他AIの直近outbox

## 連携ルール

- Claude Code はPM、設計、レビュー、次アクション整理を担当します。
- Codex は実装、編集、テスト、差分確認を担当します。
- Antigravity は調査、ブラウザ確認、UI/QA、検証報告を担当します。
- 1回の作業は小さく区切ってください。
- 1つのAIが実行を完了したら、人間またはオーケストレーターが確認し、次のAIへプロンプトを送ります。
- 作業結果は必ず `outbox/<agent>_latest.md` に書いてください。
- 他AIへの依頼は `inbox/to_<agent>.md` に、目的・対象ファイル・完了条件を短く書いてください。
- STOPが必要な場合は `stop.md` に理由を書いてください。

## 禁止事項

- 認証情報、`.env`、APIキー、個人情報を読む・書く・表示すること。
- 目的外の大規模リファクタリング。
- main/masterへの直接コミット。
- 同じ失敗を3回以上繰り返すこと。
