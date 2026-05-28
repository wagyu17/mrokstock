# To Codex

## Status: READY（Phase 3 Fortran修正の実装指示）

## 依頼内容

`design/phase3_fortran_design.md` に基づき、`2025.for` に y方向たわみ（v1hy）を追加してください。

---

## 必ず読むファイル

1. `design/phase3_fortran_design.md` — 詳細設計書（修正箇所・コード例あり）
2. `materials/実験・数値解析結果（claude）/AGENTS.md` — コードアーキテクチャ
3. `materials/実験・数値解析結果（claude）/CLAUDE.md` — ビルド手順・出力仕様

---

## 修正タスク（全7タスク）

### タスク1: MODULE simyu に変数宣言を追加

**場所**: 行110〜112付近

**追加する変数**:

```fortran
REAL*8 v1hy(0:Mkk)             !! エンドミルy方向たわみ(K,Fクラス)
REAL*8 v2hy(0:Mkk)             !! エンドミルy方向たわみ(K',F'クラス)
REAL*8 v1y(0:Mkk)              !! y方向たわみ計算用(K,Fクラス)
REAL*8 v2y(0:Mkk)              !! y方向たわみ計算用(K',F'クラス)
REAL*8 v1dy(0:Mkk),v1sy(0:Mkk) !! y方向たわみ分割計算用
REAL*8 v2dy(0:Mkk),v2sy(0:Mkk) !! y方向たわみ分割計算用
```

`delta1y`, `delta2y` は不要（収束判定は x方向の既存ロジックを維持する）。

---

### タスク2〜4: 3つの刃数ブロックに v1hy 計算を追加

以下の3ブロックに**同じパターンの修正**を適用する:

| タスク | 刃数 | 条件分岐行 | v1h計算開始行 | Rd-v1h 行 | v2h計算開始行 | ゼロリセット行 |
|--------|------|-----------|-------------|-----------|-------------|-------------|
| 2 | NofE==2 | 7393 | 7494 | 7548-7550 | 7636 | 7683-7686 |
| 3 | NofE==3 | 7724 | 8259付近 | 8313-8315 | 8400付近 | 8885-8886 |
| 4 | NofE==4 | 8925 | 9248付近 | 9302-9304 | 9400付近 | 9648-9649 |

各ブロックで以下の4つの修正を行う:

#### 修正A: v1h 計算ブロックの直後に v1hy 計算を追加

v1h(qqq) の do ループ（`do qqq=0,kk-1` 〜 `end do` + `delta1=v1h(0)`）の直後に、以下を挿入:

```fortran
c     ---- y方向たわみ v1hy の計算（dFy2 を使用） ----
      do qqq=0,kk-1
          ze(qqq)=(qqq+0.5)*dze
          do rrr=0,kk-1
              an(rrr)=(rrr+0.5)*dze
              bn(rrr)=EL-an(rrr)
              cn(rrr)=l1+l2-an(rrr)
              dn(rrr)=l1-an(rrr)

              v1dy(rrr)=(dFy2(rrr)/Ee)*((bn(rrr)**3/(3*Ie3))-
     &   (cn(rrr)**3/(3*Ie3))+(dn(rrr)**3/(3*Ie1d))+(bbb*dn(rrr)**2/3)
     &   +(bbb**2*dn(rrr)/3)+(2*bbb**3/9)-bbb**4*((cn(rrr)**2/
     &   (3*(l2+bbb)**3))+(cn(rrr)/(3*(l2+bbb)**2)+(2/(9*(l2+bbb))))))

              v1sy(rrr)=(dFy2(rrr)/Ee)*((bn(rrr)**2/(2*Ie3))-
     &    (cn(rrr)**2/(2*Ie3))+(dn(rrr)**2/(2*Ie1d))+(bbb*dn(rrr)/3)+
     &    (2*bbb**2/3)-bbb**4*((cn(rrr)/(3*(l2+bbb)**3))+
     &    (2/(3*(l2+bbb)**2))))

              v1y(rrr)=abs(v1dy(rrr)+v1sy(rrr)*(an(rrr)-ze(qqq)))
              v1hy(qqq)=v1hy(qqq)+v1y(rrr)
          end do
      end do
```

**注意**: `dFx2` → `dFy2` に変更するだけ。断面二次モーメント（Ie3, Ie1d）は同じ値を使う。

#### 修正B: 実切込み深さを 2D 合成に変更

現状 (例: 行7548-7550):
```fortran
Kt2(qqq)=Kct+(Rd-v1h(qqq))*1000*Ket
Kr2(qqq)=Kcr+(Rd-v1h(qqq))*1000*Ker
Ka2(qqq)=Kca+(Rd-v1h(qqq))*1000*Kea
```

修正後:
```fortran
Kt2(qqq)=Kct+(Rd-sqrt(v1h(qqq)**2+v1hy(qqq)**2))*1000*Ket
Kr2(qqq)=Kcr+(Rd-sqrt(v1h(qqq)**2+v1hy(qqq)**2))*1000*Ker
Ka2(qqq)=Kca+(Rd-sqrt(v1h(qqq)**2+v1hy(qqq)**2))*1000*Kea
```

#### 修正C: v2h 計算ブロックの直後に v2hy 計算を追加

v2h が `dFx3` で計算されているのと同じ構造で、v2hy を `dFy3` で計算する:

```fortran
c     ---- y方向たわみ v2hy の計算（dFy3 を使用） ----
      do qqq=0,kk-1
          ze(qqq)=(qqq+0.5)*dze
          do rrr=0,kk-1
              an(rrr)=(rrr+0.5)*dze
              bn(rrr)=EL-an(rrr)
              cn(rrr)=l1+l2-an(rrr)
              dn(rrr)=l1-an(rrr)

              v2dy(rrr)=(dFy3(rrr)/Ee)*((bn(rrr)**3/(3*Ie3))-
     &   (cn(rrr)**3/(3*Ie3))+(dn(rrr)**3/(3*Ie1d))+(bbb*dn(rrr)**2/3)
     &   +(bbb**2*dn(rrr)/3)+(2*bbb**3/9)-bbb**4*((cn(rrr)**2/
     &   (3*(l2+bbb)**3))+(cn(rrr)/(3*(l2+bbb)**2)+(2/(9*(l2+bbb))))))

              v2sy(rrr)=(dFy3(rrr)/Ee)*((bn(rrr)**2/(2*Ie3))-
     &    (cn(rrr)**2/(2*Ie3))+(dn(rrr)**2/(2*Ie1d))+(bbb*dn(rrr)/3)+
     &    (2*bbb**2/3)-bbb**4*((cn(rrr)/(3*(l2+bbb)**3))+
     &    (2/(3*(l2+bbb)**2))))

              v2y(rrr)=abs(v2dy(rrr)+v2sy(rrr)*(an(rrr)-ze(qqq)))
              v2hy(qqq)=v2hy(qqq)+v2y(rrr)
          end do
      end do
```

#### 修正D: ゼロリセットに v1hy, v2hy を追加

現状 (例: 行7683-7686):
```fortran
do qqq=0,kk-1
    v1h(qqq)=0
    v2h(qqq)=0
end do
```

修正後:
```fortran
do qqq=0,kk-1
    v1h(qqq)=0
    v1hy(qqq)=0
    v2h(qqq)=0
    v2hy(qqq)=0
end do
```

---

### タスク5: endmill_deflection.csv のヘッダ拡張

**場所**: 行2481〜2486

現状:
```fortran
OPEN(80, FILE='endmill_deflection.csv', STATUS='REPLACE')
WRITE(80,'(A)',ADVANCE='NO') 'theta[rad]'
DO qqq = 0, kk
    WRITE(80,'(A,ES14.6)',ADVANCE='NO') ',', (qqq+0.5d0)*dze
END DO
WRITE(80,*)
```

修正後:
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

### タスク6: endmill_deflection.csv のデータ行拡張

**場所**: 行2774〜2779

現状:
```fortran
WRITE(80,'(ES14.6)',ADVANCE='NO') dthz2
DO qqq = 0, kk
    WRITE(80,'(A,ES14.6)',ADVANCE='NO') ',', v1h(qqq)
END DO
WRITE(80,*)
```

修正後:
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

### タスク7: deflection_angle.csv の新規出力

**OPEN文を追加**（行2481付近、endmill_deflection.csv の OPEN の直後）:
```fortran
OPEN(81, FILE='deflection_angle.csv', STATUS='REPLACE')
WRITE(81,'(A)')
     & 'theta[rad],phi_x[rad],phi_y[rad],v1h_tip[m],v1hy_tip[m],v_combined[m]'
```

**WRITE文を追加**（行2779の直後、endmill_deflection.csv の WRITE の直後）:
```fortran
WRITE(81,'(ES14.6,5(A,ES14.6))') dthz2,
     & ',', atan2(v1h(0)-v1h(1), dze),
     & ',', atan2(v1hy(0)-v1hy(1), dze),
     & ',', v1h(0),
     & ',', v1hy(0),
     & ',', sqrt(v1h(0)**2 + v1hy(0)**2)
```

**CLOSE文を追加**（行2931付近、`CLOSE(80)` の直後）:
```fortran
CLOSE(81)   ! deflection_angle.csv
```

---

## 重要な注意事項

1. **3ブロック全てに修正を適用する**: NofE==2, NofE==3, NofE==4 の3箇所。構造は全て同じ。
2. **収束ループは変更しない**: do while の判定条件、pp の更新ロジックはそのまま。
3. **既存の v1h, v2h の計算コードは一切変更しない**: v1hy/v2hy は追加のみ。
4. **dFy2, dFy3 は既に計算済み**: 行7487 `dFy2(qqq)=pp*dFy1(qqq)` で計算されている。新たな計算は不要。
5. **ADVANCE='NO' は Intel oneAPI Fortran 必須**: 標準 Fortran コンパイラでは動かない。

## 検証手順

1. Visual Studio + Intel oneAPI でビルドしてエラーがないこと
2. 既存の条件（例: `数値解析/d1/Vf=600,Rd=0.05/10000/`）で実行して前任者と同じ結果が出ること（v1hy ≈ 0 ではないので少し異なる可能性あり）
3. `endmill_deflection.csv` に v1hy 列が出力されていること
4. `deflection_angle.csv` が新規生成されていること
5. v1hy の値が物理的に妥当な範囲（v1h と同オーダー）であること

## 出力先

結果は `outbox/codex_latest.md` に書いてください。
