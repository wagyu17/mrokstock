# Phase 3V 可視化拡張設計書

## 概要

bearing_gap_simulator.html を拡張し、Fortran から出力される v1hy（y方向たわみ）、合成たわみ、たわみ角を可視化する。

## 前提: CSV フォーマットの変更

### endmill_deflection.csv（修正後）

```
theta[rad], v1h_ze0, v1h_ze1, ..., v1h_zekk, v1hy_ze0, v1hy_ze1, ..., v1hy_zekk
```

- 列数: 1 + (kk+1)*2（従来は 1 + (kk+1)）
- 前半が x方向たわみ、後半が y方向たわみ

### deflection_angle.csv（新規）

```
theta[rad], phi_x[rad], phi_y[rad], v1h_tip[m], v1hy_tip[m], v_combined[m]
```

---

## P1: v1hy の 3D 表示

### 現状

- `computeEndmill()` 関数（行2955付近）で x方向たわみのみ計算
- `buildEndmillGeometry()` 関数（行3029付近）で 3D メッシュを x方向にのみ変形

### 修正内容

1. **CSV パーサの拡張**（行1129付近 `loadResultFiles()`）
   - ヘッダの列数から v1hy の有無を自動判定（(列数-1) が偶数なら v1hy あり）
   - `resultData.v1hy_tip[]` 配列を追加して y方向先端たわみを格納

2. **computeEndmill() の拡張**
   - `v1hy_tip` を受け取り、y方向のたわみ量を返す
   - Stage 2（CSV読み込み時）: Fortran 出力値を使用
   - Stage 1（CSV なし時）: Fy に同じ片持ち梁式を当てた近似値（現状の挙動を維持）

3. **buildEndmillGeometry() の拡張**
   - 各断面の頂点座標に y方向のオフセットを追加
   - 現状: `x += deflection * shapeFn(z)` のみ
   - 修正: `x += deflX * shapeFn(z)`,  `y += deflY * shapeFn(z)`

4. **UI 表示の追加**（stats パネル）
   - 「エンドミル先端たわみ X: __ μm / Y: __ μm」の2行表示
   - 現状は1行のみ（行551: `<span id="em-defl">—</span> μm`）

### 後方互換性

- v1hy 列がない従来フォーマットの CSV も読み込める（v1hy=0 として扱う）
- Phase 3 Fortran 修正前でも既存機能が壊れない

---

## P2: 合成たわみの表示

### 表示内容

- 合成たわみ量: `sqrt(v1h² + v1hy²)` [μm]
- たわみ方向角: `atan2(v1hy, v1h)` [°]

### UI

stats パネルに追加:
```
合成たわみ: __.__ μm  方向: ___°
```

### 3D 表示

- エンドミル先端にたわみ方向を示す矢印（ArrowHelper）を追加
- 矢印の長さ = 合成たわみ量 × 表示倍率
- 矢印の色 = 赤（先端方向ベクトル）

---

## P3: たわみ角の表示

### データソース

- `deflection_angle.csv` から phi_x, phi_y を読み込む
- CSV がない場合: v1h の隣接断面差から JS 側で近似計算

### 表示内容

stats パネルに追加:
```
たわみ角 φx: __.__ °  φy: __.__ °
```

### 3D 表示

- エンドミルの軸線に沿ってたわみ角の方向を示す扇形マーカー
- 角度が大きい場合（> 0.01°）は色で強調

---

## P4: 実験値重畳表示（Phase 4 と並行）

### データソース

- 実験データ CSV（振れ量測定結果）をドラッグ&ドロップで読み込み
- フォーマット: `theta[rad], amplitude[μm]` または `time[s], x[μm], y[μm]`

### 表示方法

- 3D 空間上で実験軌跡を別色（例: 赤い点群）で重畳表示
- 検査面の位置に実験値プロットを表示
- 数値解析結果との差異を数値で表示（相対誤差 [%]）

### UI

- 「実験データ読込」ボタンを結果再生セクションに追加
- 実験値表示の ON/OFF チェックボックス

---

## P5: 切削面プロファイル（将来拡張）

- たわみ角から予測される加工面傾斜角度を 2D 断面図として別パネルに表示
- 実験のレーザー顕微鏡データとの重畳比較

---

## 実装順序

```
1. CSV パーサ拡張（v1hy 列の読み込み） ← Phase 3 Fortran 完了後
2. computeEndmill() に v1hy を追加
3. buildEndmillGeometry() の xy 両方向変形
4. UI パネルに v1hy / 合成たわみ / たわみ角の表示追加
5. deflection_angle.csv の読み込み
6. 実験値重畳（P4）
7. 切削面プロファイル（P5）
```

## 実装の担当

- 設計: Claude Code（本ドキュメント）
- 実装: Codex（HTML/JS 修正）
- 検証: Antigravity（ブラウザ動作確認）
