# Project State

## Current Goal
ワンライフ Minecraft 案件 (`C:\Users\tomot\Desktop\マイクラ開発`) の **フェーズ1試作** を作る.
スコープ: 算数 1 ミッション (M0) + 対応する Web ドリルステージ + PDF 教材雛形 (スタッフ用 + 児童用) + スタッフ声かけ台本.

## Target Project Root
`C:\Users\tomot\Desktop\マイクラ開発`
(orchestrator 起動時に必ず `$env:AI_TEAM_ROOT` をこのパスに設定すること)

## Phase 1 Mission (M0)
**M0: どうぶつのおうちにごはんをそろえよう**

- 位置付け: 既存ロードマップの 15 ミッション (01〜) の **手前** に置く「入門 0 番」. 全15攻略を促さないため,M0 単体で完結して自由マイクラ遊びに送り出せる設計にする.
- 教科要素: 合計 10 までの足し算 (例: 「ペンギン3+ライオン2=5こ」). 算数下限要件を満たす最小設定.
- 出題数: 5〜7問.
- 対象学年目安: 小1相当〜未就学含む発達特性ある児童.
- Minecraft 仕様: Minecraft Education 1.21.132,アドベンチャーモード固定,マルチプレイ無効,`CanPlaceOn` で誤破壊防止.
- 統合先: 既存実ワールド `neeX6PLNWGo=` 上の `onelife_setup` BP に追加 function として投入 → 最終的に 1 つの `.mcworld` に統合.
- フィードバック原則: 赤バツ・否定音・「不正解」表現禁止. 「やってみよう」「いいね」「もういっかい いっしょに」のみ.

## Current Phase
waiting_for_human (M0 設計確定済み → Antigravity 調査完了 → 構築準備書類完了 → **人間が ME 上で実構築 + 座標記入中** → M3 .mcfunction化 → A7 検証 → A8 エクスポートテスト の順)

## Last Completed Work
- AIチーム運用基盤 (ai_team/) セットアップ
- マイクラ案件への適用方針確定 (M0 ミッション選定)
- Antigravity 事前調査 R1-R5 完了 (ME 1.21.132 仕様, 否定回避エビデンス, 既存 website QA, fpdf2, .mcworld 納品フロー)
- M0 設計書類 F1-F4, G1-G3, H1-H3 計10ファイル / 1107行 完成
- humanフェーズ移行準備完了 (inbox/to_human.md 作成済み)
- A8 テスト計画書作成 (`a8_mcworld_export_import_test_plan.md`)
- B1+B2: Codex が `script.js` に M0 ステージ + `M0_QUESTIONS` (5問) を実装。Claude PM 承認済み
- B3: Codex が `view-math` に M0 直接開始カード追加。Claude PM 承認済み
- B4: 既存フィードバック継承で要件充足をコード検証完了 (赤バツ・否定音・否定語なし確認)
- B5: Codex が終了画面に M0 リンク追加。Claude PM 承認済み
- B3 QA: Antigravity 実機確認完了 (問題なし)
- B6: Antigravity 包括的ブラウザ QA 完了 (24項目全 OK) → **トラック B 完了**
- C1: Codex が `generate_m0_pdf.py` (414行) を新規作成。Claude PM レビュー承認済み
- C2: Codex がスタッフ用見開き読み上げ台本を実装 (504行, 6ページ)。Claude PM 承認済み
- C4: Codex が否定表現語彙チェック実施 (指定語句+拡張語句 全 0 hit)。Claude PM 承認済み
- C5: Claude PM が A4 印刷品質レビュー実施。スタッフセクション合格、ワークシートは C3 で改修対応
- C6: Codex が PDF 生成実行 (6ページ, 158KB, A4縦)。PyMuPDF プレビュー済み。C3 未反映プレビュー版
- D1: `staff_script_m0.md` は B5 時に作成済み (85行)。D1 要件 (開始/各問/つまづき/終了) を充足。Claude PM 承認
- D2: Codex が `section_operation_card()` で PDF P2 に 3 ステップカード追加。PDF 7 ページ化。Claude PM 承認

## Current Problems
- M0 用の `.mcfunction` 群が未作成 (M3 サイクルで着手予定、human 座標記入完了が前提)
- PDF 教材: C3 (ワークシート改修: UD教科書体+フォント拡大+ボックス拡大) が未実装。C6 PDF は C3 未反映のプレビュー版
- スタッフ運用: D1+D2 完了、D3 保留 (orchestrator スキップ)、D4 未着手、D5 Codex 実装中
- E3 ME 実機テスト: A2-A7 + E2 未完了のため BLOCKED
- human フェーズ未着手: ME 上での M0 実構築と H1 座標記入が必要

## Build Status
- Web (website/): バニラ HTML/CSS/JS のため build 工程なし. ブラウザで `index.html` 直接開いて動作.
- Minecraft: `.mcworld` は手作業エクスポート. CI なし.
- Python ジェネレータ: `python generate_*.py` のみで PDF/pptx 出力.

## Test Status
unknown (M0 はこれから)

## Active Task
トラック C: C1+C2+C4+C5+C6 完了 (C3 は未実装、PDF はプレビュー版)。トラック D: D1+D2 完了、D3 保留、D5 Codex 実装中。トラック E: E3 BLOCKED (A2-A7+E2 未完了)。トラック A は引き続き human フェーズ待ち。

## Failed Attempts
0

## Next Action
1. 人間が `inbox/to_human.md` に従い ME 上で M0 を実構築し、H1 に座標を記入する.
2. 人間が `inbox/to_claude.md` に「座標記入完了」と書く.
3. Claude PM が M3 サイクル (`.mcfunction` 化) の Codex 指示を投入する.
4. A7 (ME 検証) → A8 (`.mcworld` エクスポート/インポートテスト、テスト計画書あり) の順で進行.
