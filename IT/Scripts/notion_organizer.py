#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion 自動整理スクリプト
  - ALL データベースのページにタグを自動付与
  - 空のデータベースをアーカイブ
"""

import os
import re
import sys
import requests
from dotenv import load_dotenv

# Windows でも UTF-8 出力
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

# ─────────────────────────────────────────
# 設定
# ─────────────────────────────────────────
TOKEN   = os.environ["NOTION_TOKEN"]
ALL_DB  = "c9cf12dbb52d494ba2bc56e413ae1dc6"   # 🅰️ ALL

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type":  "application/json",
    "Notion-Version": "2022-06-28",
}

# ホームの空データベース（削除対象）
EMPTY_DATABASES = [
    "1db505fa-d8d5-4d2e-9155-28d7a162df6b",
    "3f3d212d-7279-4166-8b1e-698575aca88c",
]

# ─────────────────────────────────────────
# タグ付けルール  (キーワードリスト → タグ名)
# ─────────────────────────────────────────
TAG_RULES: list[tuple[list[str], str]] = [
    (["面接", "ob訪問", "就活", "内定", "インターン", "選考", "エントリー",
      "nri", "accenture", "ibm", "ntt", "コンサル", "アクセンチュア",
      "abeam", "大林", "川崎重工", "キーエンス"], "就活"),
    (["英語", "english", "toeic", "英検", "英会話", "atsueigo"], "English"),
    (["陸上", "ランニング", "マラソン", "トレイル", "練習", "レース",
      "800m", "track", "t&f", "インターバル", "ジョグ"], "T&F"),
    (["勉強", "study", "学習", "試験", "テスト", "授業", "大学",
      "基本情報", "情報技術", "簿記", "cs50", "機械工学"], "Study"),
    (["バイト", "アルバイト", "家庭教師", "レッスン", "マイクラ",
      "minecraft", "なりと", "請求書"], "Part-time"),
    (["プログラミング", "コード", "python", "git", "shell",
      "ai", "claude", "obsidian", "notion", "llm", "api"], "Programming"),
    (["読書", "本", "書評", "読んだ", "reading", "kindle"], "Reading"),
    (["アイデア", "構想", "ビジネス", "idea", "やりたいこと"], "Idea"),
    (["計画", "スケジュール", "plan", "目標", "プラン", "ロードマップ"], "Plan"),
    (["振り返り", "review", "反省", "レビュー", "記録"], "Review"),
    (["生活", "living", "日常", "料理", "食事", "ルーティン",
      "健康", "睡眠", "掃除"], "living"),
]

DATE_PATTERN = re.compile(r"^\d{4}/\d{2}/\d{2}$")


# ─────────────────────────────────────────
# Notion API ユーティリティ
# ─────────────────────────────────────────
def query_all_pages(db_id: str) -> list[dict]:
    """データベースの全ページを取得（ページネーション対応）"""
    pages, cursor = [], None
    url = f"https://api.notion.com/v1/databases/{db_id}/query"
    while True:
        body: dict = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        res = requests.post(url, headers=HEADERS, json=body)
        res.raise_for_status()
        data = res.json()
        pages.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return pages


def get_title(page: dict) -> str:
    """ページタイトルを取得"""
    props = page.get("properties", {})
    for prop in props.values():
        if prop.get("type") == "title":
            texts = prop.get("title", [])
            return texts[0]["plain_text"] if texts else ""
    return ""


def get_current_tags(page: dict) -> list[str]:
    """現在のタグ一覧を取得"""
    tag_prop = page.get("properties", {}).get("タグ", {})
    if tag_prop.get("type") == "multi_select":
        return [o["name"] for o in tag_prop.get("multi_select", [])]
    return []


def suggest_tags(title: str) -> list[str]:
    """タイトルからタグを推定"""
    if DATE_PATTERN.match(title):
        return ["Daily"]
    tl = title.lower()
    return [tag for keywords, tag in TAG_RULES
            if any(kw in tl for kw in keywords)]


def update_tags(page_id: str, tags: list[str]) -> bool:
    """ページのタグを更新"""
    url = f"https://api.notion.com/v1/pages/{page_id}"
    body = {"properties": {"タグ": {"multi_select": [{"name": t} for t in tags]}}}
    res = requests.patch(url, headers=HEADERS, json=body)
    return res.ok


def is_db_empty(db_id: str) -> bool:
    """データベースにエントリが0件か確認"""
    url = f"https://api.notion.com/v1/databases/{db_id}/query"
    res = requests.post(url, headers=HEADERS, json={"page_size": 1})
    if not res.ok:
        return False
    return len(res.json().get("results", [])) == 0


def archive_database(db_id: str) -> bool:
    """データベースをアーカイブ（ゴミ箱に移動）"""
    url = f"https://api.notion.com/v1/pages/{db_id}"
    res = requests.patch(url, headers=HEADERS, json={"archived": True})
    return res.ok


# ─────────────────────────────────────────
# メイン処理
# ─────────────────────────────────────────
def run_tagging():
    """タグなしページへのタグ自動付与"""
    print("\n[タグ付け] タグなしページを検索中...")
    pages = query_all_pages(ALL_DB)
    print(f"   取得: {len(pages)} ページ")

    candidates = []
    for page in pages:
        title = get_title(page)
        current = get_current_tags(page)
        if not current:
            suggested = suggest_tags(title)
            candidates.append({
                "id":      page["id"],
                "title":   title or "(無題)",
                "tags":    suggested,
            })

    if not candidates:
        print("[OK] タグなしページはありません\n")
        return

    print(f"\n{'ページ名':<45} 推定タグ")
    print("─" * 70)
    for c in candidates:
        tags_str = ", ".join(c["tags"]) if c["tags"] else "─（推定不可）"
        print(f"  {c['title']:<43} {tags_str}")

    print()
    ans = input("タグを付与しますか？ [y/n]: ").strip().lower()
    if ans != "y":
        print("スキップしました\n")
        return

    ok_count = skip_count = 0
    for c in candidates:
        if not c["tags"]:
            skip_count += 1
            continue
        if update_tags(c["id"], c["tags"]):
            print(f"  [OK] {c['title']}")
            ok_count += 1
        else:
            print(f"  [NG] {c['title']} -> 更新失敗")

    print(f"\n  → {ok_count} 件更新, {skip_count} 件スキップ\n")


def run_cleanup():
    """ホームの空データベースをアーカイブ"""
    print("[削除] 空データベースをチェック中...")
    for db_id in EMPTY_DATABASES:
        clean_id = db_id.replace("-", "")
        if is_db_empty(db_id):
            if archive_database(db_id):
                print(f"  [OK] アーカイブ完了: {db_id}")
            else:
                print(f"  [NG] アーカイブ失敗: {db_id}")
        else:
            print(f"  [--] スキップ（空でない）: {db_id}")
    print()


def main():
    print("=" * 50)
    print("  Notion 自動整理スクリプト")
    print("=" * 50)
    print("\n実行モードを選択してください:")
    print("  1. タグ自動付与")
    print("  2. 空データベースの削除")
    print("  3. 両方実行")
    print("  q. 終了")

    choice = input("\n選択 [1/2/3/q]: ").strip()
    if choice == "1":
        run_tagging()
    elif choice == "2":
        run_cleanup()
    elif choice == "3":
        run_tagging()
        run_cleanup()
    else:
        print("終了します")


if __name__ == "__main__":
    main()
