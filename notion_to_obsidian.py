#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion → Obsidian 移行スクリプト
- ALL データベースの全ページを再帰的に取得
- Obsidian Markdown (.md) に変換して保存
- フォルダ構造はNotionの階層をそのまま反映
"""

import os
import re
import sys
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

# ─── 設定 ────────────────────────────────────
TOKEN   = os.environ["NOTION_TOKEN"]
ALL_DB  = "c9cf12dbb52d494ba2bc56e413ae1dc6"
VAULT   = Path(__file__).parent / "Notion"   # 出力先: My_Brain/Notion/

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type":  "application/json",
    "Notion-Version": "2022-06-28",
}

stats = {"pages": 0, "errors": 0}


# ─── API ユーティリティ ───────────────────────
def _req(method: str, url: str, **kwargs) -> dict:
    time.sleep(0.34)          # Notion API: ~3 req/sec
    res = getattr(requests, method)(url, headers=HEADERS, **kwargs)
    if not res.ok:
        raise RuntimeError(f"API error {res.status_code}: {res.text[:200]}")
    return res.json()

def api_get(url: str) -> dict:
    return _req("get", url)

def api_post(url: str, body: dict) -> dict:
    return _req("post", url, json=body)

def fetch_block_children(block_id: str) -> list:
    blocks, cursor = [], None
    while True:
        url = f"https://api.notion.com/v1/blocks/{block_id}/children?page_size=100"
        if cursor:
            url += f"&start_cursor={cursor}"
        data = api_get(url)
        blocks.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return blocks

def query_database(db_id: str) -> list:
    pages, cursor = [], None
    while True:
        body: dict = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        data = api_post(f"https://api.notion.com/v1/databases/{db_id}/query", body)
        pages.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return pages


# ─── テキスト変換 ─────────────────────────────
def sanitize(name: str) -> str:
    """ファイル名に使えない文字を除去"""
    name = re.sub(r'[\\/:*?"<>|]', '_', name)
    name = name.strip(". ")
    return name[:80] or "untitled"

def rich_text_to_md(rts: list) -> str:
    out = ""
    for rt in rts:
        t = rt.get("plain_text", "")
        a = rt.get("annotations", {})
        href = rt.get("href") or ""

        if a.get("code"):         t = f"`{t}`"
        if a.get("bold"):         t = f"**{t}**"
        if a.get("italic"):       t = f"*{t}*"
        if a.get("strikethrough"):t = f"~~{t}~~"

        if href.startswith("http"):
            t = f"[{t}]({href})"
        elif href:
            # Notion 内部リンク → [[wikilink]]
            t = f"[[{t}]]"
        out += t
    return out

def blocks_to_md(blocks: list, depth: int = 0) -> str:
    lines = []
    pad = "  " * depth

    for block in blocks:
        btype = block.get("type", "")
        data  = block.get(btype, {})

        # 子ブロック（toggle・column 等）
        child_md = ""
        if block.get("has_children") and btype not in (
            "child_page", "child_database", "table", "column_list"
        ):
            children = fetch_block_children(block["id"])
            child_md = blocks_to_md(children, depth + 1)

        if btype == "paragraph":
            text = rich_text_to_md(data.get("rich_text", []))
            lines.append(f"{pad}{text}" if text else "")

        elif btype == "heading_1":
            lines.append(f"\n# {rich_text_to_md(data.get('rich_text', []))}")
        elif btype == "heading_2":
            lines.append(f"\n## {rich_text_to_md(data.get('rich_text', []))}")
        elif btype == "heading_3":
            lines.append(f"\n### {rich_text_to_md(data.get('rich_text', []))}")

        elif btype == "bulleted_list_item":
            text = rich_text_to_md(data.get("rich_text", []))
            lines.append(f"{pad}- {text}")
            if child_md:
                lines.append(child_md); child_md = ""

        elif btype == "numbered_list_item":
            text = rich_text_to_md(data.get("rich_text", []))
            lines.append(f"{pad}1. {text}")
            if child_md:
                lines.append(child_md); child_md = ""

        elif btype == "to_do":
            text = rich_text_to_md(data.get("rich_text", []))
            chk = "[x]" if data.get("checked") else "[ ]"
            lines.append(f"{pad}- {chk} {text}")

        elif btype == "toggle":
            text = rich_text_to_md(data.get("rich_text", []))
            lines.append(f"{pad}- **{text}**")
            if child_md:
                lines.append(child_md); child_md = ""

        elif btype == "quote":
            text = rich_text_to_md(data.get("rich_text", []))
            lines.append(f"> {text}")

        elif btype == "callout":
            text  = rich_text_to_md(data.get("rich_text", []))
            icon  = data.get("icon", {})
            emoji = icon.get("emoji", "") if icon.get("type") == "emoji" else ">"
            lines.append(f"> {emoji} {text}")

        elif btype == "code":
            text = rich_text_to_md(data.get("rich_text", []))
            lang = data.get("language", "")
            lines.append(f"```{lang}\n{text}\n```")

        elif btype == "divider":
            lines.append("---")

        elif btype == "image":
            url = (data.get("file", {}).get("url") or
                   data.get("external", {}).get("url", ""))
            cap = rich_text_to_md(data.get("caption", []))
            lines.append(f"![]({url})")
            if cap:
                lines.append(f"*{cap}*")

        elif btype == "table":
            rows_data = fetch_block_children(block["id"])
            rows = []
            for r in rows_data:
                if r.get("type") == "table_row":
                    cells = r["table_row"].get("cells", [])
                    rows.append([rich_text_to_md(c) for c in cells])
            if rows:
                lines.append("| " + " | ".join(rows[0]) + " |")
                lines.append("|" + "|".join(["---"] * len(rows[0])) + "|")
                for row in rows[1:]:
                    lines.append("| " + " | ".join(row) + " |")

        elif btype == "column_list":
            cols = fetch_block_children(block["id"])
            for col in cols:
                if col.get("has_children"):
                    col_blocks = fetch_block_children(col["id"])
                    lines.append(blocks_to_md(col_blocks, depth))

        elif btype in ("bookmark", "embed", "link_preview"):
            url = data.get("url", "")
            cap = rich_text_to_md(data.get("caption", []))
            lines.append(f"[{cap or url}]({url})")

        elif btype == "equation":
            lines.append(f"$${data.get('expression', '')}$$")

        elif btype == "child_page":
            title = data.get("title", "")
            lines.append(f"[[{title}]]")

        elif btype == "child_database":
            title = data.get("title", "")
            lines.append(f"> [!note] DB: {title}")

        # unsupported / その他はスキップ

        if child_md:
            lines.append(child_md)

    return "\n".join(lines)


# ─── ページ / DB 移行 ────────────────────────
def get_title(page: dict) -> str:
    for prop in page.get("properties", {}).values():
        if prop.get("type") == "title":
            texts = prop.get("title", [])
            return texts[0]["plain_text"] if texts else ""
    return ""

def get_tags(page: dict) -> list:
    tp = page.get("properties", {}).get("タグ", {})
    if tp.get("type") == "multi_select":
        return [o["name"] for o in tp.get("multi_select", [])]
    return []

def frontmatter(tags: list, page_id: str, created: str) -> str:
    lines = ["---"]
    if tags:
        lines.append(f"tags: [{', '.join(tags)}]")
    lines.append(f"notion_id: {page_id}")
    lines.append(f"created: {created}")
    lines.append("---\n")
    return "\n".join(lines)

def save_page(page: dict, folder: Path, prefix: str = "") -> None:
    """1ページをMDとして保存し、子ページ/DBも再帰処理"""
    page_id = page["id"]
    title   = get_title(page) or "untitled"
    tags    = get_tags(page)
    created = page.get("created_time", "")[:10]
    safe    = sanitize(title)
    md_path = folder / f"{safe}.md"

    print(f"{prefix}{title}")
    stats["pages"] += 1

    try:
        blocks     = fetch_block_children(page_id)
        content_md = blocks_to_md(blocks)

        folder.mkdir(parents=True, exist_ok=True)
        md_path.write_text(
            frontmatter(tags, page_id, created) + content_md,
            encoding="utf-8"
        )

        # 子ページ・子DBを同名フォルダ内に展開
        sub = folder / safe
        for block in blocks:
            btype = block.get("type", "")
            bid   = block["id"]

            if btype == "child_page":
                child_page = api_get(f"https://api.notion.com/v1/pages/{bid}")
                save_page(child_page, sub, prefix + "  ")

            elif btype == "child_database":
                migrate_database(bid, sub, prefix + "  ")

    except Exception as e:
        stats["errors"] += 1
        print(f"{prefix}  [ERROR] {title}: {e}")


def migrate_database(db_id: str, folder: Path, prefix: str = "") -> None:
    """DBの全エントリをMDとして保存"""
    try:
        db_meta   = api_get(f"https://api.notion.com/v1/databases/{db_id}")
        db_title_raw = db_meta.get("title", [])
        db_title  = db_title_raw[0]["plain_text"] if db_title_raw else "database"
        safe_db   = sanitize(db_title)
        db_folder = folder / safe_db

        print(f"{prefix}[DB] {db_title}")

        pages = query_database(db_id)
        for page in pages:
            save_page(page, db_folder, prefix + "  ")

    except Exception as e:
        stats["errors"] += 1
        print(f"{prefix}[ERROR] DB {db_id}: {e}")


# ─── メイン ──────────────────────────────────
def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--yes", "-y", action="store_true", help="確認をスキップ")
    args = parser.parse_args()

    print("=" * 50)
    print("  Notion → Obsidian 移行スクリプト")
    print("=" * 50)
    print(f"\n出力先: {VAULT}\n")
    print("注意: ページ数が多い場合は数分かかります\n")

    if not args.yes:
        ans = input("移行を開始しますか？ [y/n]: ").strip().lower()
        if ans != "y":
            print("キャンセル")
            return

    VAULT.mkdir(parents=True, exist_ok=True)
    print("\n移行開始...\n")
    migrate_database(ALL_DB, VAULT)

    print(f"\n{'=' * 50}")
    print(f"  完了! {stats['pages']} ページ保存, {stats['errors']} エラー")
    print(f"  保存先: {VAULT}")
    print("=" * 50)


if __name__ == "__main__":
    main()
