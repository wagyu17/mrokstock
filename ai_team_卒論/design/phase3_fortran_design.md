# Phase 3 Fortran 詳細設計書

## 概要

2025.for に y方向たわみ（v1hy）を追加し、2D合成たわみとたわみ角を出力する。

## 現状の構造

### たわみ計算の流れ（EQUATIONOFMOTION 内、行7122〜9868）

```
①  dFx1, dFy1 を「たわみなし」で計算（Kt1, Kr1 を使用）
②  do while 収束ループ（二分法、係数 pp）:
    A. dFx2 = pp * dFx1,  dFy2 = pp * dFy1  （切削力にppを掛ける）
    B. v1h(qqq) を dFx2 で計算                ← x方向たわみ
    C. delta1 = v1h(0)                         （先端たわみ）
    D. Kt2 = Kct + (Rd - v1h(qqq))*1000*Ket   （実切込み深さで切削抵抗を更新）
    E. dFx3, dFy3 を Kt2, Kr2 で再計算         （更新後の切削力）
    F. v2h(qqq) を dFx3 で計算                 ← ねじれ角たわみ
    G. delta2 = v2h(0)
    H. |1 - delta1/delta2| > ddd なら pp を更新して繰り返し
③ 収束後: Fx += dFx2, Fy += dFy2, モーメント加算
```

### 3つの刃数ブロック

| 刃数 | 条件 | たわみループ開始行 | 実切込み修正行 |
|------|------|-------------------|---------------|
| NofE==1 | — | 不明（1刃は使用頻度低） | — |
| NofE==2 | 行7393 | 行7481 | 行7548-7550 |
| NofE==3 | 行7724 | 行9235 | 行9302-9304 |

※ 3ブロックとも同じ構造の繰り返し。修正は3箇所すべてに適用する必要がある。

### コメントアウトされた dFy2 によるたわみ

行7503: `c v1(rrr)=-(dFy2(rrr)*bn(rrr)**2)*(3*an(rrr)+2*bn(rrr)-3*ze(qqq))`
→ 下八川か中村が一度 y方向たわみを簡易モデルで試みたが、不採用にした痕跡。

---

## 修正計画

### 修正1: MODULE simyu に v1hy 配列を追加（行110付近）

**現状:**
```fortran
REAL*8 v1h(0:Mkk)              !! エンドミルたわみ(K,Fクラス)
REAL*8 v2h(0:Mkk)              !! エンドミルたわみ(K',F'クラス)
REAL*8 delta1,delta2
```

**修正後:**
```fortran
REAL*8 v1h(0:Mkk)              !! エンドミルx方向たわみ(K,Fクラス)
REAL*8 v1hy(0:Mkk)             !! エンドミルy方向たわみ(K,Fクラス) ← 追加
REAL*8 v2h(0:Mkk)              !! エンドミルx方向たわみ(K',F'クラス)
REAL*8 v2hy(0:Mkk)             !! エンドミルy方向たわみ(K',F'クラス) ← 追加
REAL*8 delta1,delta2
REAL*8 delta1y,delta2y          !! y方向の先端たわみ ← 追加
```

作業変数も追加:
```fortran
REAL*8 v1y(0:Mkk)              !! y方向たわみ計算用(K,Fクラス) ← 追加
REAL*8 v2y(0:Mkk)              !! y方向たわみ計算用(K',F'クラス) ← 追加
REAL*8 v1dy(0:Mkk),v1sy(0:Mkk) !! y方向たわみ分割計算用 ← 追加
REAL*8 v2dy(0:Mkk),v2sy(0:Mkk) !! y方向たわみ分割計算用 ← 追加
```

### 修正2: EQUATIONOFMOTION 内のたわみ計算ブロック（3箇所×2段階）

#### ステップ A: v1h 計算ブロックの直後に v1hy 計算を追加

**場所**: 行7494〜7536（NofE==2 の例）の直後

v1h が `dFx2` で計算されているのと完全に対称な構造で、v1hy を `dFy2` で計算する:

```fortran
!! ---- y方向たわみ v1hy の計算（dFy2 を使用） ---- 追加
do qqq=0,kk-1
    ze(qqq)=(qqq+0.5)*dze
    do rrr=0,kk-1
        an(rrr)=(rrr+0.5)*dze
        bn(rrr)=EL-an(rrr)
        cn(rrr)=l1+l2-an(rrr)
        dn(rrr)=l1-an(rrr)

        !! 切削力によるたわみ部分（dFy2 を使用）
        v1dy(rrr)=(dFy2(rrr)/Ee)*((bn(rrr)**3/(3*Ie3))-
     &     (cn(rrr)**3/(3*Ie3))+(dn(rrr)**3/(3*Ie1d))+(bbb*dn(rrr)**2/3)
     &     +(bbb**2*dn(rrr)/3)+(2*bbb**3/9)-bbb**4*((cn(rrr)**2/
     &     (3*(l2+bbb)**3))+(cn(rrr)/(3*(l2+bbb)**2)+(2/(9*(l2+bbb))))))

        !! 切削力によるたわみ角部分
        v1sy(rrr)=(dFy2(rrr)/Ee)*((bn(rrr)**2/(2*Ie3))-
     &      (cn(rrr)**2/(2*Ie3))+(dn(rrr)**2/(2*Ie1d))+(bbb*dn(rrr)/3)+
     &      (2*bbb**2/3)-bbb**4*((cn(rrr)/(3*(l2+bbb)**3))+
     &      (2/(3*(l2+bbb)**2))))

        !! 合計たわみ
        v1y(rrr)=abs(v1dy(rrr)+v1sy(rrr)*(an(rrr)-ze(qqq)))
        v1hy(qqq)=v1hy(qqq)+v1y(rrr)
    end do
end do

delta1y=v1hy(0)                 !! y方向の先端たわみ
```

**ポイント**: v1h と v1hy は独立に計算する（断面二次モーメント Ie3, Ie1d は工具の軸対称性から x/y で同じ値）。

#### ステップ B: 実切込み深さの 2D 合成

**現状** (行7548-7550):
```fortran
Kt2(qqq)=Kct+(Rd-v1h(qqq))*1000*Ket
```

**修正後:**
```fortran
!! 2D合成たわみによる実切込み深さ
Kt2(qqq)=Kct+(Rd-sqrt(v1h(qqq)**2+v1hy(qqq)**2))*1000*Ket
Kr2(qqq)=Kcr+(Rd-sqrt(v1h(qqq)**2+v1hy(qqq)**2))*1000*Ker
Ka2(qqq)=Kca+(Rd-sqrt(v1h(qqq)**2+v1hy(qqq)**2))*1000*Kea
```

#### ステップ C: v2h ブロックの直後に v2hy を同様に追加

v2h が `dFx3` で計算されているのと対称に、v2hy を `dFy3` で計算する。

#### ステップ D: 収束判定

現状は delta1 = v1h(0), delta2 = v2h(0) の比較。

y方向を追加した場合の収束判定の選択肢:
- **案A（推奨）**: x/y 独立に収束判定（既存の do while ループに影響なし）
  - 実装: v1hy は v1h と同じ pp で計算するため、x が収束すれば y も収束する
  - 理由: 同一荷重係数 pp を共有するため、追加の収束ループ不要
- 案B: 合成たわみ `sqrt(delta1² + delta1y²)` で判定 → do while の構造変更が必要

**案A を採用**: 既存の収束ループの中で v1hy を v1h と同時に計算するだけでよい。

#### ステップ E: ゼロリセット部分

**現状** (行7683-7686):
```fortran
do qqq=0,kk-1
    v1h(qqq)=0
    v2h(qqq)=0
end do
```

**修正後:**
```fortran
do qqq=0,kk-1
    v1h(qqq)=0
    v1hy(qqq)=0    !! 追加
    v2h(qqq)=0
    v2hy(qqq)=0    !! 追加
end do
```

### 修正3: endmill_deflection.csv の出力拡張

**現状** (行2481-2486 ヘッダ、行2774-2779 データ):
```
ヘッダ: theta[rad], ze_0, ze_1, ..., ze_kk
データ: dthz2, v1h(0), v1h(1), ..., v1h(kk)
```

**修正後:**
```
ヘッダ: theta[rad], v1h_ze0, v1h_ze1, ..., v1h_zekk, v1hy_ze0, v1hy_ze1, ..., v1hy_zekk
データ: dthz2, v1h(0), ..., v1h(kk), v1hy(0), ..., v1hy(kk)
```

具体的な Fortran コード:

**ヘッダ行** (行2481〜2486 を修正):
```fortran
OPEN(80, FILE='endmill_deflection.csv', STATUS='REPLACE')
WRITE(80,'(A)',ADVANCE='NO') 'theta[rad]'
DO qqq = 0, kk
    WRITE(80,'(A,A,ES14.6)',ADVANCE='NO') ',v1h_', (qqq+0.5d0)*dze
END DO
DO qqq = 0, kk
    WRITE(80,'(A,A,ES14.6)',ADVANCE='NO') ',v1hy_', (qqq+0.5d0)*dze
END DO
WRITE(80,*)
```

**データ行** (行2774〜2779 を修正):
```fortran
WRITE(80,'(ES14.6)',ADVANCE='NO') dthz2
DO qqq = 0, kk
    WRITE(80,'(A,ES14.6)',ADVANCE='NO') ',', v1h(qqq)
END DO
DO qqq = 0, kk
    WRITE(80,'(A,ES14.6)',ADVANCE='NO') ',', v1hy(qqq)
END DO
WRITE(80,*)
```

### 修正4: たわみ角の出力（新規ファイル）

**新規出力ファイル**: `deflection_angle.csv`

```
ヘッダ: theta[rad], phi_x[rad], phi_y[rad], v1h_tip[m], v1hy_tip[m], v_combined[m]
データ: dthz2, φx, φy, v1h(0), v1hy(0), sqrt(v1h(0)²+v1hy(0)²)
```

たわみ角の計算式:
```fortran
!! たわみ角 = 先端と隣接断面のたわみ差 / 断面間距離
phi_x = atan2(v1h(0) - v1h(1), dze)
phi_y = atan2(v1hy(0) - v1hy(1), dze)
```

OPEN文は行2481付近に追加:
```fortran
OPEN(81, FILE='deflection_angle.csv', STATUS='REPLACE')
WRITE(81,'(A)') 'theta[rad],phi_x[rad],phi_y[rad],v1h_tip[m],v1hy_tip[m],v_combined[m]'
```

WRITE文は行2774付近に追加:
```fortran
WRITE(81,'(ES14.6,5(A,ES14.6))') dthz2,
     & ',', atan2(v1h(0)-v1h(1), dze),
     & ',', atan2(v1hy(0)-v1hy(1), dze),
     & ',', v1h(0),
     & ',', v1hy(0),
     & ',', sqrt(v1h(0)**2 + v1hy(0)**2)
```

CLOSE文は行2931付近に追加:
```fortran
CLOSE(81)   ! deflection_angle.csv
```

---

## 修正箇所の一覧

| # | ファイル | 行番号 | 修正内容 | 影響範囲 |
|---|---------|--------|---------|---------|
| 1 | 2025.for | 110付近 | MODULE simyu に v1hy, v2hy, v1y, v2y 等の配列宣言追加 | 変数宣言のみ |
| 2 | 2025.for | 7494〜7536後 | NofE==2: v1hy 計算ブロック追加 | たわみ計算 |
| 3 | 2025.for | 7548〜7550 | NofE==2: 実切込み深さを 2D 合成に変更 | 切削抵抗更新 |
| 4 | 2025.for | 7636〜7670後 | NofE==2: v2hy 計算ブロック追加 | たわみ計算 |
| 5 | 2025.for | 7683〜7686 | NofE==2: v1hy, v2hy のゼロリセット追加 | 収束ループ |
| 6 | 2025.for | 8259〜8301後 | NofE==2(刃2): 修正2〜5と同じ | たわみ計算 |
| 7 | 2025.for | 9248〜9290後 | NofE==3: 修正2〜5と同じ | たわみ計算 |
| 8 | 2025.for | 2481〜2486 | endmill_deflection.csv ヘッダに v1hy 列追加 | CSV出力 |
| 9 | 2025.for | 2774〜2779 | endmill_deflection.csv データに v1hy 列追加 | CSV出力 |
| 10 | 2025.for | 2481付近 | deflection_angle.csv の OPEN + ヘッダ（新規） | CSV出力 |
| 11 | 2025.for | 2774付近 | deflection_angle.csv のデータ WRITE（新規） | CSV出力 |
| 12 | 2025.for | 2931付近 | deflection_angle.csv の CLOSE（新規） | CSV出力 |

## 検証方法

1. **コンパイル確認**: Visual Studio + Intel oneAPI でビルドエラーなし
2. **ゼロ検証**: Fy=0（送り速度=0 等）の条件で v1hy が全て 0 になること
3. **対称性検証**: Fx=Fy の条件で v1h ≈ v1hy になること
4. **物理的妥当性**: v1hy の符号と大きさが切削力方向と整合すること
5. **収束性**: 既存の ddd 収束判定が変わらないこと（pp は共通）
6. **前任者互換性**: v1hy=0 の場合に前任者モデルと同一の結果になること
7. **CSV出力確認**: bearing_gap_simulator.html で新フォーマットが読み込めること

## 実装の担当

- 設計レビュー: Claude Code（本ドキュメント）
- 実装: Codex（Fortran コード修正）
- 動作検証: Antigravity（CSV出力確認、HTML読み込みテスト）

## 備考

- v1h と v1hy は同一の断面二次モーメント（Ie3, Ie1d）を使用する。工具は軸対称であるため x/y で剛性は同じ。
- 収束ループの構造は変更しない（pp は x/y 共通の荷重係数）。
- NofE==1 のブロックは使用頻度が低いが、修正対象に含める。行番号は別途特定が必要。
