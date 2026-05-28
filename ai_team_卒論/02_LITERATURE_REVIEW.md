# Literature Review

## 調査テーマ

- 静圧空気軸受（aerostatic bearing）の性能・設計パラメータ
- 静圧空気スピンドル（aerostatic spindle）の回転精度
- エンドミル加工時の工具たわみ・振れ（tool deflection, runout）
- 軸受配置と加工精度の関係（bearing arrangement, machining accuracy）
- 非線形軌道法（non-linear orbit method）
- びびり振動（chatter stability）

## 研究系譜（修正版 2026/05/26）

中村修論 p.20-21 の記述に基づき確定:

| 世代 | 研究者 | 主な貢献 | 残された課題 |
|------|--------|----------|-------------|
| 若林 | 若林大輔 | 軸受配置の実験研究 | 数値解析なし |
| 嶋田（2022） | 嶋田啓太 | 非線形軌道法で軸受配置の影響を数値評価。軸・工具を剛体仮定 | 工具たわみ未考慮 |
| **下八川** | 下八川悠馬 | **工具たわみ計算を数値プログラムに追加**（切削反力によるエンドミル変形に焦点） | 切削条件の検証不足 |
| 中村（修士） | 中村朋哉 | 切削条件と数値計算の見直し、新実験装置での比較、精度向上の実証 | y方向たわみ未実装、可視化なし |
| 丸岡（本研究） | 丸岡大也 | y方向たわみ（v1hy）追加、2D合成、可視化環境構築 | — |

出典: 中村修論 1.2節「研究目的」(p.20-21)

---

## A. 嶋田論文の参考文献（[1]〜[23]）

嶋田論文（Proc IMechE Part C, 2022）の引用文献。論文の緒言で使用。

| No. | 著者 | 年 | タイトル | 誌名 | 関連性 |
|-----|------|-----|---------|------|--------|
| 1 | Chang, Chan, Jeng | 2015 | Discharge coefficients in aerostatic bearings with inherent orifice-type restrictors | ASME J Tribol | 軸受性能 |
| 2 | Neves, Schwarz, Menon | 2010 | Discharge coefficient influence on the performance of aerostatic journal bearings | Tribol Int | 軸受性能 |
| 3 | Liu, Zhang, Xu | 2009 | Performance analysis of rotating externally pressurized air bearings | Proc IMechE J | 軸受性能 |
| 4 | Song, Azam, Jang, Park | 2017 | Effect of shape errors on the stability of externally pressurized air journal bearings | Tribol Int | 軸受安定性 |
| 5 | Abele, Altintas, Brecher | 2010 | Machine tool spindle units | CIRP Ann | スピンドル総論 |
| 6 | Belforte et al. | 2011 | Comparison between grooved and plane aerostatic thrust bearings: Static performance | Meccanica | スラスト軸受 |
| 7 | Gao, Cheng, Chen, Ding, Fu | 2015 | CFD based investigation on influence of orifice chamber shapes | Tribol Int | オリフィス形状 |
| 8 | Otsu, Miyatake, Yoshimoto | 2011 | Dynamic characteristics of aerostatic porous journal bearings | ASME J Tribol | 動特性 |
| 9 | Miyatake, Yoshimoto, Sato | 2006 | Whirling instability of a rotor supported by aerostatic porous journal bearings | Proc IMechE J | ふれまわり |
| 10 | Wu et al. | 2017 | Spindle axial drift and its effect on surface topography in ultra-precision diamond turning | Int J Mach Tool Manu | スピンドルドリフト |
| 11 | Tanaka | 2009 | Recent trends and reviews of ultra-precision machine tools | Trans JSME C | 超精密加工 |
| 12 | Yoshioka, Matsumura, Hashizume, Shinno | 2006 | Minimizing thermal deformation of aerostatic spindle system | JSME Int J C | 熱変形 |
| 13 | Chen, Kang, Yang, Hwang, Shyr | 2010 | Influence of the number of feeding holes on the performances of aerostatic bearings | Ind Lubr Tribol | 給気孔数 |
| 14 | Stout, Rowe | 1975 | Tolerancing procedures for liquid and gas feed externally pressurized bearings | Wear | 製造誤差 |
| 15 | Stout, Pink | 1980 | Orifice compensated EP gas bearings: the significance of errors of manufacture | Tribol Int | 製造誤差 |
| 16 | Stout | 1985 | The effect of manufacturing variations on the performance of externally pressurized gas-lubricated journal bearings | Proc IMechE C | 製造誤差 |
| 17 | Stout, Barrans | 2000 | The design of aerostatic bearings for application to nanometre resolution manufacturing machine systems | Tribol Int | ナノ精度設計 |
| 18 | Yin, Zhang, Du, To | 2021 | Nonlinear analysis of stability and rotational accuracy of an unbalanced rotor | IEEE Access | 非線形解析 |
| 19 | Huang, Lee, Chan | 2015 | Investigation of the effects of spindle unbalance induced error motion on machining accuracy | Int J Mach Tool Manu | アンバランス |
| 20 | Chen, Cui, Pan, Fan, An | 2018 | A prediction model of the surface topography due to the unbalance of the spindle | Adv Mech Eng | 表面トポグラフィ |
| 21 | Zhang, Yu, To, Xiong | 2018 | Spindle imbalance induced forced vibration and its effect on surface generation in diamond turning | Int J Mach Tool Manu | 強制振動 |
| 22 | Sahto et al. | 2020 | Modelling and Simulation of Aerostatic Thrust Bearings | IEEE Access | スラスト軸受モデル |
| 23 | Ogawa, Nakagawa | 2018 | Fundamental investigation of cutting phenomena in micro end-milling | Proc JSPE | 比切削抵抗（本研究の切削力モデルの元データ） |

---

## B. 中村修論の参考文献（[1]〜[40]）— 嶋田と重複しないもの

中村修論には40件の参考文献がある。以下は嶋田論文 [1]〜[23] と重複しない主要なもの。

### B-1. 静圧空気軸受の基礎・歴史

| No. | 著者 | 年 | タイトル | 手元PDF | 中村[No.] |
|-----|------|-----|---------|---------|-----------|
| B01 | 嶽岡悦雄 | 1999 | 高速空気静圧主軸による高硬度材のエンドミル加工に関する研究（東大博士論文） | なし | [1] |
| B02 | 宮武正明 | 2005 | 多孔質静圧気体軸受の高性能化に関する研究（理科大博士論文） | なし | [2] |
| B03 | 林洋次 | 1983 | 滑り軸受(5) | **あり** | [3] |
| B04 | Hirn | 1854 | Sur les Principaux Phénomènes... | なし | [4] |
| B05 | Kingsbury | 1897 | Experiments with an air-lubricated journal | なし | [5] |
| B06 | Harrison | 1913 | The Hydrodynamical Theory of Lubrication... | なし | [6] |
| B07 | Rayleigh | 1918 | Notes on the Theory of Lubrication | なし | [7] |
| B08 | Fuller | 1947 | Hydrostatic lubrication, Part II | なし | [8] |
| B09 | 森, 静間, 柴山, 山本 | 1962 | ジャーナル静圧気体軸受の研究 | **あり** | [9] |
| B10 | 横松 | 2001 | 静圧軸受の現状と将来 | なし | [10] |
| B11 | 下間, 藤井 | 1974 | 静圧型気体軸受研究の進展 | **あり** | [11] |
| B12 | 矢部 | 2000 | 気体潤滑技術の源流から現在まで | **あり** | [12] |
| B13 | 宮武正明 | 2023 | 気体潤滑への導入 | **あり** | [13] |
| B14 | 宮地, 原田 | 1999 | 複合絞りを有する静圧気体ジャーナル軸受の軸受特性 | なし | [14] |

### B-2. 絞り・軸受設計

| No. | 著者 | 年 | タイトル | 手元PDF | 中村[No.] |
|-----|------|-----|---------|---------|-----------|
| B15 | Fan et al. | 2006 | Study of a Miniature Air Bearing Linear Stage System | なし | [15] |
| B16 | Lin et al. | 2006 | Modelling of an Orifice-type Aerostatic Thrust Bearing | なし | [16] |
| B17 | Wang et al. | 2015 | Research on the Characteristics... of Arrayed Micro-hole Aerostatic Journal Bearings | なし | [17] |
| B18 | Wu et al. | 2024 | Lubrication Mechanism and Characteristics of Aerostatic Bearing with Close-Spaced Micro Holes | なし | [18] |
| B19 | Song, Yuan, Zhang, Ding, Cheng | 2022 | The Stability of Spiral-Grooved Air Journal Bearings in Ultrahigh Speeds | **あり** | [19] |

### B-3. スピンドル・軸受配置

| No. | 著者 | 年 | タイトル | 手元PDF | 中村[No.] |
|-----|------|-----|---------|---------|-----------|
| B20 | 柴原, 熊谷, 幸田, 奥田 | 2010 | 微小径エンドミル加工における精度向上の一方法 | なし | [20] |
| B21 | 窪田, 吉本 | 2011 | 超精密加工機用静圧気体スピンドルの軸受配置に関する研究（理科大修論） | なし | [21] |
| B22 | Huang, Lee, Chan | 2015 | Effects of spindle unbalance induced error motion... | (嶋田[19]と同一) | [22] |
| B23 | Huang, Lee, Chan | 2016 | Investigation on the position drift of the axis average line... | **あり** | [23] |
| B24 | Zhang, Yu, To, Xiong | 2018 | Spindle imbalance induced forced vibration... | (嶋田[21]と同一) | [24] |
| B25 | 冨田, 高橋, 小泉 | 2009 | 静圧空気軸受の回転誤差に関する研究 | なし | [25] |

### B-4. 切削力・工具たわみ

| No. | 著者 | 年 | タイトル | 手元PDF | 中村[No.] |
|-----|------|-----|---------|---------|-----------|
| B26 | 中山, 新井, 武井 | 1984 | 切削抵抗の3分力を与える実用式 | **あり** | [26] |
| B27 | 小川, 中川 | 2008 | 極小径エンドミル加工における切削現象に関する基礎的研究 | **あり** | [27] |
| B28 | 西田 他 | 2017 | ボクセルモデルを用いた切削シミュレーション... | なし | [28] |
| B29 | 西田, 奥村, 佐藤, 白瀬 | 2018 | 工具系の弾性変形を考慮したボクセルモデルによるエンドミル加工シミュレーション | **あり** | [29] |
| B30 | 西田, 白瀬 | 2019 | 工具系の弾性変形の予測結果に基づく加工誤差補正 | **あり** | [30] |
| B31 | 金子, 西田, 佐藤, 白瀬 | 2017 | 傾斜切削理論に基づくエンドミル加工の切削力モデル | **あり** | [31] |
| B32 | 金子 | 2021 | 加工情報の予測結果に基づくエンドミル加工のインプロセス状態認識（神戸大博論） | なし | [32] |
| B33 | 仙波, 佐久間, 田口, 内山 | 1989 | 高剛性仕上げエンドミルの開発とその性能評価 | **あり** | [33] |

### B-5. びびり振動・加工面品位（最新論文）

| No. | 著者 | 年 | タイトル | 手元PDF | 中村[No.] |
|-----|------|-----|---------|---------|-----------|
| B34 | Shi, Jin, Cao | 2022 | Chatter stability analysis in Micro-milling with aerostatic spindle considering speed effect | **あり** | [34] |
| B35 | Sun, Zou, Chen, Xue, Huang | 2024 | Chatter failure comparison for high-speed milling... | **あり** | [35] |
| B36 | Zhu, Feng, Yuan et al. | 2025 | Functionalization and prediction of end milling surface topography... | **あり** | [36] |
| B37 | Zagórski, Weremczuk et al. | 2025 | Vibration and stability in dry rough milling AZ31B magnesium alloy... | **あり** | [37] |
| B38 | Shi, Feng, Jin, Cao | 2024 | The prediction of 3D surface topography in high-speed micro-milling with aerostatic spindle | **あり** | [38] |
| B39 | Feng, Wang, An et al. | 2025 | Design and analysis of biomimetic micro-groove aerostatic bearing... | **あり** | [39] |
| B40 | Zhang, Huang, Li, Cui, Rong, Feng | 2025 | Effects from O-rings on stability and nonlinear dynamic characteristics... | **あり** | [40] |

---

## C. 手元にある追加論文（中村修論の参考文献番号なし）

inbox/参考論文/ にあるが、嶋田・中村のどちらの参考文献リストにも直接対応しないもの。

| ID | 著者 | 年 | タイトル | 手元PDF | 関連性 |
|----|------|-----|---------|---------|--------|
| C01 | Liu, Lu, Yu, Gao, Zhao, Chen | 2022 | A steady modeling method to study the effect of FSI on thrust stiffness of an aerostatic spindle | **あり** | スラスト剛性のFSI解析 |
| C02 | Shi, Cao, Jin | 2022 | Dynamics of 5-DOF aerostatic spindle with time-varying coefficients of air bearing | **あり** | 5自由度スピンドル動特性 |
| C03 | Zhang, To, Cheung, Wang | 2012 | Dynamic characteristics of an aerostatic bearing spindle and its influence on surface topography in UPDT | **あり** | スピンドル振動と表面トポグラフィ |
| C04 | Wan, Yuan, Feng, Zhang, Yin | 2017 | Industry-oriented method for measuring cutting forces based on deflections of tool shank | **あり** | 工具たわみからの切削力測定 |
| C05 | Moges, Desai, Rao | 2018 | Modeling of cutting force, tool deflection, and surface error in micro-milling | **あり** | 微細加工の工具たわみモデル |
| C06 | Rusan, Ciupan | 2020 | Static and modal analysis of high-speed CNC milling spindle | **あり** | スピンドル静的・動的解析 |
| C07 | 奥村, 西田, 佐藤, 白瀬 | — | 工具の静変形を考慮したエンドミル加工の切削加工シミュレーション | **あり** | 工具たわみ考慮シミュレーション |
| C08 | 小野, 田村 | — | 静圧気体ジャーナル軸受の安定性 | **あり** | 軸受安定性 |
| C09 | — | — | 静圧気体軸受の理論的研究 | **あり** | 軸受理論 |
| C10 | 十合 | — | 静圧空気軸受に関する研究(第3報) | **あり** | 軸受圧力・負荷能力 |
| C11 | — | — | 気体軸受に関する調査研究分科会報告 | **あり** | 気体軸受総論 |
| C12 | — | — | Cutting Force and Finish Surface Simulation of End Milling Operation | **あり** | 切削シミュレーション |

---

## 研究の差分（最終版）

| 項目 | 嶋田（2022） | 下八川 | 中村（修士） | 丸岡（本研究） |
|------|-------------|--------|-------------|---------------|
| 軸受モデル | 非線形軌道法 | 同左 | 同左 | 同左 |
| 切削力モデル | Ogawa実験値ベース | 同左 | 切削条件見直し | 同左 |
| 工具たわみ | **未考慮（剛体仮定）** | **x方向たわみ追加** | 精度検証・条件見直し | **xy両方向（v1h + v1hy）** |
| ねじれ角 | 未考慮 | — | 考慮（v2h） | 考慮 |
| 実切込み深さ | Rd（固定） | Rd - v1h | 同左 | **Rd - sqrt(v1h² + v1hy²)** |
| 実験比較 | 計画段階 | — | **新装置で64条件実施** | 新モデルで再比較 |
| 可視化 | なし | なし | なし | **HTML可視化ツール** |

---

## 文献の充足状況

### 手元にあるPDF: 30本
- inbox/参考論文/: 30ファイル
- inbox/嶋田論文.pdf: 1ファイル
- inbox/中村朋哉_修士論文.pdf: 1ファイル

### まだ入手していない重要文献
- 嶽岡(1999) 博士論文 [中村1]
- 宮武(2005) 博士論文 [中村2]
- 窪田・吉本(2011) 修士論文 [中村21] — 軸受配置研究の直接的先行研究
- 冨田・高橋・小泉(2009) — 回転誤差 [中村25]

### 追加調査結果（2026/05/26 実施）

#### 嶋田論文の被引用状況（Forward Citations）

Scopus 上の被引用数: **4件**（2026年5月時点）。Web 検索で特定できた被引用論文候補:

- **Shi, Feng, Jin, Cao (2024)** — 既に手元にあり（B38）。同じ aerostatic spindle × micro-milling テーマで、3D 表面トポグラフィ予測モデルを構築。嶋田論文を引用している可能性が高い。
- **Xu, Zhu, Kang et al. (2025)** — "Micro–macro synergy in porous aerostatic bearings" (Int J Adv Manuf Technol, Vol.139, pp.2161-2192)。多孔質静圧軸受のレビュー論文。直接テーマは異なるが、aerostatic bearing 分野の包括的レビュー。
- 残り2件は Scopus への直接アクセスが必要なため未特定。

#### 研究グループ（宮武研）の関連発表

| ID | 著者 | 年 | タイトル | 誌名 | DOI | 手元PDF |
|----|------|-----|---------|------|-----|---------|
| D01 | 下八川悠馬, 宮武正明 | 2023 | 静圧空気スピンドルを用いたエンドミル加工時の回転軸振れおよび加工精度に関する数値的・実験的研究 | 精密工学会学術講演会講演論文集 2023A, pp.110-111 | 10.11522/pscjspe.2023A.0_110 | **なし（J-STAGEで閲覧可能）** |

- タイトルが丸岡卒論テーマと完全一致。下八川の研究成果を精密工学会で発表したもの。
- 論文の緒言で「研究グループの既発表成果」として引用すべき重要文献。

#### Shi et al. シリーズ（aerostatic spindle × micro-milling）

同研究テーマの Shi Jianghai グループの論文シリーズ。手元に3本あり:

| 手元ID | 著者 | 年 | テーマ | 手元PDF |
|--------|------|-----|-------|---------|
| B34/C02 | Shi, Jin, Cao (2022a) | 2022 | Chatter stability with speed effect | **あり** |
| C02 | Shi, Cao, Jin (2022b) | 2022 | 5-DOF spindle dynamics | **あり** |
| B38 | Shi, Feng, Jin, Cao (2024) | 2024 | 3D surface topography prediction | **あり** |

→ このグループは aerostatic spindle の動特性から加工面品位まで一貫して研究しており、緒言の「近年の研究動向」セクションで引用候補。

### 文献充足度の評価（更新版）

| カテゴリ | 充足度 | 備考 |
|---------|--------|------|
| 静圧空気軸受の基礎理論 | ◎ 十分 | 1854年〜現代まで網羅 |
| 軸受性能・設計パラメータ | ◎ 十分 | 嶋田[1]〜[17]で主要論文カバー |
| 軸受配置と加工精度 | ○ ほぼ十分 | 嶋田[19]〜[21]、D01で研究グループ成果もカバー |
| 切削力・工具たわみ | ○ ほぼ十分 | 中村[26]〜[33]で日本語・英語論文ともに確保 |
| びびり振動・加工面品位 | ◎ 十分 | 2022〜2025年の最新論文多数 |
| aerostatic spindle × milling（統合テーマ） | ○ ほぼ十分 | Shi et al. シリーズ3本 + D01 |
| **本研究の直接的先行研究（嶋田→下八川→中村）** | ◎ 十分 | 嶋田論文 + D01 + 中村修論すべて入手済み |

### 残タスク

- [ ] D01（下八川・宮武 2023）のPDFを J-STAGE から入手
- [ ] Scopus 被引用4件の完全リストを確認（大学図書館アクセス推奨）
- [ ] 緒言ドラフト作成時に引用候補の最終選定
