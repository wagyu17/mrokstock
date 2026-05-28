# Task Queue (Phase 1: M0 試作)

ワンライフ Minecraft 案件のフェーズ1試作. M0 ミッションを縦串に,
**Minecraft / Web / PDF / スタッフ運用** の4トラックを並行で進める.

凡例: `[ ]` Todo / `[~]` Doing / `[x]` Done / `[!]` Blocked

---

## トラック A: Minecraft ワールド (M0)

- [x] A1. M0 設計書 (mission spec) を `マイクラ開発/コンテンツ_アイデア/00_算数_どうぶつごはん.md` に新規作成
- [ ] A2. `world_patch_for_neeX6PLNWGo/functions/m0/init.mcfunction` 作成
        (動物の家5軒・看板・チェスト・案内NPCの座標一括配置)
- [ ] A3. `world_patch_for_neeX6PLNWGo/functions/m0/q01〜q05.mcfunction` 作成
        (各問の正答ブロック数を scoreboard でカウントし NPC が反応)
- [ ] A4. `world_patch_for_neeX6PLNWGo/functions/m0/reset.mcfunction` 作成
- [ ] A5. アドベンチャーモード固定 + 全ブロックに `CanPlaceOn` 指定で誤破壊防止
- [x] A6. NPC ダイアログ JSON / セリフリスト作成 (否定表現禁止チェック含む)
        → `m0_npc_lines.md` 作成済み。`.mcfunction` への実装は M3 サイクルで実施
- [ ] A7. Claude (人手) が ME で `/function onelife/m0/init` を叩いて配置確認
- [!] A8. 完成版を `.mcworld` エクスポート → 再インポート初期化テスト
        → BLOCKED: A2-A5, A7 未完了。テスト計画書は `a8_mcworld_export_import_test_plan.md` に作成済み

## トラック B: Web ドリル (M0連動)

- [x] B1. `website/script.js` の算数モジュールに M0 ステージ追加
        (ID: `m0_dobutsu_gohan`, 既存スキーマ `onelife_drill_v2` を破壊しない)
        → Codex 実装済み。`STAGES_BY_OP.add` 先頭に登録、`buildProblems()` で読み込み確認済み
- [x] B2. 5〜7問 (合計10までの足し算) を `M0_QUESTIONS` 定数で定義
        → B1 に包含。5問 (M0 設計書 Q1-Q5 と 1:1 対応)。Antigravity 7問案は M1 以降で活用
- [x] B3. UI: 既存 `view-math` の表示切替に M0 ステージカードを追加
        → Codex 実装済み。`data-go="stage:add:m0_dobutsu_gohan"` で直接開始。Claude PM 承認
- [x] B4. フィードバック: 既存「おしい！」「もういっかい！」を踏襲. **赤バツ・否定音禁止**
        → 既存フィードバック継承で要件充足。赤バツ・否定音・否定語なしをコード検証済み
- [x] B5. 終了画面に「マイクラ M0 もやってみよう」リンク (並列教材として併記,Web→マイクラの強制動線にしない)
        → Codex 実装済み。`staff_script_m0.md` への任意リンク。M0 終了時のみ表示。Claude PM 承認
- [x] B6. ブラウザで `index.html` を開いて動作確認 (Antigravity QA)
        → Antigravity QA 完了 (24項目全 OK)。トラック B 完了

## トラック C: PDF 教材 (M0)

- [x] C1. `generate_m0_pdf.py` 新規作成 (fpdf ベース,既存 `generate_completion_plan_pdf.py` の体裁に合わせる)
        → Codex 実装済み (414行)。色定数・フォント・レイアウト既存と整合。Claude PM 承認
- [x] C2. 1部目: **スタッフ用見開き読み上げ台本** (PCゲームスキルゼロ前提,操作は「ワールドを開く・閉じる」のみ)
        → Codex 実装済み (504行)。見開き台本形式 + script_panel()。Claude PM 承認
- [~] C3. 2部目: **児童用ワークシート** (ひらがな主体, UD デジタル教科書体推奨, 余白広め)
        → Codex に C3+C5 統合指示投入中 (UD教科書体・フォント拡大・ボックス拡大・ひらがな統一)
- [x] C4. 否定表現の語彙チェック (「不正解」「まちがい」「ダメ」を含まないこと)
        → Codex grep 確認: 指定語句 + 拡張語句 (失敗/間違/✗/×/バツ/ちがう/残念) 全て 0 hit。Claude PM 承認
- [~] C5. A4 縦印刷で読みやすいフォントサイズ・余白を確認
        → Claude PM レビュー完了。スタッフセクション合格。ワークシートセクションは C3 改修で対応
- [x] C6. `python generate_m0_pdf.py` を実行して PDF 生成 → 実物プレビュー
        → Codex 実行済み (6ページ, 158KB, A4縦)。PyMuPDF で全ページ PNG プレビュー生成済み。C3 未反映のプレビュー版

## トラック D: スタッフ運用

- [x] D1. `マイクラ開発/staff_script_m0.md` 作成 (声かけ台本: 開始 / 各問 / つまづき時 / 終了)
        → B5 実装時に Codex が作成済み (85行)。開始/各問/つまづき/終了の全セクション完備。否定表現 0 hit。Claude PM 承認
- [x] D2. 「ワールドを開く・閉じる」だけの操作カード (1枚) を PDF にも同梱
        → Codex 実装済み。`section_operation_card()` でP2に3ステップカード追加。PDF 7ページに拡大。Claude PM 承認
- [~] D3. 「自由マイクラ遊びへの送り出し方」セクション (15ミッション完全攻略を煽らない言い回し例)
        → Codex に指示投入中
- [ ] D4. NG ワード集 (赤バツ・否定音・「不正解」「失敗」「間違い」) を staff_script_m0.md に明記
- [~] D5. スタッフ向けに 5 分で読める A4 1 枚版 (要約) を生成
        → Codex に `--summary` フラグ追加 + A4 1枚クイックガイド PDF 生成指示を投入

## トラック E: 統合 / リリース

- [ ] E1. A〜D の各成果物を `現在の状況/YYYY-MM-DD_phase1_m0.md` で進捗統合
- [ ] E2. `.mcworld` に M0 を統合し,ワールドを再エクスポート
- [!] E3. Claude (人手) が ME 実機で 5〜7問を通しで実行し合否判定が想定通りか確認
        → BLOCKED: A2-A5 (.mcfunction 未作成), A7 (init 未検証), E2 (.mcworld 未統合)
- [!] E4. スタッフ 1 名にドライランしてもらい台本通りで運用可能か検証 (人手)
        → BLOCKED: E3 完了が前提。依存チェーン: A2-A5 → A7 → E2 → E3 → E4

---

## Doing

- [~] human フェーズ: ME 上で M0 実構築 + H1 座標記入 (waiting_for_human)

## Done

- [x] AIチーム運用基盤 (ai_team/) セットアップ
- [x] マイクラ案件への適用方針確定 (M0 ミッション選定)
- [x] M0 事前調査 (Antigravity R1-R5 完了)
- [x] M0 設計書類 F1-F4 (330行), G1-G3 (419行), H1-H3 (358行) 作成完了
- [x] A8 テスト計画書 (`a8_mcworld_export_import_test_plan.md`) 作成
- [x] B1+B2: M0 ステージ + M0_QUESTIONS 定数を `script.js` に実装 (Codex)
- [x] B3: M0 直接開始カードを `view-math` に追加 (Codex)
- [x] B4: フィードバック要件充足をコード検証 (Claude PM)
- [x] B5: M0 終了画面リンク実装 (Codex) + Claude PM 承認
- [x] B3 QA: Antigravity 実機確認 (問題なし)
- [x] B6: Antigravity 包括的ブラウザ QA (24項目全 OK) → **トラック B 完了**
- [x] C1: `generate_m0_pdf.py` 新規作成 (Codex 実装 + Claude PM 承認)
- [x] C2: スタッフ用見開き読み上げ台本 (Codex 実装 + Claude PM 承認)
- [x] C4: 否定表現語彙チェック (Codex grep + Claude PM 承認、全語句 0 hit)
- [x] C5: A4 印刷品質レビュー (Claude PM 実施: スタッフセクション合格、ワークシートは C3 で改修)
- [x] C6: PDF 生成 (Codex 実行、6ページ 158KB、PyMuPDF プレビュー済み、C3 未反映プレビュー版)
- [x] D1: `staff_script_m0.md` 作成済み (B5 時に作成、85行、Claude PM 承認)
- [x] D2: PDF操作カード同梱 (Codex 実装: `section_operation_card()` P2追加、PDF 7ページ化、Claude PM 承認)

## Blocked

- [!] Antigravity の自動 CLI 化: 公式 headless 仕様未確認のため manual handoff 運用. (Antigravity 調査タスクの結果次第で解除)

## Failed Attempts

| # | Task | 失敗内容 | 原因 | 対応 |
|---|------|----------|------|------|
| - | -    | -        | -    | -    |

---

## スコープ外 (Phase 1 では作らない)

- 15ミッション本編 (01_動物園〜) は **このフェーズでは触らない**
- Arnis 前橋地形の地理教材化
- マルチプレイ対応
- MakeCode を使ったギミック (1.21.132 で動作しないため)
