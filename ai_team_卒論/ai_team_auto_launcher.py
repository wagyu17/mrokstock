"""
ai_team_auto_launcher.py

00_NEXT_ACTION.md と 04_LOOP_LOG.md の HANDOFF_DONE マーカーを見て,
次に担当する AI アプリへ起動文を貼り付ける GUI 自動起動スクリプト.

PowerShell:
    python .\ai_team_auto_launcher.py --dry-run --once
    python .\ai_team_auto_launcher.py --list-windows
    python .\ai_team_auto_launcher.py
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import time
from pathlib import Path
from typing import Any


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_PROJECT_ROOT = Path(r"C:\Users\tomot\Desktop\マイクラ開発")

AI = Path(os.environ.get("AI_TEAM_DIR", SCRIPT_DIR)).resolve()
ROOT = Path(os.environ.get("AI_TEAM_PROJECT_ROOT", DEFAULT_PROJECT_ROOT)).resolve()

NEXT_ACTION = AI / "00_NEXT_ACTION.md"
LOOP_LOG = AI / "04_LOOP_LOG.md"
STATE_FILE = AI / "AUTO_RUNNER_STATE.json"
STOP_FILE = AI / "AUTO_RUNNER_STOP.md"
CONFIG_FILE = AI / "AUTO_RUNNER_CONFIG.json"

DEFAULT_POLL_SECONDS = 3.0
DEFAULT_AFTER_FOCUS_WAIT = 1.0
VALID_AGENTS = {"claude", "codex", "antigravity"}

DEFAULT_WINDOW_CONFIG: dict[str, dict[str, str]] = {
    "claude": {
        "title_re": r".*(Visual Studio Code|Code|Claude).*",
    },
    "codex": {
        "title_re": r".*(Codex).*",
    },
    "antigravity": {
        "title_re": r".*(Antigravity|Autonomous AI Development Setup).*",
    },
}


def read_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def log(message: str) -> None:
    stamp = dt.datetime.now().strftime("%H:%M:%S")
    print(f"[{stamp}] {message}", flush=True)


def load_config() -> dict[str, Any]:
    if not CONFIG_FILE.exists():
        return {}
    try:
        return json.loads(read_text(CONFIG_FILE))
    except json.JSONDecodeError as e:
        log(f"[WARN] config JSON parse failed: {CONFIG_FILE} ({e})")
        return {}


def merged_window_config(config: dict[str, Any]) -> dict[str, dict[str, str]]:
    merged = {agent: values.copy() for agent, values in DEFAULT_WINDOW_CONFIG.items()}
    user_config = config.get("window_config", {})
    if isinstance(user_config, dict):
        for agent, values in user_config.items():
            if isinstance(values, dict):
                merged.setdefault(agent, {}).update(values)
    return merged


def default_state(max_launch_count: int | None = None) -> dict[str, Any]:
    return {
        "last_handoff_id": "",
        "last_handoff_marker": "",
        "last_launched_agent": "",
        "launch_count": 0,
        "max_launch_count": max_launch_count or 3,
        "bootstrap_used": False,
    }


def load_state(max_launch_count: int | None = None) -> dict[str, Any]:
    state = default_state(max_launch_count)
    if STATE_FILE.exists():
        try:
            loaded = json.loads(read_text(STATE_FILE))
            if isinstance(loaded, dict):
                state.update(loaded)
        except json.JSONDecodeError as e:
            log(f"[WARN] state JSON parse failed. using defaults: {e}")
    if max_launch_count is not None:
        state["max_launch_count"] = max_launch_count
    return state


def save_state(state: dict[str, Any]) -> None:
    write_json(STATE_FILE, state)


def should_stop(state: dict[str, Any]) -> bool:
    if STOP_FILE.exists() and "STOP" in read_text(STOP_FILE).upper():
        log(f"[INFO] stop file detected: {STOP_FILE}")
        return True
    if int(state.get("launch_count", 0)) >= int(state.get("max_launch_count", 3)):
        log("[INFO] max_launch_count reached")
        return True
    return False


def parse_next_agent() -> str:
    text = read_text(NEXT_ACTION)
    if not text:
        return ""

    heading = re.search(
        r"(?im)^##\s*next_agent\s*$\s*^([a-zA-Z_]+)\s*$",
        text,
    )
    if heading:
        return heading.group(1).strip().lower()

    assignment = re.search(
        r"(?im)^next_agent\s*[:=]\s*([a-zA-Z_]+)\s*$",
        text,
    )
    if assignment:
        return assignment.group(1).strip().lower()

    return ""


def latest_handoff_marker() -> dict[str, str]:
    text = read_text(LOOP_LOG)
    pattern = re.compile(
        r"<<<HANDOFF_DONE\s+agent=([a-zA-Z_]+)\s+next_agent=([a-zA-Z_]+)\s*>>>"
    )
    matches = list(pattern.finditer(text))
    if not matches:
        return {}

    match = matches[-1]
    agent = match.group(1).strip().lower()
    next_agent = match.group(2).strip().lower()
    raw = match.group(0)
    return {
        "id": f"{len(matches)}:{raw}",
        "raw": raw,
        "agent": agent,
        "next_agent": next_agent,
    }


def build_launch_prompts() -> dict[str, str]:
    ai_dir = str(AI)
    root_dir = str(ROOT)

    common_header = f"""AIチーム共有ディレクトリ: {ai_dir}
対象プロジェクトルート: {root_dir}

まず `{NEXT_ACTION}` を読んでください.
`next_agent` が自分の担当名の場合だけ作業してください.
共通ルールとして `{AI / "01_RULES.md"}`, `{AI / "02_PROJECT_CONTEXT.md"}`,
`{AI / "03_AGENT_STATUS.md"}` を確認してください.
"""

    handoff_footer = f"""
作業後は必ず以下を更新してください.
- `{AI / "outbox"}\\<自分の担当>_latest.md`
- `{AI / "03_AGENT_STATUS.md"}`
- `{AI / "04_LOOP_LOG.md"}`
- `{AI / "00_NEXT_ACTION.md"}`

最後に `{AI / "04_LOOP_LOG.md"}` の末尾へ
`<<<HANDOFF_DONE agent=<自分の担当> next_agent=<次の担当>>>`
形式の HANDOFF_DONE マーカーを追記してください.
このマーカーを書く前に, 必ず `{AI / "00_NEXT_ACTION.md"}` を更新してください.
"""

    return {
        "claude": common_header
        + f"""
あなたは PM, 設計, レビュー, タスク分解担当です.
必要に応じて `{AI / "outbox"}` と `{AI / "inbox"}` を確認し,
次の AI への指示まで更新してください.
"""
        + handoff_footer,
        "codex": common_header
        + f"""
あなたは実装担当です.
`{AI / "inbox" / "to_codex.md"}` を確認し, 指定された範囲だけ実装してください.
通常は作業後に `next_agent` を `antigravity` にしてください.
"""
        + handoff_footer,
        "antigravity": common_header
        + f"""
あなたは Research + QA 担当です.
`{AI / "inbox" / "to_antigravity.md"}` を確認してください.
原則コード編集はせず, 調査, QA, 問題発見, 修正依頼作成を行ってください.
通常は作業後に `next_agent` を `claude` に戻してください.
"""
        + handoff_footer,
    }


def import_gui_modules() -> tuple[Any, Any, Any]:
    try:
        import pyautogui
        import pyperclip
        from pywinauto import Desktop
    except ImportError as e:
        raise SystemExit(
            "GUI 自動化ライブラリが見つかりません. "
            "PowerShell で `python -m pip install pyautogui pywinauto pyperclip` "
            f"を実行してください. ({e})"
        ) from e
    return pyautogui, pyperclip, Desktop


def list_windows() -> None:
    _pyautogui, _pyperclip, Desktop = import_gui_modules()
    for window in Desktop(backend="uia").windows():
        title = window.window_text()
        if title and title.strip():
            print(title)


def focus_window(
    agent: str,
    window_config: dict[str, dict[str, str]],
    after_focus_wait: float,
) -> bool:
    _pyautogui, _pyperclip, Desktop = import_gui_modules()
    title_re = window_config.get(agent, {}).get("title_re", "")
    if not title_re:
        log(f"[WARN] no title_re configured for {agent}")
        return False

    windows = Desktop(backend="uia").windows(title_re=title_re, visible_only=True)
    if not windows:
        log(f"[WARN] window not found for {agent}: {title_re}")
        return False

    win = windows[0]
    try:
        if hasattr(win, "is_minimized") and win.is_minimized():
            win.restore()
        win.set_focus()
    except Exception as e:  # noqa: BLE001 - GUI focus failures vary by app.
        log(f"[WARN] failed to focus {agent}: {e}")
        return False

    time.sleep(after_focus_wait)
    return True


def paste_and_enter(prompt: str, enter_delay: float = 0.2) -> None:
    pyautogui, pyperclip, _Desktop = import_gui_modules()
    pyperclip.copy(prompt)
    time.sleep(enter_delay)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(enter_delay)
    pyautogui.press("enter")


def launch_agent(
    agent: str,
    prompts: dict[str, str],
    window_config: dict[str, dict[str, str]],
    after_focus_wait: float,
    dry_run: bool,
) -> bool:
    if agent not in VALID_AGENTS:
        log(f"[WARN] unknown agent: {agent}")
        return False
    if agent not in prompts:
        log(f"[WARN] no launch prompt for: {agent}")
        return False

    log(f"[INFO] launching {agent}")
    if dry_run:
        preview = prompts[agent].splitlines()[0:8]
        log("[DRY-RUN] prompt preview:")
        print("\n".join(preview))
        return True

    if not focus_window(agent, window_config, after_focus_wait):
        return False

    paste_and_enter(prompts[agent])
    return True


def can_launch(
    next_agent: str,
    marker: dict[str, str],
    state: dict[str, Any],
    bootstrap: bool,
) -> tuple[bool, str]:
    if next_agent not in VALID_AGENTS:
        return False, f"next_agent is not launchable: {next_agent or '(empty)'}"

    if not marker:
        if bootstrap and not state.get("bootstrap_used"):
            return True, "bootstrap launch without HANDOFF_DONE marker"
        return False, "waiting for HANDOFF_DONE marker"

    if marker.get("next_agent") != next_agent:
        return (
            False,
            "latest HANDOFF_DONE next_agent does not match 00_NEXT_ACTION "
            f"({marker.get('next_agent')} != {next_agent})",
        )

    already_launched = (
        marker.get("id") == state.get("last_handoff_id")
        and next_agent == state.get("last_launched_agent")
    )
    if already_launched:
        return False, "already launched for latest handoff"

    return True, "new handoff detected"


def run_once(args: argparse.Namespace, config: dict[str, Any]) -> bool:
    state = load_state(args.max_launch_count)
    if not args.dry_run:
        save_state(state)

    if should_stop(state):
        return False

    next_agent = parse_next_agent()
    marker = latest_handoff_marker()
    ok_to_launch, reason = can_launch(next_agent, marker, state, args.bootstrap)
    log(f"[INFO] next_agent={next_agent or '(empty)'} / {reason}")

    if not ok_to_launch:
        return False

    window_config = merged_window_config(config)
    prompts = build_launch_prompts()
    after_focus_wait = float(config.get("after_focus_wait", DEFAULT_AFTER_FOCUS_WAIT))

    launched = launch_agent(
        next_agent,
        prompts,
        window_config,
        after_focus_wait,
        args.dry_run,
    )
    if not launched:
        log("[WARN] launch failed, retry later")
        return False

    if args.dry_run:
        log("[DRY-RUN] state was not updated")
        return True

    if marker:
        state["last_handoff_id"] = marker["id"]
        state["last_handoff_marker"] = marker["raw"]
    else:
        state["last_handoff_id"] = "bootstrap"
        state["last_handoff_marker"] = "bootstrap"
        state["bootstrap_used"] = True

    state["last_launched_agent"] = next_agent
    state["launch_count"] = int(state.get("launch_count", 0)) + 1
    save_state(state)
    log(f"[INFO] launched {next_agent}, count={state['launch_count']}")
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI team GUI auto launcher")
    parser.add_argument("--dry-run", action="store_true", help="GUI 操作せず判定だけ行う")
    parser.add_argument("--once", action="store_true", help="1 回だけ判定して終了する")
    parser.add_argument("--list-windows", action="store_true", help="現在のウィンドウタイトル一覧を表示")
    parser.add_argument("--bootstrap", action="store_true", help="初回だけ HANDOFF_DONE なしでも起動する")
    parser.add_argument(
        "--max-launch-count",
        type=int,
        default=None,
        help="AUTO_RUNNER_STATE.json の max_launch_count を上書きする",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.list_windows:
        list_windows()
        return 0

    if not args.dry_run:
        pyautogui, _pyperclip, _Desktop = import_gui_modules()
        pyautogui.FAILSAFE = True

    config = load_config()
    poll_seconds = float(config.get("poll_seconds", DEFAULT_POLL_SECONDS))

    log("[INFO] ai_team auto launcher started")
    log(f"[INFO] AI_TEAM_DIR={AI}")
    log(f"[INFO] PROJECT_ROOT={ROOT}")
    log(f"[INFO] STATE_FILE={STATE_FILE}")

    while True:
        run_once(args, config)
        if args.once:
            return 0
        time.sleep(poll_seconds)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        log("[INFO] interrupted")
        raise SystemExit(130)
