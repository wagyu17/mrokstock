from __future__ import annotations

import datetime as dt
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
MANAGEMENT_DIR = SCRIPT_DIR.parents[1]
PROJECTS_FILE = SCRIPT_DIR / "projects.json"

DEFAULT_PROJECTS: dict[str, dict[str, Any]] = {
    "minecraft": {"label": "マイクラ案件", "path": MANAGEMENT_DIR / "ai_team"},
    "thesis": {"label": "卒論案件", "path": MANAGEMENT_DIR / "ai_team_卒論"},
}

AGENT_TARGETS = {
    "codex": "Codex",
    "claude": "Claude Code",
    "antigravity": "Antigravity",
}

AGENT_LABELS = {
    "codex": "Codex",
    "claude": "Claude Code",
    "antigravity": "Antigravity",
}

AGENT_PROMPTS = {
    "codex": "codex_worker.md",
    "claude": "claude_pm.md",
    "antigravity": "antigravity_research_qa.md",
}

AGENT_INBOX = {
    "codex": "to_codex.md",
    "claude": "to_claude.md",
    "antigravity": "to_antigravity.md",
}

AGENT_OUTBOX = {
    "codex": "codex_latest.md",
    "claude": "claude_latest.md",
    "antigravity": "antigravity_latest.md",
}

CYCLE_ORDER = ["claude", "codex", "antigravity"]


def _coerce_project_path(path_value: Any) -> Path:
    path = Path(str(path_value))
    if not path.is_absolute():
        path = MANAGEMENT_DIR / path
    return path


def _load_projects_config() -> dict[str, Any]:
    projects = {
        key: {"label": str(value["label"]), "path": Path(value["path"])}
        for key, value in DEFAULT_PROJECTS.items()
    }
    active_key = "minecraft"
    if not PROJECTS_FILE.exists():
        return {"active_project": active_key, "projects": projects}

    try:
        raw = json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"active_project": active_key, "projects": projects}

    raw_projects = raw.get("projects", {})
    if isinstance(raw_projects, dict):
        for key, value in raw_projects.items():
            if not isinstance(value, dict):
                continue
            label = str(value.get("label") or key)
            path = _coerce_project_path(value.get("path") or f"ai_team_{label}")
            projects[str(key)] = {"label": label, "path": path}

    raw_active = str(raw.get("active_project") or active_key)
    if raw_active in projects:
        active_key = raw_active
    return {"active_project": active_key, "projects": projects}


_PROJECT_CONFIG = _load_projects_config()
PROJECTS: dict[str, dict[str, Any]] = _PROJECT_CONFIG["projects"]
ACTIVE_PROJECT_KEY = str(_PROJECT_CONFIG["active_project"])
AI_TEAM_DIR = PROJECTS[ACTIVE_PROJECT_KEY]["path"]
TODO_FILE = AI_TEAM_DIR / "task_queue.md"
PROMPTS_DIR = AI_TEAM_DIR / "prompts"
STATE_FILE = AI_TEAM_DIR / "desktop_orchestrator_state.json"
CURRENT_PROMPT = SCRIPT_DIR / "runtime" / "current_prompt.md"
CALIBRATION_FILE = SCRIPT_DIR / "calibration.json"

TODO_RE = re.compile(r"^(?P<indent>\s*)[-*]\s+\[(?P<mark>[ xX~!])\]\s+(?P<body>.+?)\s*$")


def save_projects_config() -> None:
    payload = {
        "active_project": ACTIVE_PROJECT_KEY,
        "projects": {
            key: {"label": str(value["label"]), "path": str(value["path"])}
            for key, value in PROJECTS.items()
        },
    }
    PROJECTS_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _safe_folder_name(label: str) -> str:
    safe = re.sub(r'[<>:"/\\|?*\x00-\x1f]+', "_", label).strip(" ._")
    return safe or f"project_{dt.datetime.now().strftime('%Y%m%d_%H%M%S')}"


def _safe_project_key(label: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_") or "project"
    key = base
    index = 2
    while key in PROJECTS:
        key = f"{base}_{index}"
        index += 1
    return key


def ensure_project_structure(project_key: str | None = None) -> None:
    key = project_key or ACTIVE_PROJECT_KEY
    root = Path(PROJECTS[key]["path"])
    (root / "prompts").mkdir(parents=True, exist_ok=True)
    (root / "inbox").mkdir(parents=True, exist_ok=True)
    (root / "outbox").mkdir(parents=True, exist_ok=True)

    todo_file = root / "task_queue.md"
    if not todo_file.exists():
        todo_file.write_text(
            f"# Prompt Queue - {PROJECTS[key]['label']}\n\n"
            "使い方: `- [ ] AIに貼り付けたいプロンプト` の形で、必要な分だけ追加します。\n\n"
            "## Queue\n\n",
            encoding="utf-8",
        )

    state_file = root / "desktop_orchestrator_state.json"
    if not state_file.exists():
        state_file.write_text(json.dumps({"tasks": {}}, ensure_ascii=False, indent=2), encoding="utf-8")

    common_prompt = root / "prompts" / "common_orchestration.md"
    if not common_prompt.exists():
        common_prompt.write_text(
            "このタブで選択されたプロンプトだけを処理してください。"
            "プロンプトキューに無い大きなタスク一覧を勝手に大量追加しないでください。\n",
            encoding="utf-8",
        )

    for agent_key, prompt_name in AGENT_PROMPTS.items():
        prompt_path = root / "prompts" / prompt_name
        if not prompt_path.exists():
            label = AGENT_LABELS.get(agent_key, agent_key)
            prompt_path.write_text(f"あなたは {label} として、このタブの指示を処理します。\n", encoding="utf-8")

    for filename in list(AGENT_INBOX.values()) + list(AGENT_OUTBOX.values()):
        target = root / ("inbox" if filename.startswith("to_") else "outbox") / filename
        if not target.exists():
            target.write_text("", encoding="utf-8")


def create_project(label: str, root: Path | None = None) -> str:
    label = label.strip()
    if not label:
        raise ValueError("tab name is empty")
    key = _safe_project_key(label)
    base_root = root or (MANAGEMENT_DIR / f"ai_team_{_safe_folder_name(label)}")
    project_root = base_root
    suffix = 2
    while project_root.exists() and str(project_root) not in [str(value["path"]) for value in PROJECTS.values()]:
        project_root = base_root.with_name(f"{base_root.name}_{suffix}")
        suffix += 1
    PROJECTS[key] = {"label": label, "path": project_root}
    ensure_project_structure(key)
    save_projects_config()
    return key


def set_project(project_key: str) -> None:
    """Switch every project-scoped path used by the orchestrator."""
    global ACTIVE_PROJECT_KEY, AI_TEAM_DIR, TODO_FILE, PROMPTS_DIR, STATE_FILE
    if project_key not in PROJECTS:
        raise ValueError(f"unknown project: {project_key}")
    ensure_project_structure(project_key)
    ACTIVE_PROJECT_KEY = project_key
    AI_TEAM_DIR = PROJECTS[project_key]["path"]
    TODO_FILE = AI_TEAM_DIR / "task_queue.md"
    PROMPTS_DIR = AI_TEAM_DIR / "prompts"
    STATE_FILE = AI_TEAM_DIR / "desktop_orchestrator_state.json"
    save_projects_config()


def current_project_key() -> str:
    return ACTIVE_PROJECT_KEY


def current_project_label() -> str:
    return str(PROJECTS[ACTIVE_PROJECT_KEY]["label"])


def current_project_root() -> Path:
    return AI_TEAM_DIR


@dataclass(frozen=True)
class TodoItem:
    id: str
    line: int
    status: str
    text: str
    section: str


def now() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def read_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def load_json(path: Path, default: dict[str, Any] | None = None) -> dict[str, Any]:
    if not path.exists():
        return dict(default or {})
    try:
        return json.loads(read_text(path))
    except json.JSONDecodeError:
        return dict(default or {})


def save_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def marker_status(marker: str) -> str:
    if marker in ("x", "X"):
        return "done"
    if marker == "~":
        return "doing"
    if marker == "!":
        return "blocked"
    return "todo"


def parse_todos(todo_file: Path | None = None) -> list[TodoItem]:
    todo_file = todo_file or TODO_FILE
    items: list[TodoItem] = []
    section = ""
    lines = read_text(todo_file).splitlines()
    index = 0
    while index < len(lines):
        line_number = index + 1
        line = lines[index]
        if line.startswith("#"):
            section = line.strip("# ").strip()
            index += 1
            continue

        match = TODO_RE.match(line)
        if not match:
            index += 1
            continue

        end = _find_block_end(lines, index)
        text_lines = [re.sub(r"\s+", " ", match.group("body")).strip()]
        for continuation in lines[index + 1 : end]:
            if continuation.startswith("    "):
                text_lines.append(continuation[4:].rstrip())
            else:
                text_lines.append(continuation.lstrip().rstrip())
        text = "\n".join(text_lines).strip()
        item_id = f"{todo_file.name}:L{line_number}"
        items.append(
            TodoItem(
                id=item_id,
                line=line_number,
                status=marker_status(match.group("mark")),
                text=text,
                section=section,
            )
        )
        index = end
    return items


def _read_todo_lines(path: Path | None = None) -> list[str]:
    path = path or TODO_FILE
    if not path.exists():
        return []
    return path.read_text(encoding="utf-8").splitlines()


def _write_todo_lines(lines: list[str], path: Path | None = None) -> None:
    path = path or TODO_FILE
    path.parent.mkdir(parents=True, exist_ok=True)
    text = "\n".join(lines)
    if not text.endswith("\n"):
        text += "\n"
    path.write_text(text, encoding="utf-8")


def _line_from_item_id(item_id: str) -> int | None:
    match = re.search(r":L(\d+)$", item_id)
    return int(match.group(1)) if match else None


def _find_block_end(lines: list[str], start_index: int) -> int:
    """
    Return exclusive end index of the todo block that starts at start_index (0-based).
    A block = the todo line plus any following lines that start with whitespace and
    are not headings, tables, or another todo.
    """
    end = start_index + 1
    while end < len(lines):
        line = lines[end]
        if not line.strip() and not line.startswith((" ", "\t")):
            break
        if line.startswith("#") or TODO_RE.match(line) or line.startswith("|"):
            break
        if not line[0].isspace():
            break
        end += 1
    return end


def _todo_block_lines(text: str, marker: str = " ", indent: str = "") -> list[str]:
    raw_lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    while raw_lines and not raw_lines[0].strip():
        raw_lines.pop(0)
    while raw_lines and not raw_lines[-1].strip():
        raw_lines.pop()
    if not raw_lines:
        raise ValueError("todo text is empty")

    first_line = re.sub(r"\s+", " ", raw_lines[0]).strip()
    block = [f"{indent}- [{marker}] {first_line}"]
    for line in raw_lines[1:]:
        if line.strip():
            block.append(f"{indent}    {line.rstrip()}")
        else:
            block.append(f"{indent}    ")
    return block


def add_todo(text: str, after_item_id: str | None = None, path: Path | None = None) -> str:
    """Append a new `- [ ] text` line. If after_item_id is given, insert after that block."""
    text = text.strip()
    if not text:
        raise ValueError("todo text is empty")
    path = path or TODO_FILE
    lines = _read_todo_lines(path)
    new_block = _todo_block_lines(text)

    if after_item_id:
        line_num = _line_from_item_id(after_item_id)
        if line_num is not None and 1 <= line_num <= len(lines):
            end = _find_block_end(lines, line_num - 1)
            insert_index = end
            lines[insert_index:insert_index] = new_block
            _write_todo_lines(lines, path)
            return f"{path.name}:L{insert_index + 1}"

    while lines and not lines[-1].strip():
        lines.pop()
    insert_index = len(lines)
    lines.extend(new_block)
    _write_todo_lines(lines, path)
    return f"{path.name}:L{insert_index + 1}"


def edit_todo(item_id: str, new_text: str, path: Path | None = None) -> None:
    """Replace the body text of the todo while keeping the same marker and indent."""
    new_text = new_text.strip()
    if not new_text:
        raise ValueError("todo text is empty")
    lines = _read_todo_lines(path)
    line_num = _line_from_item_id(item_id)
    if line_num is None or not (1 <= line_num <= len(lines)):
        raise ValueError(f"invalid item id: {item_id}")
    match = TODO_RE.match(lines[line_num - 1])
    if not match:
        raise ValueError(f"line {line_num} is not a todo")
    start = line_num - 1
    end = _find_block_end(lines, start)
    lines[start:end] = _todo_block_lines(new_text, marker=match.group("mark"), indent=match.group("indent"))
    _write_todo_lines(lines, path)


def delete_todo(item_id: str, path: Path | None = None) -> None:
    """Remove the todo line and any continuation lines that follow it."""
    lines = _read_todo_lines(path)
    line_num = _line_from_item_id(item_id)
    if line_num is None or not (1 <= line_num <= len(lines)):
        raise ValueError(f"invalid item id: {item_id}")
    start = line_num - 1
    end = _find_block_end(lines, start)
    del lines[start:end]
    _write_todo_lines(lines, path)


def move_todo(item_id: str, direction: str, path: Path | None = None) -> bool:
    """
    Swap the todo block with the previous (direction='up') or next (direction='down')
    todo block. Blank lines between blocks stay in place. Returns True if a swap occurred.
    Refuses to cross a heading boundary.
    """
    if direction not in ("up", "down"):
        raise ValueError("direction must be 'up' or 'down'")
    lines = _read_todo_lines(path)
    line_num = _line_from_item_id(item_id)
    if line_num is None or not (1 <= line_num <= len(lines)):
        raise ValueError(f"invalid item id: {item_id}")

    cur_start = line_num - 1
    cur_end = _find_block_end(lines, cur_start)
    cur_block = lines[cur_start:cur_end]

    if direction == "up":
        i = cur_start - 1
        other_idx = -1
        while i >= 0:
            stripped = lines[i].strip()
            if stripped == "":
                i -= 1
                continue
            if lines[i].startswith("#"):
                break
            if TODO_RE.match(lines[i]):
                other_idx = i
                break
            i -= 1
        if other_idx < 0:
            return False
        other_start = other_idx
        other_end = _find_block_end(lines, other_start)
        between = lines[other_end:cur_start]
        new_lines = (
            lines[:other_start]
            + cur_block
            + between
            + lines[other_start:other_end]
            + lines[cur_end:]
        )
        _write_todo_lines(new_lines, path)
        return True

    # direction == "down"
    i = cur_end
    other_idx = -1
    while i < len(lines):
        stripped = lines[i].strip()
        if stripped == "":
            i += 1
            continue
        if lines[i].startswith("#"):
            break
        if TODO_RE.match(lines[i]):
            other_idx = i
            break
        i += 1
    if other_idx < 0:
        return False
    other_start = other_idx
    other_end = _find_block_end(lines, other_start)
    between = lines[cur_end:other_start]
    new_lines = (
        lines[:cur_start]
        + lines[other_start:other_end]
        + between
        + cur_block
        + lines[other_end:]
    )
    _write_todo_lines(new_lines, path)
    return True


def load_state() -> dict[str, Any]:
    return load_json(STATE_FILE, {"tasks": {}})


def save_state(state: dict[str, Any]) -> None:
    save_json(STATE_FILE, state)


def effective_status(item: TodoItem, state: dict[str, Any]) -> str:
    saved = state.get("tasks", {}).get(item.id, {})
    if saved.get("status"):
        return str(saved["status"])
    return item.status


def set_task_status(task_id: str, status: str) -> None:
    state = load_state()
    state.setdefault("tasks", {})[task_id] = {
        "status": status,
        "updated_at": now(),
    }
    save_state(state)


def record_dispatch(task_id: str | None, agent: str, prompt_kind: str) -> None:
    state = load_state()
    state["last_dispatch"] = {
        "task_id": task_id,
        "agent": agent,
        "prompt_kind": prompt_kind,
        "timestamp": now(),
    }
    save_state(state)


def next_cycle_agent(current_agent: str | None = None) -> str:
    if current_agent not in CYCLE_ORDER:
        state = load_state()
        last_agent = state.get("last_dispatch", {}).get("agent")
        if last_agent in CYCLE_ORDER:
            current_agent = last_agent
        else:
            return CYCLE_ORDER[0]
    index = CYCLE_ORDER.index(current_agent)
    return CYCLE_ORDER[(index + 1) % len(CYCLE_ORDER)]


def next_todo(items: list[TodoItem], state: dict[str, Any] | None = None) -> TodoItem | None:
    state = state or load_state()
    for item in items:
        if effective_status(item, state) in {"todo", "doing"}:
            return item
    return None


def infer_agent(text: str) -> str:
    lowered = text.lower()
    if "claude" in lowered:
        return "claude"
    if "antigravity" in lowered:
        return "antigravity"
    return "codex"


def build_agent_prompt(item: TodoItem, agent: str) -> str:
    return build_agent_prompt_for_items([item], agent)


def build_agent_prompt_for_items(items: list[TodoItem], agent: str) -> str:
    if not items:
        raise ValueError("at least one todo item is required")

    template_path = PROMPTS_DIR / AGENT_PROMPTS[agent]
    common_path = PROMPTS_DIR / "common_orchestration.md"
    common = read_text(common_path).strip()
    template = read_text(template_path).strip()
    task_blocks = []
    for index, item in enumerate(items, start=1):
        task_blocks.append(
            "\n".join(
                [
                    f"{index}. 対象todo: {item.text}",
                    f"   todo位置: {item.id}",
                    f"   セクション: {item.section or '(なし)'}",
                ]
            )
        )
    parts = [
        "以下はAI Desktop Orchestratorからの作業指示です。",
        f"AI_TEAM_ROOT: {AI_TEAM_DIR}",
        f"自分のrole prompt: {template_path}",
        f"inbox: {AI_TEAM_DIR / 'inbox' / AGENT_INBOX[agent]}",
        f"outbox: {AI_TEAM_DIR / 'outbox' / AGENT_OUTBOX[agent]}",
    ]
    if common:
        parts.append(f"\n# Common Orchestration Rules\n{common}")
    if template:
        parts.append(f"\n# Role Prompt\n{template}")
    parts.append(
        "\n# Current Tasks\n"
        + "\n\n".join(task_blocks)
        + "\n\n選択されたtodoだけを、上から順に処理してください。todoに無い大きなタスク一覧を勝手に大量追加せず、必要になった次の小さな一手だけを提案してください。"
    )
    return "\n\n".join(parts)


def build_access_prompt(agent: str) -> str:
    template_path = PROMPTS_DIR / AGENT_PROMPTS[agent]
    common_path = PROMPTS_DIR / "common_orchestration.md"
    common = read_text(common_path).strip()
    template = read_text(template_path).strip()
    inbox = AI_TEAM_DIR / "inbox" / AGENT_INBOX[agent]
    outbox = AI_TEAM_DIR / "outbox" / AGENT_OUTBOX[agent]
    return "\n\n".join(
        [
            "これからAIチームの一員として作業してください。",
            f"AI_TEAM_ROOT: {AI_TEAM_DIR}",
            f"promptsフォルダ: {PROMPTS_DIR}",
            f"共通ルール: {common_path}",
            f"あなたのrole prompt: {template_path}",
            f"あなたのinbox: {inbox}",
            f"あなたのoutbox: {outbox}",
            "まず上記のファイルを読み、現在の目的・状態・自分の役割を把握してください。",
            "作業結果や判断は必ず自分のoutboxへ報告してください。",
            "他AIへの依頼が必要な場合は、該当するinboxへ短く具体的に書いてください。",
            "この初期確認では、コード変更はまだ始めず、読んだ内容の要約と次に実行する予定だけを返してください。",
            f"\n# Common Orchestration Rules\n{common}" if common else "",
            f"\n# Role Prompt\n{template}" if template else "",
        ]
    ).strip()


def load_calibration() -> dict[str, Any]:
    return load_json(CALIBRATION_FILE, {})


def save_teach_result(target_name: str, crop_image: Any, click_x: int, click_y: int) -> dict[str, Any]:
    safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", target_name).strip("_").lower()
    template_path = SCRIPT_DIR / "assets" / f"{safe_name}_taught.png"
    template_path.parent.mkdir(parents=True, exist_ok=True)
    crop_image.save(template_path)

    calibration = load_calibration()
    entry = {
        "use_absolute": True,
        "absolute_x": int(click_x),
        "absolute_y": int(click_y),
        "taught_template": str(template_path),
        "timestamp": now(),
    }
    calibration[target_name] = entry
    save_json(CALIBRATION_FILE, calibration)
    return {"template_path": str(template_path), **entry}
