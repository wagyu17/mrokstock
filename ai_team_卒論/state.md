# Project State

## Thesis Theme

静圧空気スピンドルを用いたエンドミル加工時の回転軸振れおよび加工精度に関する数値的・実験的研究

## Current Goal

**2つのミッションを並行推進する:**
1. Phase 3/3V の短時間検証結果を可視化ツールで操作確認し、Phase 4 の全条件計算へ進む準備をする
2. 緒言（第1章）の執筆を開始する（8月末期限）— 嶋田論文の精読、最新文献調査、ドラフト作成

**可視化方針**: bearing_gap_simulator.html に解析結果の可視化を集約する（個別画像ではなくインタラクティブ 3D ツール）

## Current Phase

phase_3v_validation_and_paper（Phase 3V 操作検証 + 論文執筆の並行フェーズ）

## Working Root

`C:\Users\tomot\Desktop\management\ai_team_卒論`

## Important Files

### フレームワーク（3AI共通）
- `00_THESIS_THEME.md` — 卒論テーマ・研究概要
- `01_RESEARCH_PLAN.md` — 研究計画・フェーズ別スケジュール
- `02_PROJECT_CONTEXT.md` — プロジェクト背景・AI役割分担
- `03_AGENT_STATUS.md` — 各AIの状態
- `task_queue.md` — タスクキュー

### 論文執筆
- `thesis/thesis_outline.md` — 論文章立て（正式版）
- `thesis/writing_status.md` — 各章の執筆ステータス
- `02_LITERATURE_REVIEW.md` — 文献レビュー（嶋田[1]〜[23] + 追加文献）

### ベース資料（inbox/）
- `inbox/嶋田論文.pdf` — ベース論文（Proc IMechE Part C, 2022, 13ページ）
- `inbox/Manu-SpindleV7.docx` — 嶋田論文の原稿版（編集可能docx）
- `inbox/論文の緒言.docx` — 教授からの緒言作成指示

### 研究コア（materials/実験・数値解析結果（claude）/）
- `CLAUDE.md` — Fortranコード全体解説（Claude向け）
- `AGENTS.md` — 同上（Codex向け）
- `研究の方針.md` — 研究の目的・方針・可視化の位置づけ
- `claude_file/研究方針・スケジュール.md` — Phase 1〜5 詳細計画
- `claude_file/Fortranコード解説.md` — 2025.for の各サブルーチン解説
- `claude_file/コード理解ロードマップ.md` — コードを読む順番ガイド
- `claude_file/使い方.md` — INPUTparameter.txt・出力ファイル・可視化ツールの操作方法

### 設計書（design/）
- `design/phase3_fortran_design.md` — Phase 3 Fortran 修正の詳細設計（v1hy + CSV拡張 + たわみ角出力）
- `design/phase3v_visualization_design.md` — Phase 3V 可視化拡張の設計（P1〜P5）

### スケジュール
- `schedule_to_july_end.md` — 2026年5/27〜7/31 の9週間計画（教授チェック用）

### ゼミ発表
- `4523139_ゼミ用資料/` — 週次ゼミ発表 pptx（20260401〜20260520）
- `4523139_プレゼン内容/` — 発表内容の md ドラフト

## Completed Milestones

- [x] Phase 1: 環境構築・前任者モデル再現（4月）
- [x] Phase 2: アニメーション出力実装（endmill_deflection.csv）（5月）
- [x] 可視化ツール bearing_gap_simulator.html Stage 1 + Stage 2 完成
- [x] Fortranコード理解ロードマップ Step 1〜6 完了
- [x] ゼミ発表 7回分（4/1〜5/20）
- [x] 嶋田論文・原稿V7・教授指示書の入手（2026/05/26）
- [x] 嶋田論文の参考文献[1]〜[23]の整理（02_LITERATURE_REVIEW.md）
- [x] 論文章立ての確定（thesis/thesis_outline.md）
- [x] 研究系譜の整理・確定（若林→嶋田→下八川→中村→丸岡）
- [x] 下八川の貢献内容確認済み: 工具たわみ計算を数値プログラムに追加（中村修論 p.20-21）
- [x] 中村修士論文(152p) + 参考論文30本のPDFを入手・整理（2026/05/26）
- [x] 中村修論の参考文献[1]〜[40]を02_LITERATURE_REVIEW.mdに統合
- [x] 嶋田論文の forward citation 調査完了（Scopus 4件、D01特定）
- [x] 可視化方針の確定: bearing_gap_simulator.html に解析結果可視化を集約（P1〜P5）
- [x] Phase 3 Fortran 詳細設計書の作成（design/phase3_fortran_design.md）
- [x] Phase 3V 可視化拡張設計書の作成（design/phase3v_visualization_design.md）
- [x] Codex への実装指示作成（inbox/to_codex.md）
- [x] 緒言（第1章）初稿 v1 完成（thesis/drafts/ch1_introduction_v1.md）
- [x] Codex による Phase 3 Fortran 実装完了（2026/05/26）
- [x] Claude Code による実装レビュー完了 → **合格**（設計書通り、12箇所すべて確認）
- [x] Intel oneAPI ifx で `2025_phase3.exe` ビルド成功（2026/05/26）
- [x] Phase 3 短時間実行で `v1hy` 非ゼロ・CSV時系列出力を確認（2026/05/26）
- [x] Codex による Phase 3V 可視化拡張完了（2026/05/26）
- [x] bearing_gap_simulator.html バグ修正（2026/05/27）
      - 結果再生時 applyCoupling スキップ（h マイナス対策）
      - xz/yz/xy 全断面で軸表示半径を固定（lastHMax 非依存）
      - xz/yz を角度断面ではなく射影図として再構築（色帯削除）
      - 「変位 ~147× 拡大表示」注記を追加
- [x] Codex による Fortran 物理計算の妥当性確認（max cg = 1.26μm << c = 15μm）
- [x] 軸の並進・回転変位を可視化に反映（検査面位置から dthx/dthy を逆算）（2026/05/27）
- [x] 軸変位表示倍率スライダー shaftMag 追加（サブ μm 動きを可視化、デフォルト 10×）（2026/05/27）
- [x] Phase 3 単一条件 0.10001 sec 完走確認（2026/05/27）

## Current Problems

- ~~Phase 3 の Fortran コード修正~~ → **完了**（実装＋レビュー＋ビルド＋短時間検証済み）
- ~~Phase 3 のビルド検証~~ → **完了**（Intel oneAPI ifx で `2025_phase3.exe` 生成）
- ~~Phase 3V の可視化拡張（P1〜P3）~~ → **完了**（`v1h/v1hy`, `phi_x/phi_y` 読込表示に対応）
- 完走結果を可視化ツールでユーザー操作確認（結果フォルダ読込・再生・目視チェック）する段階
- ~~緒言のドラフトが未着手~~ → **初稿 v1 完成**（thesis/drafts/ch1_introduction_v1.md、教授レビュー待ち）
- 全64シナリオの新モデル計算が未実施

## Next Action

1. ~~**Phase 3 設計**~~ → **完了**（design/phase3_fortran_design.md）
2. ~~**Phase 3V 設計**~~ → **完了**（design/phase3v_visualization_design.md）
3. ~~**Codex 実装指示**~~ → **完了**（inbox/to_codex.md に全7タスク記載）
4. ~~Codex の実装完了を待つ~~ → **完了 + レビュー合格**
5. ~~Visual Studio / Intel oneAPI でビルド検証~~ → **完了**
6. ~~ベンチマーク条件で短時間実行して新CSV出力を確認~~ → **完了**
7. ~~Phase 3V（bearing_gap_simulator.html の拡張）に着手~~ → **完了**
8. ~~単一条件で 0.10001 sec 完走し、CSV全行出力を確認~~ → **完了**
9. `bearing_gap_simulator.html` で結果フォルダを読み込み、`工具たわみ X/Y/|v|` と `たわみ角 phi_x/phi_y` の表示を目視確認
10. Antigravity に動作検証を依頼（inbox/to_antigravity.md）
11. D01（下八川・宮武 2023 精密工学会）のPDFを J-STAGE から入手
12. ~~緒言の構成要素の下書きを開始する~~ → **完了**（thesis/drafts/ch1_introduction_v1.md）
13. 緒言 v1 を教授にレビュー依頼 → フィードバック後に v2 作成
