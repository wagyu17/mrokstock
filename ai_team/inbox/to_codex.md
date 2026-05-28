# D5: スタッフ向け A4 1枚クイックガイド PDF 生成

## Status
ACTIVE

## Target Todo
D5. スタッフ向けに 5 分で読める A4 1 枚版 (要約) を生成

## Target File
`C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py`

## Output File
`C:\Users\tomot\Desktop\マイクラ開発\M0_スタッフ要約_1枚.pdf`

## 目的
既存の 7 ページ PDF + `staff_script_m0.md` (85行) の内容を、A4 1 枚 (片面) に凝縮した「クイックガイド」を生成する。スタッフが M0 セッション直前に 5 分で読み返せるリファレンスカード。

## 変更内容

### 1. CLI 引数 `--summary` の追加
- `argparse` に `--summary` フラグを追加
- `--summary` 指定時: `M0_スタッフ要約_1枚.pdf` を生成して終了 (既存の 7 ページ PDF は生成しない)
- `--summary --check-only` 指定時: レイアウト構築のみで PDF 書き出しなし
- 引数なし: 従来通り 7 ページ PDF を生成 (既存動作に影響なし)

### 2. `section_summary()` 関数の新規追加
1 ページに以下のセクションを収める。全体を 2 カラムまたは上下セクション分割で詰める。

**タイトル行** (NAVY 背景 + 白文字、高さ 12mm 程度):
`M0 どうぶつごはん — スタッフ用クイックガイド`

**セクション A: ミッション概要** (3 行程度)
- 対象: 小1〜未就学、発達特性のある児童
- 内容: 合計10までの足し算 × 5問 (動物の家にごはんブロックを置く)
- 所要時間: 15〜30 分 (個人差あり、途中終了 OK)

**セクション B: かんたん操作 3ステップ** (箇条書き 3 行)
1. ひらく — Minecraft Education → [プレイ] → [M0 どうぶつごはん] → [プレイ]
2. まつ — 児童が操作。スタッフは横で見守る
3. とじる — [Esc] → [保存して終了]

**セクション C: 声かけのきほん** (5 項目、各 1〜2 行)
- はじまり: 「いっしょに どうぶつに ごはんを あげにいこう！」
- 各もんだい: 「○○ と △△ がいるね。ぜんぶで なんびきかな？」
- とまったとき: 「ゆっくりで いいよ。」→ 待つ → 「いっしょに かぞえてみようか。」
- できたとき: 「いいね！」「できたね！」(短く穏やかに)
- おわり: 「おつかれさま！ すきなところで あそんでみてね。」

**セクション D: つかわない表現** (1 行 + 箇条書き)
- 「不正解」「まちがい」「ダメ」「失敗」
- 赤バツ・否定音・「はやく」「いそいで」
- 他児との比較・全ミッション攻略の促し

**セクション E: トラブル時** (箇条書き 3 行)
- 固まった → ワールドを閉じて開き直す
- 興味を失った → 自由マイクラ遊びか別の活動へ
- コマンドが効かない → チャットで `/function onelife/m0/init` を再実行

**フッター** (muted, 右寄せ):
`ワンライフ M0 教材 — クイックガイド v1.0`

### 3. レイアウト仕様
- 用紙: A4 縦 (既存と同じ)
- マージン: 上下左右 12mm (通常の 18mm より狭く、1 ページに収めるため)
- フォント: `noto` (既存の NotoSansJP)
- フォントサイズ:
  - タイトル: 16pt Bold
  - セクション見出し (A〜E): 11pt Bold、ACCENT 色の下線
  - 本文: 9pt Regular
  - 箇条書き: 9pt Regular
  - フッター: 7pt muted
- 色: 既存定数 (NAVY, ACCENT, GREEN 等) をそのまま使用
- セクション間の余白: 4mm
- セクション見出しと本文の間: 2mm
- ページ溢れ防止: `--check-only` 時にページ数が 1 を超えたらエラーメッセージを出す

### 4. `build_summary_pdf()` 関数
```python
def build_summary_pdf(check_only=False):
    pdf = M0PDF()
    section_summary(pdf)
    if pdf.page > 1:
        print("ERROR: summary exceeds 1 page")
        return
    if check_only:
        print("check OK: summary layout fits 1 page")
        return
    out = PROJ / "M0_スタッフ要約_1枚.pdf"
    pdf.output(str(out))
    print(f"wrote: {out}")
```

### 5. main() の分岐
```python
if args.summary:
    build_summary_pdf(check_only=args.check_only)
else:
    build_pdf(check_only=args.check_only)
```

## 変更しないもの (明示)
- 既存の `build_pdf()` とそこから呼ばれる全関数 — 一切変更しない
- 既存の定数 (QUESTIONS, STAFF_STEPS 等) — 変更しない
- 既存の CLI 動作 (引数なし → 7 ページ PDF) — 変更しない

## 完了条件
1. `python -m py_compile generate_m0_pdf.py` が OK
2. `python generate_m0_pdf.py --check-only` が OK (既存動作に影響なし)
3. `python generate_m0_pdf.py --summary --check-only` が OK + "summary layout fits 1 page"
4. `python generate_m0_pdf.py --summary` で `M0_スタッフ要約_1枚.pdf` が生成される
5. PDF が 1 ページであること
6. 否定表現 (`不正解|まちがい|ダメ|失敗|間違|✗|×`) が 0 hit
7. 既存の 7 ページ PDF 生成に影響がないこと (`python generate_m0_pdf.py` で `M0_どうぶつごはん_教材.pdf` が従来通り生成)

## 確認コマンド
```powershell
python -m py_compile C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py
python C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py --check-only
python C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py --summary --check-only
python C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py --summary
python C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py
rg "不正解|まちがい|ダメ|失敗|間違|✗|×" C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py
(Get-Content C:\Users\tomot\Desktop\マイクラ開発\generate_m0_pdf.py).Count
```

## 注意事項
- 1 ページに収まらない場合: フォントサイズを 8pt に下げる、セクション E を 2 行に短縮する等の調整を自律的に行ってよい。ただし 7pt 未満にはしない
- PyMuPDF でプレビュー PNG を生成し、`ai_team/logs/m0_pdf_preview_d5_YYYYMMDD_HHMM/` に保存すること
- 既存 PDF (`M0_どうぶつごはん_教材.pdf`) は再生成して従来通り出力されることも確認すること
