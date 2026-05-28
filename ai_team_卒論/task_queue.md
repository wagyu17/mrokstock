# Task Queue - 卒論

凡例: `[ ]` Todo / `[~]` Doing / `[x]` Done / `[!]` Blocked

---

## Phase 1: 環境構築・前任者モデル再現（4月）

- [x] 2025.for をビルドし 2025.exe を生成
- [x] d1/Vf=600/Rd=0.05/N=10000 で前任者の結果を再現
- [x] 真たわみ考慮有無比較*.xlsx の数値を手元で再現
- [x] Visual Studio + Intel oneAPI Fortran Compiler を導入

## Phase 2: アニメーション出力・可視化ツール（5月）

- [x] endmill_deflection.csv 出力を Fortran コードに実装
- [x] plot_deflection.py でたわみ静的画像を生成
- [x] bearing_gap_simulator.html Stage 1（解析結果再生）を実装
- [x] bearing_gap_simulator.html Stage 2（v1h 本物データ切替）を実装
- [x] Fortran コード理解ロードマップ Step 1〜6 を完了

## Phase 3: y 方向たわみ追加（6〜7月）

- [x] Claude: v1hy 追加の Fortran 修正計画を作成
- [x] Codex: MODULE simyu に v1hy(0:Mkk) 配列を追加
- [x] Codex: EQUATIONOFMOTION() 内に dFy2 版たわみ計算ブロックを追加
- [x] Codex: 実切込み深さを `Rd - sqrt(v1h² + v1hy²)` に変更
- [x] Codex: endmill_deflection.csv に v1hy カラムを追加
- [x] Claude: 修正後コードのロジックレビュー
- [x] Codex/User: Intel oneAPI ifx で `2025_phase3.exe` のビルド確認
- [x] Codex: `endmill_deflection.csv` / `deflection_angle.csv` を動的ループ内にも出力するよう修正
- [x] 単一条件（d1/10000rpm）で短時間テスト計算
- [x] v1hy が v1h の 10〜50%（物理的に妥当な範囲）であることを確認
- [x] 単一条件（d1/10000rpm）で 0.10001 sec 完走し、Phase 3 CSV 全行出力を確認
- [x] Codex: bearing_gap_simulator.html Phase 3V（v1h/v1hy・たわみ角表示）を実装
- [ ] Antigravity/User: 可視化ツールで新モデル結果を操作確認

## Phase 4: 全条件計算・実験比較（8〜10月）

- [ ] 64シナリオのバッチ計算スクリプトを作成
- [ ] 全 64 シナリオの計算を実行
- [ ] 実験値との比較グラフを作成（振れ量振幅 vs 回転数）
- [ ] 前任者モデルとの差異を定量的に整理
- [ ] 切削面傾斜角度の比較

## Phase 5: 考察・論文執筆（11〜1月）

- [ ] thesis/thesis_outline.md に章立てを作成
- [ ] 第1章 緒言のドラフト
- [ ] 第2章 数値解析手法のドラフト
- [ ] 第3章 実験方法のドラフト
- [ ] 第4章 結果と考察のドラフト
- [ ] 第5章 結言のドラフト
- [ ] Claude: 論理構成レビュー
- [ ] Antigravity: 引用・先行研究の不足確認

## Research（並行タスク）

- [ ] Antigravity: 先行研究リストを research/literature/ に整理
- [ ] Antigravity: 嶋田ら（2022）の引用ネットワーク調査
- [ ] Claude: 研究の新規性・差分を整理
- [ ] 実験データ一覧を 05_DATA_INVENTORY.md に記録

## Data Organization

- [x] フォルダ構成分析レポートを作成
- [x] 引き継ぎ資料（実験・数値解析結果）を materials/ に格納
- [ ] 実験データのインデックスを完成させる
- [ ] 数値解析結果のインデックスを完成させる
