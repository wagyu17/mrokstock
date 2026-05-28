# 02_PROJECT_CONTEXT

このファイルは、3つのAIが共通して読むプロジェクト背景メモです。
一時的な次アクションは `00_NEXT_ACTION.md` に書き、長期的な背景だけをここに残します。

## Project Name

静圧空気スピンドル エンドミル加工シミュレーションの高度化（丸岡 卒論）

## Project Root

`C:\Users\tomot\Desktop\management\ai_team_卒論`

## Current Goal

**Phase 3 + 論文執筆の並行推進**:
1. y方向たわみ（v1hy）+ たわみ角出力の Fortran コード実装
2. 学術誌投稿論文の緒言（第1章）を8月末までに初稿完成（嶋田論文ベース + 最新文献追加）

## Background

- 嶋田啓太ら（2022）が非線形軌道法による軸受配置の影響評価を学術誌に発表（Proc IMechE Part C）。軸・工具を剛体と仮定
- 下八川悠馬が嶋田の研究を引き継ぎ（詳細は要確認）
- 中村朋哉（修士）が x方向の工具たわみ・ねじれ角を考慮した静的連成モデルを Fortran で構築
- 丸岡大也（学部4年）が引き継ぎ、y方向たわみ追加・可視化ツール構築・実験比較を卒論とする
- 卒論と同内容の学術誌投稿論文を 2027年2月末までに完成させる
- Claude Code / Codex / Antigravity の 3AI 体制で研究作業を分担する
- 研究の核は `materials/実験・数値解析結果（claude）/` 配下の Fortran コード・実験データ・解析結果
- 論文のベース資料: `inbox/嶋田論文.pdf`, `inbox/Manu-SpindleV7.docx`, `inbox/論文の緒言.docx`

## Current Phase

phase_3_and_paper（Phase 3 コード実装 + 論文執筆の並行フェーズ）

## AI Role Assignment

| Agent | 役割 | 主な作業 |
|---|---|---|
| **Claude Code** | PM・設計・レビュー・論文構成 | 研究計画管理、Fortranコードのロジック設計、論文章立て・ドラフト、ゼミ発表資料のレビュー |
| **Codex** | 実装・データ処理 | Fortranコード修正、Python可視化スクリプト、HTML可視化ツール改修、バッチ計算スクリプト |
| **Antigravity** | リサーチ・QA・検証 | 先行研究調査、実験データの整合性確認、可視化ツールのブラウザ動作検証、論文引用の確認 |

## Important Constraints

- Fortran コードのビルドには Visual Studio + Intel oneAPI Fortran Compiler が必要（AI が直接ビルドは不可、手順書を出す）
- 実験生データ（`materials/実験・数値解析結果（claude）/実験/`）は読み取り専用。加工・変換したものを `experiments/` に保存
- レーザー顕微鏡の .cag ファイルは各 ~570MB — バックアップ・移動時に注意
- 1回の Codex 作業は小さく（diff 500 行以内が目安）
- 認証情報・.env・APIキー・秘密情報には触れない

## Key References

| ファイル | 内容 |
|---------|------|
| `materials/実験・数値解析結果（claude）/CLAUDE.md` | Fortranコード全体のアーキテクチャ・ビルド手順・研究課題（Claude向け） |
| `materials/実験・数値解析結果（claude）/AGENTS.md` | 同上（Codex向け） |
| `materials/実験・数値解析結果（claude）/研究の方針.md` | 研究の目的・方針・可視化ソフトの位置づけ |
| `materials/実験・数値解析結果（claude）/claude_file/研究方針・スケジュール.md` | Phase 1〜5 の詳細スケジュール |
| `materials/実験・数値解析結果（claude）/claude_file/Fortranコード解説.md` | 2025.for の各サブルーチン詳細解説 |
| `materials/実験・数値解析結果（claude）/claude_file/コード理解ロードマップ.md` | コードを読む順番・スケジュール目安 |

## Build / Test Commands

```powershell
# Fortran: Visual Studio で 2025nakamura.sln をビルド（Ctrl+Shift+B）
# 実行:
cd "materials\実験・数値解析結果（claude）\数値解析\[結果フォルダ]"
.\2025.exe

# たわみ画像生成:
python "materials\実験・数値解析結果（claude）\claude_file\plot_deflection.py" "[結果フォルダパス]"

# HTML可視化ツール:
start "" "materials\実験・数値解析結果（claude）\claude_file\bearing_gap_simulator.html"
```

## Known Risks

- 各AIが同じファイルを同時に編集すると衝突する → `lock/current_lock.md` を確認
- Fortran コードは約 10,000 行の単一ファイル — 行番号が変わると他の参照がずれる
- 「軸と軸受が接触します」エラーが出たら計算条件を見直す（初期変位を 0 に or 回転数・切込みを下げる）
