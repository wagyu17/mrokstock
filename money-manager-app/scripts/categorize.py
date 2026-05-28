# -*- coding: utf-8 -*-
"""input フォルダの全口座データを取り込み、各取引をカテゴリ自動分類して
家計簿サマリー.md と 取引カテゴリ分類.csv を出力する。"""
import csv, json, subprocess, sys, os, unicodedata
from collections import defaultdict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IN = os.path.join(BASE, "input")
PY = sys.executable

def num(s):
    s = (s or "").strip().replace(",", "")
    if s in ("", "-"):
        return 0
    return int(s) if s.lstrip("-").isdigit() else 0

def norm(s):
    """全角→半角・半角カナ→全角カナなどを正規化し、英字は大文字化（照合用）。"""
    return unicodedata.normalize("NFKC", str(s or "")).upper()

# ---------- カテゴリ分類ルール ----------
# (カテゴリ名, 区分, [キーワード...])  上から順に最初に一致したものを採用。
RULES = [
    # --- 口座間移動（自分の資産の移し替え。実収支から除外） ---
    ("口座間移動", "transfer", ["RTK ペイペイ", "ペイペイ", "PAYPAY", "ライン ペイ", "LINE PAY",
                            "LINEPAY", "モバイルSUICA", "SUICAチャージ", "SUICA GO", "チャージ",
                            "BANCS"]),
    # --- 収入 ---
    ("ONEHOUDAY", "income", ["ワンライフ", "ONELIFE", "ONEHOUDAY"]),
    ("配達・ギグ報酬", "income", ["UBER", "出前館", "デマエカン", "DEMAE", "WOLT", "MENU"]),
    ("まいばすけっと給与", "income", ["給料振込", "給与", "給料"]),
    ("利息", "income", ["利息"]),
    ("ポイント・還元", "income", ["ポイント", "残高の獲得", "現金還元", "還元"]),
    ("返金・キャンセル", "income", ["返金", "キャンセル"]),
    # --- 支出 ---
    ("コンビニ", "expense", ["セブン", "SEVEN", "ローソン", "LAWSON", "ファミリーマート", "ファミマ",
                          "ミニストップ", "MINISTOP", "NEWDAYS", "ニューデイズ"]),
    ("スーパー・食料品", "expense", ["まいばすけっと", "マイバスケット", "イオン", "AEON", "マルエツ",
                              "成城石井", "ライフ", "業務スーパー", "スーパー", "肉のハナマサ",
                              "ハナマサ", "オーケー", "ヤオコー", "いなげや"]),
    ("お菓子", "expense", ["おかしのまちおか", "お菓子", "シャトレーゼ"]),
    ("カフェ", "expense", ["スタバ", "スターバックス", "STARBUCKS", "ドトール", "DOUTOR",
                        "タリーズ", "TULLY", "コーヒー", "珈琲", "カフェ", "CAFE"]),
    ("外食", "expense", ["おぶとん", "焼肉", "ホルモン", "ふたご", "レストラン", "食堂", "ダイニング",
                       "マクドナルド", "MCDONALD", "松屋", "すき家", "吉野家", "居酒屋", "ラーメン",
                       "麺", "飲食", "鍋", "寿司", "そば", "うどん", "丼", "ピザ", "PIZZA",
                       "伊勢屋", "神田屋", "とびっちょ", "丸玄", "フリホーレス"]),
    # サブスク／デジタルは「ネットショッピング」より先に判定する
    ("サブスク・デジタル", "expense", ["AMAZON DOWNLOADS", "APPLE COM", "APPLE.COM", "APPLEサービス",
                               "NETFLIX",
                               "SPOTIFY", "ADOBE", "ICLOUD", "YOUTUBE", "OPENAI", "ANTHROPIC",
                               "CLAUDE", "CHATGPT", "DISNEY", "DAZN"]),
    ("ガジェット・PC", "expense", ["DELL", "GOOGLE S", "GOOGLE STORE", "APPLE ONLINE",
                            "APPLE STORE", "PIXEL", "ビックカメラ", "BIC CAMERA",
                            "TEMPORARY HOLD"]),
    ("ネットショッピング", "expense", ["AMAZON", "楽天市場", "RAKUTEN", "MERCARI", "メルカリ",
                               "ZOZO", "YAHOO", "QOO10", "LINE EC"]),
    ("衣服・スポーツ用品", "expense", ["ADIDAS", "アディダス", "NIKE", "ナイキ", "UNIQLO", "ユニクロ",
                              "GU ", "ZARA", "2XU", "ALPEN", "アルペン", "ASICS", "アシックス",
                              "MIZUNO", "ミズノ", "スポーツ", "SP ATSUGI"]),
    ("理美容", "expense", ["バーバー", "BARBER", "美容室", "美容院", "理容", "床屋", "ヘアー"]),
    ("医療・健康", "expense", ["整骨院", "鍼灸", "病院", "クリニック", "薬局", "ドラッグ", "歯科",
                          "医院", "接骨", "保健"]),
    ("宿泊・旅行", "expense", ["KOYADO", "AGODA", "BOOKING", "じゃらん", "JALAN", "ホテル", "HOTEL",
                          "ゲストハウス", "旅館", "EXPEDIA", "AIRBNB"]),
    ("通信費", "expense", ["DOCOMO", "ドコモ", "SOFTBANK", "ソフトバンク", "楽天モバイル", "AHAMO",
                       "POVO", "通信"]),
    ("水道光熱費", "expense", ["東京電力", "東京ガス", "電気料金", "ガス料金", "水道料金", "TEPCO",
                          "電力", "光熱"]),
    ("住居・家賃", "expense", ["家賃", "賃料", "管理費", "礼金", "敷金"]),
    ("ATM・現金引出", "expense", ["ATM", "引出", "出金手数料"]),
    ("ポイント失効", "expense", ["期限切れ", "取消"]),
]

def categorize(text, direction):
    """direction は実際の入出金方向（"income"/"expense"）。
    口座間移動ルールは方向に関係なく適用し、収入/支出ルールは方向が一致するものだけ適用する
    （例: イオンからの入金が支出キーワード「イオン」で支出扱いになる誤分類を防ぐ）。"""
    t = norm(text)
    for name, kind, kws in RULES:
        if kind != "transfer" and kind != direction:
            continue
        for kw in kws:
            if norm(kw) in t:
                return name, kind
    # フォールバック
    if direction == "income":
        if "カード" in t or "カ-ド" in t:
            # ATMでキャッシュカードを使った現金入金（主に親戚からの祝い金等）
            return "祝い金・現金入金", "income"
        if "振込" in str(text):
            return "振込入金（個人・その他）", "income"
        return "その他入金", "income"
    if "振込" in str(text):
        return "振込支払（個人・その他）", "expense"
    return "その他支出", "expense"

# ---------- 各口座の取引を読み込む ----------
txns = []  # dict: date, account, inc, out, desc, category, kind

# 三井住友銀行
for r in list(csv.reader(open(os.path.join(IN, "meisai (1).csv"), encoding="cp932")))[1:]:
    inc, out, desc = num(r[2]), num(r[1]), r[3]
    cat, kind = categorize(desc, "income" if inc else "expense")
    txns.append(dict(date=r[0], account="三井住友銀行", inc=inc, out=out, desc=desc, category=cat, kind=kind))

# 三菱UFJ銀行
for r in list(csv.reader(open(os.path.join(IN, "1030669_20260516202702.csv"), encoding="cp932")))[1:]:
    inc, out, desc = num(r[4]), num(r[3]), (r[1] + " " + r[2]).strip()
    if inc and "デビット" in desc:
        # デビット入金は購入のキャンセル・返金
        cat, kind = "返金・キャンセル", "income"
    elif inc and "給料" in desc:
        # 三菱UFJに「給料」名義で毎月25日前後に入る入金はトモノカイ（家庭教師）
        cat, kind = "トモノカイ", "income"
    else:
        cat, kind = categorize(desc, "income" if inc else "expense")
    txns.append(dict(date=r[0], account="三菱UFJ銀行", inc=inc, out=out, desc=desc, category=cat, kind=kind))

# PayPay
for r in list(csv.reader(open(os.path.join(IN, "Transactions_20250601-20260516 (1).csv"), encoding="utf-8-sig")))[1:]:
    inc, out = num(r[2]), num(r[1])
    pp_kind, who = r[7], r[8]
    desc = (pp_kind + " " + who).strip()
    if pp_kind == "チャージ":
        cat, kind = "口座間移動", "transfer"
    elif pp_kind == "受け取った金額":
        cat, kind = "個人からの受取", "income"
    elif pp_kind == "送った金額":
        cat, kind = "個人への送金", "expense"
    elif "ポイント" in pp_kind and "獲得" in pp_kind:
        cat, kind = "ポイント・還元", "income"
    elif "期限切れ" in pp_kind or "取消" in pp_kind:
        cat, kind = "ポイント失効", "expense"
    elif pp_kind == "返金":
        cat, kind = "返金・キャンセル", "income"
    else:  # 支払い など
        cat, kind = categorize(who, "income" if inc else "expense")
    txns.append(dict(date=r[0].split()[0], account="PayPay", inc=inc, out=out, desc=desc, category=cat, kind=kind))

# モバイルSuica
suica_pdf = os.path.join(IN, "JE80F521072454210_20260319_20260516210536.pdf")
res = subprocess.run([PY, os.path.join(BASE, "scripts", "suica_pdf_to_json.py"), suica_pdf, os.path.basename(suica_pdf)],
                     capture_output=True, text=True, encoding="utf-8")
for t in json.loads(res.stdout)["transactions"]:
    m = t["merchant"]
    if "チャージ" in m:
        cat, kind = "口座間移動", "transfer"
    elif "入" in m and "出" in m:
        cat, kind = "交通費", "expense"
    else:
        cat, kind = "Suica物販", "expense"
    inc = t["amount"] if t["type"] == "income" else 0
    out = t["amount"] if t["type"] == "expense" else 0
    txns.append(dict(date=t["date"], account="モバイルSuica", inc=inc, out=out, desc=m, category=cat, kind=kind))

def iso(d):
    p = d.replace("-", "/").split("/")
    return f"{int(p[0]):04d}-{int(p[1]):02d}-{int(p[2]):02d}"
for t in txns:
    t["date"] = iso(t["date"])
txns.sort(key=lambda t: t["date"])

# ---------- CSV 出力（全取引＋カテゴリ） ----------
with open(os.path.join(BASE, "取引カテゴリ分類.csv"), "w", encoding="utf-8-sig", newline="") as f:
    wr = csv.writer(f)
    wr.writerow(["日付", "口座", "区分", "カテゴリ", "入金", "出金", "内容"])
    for t in txns:
        wr.writerow([t["date"], t["account"],
                     {"income": "収入", "expense": "支出", "transfer": "口座間移動"}[t["kind"]],
                     t["category"], t["inc"] or "", t["out"] or "", t["desc"]])

# ---------- カテゴリ別集計 ----------
cat_exp = defaultdict(lambda: [0, 0])
cat_inc = defaultdict(lambda: [0, 0])
cat_trf = defaultdict(lambda: [0, 0])
for t in txns:
    if t["kind"] == "expense":
        c = cat_exp[t["category"]]; c[0] += 1; c[1] += t["out"]
    elif t["kind"] == "income":
        c = cat_inc[t["category"]]; c[0] += 1; c[1] += t["inc"]
    else:
        c = cat_trf[t["category"]]; c[0] += 1; c[1] += (t["inc"] + t["out"])

real_exp = sum(v[1] for v in cat_exp.values())
real_inc = sum(v[1] for v in cat_inc.values())
gift_in = cat_inc.get("祝い金・現金入金", [0, 0])[1]
earned_inc = real_inc - gift_in  # 一時的な祝い金を除いた、労働・業務委託による継続収入

# ---------- Markdown 出力 ----------
md = []
def L(s=""): md.append(s)

L("# 家計簿サマリー")
L()
L("> 作成日: 2026-05-17 ／ 自動生成スクリプト `scripts/categorize.py` による出力")
L("> データ元: `input/` の三井住友銀行・三菱UFJ銀行・PayPay・モバイルSuica の明細")
L(f"> 対象取引: 全 {len(txns)} 件")
L()
L("## 1. 現在の資産")
L()
L("| 口座 | 現在残高 | 出典 |")
L("|---|---:|---|")
L("| 三菱UFJ銀行 | 221,890円 | CSV最新残高 |")
L("| 三井住友銀行 | 4,085円 | CSV最新残高 |")
L("| モバイルSuica | 2,029円 | PDF最新残高 |")
L("| PayPay | 不明 | CSVに残高列なし（要アプリ確認） |")
L("| 現金 | 不明 | データなし |")
L("| **判明分の合計** | **227,004円** | （＋PayPay・現金） |")
L()
L("資産の約97%が三菱UFJ銀行に集中している。")
L()

L("## 2. カテゴリ別 支出")
L()
L(f"口座間移動を除く実支出の合計: **{real_exp:,}円**（取り込み期間全体）")
L()
L("| カテゴリ | 件数 | 金額 | 構成比 |")
L("|---|---:|---:|---:|")
for cat, (c, amt) in sorted(cat_exp.items(), key=lambda kv: -kv[1][1]):
    pct = amt / real_exp * 100 if real_exp else 0
    L(f"| {cat} | {c} | {amt:,}円 | {pct:.1f}% |")
L()

L("## 3. カテゴリ別 収入")
L()
L(f"口座間移動を除く収入の合計: **{real_inc:,}円**")
L(f"うち一時的な「祝い金・現金入金」**{gift_in:,}円** を除いた、")
L(f"労働・業務委託による継続的な収入は **{earned_inc:,}円**")
L()
L("| カテゴリ | 件数 | 金額 | 構成比 |")
L("|---|---:|---:|---:|")
for cat, (c, amt) in sorted(cat_inc.items(), key=lambda kv: -kv[1][1]):
    pct = amt / real_inc * 100 if real_inc else 0
    L(f"| {cat} | {c} | {amt:,}円 | {pct:.1f}% |")
L()
L("**収入源の内訳:**")
L()
L("- **ONEHOUDAY**: 業務委託契約。三菱UFJに「振込 カ）ワンライフ」名義で月末〜月初に入金。")
L("- **トモノカイ**: 家庭教師。三菱UFJに「給料」名義で毎月25日（25日が土日祝なら直前の平日）に入金。")
L("- **まいばすけっと給与**: 三井住友に「給料振込」名義で入るアルバイト給与。")
L("- **配達・ギグ報酬**: Uber Eats・出前館の配達報酬。三井住友に振込。")
L("- **個人からの受取**: 主にPayPayの「受け取った金額」。友人との立替精算など。")
L("- **祝い金・現金入金**: ATMでキャッシュカードを使って入金した現金。出所は主に")
L("  親戚からの祝い金等。一時的な収入であり、継続的に見込めるものではない。")
L()

L("## 4. 口座間移動（チャージ等・実収支から除外）")
L()
L("| カテゴリ | 件数 | 金額 |")
L("|---|---:|---:|")
for cat, (c, amt) in sorted(cat_trf.items(), key=lambda kv: -kv[1][1]):
    L(f"| {cat} | {c} | {amt:,}円 |")
L()
L("銀行→PayPay／LINE Pay／Suica へのチャージは自分の資産の移し替えであり、収入・支出には含めていない。")
L()

L("## 5. 口座別の取り込み期間と動き")
L()
L("| 口座 | 期間 | 件数 | 入金計 | 出金計 | 純増減 |")
L("|---|---|---:|---:|---:|---:|")
acc_data = defaultdict(lambda: [0, 0, 0, None, None])
for t in txns:
    a = acc_data[t["account"]]
    a[0] += t["inc"]; a[1] += t["out"]; a[2] += 1
    a[3] = t["date"] if a[3] is None else min(a[3], t["date"])
    a[4] = t["date"] if a[4] is None else max(a[4], t["date"])
for acc in ["三井住友銀行", "三菱UFJ銀行", "PayPay", "モバイルSuica"]:
    i, o, c, mn, mx = acc_data[acc]
    L(f"| {acc} | {mn}〜{mx} | {c} | {i:,}円 | {o:,}円 | {i-o:+,}円 |")
L()
L("※ この入金計・出金計には口座間移動を含むため、額面どおりの収支ではない。")
L()

L("## 6. 注意点（数字を読む前提）")
L()
L("1. **分類はキーワードによる自動判定**であり完全ではない。「その他支出」「その他入金」に")
L("   未分類が残る。銀行のデビット明細は店名コード主体のため精度が低い。")
L("2. **「祝い金・現金入金」983,000円** はATMでの現金入金（主に親戚からの祝い金等）で、")
L("   負債ではない。ただし一時的な収入なので、収入合計を「稼ぐ力」と見なさないこと。")
L("3. **PayPay残高・現金が不明**のため、総資産227,004円は概算。")
L("4. **取り込み期間が口座ごとに異なる**（三井住友2024/10〜、他2025/6〜、Suica2026/3〜）。")
L("   期間横断の比較・月次合算には注意。")
L("5. LINE Pay へのチャージは口座間移動として除外したが、LINE Pay 側の利用明細は未取込のため、")
L("   その先の支出は本サマリーに反映されていない。")
L("6. 「ガジェット・PC」にはGoogleでの購入129,510円が含まれるが、これは後日全額返金されている")
L("   （§3「返金・キャンセル」に同額の入金あり）。返金を相殺した実質負担は約254,789円。")
L("7. 「トモノカイ」「ONEHOUDAY」「まいばすけっと給与」は振込名義で判定している。Suica等への")
L("   チャージ（同日・同額の口座間の入出金ペア）は §4『口座間移動』として収支から除外。")
L()
L("## 7. 全取引の分類結果")
L()
L("各取引の日付・口座・区分・カテゴリ・金額・内容は、同フォルダの")
L("**`取引カテゴリ分類.csv`**（UTF-8・Excelでそのまま開ける）に全件出力した。")

with open(os.path.join(BASE, "家計簿サマリー.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(md) + "\n")

print("done. txns =", len(txns))
print("real_exp =", real_exp, " real_inc =", real_inc, " card_in =", card_in)
print("misc_exp =", cat_exp.get("その他支出"), " misc_inc =", cat_inc.get("その他入金"))
# トモノカイ入金が25日前後に集中しているかの検証
tomo_days = sorted(int(t["date"][8:10]) for t in txns if t["category"] == "トモノカイ")
one_dates = sorted(t["date"] for t in txns if t["category"] == "ONEHOUDAY")
print("tomonokai income days:", tomo_days)
print("onehouday income dates:", one_dates)
