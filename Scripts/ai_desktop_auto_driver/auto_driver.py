#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ctypes
import json
import logging
import platform
import time
from ctypes import wintypes
from pathlib import Path
from typing import Any

import pyautogui

try:
    import pyperclip
except ImportError:
    pyperclip = None


SCRIPT_DIR = Path(__file__).resolve().parent
CALIBRATION_FILE = SCRIPT_DIR / "calibration.json"
DEFAULT_PROMPT = "予定通り、プロジェクトのtodoファイルに従って、次の未完了タスクの処理を進めてください。"


def configure_windows_dpi_awareness() -> None:
    if platform.system() != "Windows":
        return
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(2)
    except Exception:
        try:
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:
            pass


def windows_virtual_screen_origin() -> tuple[int, int]:
    if platform.system() != "Windows":
        return (0, 0)
    user32 = ctypes.windll.user32
    return (
        int(user32.GetSystemMetrics(76)),
        int(user32.GetSystemMetrics(77)),
    )


def windows_monitor_rects() -> list[tuple[int, int, int, int]]:
    """Return physical monitor rectangles as (left, top, right, bottom)."""
    if platform.system() != "Windows":
        size = pyautogui.size()
        return [(0, 0, int(size.width), int(size.height))]

    class MonitorInfo(ctypes.Structure):
        _fields_ = [
            ("cbSize", wintypes.DWORD),
            ("rcMonitor", wintypes.RECT),
            ("rcWork", wintypes.RECT),
            ("dwFlags", wintypes.DWORD),
        ]

    user32 = ctypes.windll.user32
    monitor_rects: list[tuple[int, int, int, int]] = []

    callback_type = ctypes.WINFUNCTYPE(
        ctypes.c_int,
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.POINTER(wintypes.RECT),
        ctypes.c_void_p,
    )

    def callback(hmonitor: int, _hdc: int, _rect: Any, _data: Any) -> int:
        info = MonitorInfo()
        info.cbSize = ctypes.sizeof(MonitorInfo)
        if user32.GetMonitorInfoW(hmonitor, ctypes.byref(info)):
            rc = info.rcMonitor
            monitor_rects.append((int(rc.left), int(rc.top), int(rc.right), int(rc.bottom)))
        return 1

    enum_proc = callback_type(callback)
    user32.EnumDisplayMonitors(None, None, enum_proc, None)

    if not monitor_rects:
        origin_x, origin_y = windows_virtual_screen_origin()
        width = int(user32.GetSystemMetrics(78))  # SM_CXVIRTUALSCREEN
        height = int(user32.GetSystemMetrics(79))  # SM_CYVIRTUALSCREEN
        monitor_rects.append((origin_x, origin_y, origin_x + width, origin_y + height))

    return sorted(monitor_rects, key=lambda rect: (rect[1], rect[0]))


def set_window_rect(hwnd: int, left: int, top: int, width: int, height: int) -> None:
    """Move a native window to an exact virtual-screen rectangle."""
    if platform.system() != "Windows":
        return
    hwnd_topmost = -1
    swp_showwindow = 0x0040
    ctypes.windll.user32.SetWindowPos(
        wintypes.HWND(hwnd),
        wintypes.HWND(hwnd_topmost),
        int(left),
        int(top),
        int(width),
        int(height),
        swp_showwindow,
    )


def load_calibration() -> dict[str, Any]:
    if not CALIBRATION_FILE.exists():
        return {}
    with CALIBRATION_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_target_calibration(target_name: str) -> dict[str, Any] | None:
    calibration = load_calibration()
    if target_name in calibration:
        return calibration[target_name]
    lowered = target_name.lower()
    for name, entry in calibration.items():
        if name.lower() == lowered:
            return entry
    return None


def read_prompt(args: argparse.Namespace) -> str:
    if args.prompt_file:
        return Path(args.prompt_file).read_text(encoding="utf-8", errors="replace")
    if args.prompt:
        return args.prompt
    return DEFAULT_PROMPT


def paste_prompt(prompt: str, target_name: str, args: argparse.Namespace) -> int:
    if pyperclip is None:
        logging.error("pyperclip is not installed. Run: pip install pyperclip")
        return 1

    cal = get_target_calibration(target_name)
    if not cal or not cal.get("use_absolute"):
        logging.error("%s: Teach Input Field is required before paste.", target_name)
        return 2

    x = int(cal["absolute_x"])
    y = int(cal["absolute_y"])
    logging.info("%s: clicking taught input field at (%d, %d)", target_name, x, y)

    if args.dry_run:
        logging.info("%s: dry-run enabled; click/paste skipped.", target_name)
        return 0

    pyperclip.copy(prompt)
    pyautogui.click(x=x, y=y, clicks=1, interval=0.05)
    time.sleep(args.post_click_wait)
    pyautogui.hotkey("ctrl", "a")
    time.sleep(0.1)
    pyautogui.hotkey("ctrl", "v")
    logging.info("%s: prompt pasted.", target_name)
    time.sleep(args.post_paste_wait)

    if args.no_submit:
        logging.info("%s: Enter skipped.", target_name)
        return 0

    pyautogui.press("enter")
    logging.info("%s: Enter pressed.", target_name)
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Paste a prompt into a taught AI desktop input field.")
    parser.add_argument("--only", default="Codex", help="Target name saved by Teach Input Field.")
    parser.add_argument("--prompt", default=None)
    parser.add_argument("--prompt-file", default=None)
    parser.add_argument("--no-submit", action="store_true", help="Paste only; do not press Enter.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--post-click-wait", type=float, default=1.0)
    parser.add_argument("--post-paste-wait", type=float, default=2.0)
    parser.add_argument("--verbose", action="store_true")

    # Accepted for compatibility with older buttons/scripts. They are ignored in taught-coordinate mode.
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--screen-capture", default=None)
    parser.add_argument("--no-restore-clipboard", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    configure_windows_dpi_awareness()
    pyautogui.FAILSAFE = True

    if platform.system() == "Windows":
        logging.info("Windows note: run from an unlocked desktop session.")
        logging.info("Virtual screen origin: %s", windows_virtual_screen_origin())

    prompt = read_prompt(args)
    return paste_prompt(prompt, args.only, args)


if __name__ == "__main__":
    raise SystemExit(main())
