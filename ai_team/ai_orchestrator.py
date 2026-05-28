"""
ai_orchestrator.py

Claude Code -> Antigravity (research) -> Claude Code -> Codex -> Antigravity (QA) -> Claude review
というサイクルを ai_team/ 内の共有ファイル経由で回す監督スクリプト.

設計思想:
- AI同士を直接チャットさせない. すべての中間状態はファイルに記録.
- Codex だけがコードを編集する.
- Antigravity はリサーチ + QA 専用. コードは編集しない.
- Claude Code は設計とレビューに専念.
- Gemini Chat はループに含めない (人間が必要に応じて使う外部相談役).

CLI呼び出しの前提:
- claude (Anthropic Claude Code) : `claude -p <prompt>` で headless 実行
- codex  (OpenAI Codex CLI)      : `codex exec --cd <dir> <prompt>` で非対話実行
- antigravity                     : 公式 headless CLI が確立していないため,
                                   既定では "manual handoff" モードで停止し,
                                   ユーザーが Antigravity IDE で実行して outbox に
                                   結果を書く運用とする. CLI が確立できる場合は
                                   AI_TEAM_ANTIGRAVITY_CMD を設定する.

環境変数 (すべて任意):
    AI_TEAM_ROOT             : Codex が編集対象とするプロジェクトルート (既定: ai_team の親)
    AI_TEAM_MAX_CYCLES       : 最大サイクル数 (既定: 3)
    AI_TEAM_SLEEP            : サイクル間スリープ秒 (既定: 5)
    AI_TEAM_TIMEOUT          : CLI呼び出しのタイムアウト秒 (既定: 1800)
    AI_TEAM_MAX_DIFF_LINES   : 1サイクル差分上限行数 (既定: 500)
    AI_TEAM_CLAUDE_CMD       : Claude CLIコマンド名 (既定: claude)
    AI_TEAM_CODEX_CMD        : Codex CLIコマンド名  (既定: codex)
    AI_TEAM_ANTIGRAVITY_CMD  : Antigravity CLIコマンド名 (既定: 未設定 → manual handoff)
    AI_TEAM_ANTIGRAVITY_MODE : "manual" / "cli" / "skip" (既定: manual)

使い方 (PowerShell):
    python .\ai_team\ai_orchestrator.py
"""

from __future__ import annotations

import datetime
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path


# --- パス設定 -----------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent           # ai_team/
ROOT = Path(os.environ.get("AI_TEAM_ROOT", SCRIPT_DIR.parent)).resolve()
AI = SCRIPT_DIR

PROMPTS = AI / "prompts"
INBOX = AI / "inbox"
OUTBOX = AI / "outbox"
LOGS = AI / "logs"


# --- 実行設定 -----------------------------------------------------------
MAX_CYCLES = int(os.environ.get("AI_TEAM_MAX_CYCLES", "3"))
SLEEP_SECONDS = int(os.environ.get("AI_TEAM_SLEEP", "5"))
COMMAND_TIMEOUT = int(os.environ.get("AI_TEAM_TIMEOUT", "1800"))
MAX_DIFF_LINES = int(os.environ.get("AI_TEAM_MAX_DIFF_LINES", "500"))
MAX_FAILED_ATTEMPTS = 3

CLAUDE_CMD = os.environ.get("AI_TEAM_CLAUDE_CMD", "claude")
CODEX_CMD = os.environ.get("AI_TEAM_CODEX_CMD", "codex")
ANTIGRAVITY_CMD = os.environ.get("AI_TEAM_ANTIGRAVITY_CMD", "")
ANTIGRAVITY_MODE = os.environ.get(
    "AI_TEAM_ANTIGRAVITY_MODE",
    "cli" if ANTIGRAVITY_CMD else "manual",
).lower()

# Codex 指示や差分に含まれていたら即停止する語
SECRET_KEYWORDS = (
    ".env",
    "secret",
    "api_key",
    "apikey",
    "private_key",
    "password=",
    "aws_secret",
    "bearer ",
    "ssh-rsa ",
    "begin rsa private",
)


# --- 基本ユーティリティ -------------------------------------------------
def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def append(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(text + "\n")


def now() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def resolve_cmd(cmd: str) -> str:
    """PATH 上の実体を返す. Windows の .cmd / .bat も拾う."""
    found = shutil.which(cmd)
    if found is None:
        raise FileNotFoundError(
            f"CLI '{cmd}' が PATH に見つからない. "
            f"環境変数 AI_TEAM_*_CMD で上書きするか, インストールを確認."
        )
    return found


def run_command(name: str, argv: list[str], timeout: int = COMMAND_TIMEOUT) -> str:
    print(f"\n===== RUNNING {name} =====", flush=True)
    try:
        result = subprocess.run(
            argv,
            cwd=str(ROOT),
            text=True,
            capture_output=True,
            timeout=timeout,
        )
        stdout = result.stdout or ""
        stderr = result.stderr or ""
        rc = result.returncode
    except FileNotFoundError as e:
        stdout, stderr, rc = "", f"FileNotFoundError: {e}", 127

    return (
        f"# {name}\n\n"
        f"Run at: {now()}\n\n"
        f"## CMD\n\n`{' '.join(argv[:3])} ...`\n\n"
        f"## STDOUT\n\n{stdout}\n\n"
        f"## STDERR\n\n{stderr}\n\n"
        f"## RETURN CODE\n\n{rc}\n"
    )


# --- 安全装置 -----------------------------------------------------------
def should_stop() -> tuple[bool, str]:
    """stop.md の先頭非空行が "NO STOP" 以外で "STOP" を含めば停止."""
    text = read(AI / "stop.md")
    lines = [l.strip() for l in text.splitlines()
             if l.strip() and not l.strip().startswith("<!--")]
    if not lines:
        return False, ""
    first = lines[0].upper()
    if first.startswith("NO STOP") or first.startswith("NOSTOP"):
        return False, ""
    if "STOP" in first:
        return True, text
    return False, ""


def touched_secrets(text: str) -> bool:
    low = text.lower()
    return any(k in low for k in SECRET_KEYWORDS)


def diff_too_large() -> tuple[bool, int]:
    try:
        out = subprocess.run(
            ["git", "diff", "--numstat"],
            cwd=str(ROOT), text=True, capture_output=True, timeout=60,
        )
    except Exception:
        return False, 0
    total = 0
    for line in (out.stdout or "").splitlines():
        parts = line.split()
        if len(parts) >= 2:
            try:
                total += int(parts[0]) + int(parts[1])
            except ValueError:
                continue
    return total > MAX_DIFF_LINES, total


def git_snapshot(label: str) -> str:
    status = run_command(
        f"git status after {label}",
        ["git", "status", "--short"], timeout=60,
    )
    diff = run_command(
        f"git diff --stat after {label}",
        ["git", "diff", "--stat"], timeout=60,
    )
    return status + "\n" + diff


# --- セクション抽出 -----------------------------------------------------
def extract_section(text: str, marker: str) -> str:
    if marker not in text:
        return ""
    after = text.split(marker, 1)[1]
    return after.split("\n## ", 1)[0].strip()


# --- プロンプト組み立て -------------------------------------------------
def build_claude_prompt() -> str:
    return f"""{read(PROMPTS / "claude_pm.md")}

# Shared Context

## mission.md
{read(AI / "mission.md")}

## state.md
{read(AI / "state.md")}

## task_queue.md
{read(AI / "task_queue.md")}

## memory.md
{read(AI / "memory.md")}

## latest Antigravity output
{read(OUTBOX / "antigravity_latest.md")}

## latest Codex output
{read(OUTBOX / "codex_latest.md")}

Now act as Claude PM. 出力形式に従って書くこと.
必要なら ai_team/inbox/to_antigravity.md と ai_team/inbox/to_codex.md に書く本文を
レポート内に提示すること (orchestrator が拾って書き込む).
"""


def build_antigravity_prompt(request_body: str, mode_label: str) -> str:
    return f"""{read(PROMPTS / "antigravity_research_qa.md")}

# Mode
{mode_label}

# Request from Claude PM

{request_body if request_body else read(INBOX / "to_antigravity.md")}

# Current State

{read(AI / "state.md")}

# Latest Codex Output (for QA mode)

{read(OUTBOX / "codex_latest.md")}
"""


def build_codex_prompt() -> str:
    return f"""{read(PROMPTS / "codex_worker.md")}

# Task From Claude

{read(INBOX / "to_codex.md")}

# Antigravity Research / QA

{read(OUTBOX / "antigravity_latest.md")}

Now implement the requested task safely. 出力形式に従って報告すること.
"""


# --- CLI 呼び出しラッパ -------------------------------------------------
def call_claude(prompt: str) -> str:
    return run_command("Claude PM", [resolve_cmd(CLAUDE_CMD), "-p", prompt])


def call_codex(prompt: str) -> str:
    return run_command(
        "Codex Worker",
        [resolve_cmd(CODEX_CMD), "exec", "--cd", str(ROOT), prompt],
    )


def call_antigravity(prompt: str, mode_label: str) -> str | None:
    """
    Antigravity 呼び出し. mode によって挙動を切替.
    - "cli"   : AI_TEAM_ANTIGRAVITY_CMD があれば実行
    - "manual": stop.md に手動引き継ぎ指示を書いて None を返す (orchestrator は halt)
    - "skip"  : 何もせず空文字を返す (QAなしで先へ進む — 非推奨)

    None を返した場合, 呼び出し元はループを終了して人間の介入を待つ.
    """
    write(INBOX / "to_antigravity.md", prompt)

    if ANTIGRAVITY_MODE == "skip":
        return "(Antigravity skipped by AI_TEAM_ANTIGRAVITY_MODE=skip)\n"

    if ANTIGRAVITY_MODE == "cli":
        if not ANTIGRAVITY_CMD:
            print("WARN: ANTIGRAVITY_MODE=cli だが AI_TEAM_ANTIGRAVITY_CMD 未設定. "
                  "manual handoff にフォールバック.", file=sys.stderr)
        else:
            try:
                cmd = resolve_cmd(ANTIGRAVITY_CMD)
                # NOTE: Antigravity の headless 実行オプションは公式に確立されていない.
                #       ここは環境に合わせて argv を必ず修正すること.
                #       下記は "-p <prompt>" を想定した暫定形.
                return run_command(f"Antigravity ({mode_label})", [cmd, "-p", prompt])
            except FileNotFoundError as e:
                print(f"WARN: {e} / manual handoff にフォールバック.", file=sys.stderr)

    # --- manual handoff ----------------------------------------------------
    msg = (
        f"STOP: Antigravity ({mode_label}) の手動実行が必要.\n"
        f"\n"
        f"手順:\n"
        f"  1) Antigravity IDE / アプリを開く.\n"
        f"  2) ai_team/inbox/to_antigravity.md の内容を依頼として実行する.\n"
        f"  3) 結果を prompts/antigravity_research_qa.md の出力形式で\n"
        f"     ai_team/outbox/antigravity_latest.md に保存する.\n"
        f"  4) ai_team/stop.md の先頭行を 'NO STOP' に戻す.\n"
        f"  5) python .\\ai_team\\ai_orchestrator.py を再実行する.\n"
        f"\n"
        f"自動化したい場合は環境変数 AI_TEAM_ANTIGRAVITY_CMD を設定し,\n"
        f"call_antigravity() の argv を環境に合うよう修正すること.\n"
    )
    write(AI / "stop.md", msg)
    print(msg)
    return None


# --- Claude PM レポートから派生ファイルを更新 ---------------------------
def apply_claude_dispatches(claude_out: str) -> tuple[bool, str, bool, str]:
    """
    Claude の出力から Antigravity 依頼と Codex タスクを抽出して inbox に書く.
    返り値: (need_antigravity, antigravity_body, has_codex_task, codex_body)
    """
    need_section = extract_section(claude_out, "## Need Antigravity")
    need_antigravity = False
    antigravity_body = ""
    if need_section:
        head = need_section.splitlines()[0].upper() if need_section else ""
        if "YES" in head:
            need_antigravity = True
            # YES の後の本文を依頼として扱う
            rest = "\n".join(need_section.splitlines()[1:]).strip()
            antigravity_body = rest or need_section
            write(INBOX / "to_antigravity.md", antigravity_body)

    codex_section = extract_section(claude_out, "## Task for Codex")
    has_codex_task = False
    codex_body = ""
    if codex_section and codex_section.lower().strip() not in ("none", "なし", "n/a"):
        has_codex_task = True
        codex_body = codex_section
        write(INBOX / "to_codex.md", codex_body)

    return need_antigravity, antigravity_body, has_codex_task, codex_body


def claude_said_stop(claude_out: str) -> bool:
    sec = extract_section(claude_out, "## Continue or Stop").upper()
    return "STOP" in sec and "CONTINUE" not in sec


# --- メインループ -------------------------------------------------------
def main() -> int:
    for d in (LOGS, OUTBOX, INBOX):
        d.mkdir(parents=True, exist_ok=True)

    print("AI Team Orchestrator (Claude / Codex / Antigravity)")
    print(f"  ROOT             = {ROOT}")
    print(f"  AI_TEAM          = {AI}")
    print(f"  MAX_CYCLES       = {MAX_CYCLES}")
    print(f"  ANTIGRAVITY_MODE = {ANTIGRAVITY_MODE}")
    print()

    failed_attempts = 0

    for cycle in range(1, MAX_CYCLES + 1):
        stop, reason = should_stop()
        if stop:
            print(f"STOP detected in stop.md: {reason[:200]}")
            return 0

        cycle_log = LOGS / f"cycle_{cycle:03d}.md"
        append(cycle_log, f"# Cycle {cycle}\nStarted: {now()}\n")

        # --- 1. Claude PM: 次の行動を決める ------------------------------
        prompt = build_claude_prompt()
        write(AI / "tmp_claude_prompt.md", prompt)
        claude_out = call_claude(prompt)
        write(OUTBOX / "claude_latest.md", claude_out)
        append(cycle_log, claude_out)

        if claude_said_stop(claude_out):
            write(AI / "stop.md", "STOP requested by Claude PM.\n")
            print("Claude PM requested STOP.")
            return 0

        need_ag, ag_body, has_codex, _codex_body = apply_claude_dispatches(claude_out)

        # --- 2. Antigravity: リサーチ ------------------------------------
        if need_ag:
            ag_prompt = build_antigravity_prompt(ag_body, "RESEARCH")
            ag_out = call_antigravity(ag_prompt, "RESEARCH")
            if ag_out is None:
                # manual handoff: ループを抜けて人間の介入を待つ
                return 0
            write(OUTBOX / "antigravity_latest.md", ag_out)
            append(cycle_log, ag_out)

            # Claude が調査結果を踏まえて再判断
            prompt = build_claude_prompt()
            claude_out = call_claude(prompt)
            write(OUTBOX / "claude_latest.md", claude_out)
            append(cycle_log, claude_out)

            _, _, has_codex, _ = apply_claude_dispatches(claude_out)

            if claude_said_stop(claude_out):
                write(AI / "stop.md", "STOP requested by Claude PM after research.\n")
                return 0

        # --- 3. Codex: 実装 ----------------------------------------------
        codex_task_text = read(INBOX / "to_codex.md").strip()
        if has_codex and codex_task_text:
            if touched_secrets(codex_task_text):
                msg = "STOP: Codex 指示に機密情報キーワードを検出"
                write(AI / "stop.md", msg + "\n")
                append(cycle_log, msg)
                print(msg)
                return 1

            cprompt = build_codex_prompt()
            write(AI / "tmp_codex_prompt.md", cprompt)
            codex_out = call_codex(cprompt)
            write(OUTBOX / "codex_latest.md", codex_out)
            append(cycle_log, codex_out)

            # 差分チェック
            big, n = diff_too_large()
            snap = git_snapshot("codex")
            append(cycle_log, snap)
            if big:
                msg = f"STOP: 差分が大きすぎる ({n} 行 > {MAX_DIFF_LINES})"
                write(AI / "stop.md", msg + "\n")
                append(cycle_log, msg)
                print(msg)
                return 1
            if touched_secrets(snap):
                msg = "STOP: diff に機密情報キーワードを検出"
                write(AI / "stop.md", msg + "\n")
                append(cycle_log, msg)
                print(msg)
                return 1

            # 失敗連続検出
            low = codex_out.lower()
            if "error" in low or "failed" in low or "traceback" in low:
                failed_attempts += 1
                append(cycle_log, f"failed_attempts = {failed_attempts}")
                if failed_attempts >= MAX_FAILED_ATTEMPTS:
                    msg = f"STOP: 失敗が {MAX_FAILED_ATTEMPTS} 回連続"
                    write(AI / "stop.md", msg + "\n")
                    print(msg)
                    return 1
            else:
                failed_attempts = 0

            # --- 4. Antigravity: QA --------------------------------------
            qa_request = (
                f"直前の Codex 実装に対する QA を行う.\n"
                f"対象: outbox/codex_latest.md に記載された変更.\n"
                f"観点: UI 表示 / ブラウザ動作 / コンソールエラー / 期待挙動との差分.\n"
            )
            ag_prompt = build_antigravity_prompt(qa_request, "QA")
            ag_out = call_antigravity(ag_prompt, "QA")
            if ag_out is None:
                return 0  # manual handoff
            write(OUTBOX / "antigravity_latest.md", ag_out)
            append(cycle_log, ag_out)

            # --- 5. Claude: レビュー --------------------------------------
            prompt = build_claude_prompt()
            review = call_claude(prompt)
            write(OUTBOX / "claude_latest.md", review)
            append(cycle_log, review)
            apply_claude_dispatches(review)

            if claude_said_stop(review):
                write(AI / "stop.md", "STOP requested by Claude review.\n")
                return 0

        time.sleep(SLEEP_SECONDS)

    write(AI / "stop.md", f"STOP: reached MAX_CYCLES={MAX_CYCLES}\n")
    print(f"Reached MAX_CYCLES={MAX_CYCLES}. Exiting.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except subprocess.TimeoutExpired as e:
        write(AI / "stop.md", f"STOP: command timed out: {e}\n")
        print(f"Timeout: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        write(AI / "stop.md", "STOP: KeyboardInterrupt\n")
        print("Interrupted.")
        sys.exit(130)
    except Exception as e:
        write(AI / "stop.md", f"STOP: orchestrator error: {e}\n")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
