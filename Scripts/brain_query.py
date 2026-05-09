#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
brain_query.py - Obsidian × Claude → Notion 壁打ちシステム

使い方:
  python brain_query.py "就活の軸をどう整理すればよいか？"
  python brain_query.py  (質問を対話的に入力)

処理フロー:
  1. キーワードでObsidianのmdファイルを検索
  2. 関連ファイルのコンテキストをClaudeに渡す
  3. Claude (Opus 4.6) が分析・回答を生成
  4. 結果をNotionの「AI壁打ち」ページとして保存（スマホで閲覧可能）
"""

import os
import re
import sys
import json
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
import anthropic
import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

# ─── 設定 ────────────────────────────────────────────────────────────────
VAULT      = Path(__file__).parent          # My_Brain フォルダ
NOTION_TOKEN = os.environ.get("NOTION_TOKEN", "")
ALL_DB     = "c9cf12dbb52d494ba2bc56e413ae1dc6"
MAX_CONTEXT_FILES = 8    # コンテキストに含める最大ファイル数
MAX_FILE_CHARS    = 3000 # 1ファイルあたりの最大文字数
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type":  "application/json",
    "Notion-Version": "2022-06-28",
}

claude_client = anthropic.Anthropic()


# ─── 1. Obsidian 検索 ────────────────────────────────────────────────────

def extract_keywords(question: str) -> list[str]:
    """質問から検索キーワードを抽出（日本語・英語対応）"""
    # ストップワードを除く簡易抽出
    stop = {"の", "は", "が", "を", "に", "で", "と", "や", "も", "か",
            "する", "ある", "いる", "こと", "どう", "なぜ", "どれ", "これ",
            "それ", "あれ", "どの", "この", "その", "あの", "て", "た", "な",
            "i", "a", "the", "is", "are", "was", "be", "to", "of", "and",
            "in", "that", "have", "for", "it", "with", "he", "she", "we",
            "you", "do", "but", "not", "what", "how", "why", "when"}
    tokens = re.findall(r'[ぁ-ん]{2,}|[ァ-ン]{2,}|[一-龯々]{1,}|[a-zA-Z]{3,}', question)
    return [t for t in tokens if t.lower() not in stop]


def score_file(path: Path, keywords: list[str]) -> int:
    """ファイルのキーワードマッチ数をスコアとして返す"""
    try:
        text = path.read_text(encoding="utf-8", errors="ignore").lower()
    except Exception:
        return 0
    return sum(text.count(kw.lower()) for kw in keywords)


def search_vault(keywords: list[str]) -> list[tuple[Path, int]]:
    """Obsidian vault からキーワードに関連するmdファイルを検索"""
    exclude_dirs = {".obsidian", ".git", "Attachments"}
    results = []
    for md in VAULT.rglob("*.md"):
        if any(part in exclude_dirs for part in md.parts):
            continue
        score = score_file(md, keywords)
        if score > 0:
            results.append((md, score))
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:MAX_CONTEXT_FILES]


def build_context(files: list[tuple[Path, int]]) -> str:
    """検索結果のファイル内容をコンテキスト文字列にまとめる"""
    if not files:
        return "（関連ノートが見つかりませんでした）"
    parts = []
    for path, score in files:
        content = path.read_text(encoding="utf-8", errors="ignore")
        # YAML frontmatter を除去
        content = re.sub(r'^---[\s\S]*?---\n', '', content).strip()
        if len(content) > MAX_FILE_CHARS:
            content = content[:MAX_FILE_CHARS] + "\n…（省略）"
        rel = path.relative_to(VAULT)
        parts.append(f"### {rel}\n{content}")
    return "\n\n---\n\n".join(parts)


# ─── 2. Claude API 呼び出し ──────────────────────────────────────────────

SYSTEM_PROMPT = """あなたは優秀な思考パートナー（壁打ち相手）です。
ユーザーのObsidianノートを知識ベースとして参照しながら、
質問に対して具体的・実践的な分析と提案を行ってください。

回答スタイル:
- 箇条書きや見出しを使って読みやすく構造化する
- ユーザーのノートにある具体的な情報を積極的に引用・参照する
- 抽象論ではなく、ユーザーの状況に即した具体的なアドバイスを提供する
- 最後に「次のアクション」として3つ以内の具体的なステップを示す"""


def query_claude(question: str, context: str) -> str:
    """Claude Opus 4.6 に質問+コンテキストを送り、ストリーミングで回答を取得"""
    user_message = f"""## 参照ノート（Obsidianより）

{context}

---

## 質問

{question}"""

    print("\n[Claude が考えています...]\n")
    full_response = []

    with claude_client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=4096,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    ) as stream:
        for event in stream:
            if event.type == "content_block_delta":
                if event.delta.type == "text_delta":
                    text = event.delta.text
                    print(text, end="", flush=True)
                    full_response.append(text)

    print("\n")
    return "".join(full_response)


# ─── 3. Notion へ書き戻し ────────────────────────────────────────────────

def md_to_notion_blocks(text: str) -> list[dict]:
    """Markdown テキストを Notion ブロックのリストに変換"""
    blocks = []
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]

        # 見出し
        if line.startswith("### "):
            blocks.append(_heading(3, line[4:]))
        elif line.startswith("## "):
            blocks.append(_heading(2, line[3:]))
        elif line.startswith("# "):
            blocks.append(_heading(1, line[2:]))

        # 箇条書き
        elif re.match(r'^[-*•] ', line):
            blocks.append(_bullet(line[2:]))

        # 番号付きリスト
        elif re.match(r'^\d+\. ', line):
            text_part = re.sub(r'^\d+\. ', '', line)
            blocks.append(_numbered(text_part))

        # チェックボックス
        elif line.startswith("- [ ] ") or line.startswith("- [x] "):
            checked = line.startswith("- [x]")
            blocks.append(_todo(line[6:], checked))

        # 区切り線
        elif line.strip() in ("---", "***", "___"):
            blocks.append({"object": "block", "type": "divider", "divider": {}})

        # 空行
        elif line.strip() == "":
            pass  # 空ブロックは省略

        # 通常段落
        else:
            blocks.append(_paragraph(line))

        i += 1

    return blocks


def _rich_text(text: str) -> list[dict]:
    """太字・イタリックを含む rich_text オブジェクトを生成"""
    # 簡易実装: **bold** と *italic* を処理
    parts = []
    pattern = re.compile(r'\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)')
    for m in pattern.finditer(text):
        if m.group(1):   # **bold**
            parts.append({"type": "text", "text": {"content": m.group(1)},
                          "annotations": {"bold": True}})
        elif m.group(2): # *italic*
            parts.append({"type": "text", "text": {"content": m.group(2)},
                          "annotations": {"italic": True}})
        elif m.group(3): # plain
            parts.append({"type": "text", "text": {"content": m.group(3)}})
    return parts or [{"type": "text", "text": {"content": text}}]


def _paragraph(text: str) -> dict:
    return {"object": "block", "type": "paragraph",
            "paragraph": {"rich_text": _rich_text(text)}}

def _heading(level: int, text: str) -> dict:
    key = f"heading_{level}"
    return {"object": "block", "type": key, key: {"rich_text": _rich_text(text)}}

def _bullet(text: str) -> dict:
    return {"object": "block", "type": "bulleted_list_item",
            "bulleted_list_item": {"rich_text": _rich_text(text)}}

def _numbered(text: str) -> dict:
    return {"object": "block", "type": "numbered_list_item",
            "numbered_list_item": {"rich_text": _rich_text(text)}}

def _todo(text: str, checked: bool = False) -> dict:
    return {"object": "block", "type": "to_do",
            "to_do": {"rich_text": _rich_text(text), "checked": checked}}


def save_to_notion(question: str, answer: str, context_files: list) -> str | None:
    """Notion の ALL データベースに壁打ち結果ページを作成"""
    if not NOTION_TOKEN:
        print("[Notion] NOTION_TOKEN が設定されていないためスキップ")
        return None

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    title = f"[AI壁打ち] {question[:50]}"

    # ページのコンテンツブロックを構築
    header_blocks = [
        {"object": "block", "type": "callout", "callout": {
            "rich_text": [{"type": "text", "text": {
                "content": f"質問: {question}"
            }}],
            "icon": {"emoji": "🤖"},
            "color": "blue_background"
        }},
        {"object": "block", "type": "heading_2", "heading_2": {
            "rich_text": [{"type": "text", "text": {"content": "参照したノート"}}]
        }},
    ]

    # 参照ファイルリスト
    ref_blocks = []
    for path, score in context_files:
        rel = str(path.relative_to(VAULT)).replace("\\", "/")
        ref_blocks.append(_bullet(f"{rel} (スコア: {score})"))

    answer_header = [
        {"object": "block", "type": "divider", "divider": {}},
        {"object": "block", "type": "heading_2", "heading_2": {
            "rich_text": [{"type": "text", "text": {"content": "Claude の回答"}}]
        }},
    ]

    answer_blocks = md_to_notion_blocks(answer)

    # Notion API: ページ作成
    payload = {
        "parent": {"database_id": ALL_DB},
        "properties": {
            "名前": {
                "title": [{"text": {"content": title}}]
            },
            "タグ": {
                "multi_select": [{"name": "AI壁打ち"}]
            },
            "日付": {
                "date": {"start": today}
            }
        },
        "children": header_blocks + ref_blocks + answer_header + answer_blocks[:95]
        # Notion API: 1リクエストで最大100ブロックまで
    }

    time.sleep(0.35)
    resp = requests.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json=payload,
        timeout=30
    )

    if resp.status_code == 200:
        page_id = resp.json().get("id", "")
        page_url = resp.json().get("url", "")
        print(f"[Notion] ページ作成完了: {page_url}")
        return page_url
    else:
        print(f"[Notion] エラー {resp.status_code}: {resp.text[:300]}")
        return None


# ─── メイン ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Obsidian × Claude → Notion 壁打ちシステム")
    parser.add_argument("question", nargs="?", help="質問（省略時は対話入力）")
    parser.add_argument("--no-notion", action="store_true", help="Notionへの書き戻しをスキップ")
    parser.add_argument("--files", type=int, default=MAX_CONTEXT_FILES,
                        help=f"参照するファイル数 (デフォルト: {MAX_CONTEXT_FILES})")
    args = parser.parse_args()

    # 質問の取得
    question = args.question
    if not question:
        print("=" * 60)
        print("  Obsidian × Claude 壁打ちシステム")
        print("  結果は自動的にNotionに保存されます")
        print("=" * 60)
        question = input("\n質問を入力してください: ").strip()
        if not question:
            print("質問が空です。終了します。")
            sys.exit(1)

    print(f"\n質問: {question}")

    # 1. キーワード抽出 & Obsidian 検索
    keywords = extract_keywords(question)
    print(f"\n[検索キーワード] {keywords}")
    matched = search_vault(keywords)
    if matched:
        print(f"[参照ファイル] {len(matched)}件見つかりました:")
        for path, score in matched:
            print(f"  - {path.relative_to(VAULT)} (スコア:{score})")
    else:
        print("[参照ファイル] 関連ノートが見つかりませんでした。一般知識で回答します。")

    # 2. コンテキスト構築 & Claude API 呼び出し
    context = build_context(matched)
    answer = query_claude(question, context)

    # 3. Notion へ書き戻し
    if not args.no_notion:
        print("[Notion] 結果を保存中...")
        save_to_notion(question, answer, matched)
    else:
        print("[Notion] スキップ（--no-notion オプション）")


if __name__ == "__main__":
    main()
