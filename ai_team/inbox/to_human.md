# inbox/to_human.md — humanフェーズ作業指示 (M2 完了→実構築・座標取得)

## Status
ACTIVE (human 担当)

## From
Claude Code (PM)

## To
人間 (丸岡)

## Phase
human_build_and_coordinate_capture

## 目的

AI チーム (Codex / Antigravity) による設計と運用書類の作成は完了した (F1〜F4 / G1〜G3 / H1〜H3 計 10 ファイル)。
次は **Minecraft Education 上で M0「どうぶつのおうちに ごはんを そろえよう」のミッションエリアを実構築し, 実座標を H1 に記入する** フェーズ。

座標が H1 に確定して戻ってきた時点ではじめて, M3 (`.mcfunction` 化サイクル) に着手できる。
**今は AI がさらに文書を作る段階ではない。** 人間が ME 上で 1 回構築する段階。

---

## 作業前に読むファイル (順番厳守)

1. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m2_world_backup_rule.md` (H3)
   - **最初に必ず読む**。作業前バックアップが先。
2. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m2_build_session_checklist.md` (H2)
   - 当日チェックリスト。これを画面横に開きながら進める。
3. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m1_build_guide.md` (G1)
   - 構築の見取り図と素材指定。
4. `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_build\world_patch_for_neeX6PLNWGo\m2_coordinate_capture_sheet.md` (H1)
   - 座標記入シート。**作業中に書き込んでいく**。
5. (参考) `m0_npc_lines.md` (NPC セリフ), `m1_command_pseudocode.md`, `m1_manual_test_checklist.md`

---

## 作業前バックアップ手順 (絶対飛ばさない)

H3 のルールに従って実施する。

1. ME を起動し, ワールド一覧で対象ワールド (`neeX6PLNWGo=` 系) を選ぶ。
2. ワールド設定 → エクスポートを実行。
3. 保存先: `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_backups\` (フォルダがなければ作る)。
   - **`world_patch_for_neeX6PLNWGo/` の中には置かない** (パッチと混ざる)。
4. ファイル名: `neeX6PLNWGo_before_m0_build_human_me_1_21_132_<YYYYMMDD>_<HHMM>.mcworld`
5. Explorer でファイルサイズが 0 KB ではないことを確認。
6. ファイル名を H2 の「当日メモ → 作業前ファイル」欄に転記。

---

## Minecraft Education での構築手順

### Step 1: ワールド複製

- 本番ワールドを直接いじらない。ME の「コピーを作成」で複製する。
- 複製名を **`M0_DRAFT`** (または日付付き `M0_DRAFT_20260523`) にする。
- 以降の作業はこの複製ワールドで行う。

### Step 2: バージョン・設定確認 (H2 セクション C)

- Minecraft Education 1.21.132 であること。
- チート ON / マルチプレイ無効 / Default Game Mode = Adventure。
- 構築作業の間だけ自分だけ Creative に切り替える。

### Step 3: 構築 (G1 `m1_build_guide.md` の見取り図に従う)

H2 のセクション D〜G を上から順に消化していく。

- **H0 (ハブ中心)** に立ち, 実座標を H1 の S1 に記入。これが基準点になる。
- 入口看板 → 通路 → メインエリア外形 → 動物の家 5 軒 (ペンギン/うさぎ/くま/ひつじ/ぞう) → 緑コンクリ 5 ヶ所 → バリアブロックでの外周封鎖 → 案内 NPC「あんないの ねこ」。
- NPC セリフは `m0_npc_lines.md` をそのまま貼り付ける (改変禁止。否定表現が混じる事故防止)。
- バリアブロック設置後, **手から外して通常視点で歩いて** 抜け道がないか確認。

---

## 座標取得方法

### F3 デバッグ画面の使い方

- ME では **F3 キー** または **設定 → 開発者向け → 座標表示 ON** で座標が出る。
- 表示は `X / Y / Z` (X=東西, Y=高さ, Z=南北)。
- 小数が出る場合は, 立っているブロックそのものの整数値に丸めて記入する (H1 の「記録時の基本」5 項参照)。

### 記入対象 (H1 の S1〜S7 全部)

| セクション | 対象 |
|---|---|
| S1 | H0 (ハブ中心), HP (初期スポーン), RP0 (作業開始地点) |
| S2 | E1〜E3 (入口看板・通路始点・通路終点) |
| S3 | A1〜A5 (動物の家 5 軒) |
| S4 | Q1〜Q5 緑コンクリ座標と真上 3 マスの座標, 必要数 |
| S5 | C1 (エサチェスト), N0 (案内 NPC), B1/B2 (看板), EX (出口) |
| S6 | BA_MIN / BA_MAX (バリア最小/最大点), BA_ENTRY / BA_EXIT |
| S7 | RP (リスポーン), RT (復帰地点), CL (クリア地点) |

**Q1〜Q5 の Y (高さ) はそろえる**。`.mcfunction` 化の際に for ループで処理しやすくなる。

---

## スクリーンショット保存方法

- ME の **F2 キー** または PrintScreen で撮影。
- 保存先: `C:\Users\tomot\Desktop\マイクラ開発\minecraft_world_backups\screenshots_m0_<YYYYMMDD>\`
- 必須カット (H2 セクション J):
  1. ハブから入口までの導線
  2. メインエリア全景 (鳥瞰)
  3. 緑コンクリの答え置き場 5 ヶ所
  4. 案内 NPC のダイアログ画面
- 各ファイル名: `m0_<対象>_<連番>.png` (例: `m0_entrance_01.png`)
- 保存先パスを H1 の各「スクリーンショット」欄に記入。

---

## 作業後バックアップ手順

構築と H1 記入と スクショ保存が**全部終わってから**実施する。

1. ME で M0_DRAFT ワールドのエクスポートを実行。
2. ファイル名: `neeX6PLNWGo_after_m0_build_human_me_1_21_132_<YYYYMMDD>_<HHMM>.mcworld`
3. 保存先は作業前バックアップと同じフォルダ。
4. **作業前ファイルと作業後ファイルを両方残す** (上書き禁止)。
5. ファイルサイズ 0 KB チェック。
6. H2 の「作業後ファイル」欄に転記。

---

## AI に戻す成果物一覧

以下を揃えて Claude に戻してください。

| # | 成果物 | 場所 | 状態 |
|---|---|---|---|
| 1 | H1 (`m2_coordinate_capture_sheet.md`) の S1〜S7 全記入版 | 既存パスを上書き | 全欄に整数座標 |
| 2 | H2 (`m2_build_session_checklist.md`) のチェック完了版 + 当日メモ記入 | 既存パスを上書き | 全項目 `[x]` + 当日メモ全記入 |
| 3 | 作業前 `.mcworld` | `minecraft_world_backups\` | `_before_` ファイル |
| 4 | 作業後 `.mcworld` | `minecraft_world_backups\` | `_after_` ファイル |
| 5 | スクリーンショット 4 種以上 | `minecraft_world_backups\screenshots_m0_*\` | PNG |
| 6 | 構築中の気づきメモ | `ai_team/inbox/to_claude.md` | 自由記述 (任意だが推奨) |

戻し方は **`ai_team/inbox/to_claude.md` に「座標記入完了」と書く** だけで OK。Claude 起動時にこれを読みに行く。

---

## 作業中に止める条件 (どれか 1 つでも該当したら作業中断)

| 条件 | 対応 |
|---|---|
| 同じ手順で 3 回連続失敗 (例: バリアの抜け道がふさがらない等) | 作業中断 → `inbox/to_claude.md` に状況メモ |
| ワールドが起動しない / 破損した | H3 ケース 2 に従って作業前 `.mcworld` から復元 |
| H1 に書く対象が見取り図に見当たらない (例: NPC 位置が決められない) | 作業中断 → Claude に「設計に不足あり」とフィードバック |
| `.mcworld` エクスポートが 0 KB になる | 作業中断 → 再エクスポート, 改善しなければ Claude に連絡 |
| 作業時間が想定の 2 倍 (4 時間以上) を超える | 一旦中断 → 作業後バックアップだけ取り Claude に進捗報告 |
| NPC セリフに否定表現 (「ちがう」「まちがい」「不正解」「失敗」) が混ざりそう | 即停止 → `m0_npc_lines.md` の原文以外を書かない |
| `world_patch_for_neeX6PLNWGo/` 内のファイル (H1〜H3, G1〜G3) を AI 以外が書き換えそうになった | 中断 (H1 だけは記入 OK。他は触らない) |

---

## M3 (`.mcfunction` 化) に進むために必要な情報

座標が H1 に確定して戻ってきた時点で, Claude PM が Codex に以下の実装指示を投入できる状態になる。

### M3 で Codex が作る予定のファイル

- `world_patch_for_neeX6PLNWGo/functions/onelife/m0/init.mcfunction`
   - 動物の家 5 軒・看板・チェスト・案内 NPC スポーンを `setblock` / `fill` / `summon` で一括配置
- `world_patch_for_neeX6PLNWGo/functions/onelife/m0/q01〜q05.mcfunction`
   - 各問の正答ブロック数を scoreboard でカウント, NPC が反応
- `world_patch_for_neeX6PLNWGo/functions/onelife/m0/reset.mcfunction`
   - エリアの原状復帰

### H1 が満たすべき M3 着手条件

- [ ] **S1 H0 座標が確定している** (これがないと全座標が浮く)
- [ ] **S3 A1〜A5 の動物の家 5 軒の座標が確定** (`summon` の対象座標)
- [ ] **S4 Q1〜Q5 緑コンクリ座標 + 真上 1〜3 の座標が確定** (`/testforblock` または `execute if blocks` の対象)
- [ ] **S4 Q1〜Q5 の Y (高さ) がそろっている** (for ループ化のため)
- [ ] **S5 N0 案内 NPC 座標が確定** (`summon npc` の対象)
- [ ] **S6 BA_MIN / BA_MAX が確定** (`fill` でバリア生成する範囲)
- [ ] **S7 RP リスポーン地点が確定** (`spawnpoint` の対象)

ここが埋まっていれば M3 着手可能。S2/S5 看板や S7 RT/CL は M3 着手後でも追加記入可能。

---

## 次の Handoff

- 作業完了後: `ai_team/inbox/to_claude.md` に「座標記入完了」と記入 → Claude PM が M3 サイクル指示 (Codex 向け) を投入。
- 作業中断時: `ai_team/inbox/to_claude.md` に状況を残す → Claude PM が判断 (リトライ・設計補正・別経路選定のいずれか)。

## Continue or Stop
WAIT_FOR_HUMAN
