import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader


ROW_RE = re.compile(r"^([+-]?[0-9,]*\d{2})\s+(.+?)\s+\\([0-9,]+)(\d{2})$")
PERIOD_RE = re.compile(r"_(\d{8})_(\d{8})")

# 「残高ご利用明細書」ではなく、チャージ1件分の「領収書」PDF用
RECEIPT_DATE_RE = re.compile(r"(\d{4})年(\d{1,2})月(\d{1,2})日")
RECEIPT_AMOUNT_RE = re.compile(r"[¥￥]\s*([0-9,]+)")
RECEIPT_NO_RE = re.compile(r"No\.\s*([0-9]{5,})|([0-9]{5,})\s*No\.")
RECEIPT_CONTENT_RE = re.compile(r"[（(]([^（）()]*利用分[^（）()]*)[）)]")


def parse_money(value):
    if not value:
        return 0
    return int(value.replace(",", ""))


def infer_period(path):
    match = PERIOD_RE.search(path.name)
    if not match:
        return None
    start = match.group(1)
    end = match.group(2)
    return {
        "start_year": int(start[:4]),
        "start_month": int(start[4:6]),
        "end_year": int(end[:4]),
        "end_month": int(end[4:6]),
    }


def infer_year(month, period):
    if not period:
        return None
    if period["start_year"] == period["end_year"]:
        return period["start_year"]
    if month >= period["start_month"]:
        return period["start_year"]
    return period["end_year"]


def category_for(amount, detail):
    if amount > 0:
        return "振替"
    if "入 " in detail and " 出 " in detail:
        return "交通費"
    return "その他"


def merchant_for(amount, detail):
    if amount > 0 and "モバイル" in detail:
        return "モバイルSuicaチャージ"
    return detail


def parse_statement_row(line, period):
    match = ROW_RE.match(line.strip())
    if not match:
        return None

    prefix, detail, balance_text, day_text = match.groups()
    month = int(prefix[-2:])
    amount_text = prefix[:-2]
    amount = parse_money(amount_text)

    year = infer_year(month, period)
    if not year:
        return None

    day = int(day_text)
    return {
        "date": f"{year:04d}-{month:02d}-{day:02d}",
        "amount": amount,
        "detail": detail,
        "balance": parse_money(balance_text),
    }


def transaction_from_statement_row(statement_row):
    amount = statement_row["amount"]
    if amount == 0:
        return None

    tx_type = "income" if amount > 0 else "expense"
    amount_abs = abs(amount)
    detail = statement_row["detail"]
    category = category_for(amount, detail)

    return {
        "date": statement_row["date"],
        "type": tx_type,
        "accountId": "mobile-suica",
        "amount": amount_abs,
        "merchant": merchant_for(amount, detail),
        "memo": f"残高 {statement_row['balance']}円",
        "categories": [category],
        "category": category,
        "source": "suica-pdf",
    }


def parse_row(line, period):
    statement_row = parse_statement_row(line, period)
    if not statement_row:
        return None
    return transaction_from_statement_row(statement_row)


def infer_statement_info(statement_rows):
    if not statement_rows:
        return None

    first = statement_rows[0]
    last = statement_rows[-1]
    if first["amount"] == 0:
        opening_balance = first["balance"]
    else:
        opening_balance = first["balance"] - first["amount"]

    net_change = sum(row["amount"] for row in statement_rows)
    expected_last_balance = opening_balance + net_change
    if expected_last_balance != last["balance"]:
        return None

    return {
        "accountId": "mobile-suica",
        "firstDate": first["date"],
        "lastDate": last["date"],
        "openingBalance": opening_balance,
        "statementBalance": last["balance"],
    }


def parse_receipt(text):
    """JR東日本発行のモバイルSuica「領収書」PDF（チャージ1件分）を解析する。"""
    if "領収書" not in text or "Suica" not in text:
        return []

    amounts = [parse_money(value) for value in RECEIPT_AMOUNT_RE.findall(text)]
    amounts = [value for value in amounts if value > 0]
    if not amounts:
        return []
    amount = max(amounts)

    # 発行日時ではなく購入年月日を採用する（発行日時の行は除外）。
    purchase = None
    for line in text.splitlines():
        if "発行" in line or "時" in line:
            continue
        match = RECEIPT_DATE_RE.search(line)
        if match:
            purchase = match
            break
    if not purchase:
        purchase = RECEIPT_DATE_RE.search(text)
    if not purchase:
        return []
    year, month, day = (int(value) for value in purchase.groups())

    # 「但し SF(電子マネー)代金として」はチャージ（入金）を示す。
    is_charge = "代金として" in text and ("SF" in text or "チャージ" in text)
    if not is_charge:
        return []

    no_match = RECEIPT_NO_RE.search(text)
    content_match = RECEIPT_CONTENT_RE.search(text)
    memo_parts = ["モバイルSuica領収書"]
    if no_match:
        memo_parts.append(f"No.{no_match.group(1) or no_match.group(2)}")
    if content_match:
        memo_parts.append(content_match.group(1).strip())

    return [{
        "date": f"{year:04d}-{month:02d}-{day:02d}",
        "type": "income",
        "accountId": "mobile-suica",
        "amount": amount,
        "merchant": "モバイルSuicaチャージ",
        "memo": " / ".join(memo_parts),
        "categories": ["振替"],
        "category": "振替",
        "source": "suica-pdf",
    }]


def parse_pdf(path, source_name=None):
    path = Path(path)
    reader = PdfReader(str(path))
    period = infer_period(Path(source_name)) if source_name else infer_period(path)
    transactions = []
    statement_rows = []
    seen = set()

    full_text = []
    for page in reader.pages:
        text = page.extract_text() or ""
        full_text.append(text)
        for line in text.splitlines():
            statement_row = parse_statement_row(line, period)
            if statement_row:
                statement_rows.append(statement_row)
            row = transaction_from_statement_row(statement_row) if statement_row else None
            if not row:
                continue
            key = (
                row["date"],
                row["type"],
                row["accountId"],
                row["amount"],
                row["merchant"],
                row["memo"],
            )
            if key in seen:
                continue
            seen.add(key)
            transactions.append(row)

    # 明細表が無い場合は「領収書」PDFとして解析を試みる。
    if not transactions:
        transactions = parse_receipt("\n".join(full_text))

    transactions.sort(key=lambda tx: tx["date"], reverse=True)
    return {
        "transactions": transactions,
        "statementInfo": infer_statement_info(statement_rows),
    }


def main():
    if len(sys.argv) not in (2, 3):
        print(json.dumps({"error": "PDF path is required"}))
        return 2

    path = Path(sys.argv[1])
    source_name = sys.argv[2] if len(sys.argv) == 3 else None
    parsed = parse_pdf(path, source_name)
    print(json.dumps(parsed))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
