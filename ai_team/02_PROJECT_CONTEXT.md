# 02_PROJECT_CONTEXT

このファイルは、3つのAIが共通して読むプロジェクト背景メモです。
一時的な次アクションは `00_NEXT_ACTION.md` に書き、長期的な背景だけをここに残します。

## Project Name
ワンライフ Minecraft 学習プログラム (株式会社ワンライフ・放課後等デイサービス向け)

## Project Root
`C:\Users\tomot\Desktop\マイクラ開発`
(orchestrator や Codex の作業対象ルート。`$env:AI_TEAM_ROOT` に必ずこのパスを指定する)

## Current Goal
**フェーズ1試作 (M0)**: 算数1ミッション「どうぶつのおうちにごはんをそろえよう」を縦串に、
以下を一括で雛形作成する。
- Minecraft Education 用 `.mcfunction` 群 + NPC セリフ
- 並列教材としての Web ドリルステージ (data 定義のみ。既存 `script.js` は触らない)
- PDF 教材 (スタッフ用台本 + 児童用ワークシート、`fpdf`)
- スタッフ声かけ台本 (`staff_script_m0.md`、NG ワード集付き)

詳細設計は `state.md` (旧) と `manual_check_phase1.md` 参照。

## Background
- Claude Code、Codex、Antigravity を同一フォルダ内で半自動リレー運用する。
- GUI 自動起動は `ai_team_auto_launcher.py` で準備済み。人間が明示的に起動した場合だけ、`00_NEXT_ACTION.md` と `04_LOOP_LOG.md` の `HANDOFF_DONE` マーカーを見て順番に回す。
- Gemini Chat はループ外。人間が必要に応じて使う外部相談役。
- 対象児童は放デイ利用の小1相当〜未就学含む発達特性児童。
- スタッフ IT リテラシーゼロ前提 (操作は「ワールドを開く・閉じる」のみ)。

## Current Phase
planning (Phase 1 M0 試作の Antigravity 事前調査待ち)

## Important Constraints
- 変更は小さく行う。1サイクルの diff は 500 行以内。
- Codex は Claude Code からの明確な実装指示がある場合だけ実装する。
- Antigravity は原則コード編集せず、調査とQAを担当する。
- 設計方針の最終判断は Claude Code が行う。
- **教材は完結型ではなく自由マイクラ遊びへのゲートウェイ**。全15ミッション完全攻略を煽らない。
- **Web ドリルはマイクラの入口ではなく並列教材**として扱う。Web→マイクラの強制動線は作らない。
- **否定しないフィードバック徹底**: 赤バツ・否定音・「不正解」「失敗」「間違い」表現を全面禁止。
- 1ミッションは 5〜7問。算数下限は「1+1 〜 合計10 の足し算」。
- Minecraft Education 1.21.132 前提。アドベンチャーモード固定。マルチプレイなし。
- 最終的に 1 つの `.mcworld` に統合する。
- 既存実ワールド `neeX6PLNWGo=` のファイルには直接触らない (追加は `world_patch_for_neeX6PLNWGo/` 配下)。
- `website/` の LocalStorage キー `onelife_drill_v2` のスキーマを破壊しない。
- main / master ブランチへの直接コミット禁止。
- `.env` / APIキー / 認証情報 / 個人情報に触れない。

## Build / Test Commands
```powershell
# Web ドリル: ブラウザで直接開くだけ (build工程なし)
start "" "C:\Users\tomot\Desktop\マイクラ開発\website\index.html"

# PDF 生成 (既存)
cd C:\Users\tomot\Desktop\マイクラ開発
python generate_completion_plan_pdf.py

# Minecraft world は手動エクスポート (ME GUI から)。CI なし。
# .mcfunction の構文チェックは ME 内でチートONして手動実行。
```

## Known Risks
- 各AIが同じファイルを同時に編集すると衝突する → `lock/current_lock.md` を必ず確認。
- inbox/outbox の古い内容を新しい指示と誤認する可能性がある → 各ファイルの `Status` と `Archived Previous Message` を確認。
- GUI 自動起動を使う場合は, 最初は `--max-launch-count 3` で止め, 人間が結果を確認する。ウィンドウタイトルが合わない場合は `AUTO_RUNNER_CONFIG.json` で調整する。
- Minecraft Education の API 仕様は頻繁に変わる (MakeCode 不可など) → Antigravity の R1 で随時最新確認。
- 対象ワールド `neeX6PLNWGo=` への誤上書きで実プレイ状態が壊れる可能性 → Codex は `world_patch_for_neeX6PLNWGo/` 配下にのみ新規作成。

## Notes
- 旧 `mission.md`、`state.md`、`task_queue.md`、`memory.md`、`manual_check_phase1.md` には Phase 1 M0 の詳細設計が残っている。半自動リレー運用ではこの `00`〜`04` を優先するが、Phase 1 設計の詳細は旧ファイルを **参考情報** として活用する。
- `inbox/to_codex.md` と `inbox/to_antigravity.md` の `Archived Previous Message` セクションには、前サイクルで Claude PM が出した詳細な M0 指示が保存されている。新しい指示を出すときは、その archived 内容を踏襲する形で要約する。
