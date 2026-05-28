# NEXT ACTION

## next_agent
human

## status
waiting_for_human

## phase
human_build_and_coordinate_capture

## current_task
humanフェーズ: Minecraft Education上で M0 を実構築し、H1 (`m2_coordinate_capture_sheet.md`) にS1〜S7の実座標を記入する。

## instruction_for_next_agent
あなたは人間担当です。

まず以下を読んでください。
1. `inbox/to_human.md`
2. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m2_world_backup_rule.md`
3. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m2_build_session_checklist.md`
4. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m1_build_guide.md`
5. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m2_coordinate_capture_sheet.md`

作業内容:
- 作業前に `.mcworld` をバックアップする
- 対象ワールドを複製して `M0_DRAFT` で作業する
- G1の手順に従い、M0エリアをMinecraft Education上で手作業構築する
- H1のS1〜S7に実座標を整数で記入する
- H2チェックリストを埋める
- スクリーンショットを保存する
- 作業後 `.mcworld` をエクスポートする
- `inbox/to_claude.md` に「座標記入完了」と成果物パスを書く

完了条件:
- H1 S1〜S7が全て記入済み
- H2チェックリストが完了済み
- 作業前/作業後 `.mcworld` が保存済み
- スクリーンショット4種以上が保存済み
- `inbox/to_claude.md` に成果物パスとメモが記入済み

## stop_condition
- 対象ワールドが開けない場合は作業を止め、Claude Codeへ戻す
- バックアップが作れない場合は作業を始めず、Claude Codeへ戻す
- 座標取得方法が不明な場合はH1/H2を再確認し、それでも進められなければClaude Codeへ戻す

## note
Codex確認では、H1は未記入、H2は未チェック、バックアップフォルダは未作成。CodexはMinecraft Education実機操作を代行できないため、人間作業完了待ち。
