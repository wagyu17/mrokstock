"""
My Brain MCP Server
Obsidian Vault のドキュメントを AI に提供する MCP サーバー
"""

import re
from pathlib import Path
import mcp.types as types
from mcp.server import Server
from mcp.server.stdio import stdio_server

VAULT_DIR = Path(__file__).parent
IGNORED_DIRS = {".obsidian", ".trash", ".git"}

server = Server("my-brain")


def get_all_markdown_files() -> list[Path]:
    files = []
    for path in VAULT_DIR.rglob("*.md"):
        if not any(part in IGNORED_DIRS for part in path.parts):
            files.append(path)
    return sorted(files)


def relative_path(path: Path) -> str:
    return path.relative_to(VAULT_DIR).as_posix()


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """YAMLフロントマターを解析して (metadata, body) を返す"""
    if not content.startswith("---"):
        return {}, content
    end = content.find("\n---", 3)
    if end == -1:
        return {}, content
    frontmatter_text = content[3:end].strip()
    body = content[end + 4:].strip()
    metadata = {}
    for line in frontmatter_text.splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            metadata[key.strip()] = value.strip()
    return metadata, body


def extract_obsidian_links(content: str) -> list[str]:
    """Obsidian の [[リンク]] を抽出する"""
    return re.findall(r"\[\[([^\]|]+)(?:\|[^\]]*)?\]\]", content)


@server.list_resources()
async def list_resources() -> list[types.Resource]:
    resources = []
    for path in get_all_markdown_files():
        rel = relative_path(path)
        resources.append(types.Resource(
            uri=f"brain://{rel}",
            name=rel,
            description=f"Obsidian note: {path.stem}",
            mimeType="text/markdown",
        ))
    return resources


@server.read_resource()
async def read_resource(uri: types.AnyUrl) -> str:
    uri_str = str(uri)
    if not uri_str.startswith("brain://"):
        raise ValueError(f"Unknown URI scheme: {uri_str}")
    rel = uri_str[len("brain://"):]
    path = VAULT_DIR / rel
    if not path.exists():
        raise ValueError(f"File not found: {rel}")
    return path.read_text(encoding="utf-8")


@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="list_documents",
            description="My Brain (Obsidian Vault) 内のドキュメント一覧を取得する",
            inputSchema={
                "type": "object",
                "properties": {
                    "folder": {
                        "type": "string",
                        "description": "絞り込むフォルダパス（省略可）",
                    }
                },
            },
        ),
        types.Tool(
            name="read_document",
            description="指定したドキュメントの内容を読み込む",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "ドキュメントの相対パス（例: フォルダ/ノート.md）",
                    }
                },
                "required": ["path"],
            },
        ),
        types.Tool(
            name="search_documents",
            description="My Brain 内のドキュメントをキーワード検索する",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "検索キーワード",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "最大件数（デフォルト: 10）",
                        "default": 10,
                    },
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="get_document_index",
            description="My Brain 全体のインデックスサマリーを取得する（タグ・リンク構造含む）",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "list_documents":
        folder = arguments.get("folder", "")
        files = get_all_markdown_files()
        if folder:
            files = [f for f in files if relative_path(f).startswith(folder)]
        lines = [f"# ドキュメント一覧 ({len(files)} 件)\n"]
        for f in files:
            lines.append(f"- {relative_path(f)}")
        return [types.TextContent(type="text", text="\n".join(lines))]

    elif name == "read_document":
        path_str = arguments["path"]
        path = VAULT_DIR / path_str
        if not path.exists():
            # 拡張子なしで検索
            candidates = list(VAULT_DIR.rglob(f"{path_str}.md"))
            if not candidates:
                return [types.TextContent(type="text", text=f"ファイルが見つかりません: {path_str}")]
            path = candidates[0]
        content = path.read_text(encoding="utf-8")
        metadata, body = parse_frontmatter(content)
        links = extract_obsidian_links(content)
        result = f"# {path.stem}\n\n"
        if metadata:
            result += "**メタデータ:**\n"
            for k, v in metadata.items():
                result += f"- {k}: {v}\n"
            result += "\n"
        if links:
            result += f"**リンク先:** {', '.join(links)}\n\n"
        result += body
        return [types.TextContent(type="text", text=result)]

    elif name == "search_documents":
        query = arguments["query"].lower()
        max_results = int(arguments.get("max_results", 10))
        results = []
        for path in get_all_markdown_files():
            content = path.read_text(encoding="utf-8")
            if query in content.lower() or query in path.stem.lower():
                _, body = parse_frontmatter(content)
                # マッチ行を抽出
                matched_lines = [
                    line.strip()
                    for line in content.splitlines()
                    if query in line.lower()
                ][:3]
                snippet = "\n  ".join(matched_lines) if matched_lines else body[:200]
                results.append((relative_path(path), snippet))
            if len(results) >= max_results:
                break

        if not results:
            return [types.TextContent(type="text", text=f"「{query}」に一致するドキュメントは見つかりませんでした。")]

        lines = [f"# 検索結果: 「{query}」({len(results)} 件)\n"]
        for rel, snippet in results:
            lines.append(f"## {rel}\n  {snippet}\n")
        return [types.TextContent(type="text", text="\n".join(lines))]

    elif name == "get_document_index":
        files = get_all_markdown_files()
        all_tags: dict[str, int] = {}
        all_links: dict[str, list[str]] = {}

        for path in files:
            content = path.read_text(encoding="utf-8")
            metadata, _ = parse_frontmatter(content)
            # タグ集計
            tags_raw = metadata.get("tags", "")
            for tag in re.split(r"[,\s]+", tags_raw):
                tag = tag.strip().lstrip("#")
                if tag:
                    all_tags[tag] = all_tags.get(tag, 0) + 1
            # リンク集計
            links = extract_obsidian_links(content)
            if links:
                all_links[relative_path(path)] = links

        lines = [f"# My Brain インデックス\n", f"**総ドキュメント数:** {len(files)}\n"]

        # フォルダ構造
        folders: dict[str, int] = {}
        for f in files:
            rel = relative_path(f)
            folder = str(Path(rel).parent)
            folders[folder] = folders.get(folder, 0) + 1
        lines.append("## フォルダ構造")
        for folder, count in sorted(folders.items()):
            lines.append(f"- {folder}: {count} ファイル")

        # タグ
        if all_tags:
            lines.append("\n## タグ一覧")
            for tag, count in sorted(all_tags.items(), key=lambda x: -x[1])[:20]:
                lines.append(f"- #{tag}: {count} 件")

        # リンクマップ
        if all_links:
            lines.append("\n## リンク構造（上位10件）")
            for src, dsts in list(all_links.items())[:10]:
                lines.append(f"- {src} → {', '.join(dsts)}")

        return [types.TextContent(type="text", text="\n".join(lines))]

    return [types.TextContent(type="text", text=f"Unknown tool: {name}")]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
