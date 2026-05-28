from __future__ import annotations

import datetime as dt
import queue
import subprocess
import sys
import threading

import auto_driver

auto_driver.configure_windows_dpi_awareness()

import tkinter as tk
from tkinter import messagebox, simpledialog, ttk

from PIL import Image, ImageGrab

import orchestrator_core as core


class OrchestratorApp(tk.Tk):
    """Current-phase UI: teach one input field, then paste/send todos in order."""

    def __init__(self) -> None:
        super().__init__()
        self.title("AI Desktop Orchestrator")
        self.geometry("1040x680")
        self.minsize(900, 580)

        self.items: list[core.TodoItem] = []
        self.task_by_tree_id: dict[str, core.TodoItem] = {}
        self.worker_messages: queue.Queue[str] = queue.Queue()
        self.teach_status_vars: dict[str, tk.StringVar] = {}
        self.project_tab_keys: list[str] = []
        self.rebuilding_project_tabs = False
        self.project_status_var = tk.StringVar()
        self.project_title_var = tk.StringVar()
        self.task_summary_var = tk.StringVar()
        self.selected_count_var = tk.StringVar(value="0 selected")
        self.agent_var = tk.StringVar(value="codex")
        self.auto_interval_var = tk.StringVar(value="3")
        self.auto_max_cycles_var = tk.StringVar(value="")
        self.auto_cycle_var = tk.BooleanVar(value=True)
        self.auto_status_var = tk.StringVar(value="Auto stopped")
        self.auto_after_id: str | None = None
        self.auto_max_cycles: int | None = None
        self.auto_completed_cycles = 0
        self.auto_enabled = False
        self.auto_busy = False
        self.active_task_id: str | None = None
        self.active_task_ids: set[str] = set()
        self.active_agent_key: str | None = None
        self.current_task_var = tk.StringVar(value="現在のtodo: 未送信")

        self._style()
        self._layout()
        self.refresh_project_status()
        self.refresh_teach_status()
        self.reload_tasks()
        self.refresh_current_task()
        self.after(200, self._drain_messages)
        self.protocol("WM_DELETE_WINDOW", self.on_close)

    def _style(self) -> None:
        style = ttk.Style(self)
        if "clam" in style.theme_names():
            style.theme_use("clam")
        self.configure(bg="#f7f7f5")
        style.configure(".", font=("Segoe UI", 10), background="#f7f7f5", foreground="#242424")
        style.configure("App.TFrame", background="#f7f7f5")
        style.configure("Sidebar.TFrame", background="#f1f1ef")
        style.configure("Panel.TFrame", background="#ffffff")
        style.configure("Title.TLabel", font=("Segoe UI", 18, "bold"), background="#f7f7f5", foreground="#202020")
        style.configure("SidebarTitle.TLabel", font=("Segoe UI", 18, "bold"), background="#f1f1ef", foreground="#202020")
        style.configure("PageTitle.TLabel", font=("Segoe UI", 20, "bold"), background="#f7f7f5", foreground="#202020")
        style.configure("Section.TLabel", font=("Segoe UI", 11, "bold"), background="#ffffff", foreground="#202020")
        style.configure("Hint.TLabel", background="#f7f7f5", foreground="#6b6b6b")
        style.configure("PanelHint.TLabel", background="#ffffff", foreground="#6b6b6b")
        style.configure("Sidebar.TLabel", background="#f1f1ef", foreground="#6b6b6b")
        style.configure("TButton", padding=(10, 7), borderwidth=1, relief="flat", background="#f3f3f1")
        style.map("TButton", background=[("active", "#e9e9e6")])
        style.configure("TCheckbutton", background="#ffffff", foreground="#242424")
        style.configure("Primary.TButton", font=("Segoe UI", 10, "bold"), padding=(14, 8), background="#202020", foreground="#ffffff")
        style.map("Primary.TButton", background=[("active", "#3a3a3a")], foreground=[("active", "#ffffff")])
        style.configure("Quiet.TButton", padding=(10, 7), background="#f3f3f1", foreground="#242424")
        style.map("Quiet.TButton", background=[("active", "#e9e9e6")])
        style.configure(
            "Treeview",
            rowheight=34,
            font=("Segoe UI", 10),
            background="#ffffff",
            fieldbackground="#ffffff",
            borderwidth=0,
            relief="flat",
        )
        style.configure(
            "Treeview.Heading",
            font=("Segoe UI", 9, "bold"),
            background="#f5f5f3",
            foreground="#666666",
            relief="flat",
        )
        style.map("Treeview", background=[("selected", "#dbeafe")], foreground=[("selected", "#111827")])

    def _layout(self) -> None:
        root = ttk.Frame(self, padding=0, style="App.TFrame")
        root.pack(fill=tk.BOTH, expand=True)

        shell = ttk.Frame(root, style="App.TFrame")
        shell.pack(fill=tk.BOTH, expand=True)

        sidebar = ttk.Frame(shell, width=236, padding=(16, 16, 12, 16), style="Sidebar.TFrame")
        sidebar.pack(side=tk.LEFT, fill=tk.Y)
        sidebar.pack_propagate(False)

        content = ttk.Frame(shell, padding=(22, 18, 22, 18), style="App.TFrame")
        content.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        ttk.Label(sidebar, text="Orchestrator", style="SidebarTitle.TLabel").pack(anchor=tk.W)
        ttk.Label(sidebar, text="Prompt queues", style="Sidebar.TLabel").pack(anchor=tk.W, pady=(2, 18))
        self._project_tabs(sidebar)

        header = ttk.Frame(content, style="App.TFrame")
        header.pack(fill=tk.X, pady=(0, 16))
        ttk.Label(header, textvariable=self.project_title_var, style="PageTitle.TLabel").pack(side=tk.LEFT)
        ttk.Label(header, textvariable=self.task_summary_var, style="Hint.TLabel").pack(side=tk.RIGHT, pady=(8, 0))
        ttk.Label(content, textvariable=self.project_status_var, style="Hint.TLabel").pack(anchor=tk.W, pady=(0, 14))

        body = ttk.PanedWindow(content, orient=tk.HORIZONTAL)
        body.pack(fill=tk.BOTH, expand=True)

        left = ttk.Frame(body, padding=(0, 0, 14, 0), style="App.TFrame")
        right = ttk.Frame(body, padding=(14, 0, 0, 0), style="App.TFrame")
        body.add(left, weight=5)
        body.add(right, weight=2)

        self._task_panel(left)
        self._control_panel(right)
        self._teach_status_panel(right)
        self._auto_panel(right)
        self._current_panel(right)
        self._log_panel(right)

    def _project_tabs(self, parent: ttk.Frame) -> None:
        row = ttk.Frame(parent, style="Sidebar.TFrame")
        row.pack(fill=tk.X, pady=(0, 10))
        ttk.Label(row, text="Pages", style="Sidebar.TLabel").pack(side=tk.LEFT)
        ttk.Button(row, text="+", width=3, command=self.add_project_tab, style="Quiet.TButton").pack(side=tk.RIGHT)

        list_frame = ttk.Frame(parent, style="Sidebar.TFrame")
        list_frame.pack(fill=tk.BOTH, expand=True)

        self.project_list = tk.Listbox(
            list_frame,
            activestyle="none",
            bg="#f1f1ef",
            bd=0,
            exportselection=False,
            font=("Segoe UI", 10),
            highlightthickness=0,
            relief=tk.FLAT,
            selectbackground="#e6e4df",
            selectforeground="#202020",
        )
        self.project_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        project_scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.project_list.yview)
        project_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.project_list.configure(yscrollcommand=project_scrollbar.set)
        self.project_list.bind("<<ListboxSelect>>", self.on_project_tab_changed)
        self.refresh_project_tabs(core.current_project_key())

    def refresh_project_tabs(self, select_key: str | None = None) -> None:
        self.rebuilding_project_tabs = True
        self.project_list.delete(0, tk.END)
        self.project_tab_keys = list(core.PROJECTS.keys())
        for project_key in self.project_tab_keys:
            info = core.PROJECTS[project_key]
            self.project_list.insert(tk.END, f"  {info['label']}")
        if select_key in self.project_tab_keys:
            index = self.project_tab_keys.index(select_key)
            self.project_list.selection_clear(0, tk.END)
            self.project_list.selection_set(index)
            self.project_list.activate(index)
            self.project_list.see(index)
        self.rebuilding_project_tabs = False

    def refresh_project_status(self) -> None:
        self.project_title_var.set(core.current_project_label())
        self.project_status_var.set(str(core.current_project_root()))

    def on_project_tab_changed(self, _event: tk.Event) -> None:
        if self.rebuilding_project_tabs:
            return
        if not self.project_tab_keys:
            return
        selection = self.project_list.curselection()
        if not selection:
            return
        index = int(selection[0])
        project_key = self.project_tab_keys[index]
        if project_key == core.current_project_key():
            return
        if self.active_task_ids or self.active_task_id or self.auto_busy:
            current_index = self.project_tab_keys.index(core.current_project_key())
            self.rebuilding_project_tabs = True
            self.project_list.selection_clear(0, tk.END)
            self.project_list.selection_set(current_index)
            self.project_list.activate(current_index)
            self.rebuilding_project_tabs = False
            messagebox.showinfo("Send in progress", "送信中はページを切り替えられません。完了後に切り替えてください。")
            return
        self.switch_project(project_key)

    def add_project_tab(self) -> None:
        label = simpledialog.askstring(
            "New Page",
            "新しいページ名を入力してください。\n例: 新規案件、論文レビュー、営業資料",
            parent=self,
        )
        if label is None:
            return
        label = label.strip()
        if not label:
            messagebox.showerror("New Page failed", "ページ名を空にはできません。")
            return
        try:
            project_key = core.create_project(label)
        except Exception as exc:
            messagebox.showerror("New Page failed", str(exc))
            return
        self.refresh_project_tabs(project_key)
        self.switch_project(project_key)
        self.log(f"Page added: {core.current_project_label()}")

    def switch_project(self, project_key: str) -> None:
        self.stop_auto_send(log_message=False)
        core.set_project(project_key)
        self.active_task_id = None
        self.active_task_ids.clear()
        self.active_agent_key = None
        self.auto_completed_cycles = 0
        self.auto_busy = False
        self.refresh_project_status()
        self.reload_tasks()
        self.refresh_current_task()
        self.log(f"Project switched: {core.current_project_label()}")

    def _task_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.Frame(parent, padding=14, style="Panel.TFrame")
        panel.pack(fill=tk.BOTH, expand=True)

        top = ttk.Frame(panel, style="Panel.TFrame")
        top.pack(fill=tk.X, pady=(0, 10))
        ttk.Label(top, text="Tasks", style="Section.TLabel").pack(side=tk.LEFT)
        ttk.Label(top, textvariable=self.selected_count_var, style="PanelHint.TLabel").pack(side=tk.LEFT, padx=(12, 0))
        ttk.Button(top, text="Reload", command=self.reload_tasks, style="Quiet.TButton").pack(side=tk.RIGHT)
        ttk.Label(
            panel,
            text="プロンプトを書いてキューに追加。下の一覧ではShiftで範囲選択、Ctrlで複数選択できます。",
            style="PanelHint.TLabel",
        ).pack(anchor=tk.W, pady=(0, 10))

        composer = ttk.Frame(panel, style="Panel.TFrame")
        composer.pack(fill=tk.X, pady=(0, 12))
        composer.columnconfigure(0, weight=1)
        self.prompt_text = tk.Text(
            composer,
            height=6,
            wrap=tk.WORD,
            font=("Segoe UI", 10),
            bg="#fbfbfa",
            bd=0,
            padx=10,
            pady=10,
            highlightthickness=1,
            highlightbackground="#deded9",
            highlightcolor="#bdbdb7",
            relief=tk.FLAT,
        )
        self.prompt_text.grid(row=0, column=0, sticky="ew")
        composer_scrollbar = ttk.Scrollbar(composer, orient=tk.VERTICAL, command=self.prompt_text.yview)
        composer_scrollbar.grid(row=0, column=1, sticky="ns")
        self.prompt_text.configure(yscrollcommand=composer_scrollbar.set)
        self.prompt_text.bind("<Control-Return>", self.add_prompt_from_composer_shortcut)

        composer_actions = ttk.Frame(panel, style="Panel.TFrame")
        composer_actions.pack(fill=tk.X, pady=(0, 12))
        ttk.Button(
            composer_actions,
            text="Add to Queue",
            command=lambda: self.add_prompt_from_composer(select_new=True, send=False),
            style="Primary.TButton",
        ).pack(side=tk.LEFT)
        ttk.Button(
            composer_actions,
            text="Add & Send",
            command=lambda: self.add_prompt_from_composer(select_new=True, send=True),
            style="Quiet.TButton",
        ).pack(side=tk.LEFT, padx=(8, 0))
        ttk.Button(composer_actions, text="Clear", command=self.clear_prompt_composer, style="Quiet.TButton").pack(
            side=tk.LEFT, padx=(8, 0)
        )

        editor_row = ttk.Frame(panel, style="Panel.TFrame")
        editor_row.pack(fill=tk.X, pady=(0, 10))
        ttk.Button(editor_row, text="Focus Composer", command=self.add_todo_dialog, style="Quiet.TButton").pack(side=tk.LEFT)
        ttk.Button(editor_row, text="Edit", command=self.edit_todo_dialog, style="Quiet.TButton").pack(side=tk.LEFT, padx=(8, 0))
        ttk.Button(editor_row, text="Delete", command=self.delete_todo_confirm, style="Quiet.TButton").pack(side=tk.LEFT, padx=(8, 0))
        ttk.Button(editor_row, text="Up", command=lambda: self.move_selected("up"), style="Quiet.TButton").pack(side=tk.LEFT, padx=(18, 0))
        ttk.Button(editor_row, text="Down", command=lambda: self.move_selected("down"), style="Quiet.TButton").pack(side=tk.LEFT, padx=(8, 0))

        columns = ("line", "status", "agent", "task")
        tree_frame = ttk.Frame(panel, style="Panel.TFrame")
        tree_frame.pack(fill=tk.BOTH, expand=True)
        tree_frame.columnconfigure(0, weight=1)
        tree_frame.rowconfigure(0, weight=1)

        self.task_tree = ttk.Treeview(tree_frame, columns=columns, show="headings", selectmode="extended")
        self.task_tree.heading("line", text="Line")
        self.task_tree.heading("status", text="Status")
        self.task_tree.heading("agent", text="Agent")
        self.task_tree.heading("task", text="Task")
        self.task_tree.column("line", width=54, anchor=tk.E)
        self.task_tree.column("status", width=90)
        self.task_tree.column("agent", width=92)
        self.task_tree.column("task", width=560)
        self.task_tree.tag_configure("active", background="#fff4bf")
        self.task_tree.tag_configure("last", background="#e8f3ff")
        self.task_tree.grid(row=0, column=0, sticky="nsew")
        self.task_tree.bind("<<TreeviewSelect>>", lambda _event: self.update_selection_summary())

        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=self.task_tree.yview)
        self.task_tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=0, column=1, sticky="ns")

    def _how_to_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.LabelFrame(parent, text="押す順番", padding=10)
        panel.pack(fill=tk.X)
        text = (
            "1. 下のTeachボタンで各AIの入力欄を記憶する\n"
            "2. Agentを選び、Send Access Setupでai_teamを読ませる\n"
            "3. Test Pasteで入力欄に入るか確認\n"
            "4. Send Selected / Send Nextで作業プロンプトを送る\n"
            "5. 1つのAIの完了を確認したら Send Selected To Next AI\n"
            "6. 自動順送りは Send Next Cycle（Claude→Codex→Antigravity）"
        )
        ttk.Label(panel, text=text, justify=tk.LEFT, wraplength=400).pack(fill=tk.X)

    def _teach_status_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.Frame(parent, padding=14, style="Panel.TFrame")
        panel.pack(fill=tk.X, pady=(12, 0))
        ttk.Label(panel, text="Input Fields", style="Section.TLabel").pack(anchor=tk.W, pady=(0, 10))

        labels = {
            "codex": "Codex",
            "claude": "Claude Code",
            "antigravity": "Antigravity",
        }
        for agent_key, label in labels.items():
            row = ttk.Frame(panel, style="Panel.TFrame")
            row.pack(fill=tk.X, pady=(0, 6))
            ttk.Label(row, text=label, width=14, style="PanelHint.TLabel").pack(side=tk.LEFT)
            var = tk.StringVar(value="未設定")
            self.teach_status_vars[agent_key] = var
            ttk.Label(row, textvariable=var, style="PanelHint.TLabel").pack(side=tk.LEFT, fill=tk.X, expand=True)
            ttk.Button(row, text="Teach", command=lambda key=agent_key: self.teach_agent_input_field(key), style="Quiet.TButton").pack(side=tk.RIGHT)

    def _control_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.Frame(parent, padding=14, style="Panel.TFrame")
        panel.pack(fill=tk.X)
        ttk.Label(panel, text="Send", style="Section.TLabel").pack(anchor=tk.W, pady=(0, 10))

        row = ttk.Frame(panel, style="Panel.TFrame")
        row.pack(fill=tk.X)
        ttk.Label(row, text="Send to AI", style="PanelHint.TLabel").pack(side=tk.LEFT)
        ttk.Combobox(
            row,
            textvariable=self.agent_var,
            values=("codex", "claude", "antigravity"),
            state="readonly",
            width=16,
        ).pack(side=tk.RIGHT, padx=(8, 0))

        selected_row = ttk.Frame(panel, style="Panel.TFrame")
        selected_row.pack(fill=tk.X, pady=(12, 0))
        ttk.Button(selected_row, text="Send Selected", command=lambda: self.dispatch_selected(submit=True), style="Primary.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True
        )
        ttk.Button(selected_row, text="Paste Only", command=lambda: self.dispatch_selected(submit=False), style="Quiet.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=(8, 0)
        )

        next_row = ttk.Frame(panel, style="Panel.TFrame")
        next_row.pack(fill=tk.X, pady=(8, 0))
        ttk.Button(next_row, text="Send Next", command=lambda: self.dispatch_next(submit=True), style="Quiet.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True
        )
        ttk.Button(next_row, text="Send Cycle", command=self.dispatch_next_cycle, style="Quiet.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=(8, 0)
        )

        setup_row = ttk.Frame(panel, style="Panel.TFrame")
        setup_row.pack(fill=tk.X, pady=(8, 0))
        ttk.Button(setup_row, text="Send Access Setup", command=self.send_access_setup).pack(
            side=tk.LEFT, fill=tk.X, expand=True
        )
        ttk.Button(setup_row, text="Send Selected To Next AI", command=self.dispatch_selected_to_next_agent).pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=(8, 0)
        )

        teach_row = ttk.Frame(panel, style="Panel.TFrame")
        teach_row.pack(fill=tk.X, pady=(8, 0))
        ttk.Button(teach_row, text="Teach Current AI", command=self.teach_input_field, style="Quiet.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True
        )
        ttk.Button(teach_row, text="Test Paste", command=self.test_paste, style="Quiet.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=(8, 0)
        )

        self.status_label = ttk.Label(panel, text="Ready", style="PanelHint.TLabel")
        self.status_label.pack(fill=tk.X, pady=(10, 0))

    def _auto_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.Frame(parent, padding=14, style="Panel.TFrame")
        panel.pack(fill=tk.X, pady=(12, 0))
        ttk.Label(panel, text="Automation", style="Section.TLabel").pack(anchor=tk.W, pady=(0, 10))

        row = ttk.Frame(panel, style="Panel.TFrame")
        row.pack(fill=tk.X)
        ttk.Label(row, text="Interval minutes", style="PanelHint.TLabel").pack(side=tk.LEFT)
        ttk.Entry(row, textvariable=self.auto_interval_var, width=8).pack(side=tk.LEFT, padx=(8, 0))
        ttk.Checkbutton(row, text="Cycle AI", variable=self.auto_cycle_var).pack(side=tk.LEFT, padx=(12, 0))

        limit_row = ttk.Frame(panel, style="Panel.TFrame")
        limit_row.pack(fill=tk.X, pady=(8, 0))
        ttk.Label(limit_row, text="Max cycles", style="PanelHint.TLabel").pack(side=tk.LEFT)
        ttk.Entry(limit_row, textvariable=self.auto_max_cycles_var, width=8).pack(side=tk.LEFT, padx=(24, 0))
        ttk.Label(limit_row, text="blank = unlimited", style="PanelHint.TLabel").pack(side=tk.LEFT, padx=(8, 0))

        button_row = ttk.Frame(panel, style="Panel.TFrame")
        button_row.pack(fill=tk.X, pady=(8, 0))
        ttk.Button(button_row, text="Start", style="Quiet.TButton", command=self.start_auto_send).pack(
            side=tk.LEFT, fill=tk.X, expand=True
        )
        ttk.Button(button_row, text="Stop", command=self.stop_auto_send, style="Quiet.TButton").pack(
            side=tk.LEFT, fill=tk.X, expand=True, padx=(8, 0)
        )

        ttk.Label(panel, textvariable=self.auto_status_var, style="PanelHint.TLabel").pack(fill=tk.X, pady=(8, 0))

    def _current_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.Frame(parent, padding=14, style="Panel.TFrame")
        panel.pack(fill=tk.X, pady=(12, 0))
        ttk.Label(panel, text="Now", style="Section.TLabel").pack(anchor=tk.W, pady=(0, 8))
        ttk.Label(panel, textvariable=self.current_task_var, justify=tk.LEFT, wraplength=330, style="PanelHint.TLabel").pack(fill=tk.X)

    def _log_panel(self, parent: ttk.Frame) -> None:
        panel = ttk.Frame(parent, padding=14, style="Panel.TFrame")
        panel.pack(fill=tk.BOTH, expand=True, pady=(12, 0))
        ttk.Label(panel, text="Activity", style="Section.TLabel").pack(anchor=tk.W, pady=(0, 8))
        self.log_text = tk.Text(
            panel,
            height=9,
            wrap=tk.WORD,
            font=("Consolas", 9),
            bg="#fafafa",
            bd=0,
            highlightthickness=1,
            highlightbackground="#e5e7eb",
            relief=tk.FLAT,
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)

    def log(self, message: str) -> None:
        self.log_text.insert(tk.END, f"{core.now()}  {message}\n")
        self.log_text.see(tk.END)
        self.status_label.configure(text=message)

    def _drain_messages(self) -> None:
        try:
            while True:
                self.log(self.worker_messages.get_nowait())
        except queue.Empty:
            pass
        self.after(200, self._drain_messages)

    def reload_tasks(self) -> None:
        self.items = core.parse_todos()
        state = core.load_state()
        last_task_id = state.get("last_dispatch", {}).get("task_id")
        self.task_by_tree_id.clear()
        self.task_tree.delete(*self.task_tree.get_children())
        for item in self.items:
            status = core.effective_status(item, state)
            agent = core.infer_agent(item.text)
            tags: tuple[str, ...] = ()
            if item.id in self.active_task_ids or item.id == self.active_task_id:
                tags = ("active",)
            elif item.id == last_task_id:
                tags = ("last",)
            tree_id = self.task_tree.insert("", tk.END, values=(item.line, status, agent, self.task_preview(item.text)), tags=tags)
            self.task_by_tree_id[tree_id] = item
            if item.id == self.active_task_id or (self.active_task_id is None and item.id == last_task_id):
                self.task_tree.see(tree_id)
        self.update_task_summary(state)
        self.update_selection_summary()
        self.log(f"Loaded {len(self.items)} todo items from {core.current_project_label()}")
        self.refresh_current_task()

    def update_task_summary(self, state: dict[str, object] | None = None) -> None:
        state = state or core.load_state()
        pending = sum(1 for item in self.items if core.effective_status(item, state) in {"todo", "doing"})
        done = sum(1 for item in self.items if core.effective_status(item, state) in {"done", "dispatched"})
        self.task_summary_var.set(f"{pending} pending / {done} done / {len(self.items)} total")

    def update_selection_summary(self) -> None:
        count = len(self.task_tree.selection()) if hasattr(self, "task_tree") else 0
        self.selected_count_var.set(f"{count} selected")

    def task_preview(self, text: str) -> str:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if not lines:
            return ""
        preview = lines[0]
        if len(lines) > 1:
            preview += f"  (+{len(lines) - 1} lines)"
        return preview

    def selected_item(self) -> core.TodoItem | None:
        items = self.selected_items()
        if not items:
            return None
        return items[0]

    def selected_items(self) -> list[core.TodoItem]:
        selected = set(self.task_tree.selection())
        if not selected:
            return []
        items: list[core.TodoItem] = []
        for tree_id in self.task_tree.get_children(""):
            if tree_id in selected and tree_id in self.task_by_tree_id:
                items.append(self.task_by_tree_id[tree_id])
        return items

    def single_selected_item(self, action_name: str) -> core.TodoItem | None:
        items = self.selected_items()
        if len(items) == 1:
            return items[0]
        if not items:
            messagebox.showinfo("No selection", f"{action_name}するTaskを1つ選んでください。")
        else:
            messagebox.showinfo("Multiple selection", f"{action_name}は1件ずつ行います。Taskを1つだけ選んでください。")
        return None

    def next_item(self) -> core.TodoItem | None:
        return core.next_todo(self.items, core.load_state())

    def item_by_id(self, task_id: str | None) -> core.TodoItem | None:
        if task_id is None:
            return None
        for item in self.items:
            if item.id == task_id:
                return item
        return None

    def refresh_current_task(self) -> None:
        if self.active_task_ids:
            items = [item for item in self.items if item.id in self.active_task_ids]
            agent = core.AGENT_LABELS.get(self.active_agent_key or "", self.active_agent_key or "-")
            if items:
                preview = "\n".join(f"- {item.id}: {item.text}" for item in items[:4])
                if len(items) > 4:
                    preview += f"\n... and {len(items) - 4} more"
                self.current_task_var.set(f"送信中: {len(items)}件 -> {agent}\n{preview}")
            else:
                self.current_task_var.set(f"送信中: {len(self.active_task_ids)}件 -> {agent}")
            return

        if self.active_task_id:
            item = self.item_by_id(self.active_task_id)
            agent = core.AGENT_LABELS.get(self.active_agent_key or "", self.active_agent_key or "-")
            if item:
                self.current_task_var.set(f"送信中: {item.id} -> {agent}\n{item.text}")
            else:
                self.current_task_var.set(f"送信中: {self.active_task_id} -> {agent}")
            return

        state = core.load_state()
        last = state.get("last_dispatch", {})
        task_id = last.get("task_id")
        agent_key = last.get("agent")
        prompt_kind = last.get("prompt_kind", "-")
        timestamp = last.get("timestamp", "-")
        if not task_id:
            if agent_key:
                agent = core.AGENT_LABELS.get(agent_key, agent_key)
                self.current_task_var.set(f"直近送信: {agent} / {prompt_kind} / {timestamp}")
            else:
                self.current_task_var.set("現在のtodo: 未送信")
            return

        item = self.item_by_id(task_id)
        agent = core.AGENT_LABELS.get(agent_key, agent_key or "-")
        if item:
            self.current_task_var.set(f"直近送信: {item.id} -> {agent} / {timestamp}\n{item.text}")
        else:
            self.current_task_var.set(f"直近送信: {task_id} -> {agent} / {timestamp}")

    def set_active_task(self, item: core.TodoItem | None, agent_key: str) -> None:
        self.set_active_tasks([item] if item else [], agent_key)

    def set_active_tasks(self, items: list[core.TodoItem], agent_key: str) -> None:
        self.active_task_id = items[0].id if items else None
        self.active_task_ids = {item.id for item in items}
        self.active_agent_key = agent_key
        self.refresh_current_task()
        self.reload_tasks()

    def finish_active_task(self, item: core.TodoItem | None, agent_key: str, return_code: int) -> None:
        self.finish_active_tasks([item] if item else [], agent_key, return_code)

    def finish_active_tasks(self, items: list[core.TodoItem], agent_key: str, return_code: int) -> None:
        if return_code == 0:
            self.active_task_id = None
            self.active_task_ids.clear()
            self.active_agent_key = None
            self.refresh_current_task()
            self.reload_tasks()
            return

        label = core.AGENT_LABELS.get(agent_key, agent_key)
        if items:
            preview = "\n".join(f"- {item.id}: {item.text}" for item in items[:4])
            if len(items) > 4:
                preview += f"\n... and {len(items) - 4} more"
            self.current_task_var.set(f"送信失敗: {len(items)}件 -> {label} rc={return_code}\n{preview}")
        else:
            self.current_task_var.set(f"送信失敗: {label} rc={return_code}")
        self.active_task_id = None
        self.active_task_ids.clear()
        self.active_agent_key = None
        self.reload_tasks()

    def selected_agent_key(self) -> str:
        return self.agent_var.get()

    def selected_target_name(self) -> str:
        return core.AGENT_TARGETS[self.selected_agent_key()]

    def teach_input_field(self) -> None:
        self.teach_agent_input_field(self.selected_agent_key())

    def teach_agent_input_field(self, agent_key: str) -> None:
        self.agent_var.set(agent_key)
        target_name = core.AGENT_TARGETS[agent_key]
        self.log(f"Teach overlay opening for {target_name}")
        self.after(150, lambda: self._show_overlay(target_name))

    def refresh_teach_status(self) -> None:
        calibration = core.load_calibration()
        for agent_key, target_name in core.AGENT_TARGETS.items():
            var = self.teach_status_vars.get(agent_key)
            if var is None:
                continue
            entry = calibration.get(target_name)
            if entry and entry.get("use_absolute"):
                x = entry.get("absolute_x")
                y = entry.get("absolute_y")
                timestamp = entry.get("timestamp", "")
                var.set(f"設定済み x={x}, y={y} {timestamp}")
            else:
                var.set("未設定")

    def _show_overlay(self, target_name: str) -> None:
        monitors = auto_driver.windows_monitor_rects()
        overlays: list[tk.Toplevel] = []
        active_canvas: list[tk.Canvas | None] = [None]
        start_screen: list[int | None] = [None, None]
        rect_id: list[int | None] = [None]
        dot_id: list[int | None] = [None]

        def destroy_overlays() -> None:
            self.unbind_all("<Escape>")
            for overlay in list(overlays):
                if overlay.winfo_exists():
                    overlay.destroy()

        def clear_shapes() -> None:
            canvas = active_canvas[0]
            if canvas is None:
                return
            for holder in (rect_id, dot_id):
                if holder[0] is not None:
                    canvas.delete(holder[0])
                    holder[0] = None

        def on_press(event: tk.Event) -> None:
            active_canvas[0] = event.widget
            start_screen[0] = event.x_root
            start_screen[1] = event.y_root
            clear_shapes()

        def on_drag(event: tk.Event) -> None:
            canvas = active_canvas[0]
            if canvas is None or start_screen[0] is None or start_screen[1] is None:
                return
            clear_shapes()
            local_start_x = start_screen[0] - canvas.winfo_rootx()
            local_start_y = start_screen[1] - canvas.winfo_rooty()
            local_end_x = event.x_root - canvas.winfo_rootx()
            local_end_y = event.y_root - canvas.winfo_rooty()
            rect_id[0] = canvas.create_rectangle(
                local_start_x,
                local_start_y,
                local_end_x,
                local_end_y,
                outline="#ff3333",
                width=3,
            )
            cx = (local_start_x + local_end_x) // 2
            cy = (local_start_y + local_end_y) // 2
            dot_id[0] = canvas.create_oval(cx - 8, cy - 8, cx + 8, cy + 8, fill="#ff3333", outline="white")

        def on_release(event: tk.Event) -> None:
            if start_screen[0] is None or start_screen[1] is None:
                return
            screen_x1, screen_x2 = sorted((start_screen[0], event.x_root))
            screen_y1, screen_y2 = sorted((start_screen[1], event.y_root))
            if screen_x2 - screen_x1 < 10 or screen_y2 - screen_y1 < 10:
                destroy_overlays()
                self.log("Teach cancelled: selection was too small")
                return

            try:
                crop = ImageGrab.grab(bbox=(screen_x1, screen_y1, screen_x2, screen_y2), all_screens=True)
            except Exception:
                crop = Image.new("RGB", (max(1, screen_x2 - screen_x1), max(1, screen_y2 - screen_y1)), "#000000")
            click_x = (screen_x1 + screen_x2) // 2
            click_y = (screen_y1 + screen_y2) // 2
            result = core.save_teach_result(target_name, crop, click_x, click_y)
            destroy_overlays()
            self.log(f"{target_name} taught: click=({click_x}, {click_y})")
            self.log(f"Saved teach image: {result['template_path']}")
            self.refresh_teach_status()

        def on_escape(_event: tk.Event) -> None:
            destroy_overlays()
            self.log("Teach cancelled")

        self.bind_all("<Escape>", on_escape, add="+")

        for index, (left, top, right, bottom) in enumerate(monitors, start=1):
            width = right - left
            height = bottom - top
            overlay = tk.Toplevel(self)
            overlay.overrideredirect(True)
            overlay.attributes("-topmost", True)
            overlay.attributes("-alpha", 0.28)
            overlay.geometry(f"{width}x{height}+0+0")
            overlay.configure(bg="#000000")

            canvas = tk.Canvas(
                overlay,
                width=width,
                height=height,
                cursor="crosshair",
                highlightthickness=0,
                bg="#000000",
            )
            canvas.pack(fill=tk.BOTH, expand=True)
            canvas.create_rectangle(0, 0, width, height, fill="#000000", outline="")
            canvas.create_rectangle(18, 18, min(width - 18, 920), 108, fill="#111827", outline="#60a5fa", width=2)
            canvas.create_text(
                34,
                34,
                anchor=tk.NW,
                text=f"Teach Input Field: {target_name} / Display {index}\nAIの入力欄だけをドラッグ選択してください。Escでキャンセル。",
                fill="white",
                font=("Segoe UI", 14, "bold"),
            )
            canvas.bind("<ButtonPress-1>", on_press)
            canvas.bind("<B1-Motion>", on_drag)
            canvas.bind("<ButtonRelease-1>", on_release)
            canvas.bind("<Escape>", on_escape)
            overlay.bind("<Escape>", on_escape)
            overlay.update_idletasks()
            auto_driver.set_window_rect(overlay.winfo_id(), left, top, width, height)
            overlays.append(overlay)

        self.log(f"Teach overlay shown on {len(overlays)} display(s)")
        if overlays:
            overlays[-1].focus_force()

    def test_paste(self) -> None:
        self._run_auto_driver_with_prompt(
            "貼り付けテストです。入力欄に入っていれば成功です。",
            submit=False,
            mark_item=None,
            prompt_kind="test",
        )

    def send_access_setup(self) -> None:
        agent = self.selected_agent_key()
        prompt = core.build_access_prompt(agent)
        self._run_auto_driver_with_prompt(prompt, submit=True, mark_item=None, prompt_kind="access_setup")

    def dispatch_selected(self, submit: bool) -> None:
        items = self.selected_items()
        if not items:
            messagebox.showinfo("No task selected", "左のtodoを1つ以上選んでください。")
            return
        self._dispatch_items(items, submit)

    def dispatch_selected_to_next_agent(self) -> None:
        items = self.selected_items()
        if not items:
            messagebox.showinfo("No task selected", "左のtodoを1つ以上選んでください。")
            return
        next_agent = core.next_cycle_agent(self.selected_agent_key())
        self.agent_var.set(next_agent)
        self.log(f"Advanced agent to {core.AGENT_LABELS[next_agent]}")
        self._dispatch_items(items, submit=True)

    def dispatch_next(self, submit: bool) -> None:
        item = self.next_item()
        if item is None:
            messagebox.showinfo("No pending task", "未送信のtodoがありません。")
            return
        self._dispatch_item(item, submit)

    def dispatch_next_cycle(self) -> None:
        item = self.next_item()
        if item is None:
            messagebox.showinfo("No pending task", "未送信のtodoがありません。")
            return
        next_agent = core.next_cycle_agent()
        self.agent_var.set(next_agent)
        self.log(f"Cycle agent: {core.AGENT_LABELS[next_agent]}")
        self._dispatch_item(item, submit=True)

    def start_auto_send(self) -> None:
        interval = self._auto_interval_minutes()
        if interval is None:
            return
        ok, max_cycles = self._read_auto_max_cycles()
        if not ok:
            return
        self.stop_auto_send(log_message=False)
        self.auto_max_cycles = max_cycles
        self.auto_completed_cycles = 0
        self.auto_enabled = True
        self.auto_busy = False
        limit_text = "unlimited" if max_cycles is None else str(max_cycles)
        self.auto_status_var.set(f"Auto running every {interval:g} minute(s), max cycles={limit_text}")
        self.log(f"Auto send started: every {interval:g} minute(s), max cycles={limit_text}")
        self._auto_send_next_now()

    def stop_auto_send(self, log_message: bool = True) -> None:
        self.auto_enabled = False
        if self.auto_after_id is not None:
            self.after_cancel(self.auto_after_id)
            self.auto_after_id = None
        self.auto_status_var.set("Auto stopped")
        if log_message:
            self.log("Auto send stopped")

    def _auto_interval_minutes(self) -> float | None:
        raw = self.auto_interval_var.get().strip()
        try:
            value = float(raw)
        except ValueError:
            messagebox.showerror("Invalid interval", "Interval minutesには数値を入れてください。例: 3")
            return None
        if value <= 0:
            messagebox.showerror("Invalid interval", "Interval minutesは0より大きい値にしてください。")
            return None
        return value

    def _read_auto_max_cycles(self) -> tuple[bool, int | None]:
        raw = self.auto_max_cycles_var.get().strip()
        if not raw:
            return True, None
        try:
            value = int(raw)
        except ValueError:
            messagebox.showerror("Invalid max cycles", "Max cyclesには整数を入れてください。例: 10")
            return False, None
        if value <= 0:
            messagebox.showerror("Invalid max cycles", "Max cyclesは1以上、または空欄にしてください。")
            return False, None
        return True, value

    def _auto_progress_text(self) -> str:
        if self.auto_max_cycles is None:
            return f"{self.auto_completed_cycles}/unlimited"
        return f"{self.auto_completed_cycles}/{self.auto_max_cycles}"

    def _schedule_next_auto_send(self) -> None:
        if not self.auto_enabled:
            return
        interval = self._auto_interval_minutes()
        if interval is None:
            self.stop_auto_send(log_message=False)
            return
        milliseconds = max(1000, int(interval * 60 * 1000))
        next_at = dt.datetime.now() + dt.timedelta(milliseconds=milliseconds)
        self.auto_status_var.set(f"Next auto send: {next_at.strftime('%H:%M:%S')} cycles={self._auto_progress_text()}")
        self.auto_after_id = self.after(milliseconds, self._auto_send_next_now)

    def _auto_send_next_now(self) -> None:
        self.auto_after_id = None
        if not self.auto_enabled:
            return
        if self.auto_busy:
            self.log("Auto send skipped: previous send is still running")
            self._schedule_next_auto_send()
            return

        item = self.next_item()
        if item is None:
            self.stop_auto_send(log_message=False)
            self.log("Auto send stopped: no pending todo")
            return

        if self.auto_cycle_var.get():
            agent = core.next_cycle_agent()
            self.agent_var.set(agent)

        self.auto_busy = True
        self.auto_status_var.set(
            f"Sending {item.id} to {core.AGENT_LABELS[self.selected_agent_key()]} cycles={self._auto_progress_text()}"
        )
        self._dispatch_item(item, submit=True, on_done=self._auto_send_done)

    def _auto_send_done(self, return_code: int) -> None:
        self.auto_busy = False
        self.auto_status_var.set(f"Last auto send rc={return_code} cycles={self._auto_progress_text()}")
        if return_code != 0:
            self.stop_auto_send(log_message=False)
            self.log(f"Auto send stopped: last send failed rc={return_code}")
            return
        self.auto_completed_cycles += 1
        if self.auto_max_cycles is not None and self.auto_completed_cycles >= self.auto_max_cycles:
            self.stop_auto_send(log_message=False)
            self.auto_status_var.set(f"Auto stopped: completed {self.auto_completed_cycles}/{self.auto_max_cycles} cycles")
            self.log(f"Auto send completed: {self.auto_completed_cycles}/{self.auto_max_cycles} cycles")
            return
        if self.auto_enabled:
            self._schedule_next_auto_send()

    def _dispatch_item(self, item: core.TodoItem, submit: bool, on_done=None) -> None:
        self._dispatch_items([item], submit, on_done=on_done)

    def _dispatch_items(self, items: list[core.TodoItem], submit: bool, on_done=None) -> None:
        prompt = core.build_agent_prompt_for_items(items=items, agent=self.selected_agent_key())
        self._run_auto_driver_with_prompt(
            prompt,
            submit=submit,
            mark_item=items[0] if submit and items else None,
            prompt_kind="task",
            on_done=on_done,
            mark_items=items if submit else [],
        )

    def _run_auto_driver_with_prompt(
        self,
        prompt: str,
        submit: bool,
        mark_item: core.TodoItem | None,
        prompt_kind: str,
        on_done=None,
        mark_items: list[core.TodoItem] | None = None,
    ) -> None:
        agent_key = self.selected_agent_key()
        target_name = self.selected_target_name()
        mark_items = mark_items or ([mark_item] if mark_item else [])
        core.write_text(core.CURRENT_PROMPT, prompt)

        cmd = [
            sys.executable,
            str(core.SCRIPT_DIR / "auto_driver.py"),
            "--only",
            target_name,
            "--prompt-file",
            str(core.CURRENT_PROMPT),
            "--post-click-wait",
            "1",
            "--post-paste-wait",
            "2",
        ]
        if not submit:
            cmd.append("--no-submit")

        action = "Send" if submit else "Paste"
        self.log(f"{action} started: {target_name}")
        if mark_items:
            self.set_active_tasks(mark_items, agent_key)
        else:
            self.current_task_var.set(f"{action}中: {core.AGENT_LABELS.get(agent_key, agent_key)} / {prompt_kind}")

        def worker() -> None:
            result = subprocess.run(cmd, cwd=str(core.SCRIPT_DIR), text=True, capture_output=True, timeout=180)
            output = (result.stdout or "") + (result.stderr or "")
            self.worker_messages.put(f"{action} finished rc={result.returncode}")
            if output.strip():
                self.worker_messages.put(output.strip())
            if result.returncode == 0:
                dispatch_id = None
                if mark_items:
                    dispatch_id = mark_items[0].id if len(mark_items) == 1 else f"{len(mark_items)} selected tasks"
                core.record_dispatch(dispatch_id, agent_key, prompt_kind)
            if submit and result.returncode == 0 and mark_items:
                for item in mark_items:
                    core.set_task_status(item.id, "dispatched")
                self.after(0, self.reload_tasks)
            self.after(0, lambda items=mark_items, agent=agent_key, rc=result.returncode: self.finish_active_tasks(items, agent, rc))
            if on_done is not None:
                self.after(0, lambda rc=result.returncode: on_done(rc))

        threading.Thread(target=worker, daemon=True).start()

    # --- Todo editing ---

    def add_prompt_from_composer_shortcut(self, _event: tk.Event) -> str:
        self.add_prompt_from_composer(select_new=True, send=False)
        return "break"

    def clear_prompt_composer(self) -> None:
        self.prompt_text.delete("1.0", tk.END)
        self.prompt_text.focus_set()

    def add_prompt_from_composer(self, select_new: bool = True, send: bool = False) -> None:
        text = self.prompt_text.get("1.0", "end-1c").strip()
        if not text:
            messagebox.showinfo("Empty prompt", "追加するプロンプトを入力してください。")
            self.prompt_text.focus_set()
            return

        selected_items = self.selected_items()
        insert_after = selected_items[-1].id if selected_items else None
        try:
            item_id = core.add_todo(text, after_item_id=insert_after)
        except Exception as exc:
            messagebox.showerror("Add failed", str(exc))
            return

        self.clear_prompt_composer()
        self.reload_tasks()
        if select_new:
            self.select_item_by_id(item_id)
        self.log(f"Prompt added: {self.task_preview(text)[:60]}")

        if send:
            item = self.item_by_id(item_id)
            if item is not None:
                self._dispatch_items([item], submit=True)

    def _select_tree_id_for_line(self, line_number: int) -> None:
        for tree_id, item in self.task_by_tree_id.items():
            if item.line == line_number:
                self.task_tree.selection_set(tree_id)
                self.task_tree.see(tree_id)
                return

    def select_item_by_id(self, item_id: str) -> None:
        for tree_id, item in self.task_by_tree_id.items():
            if item.id == item_id:
                self.task_tree.selection_remove(self.task_tree.selection())
                self.task_tree.selection_set(tree_id)
                self.task_tree.focus(tree_id)
                self.task_tree.see(tree_id)
                self.update_selection_summary()
                return

    def ask_multiline(self, title: str, initial_text: str = "") -> str | None:
        dialog = tk.Toplevel(self)
        dialog.title(title)
        dialog.transient(self)
        dialog.grab_set()
        dialog.configure(bg="#f7f7f5")
        dialog.geometry("640x420")

        frame = ttk.Frame(dialog, padding=16, style="App.TFrame")
        frame.pack(fill=tk.BOTH, expand=True)
        ttk.Label(frame, text=title, style="PageTitle.TLabel").pack(anchor=tk.W, pady=(0, 10))

        text_box = tk.Text(
            frame,
            wrap=tk.WORD,
            font=("Segoe UI", 10),
            bg="#ffffff",
            bd=0,
            padx=10,
            pady=10,
            highlightthickness=1,
            highlightbackground="#deded9",
            highlightcolor="#bdbdb7",
            relief=tk.FLAT,
        )
        text_box.pack(fill=tk.BOTH, expand=True)
        text_box.insert("1.0", initial_text)
        text_box.focus_set()

        result: dict[str, str | None] = {"value": None}

        def submit() -> None:
            result["value"] = text_box.get("1.0", "end-1c").strip()
            dialog.destroy()

        def cancel() -> None:
            dialog.destroy()

        actions = ttk.Frame(frame, style="App.TFrame")
        actions.pack(fill=tk.X, pady=(12, 0))
        ttk.Button(actions, text="Save", command=submit, style="Primary.TButton").pack(side=tk.RIGHT)
        ttk.Button(actions, text="Cancel", command=cancel, style="Quiet.TButton").pack(side=tk.RIGHT, padx=(0, 8))
        dialog.bind("<Escape>", lambda _event: cancel())
        self.wait_window(dialog)
        return result["value"]

    def add_todo_dialog(self) -> None:
        self.prompt_text.focus_set()

    def edit_todo_dialog(self) -> None:
        item = self.single_selected_item("編集")
        if item is None:
            return
        new_text = self.ask_multiline("Edit Prompt", item.text)
        if new_text is None:
            return
        new_text = new_text.strip()
        if not new_text:
            messagebox.showerror("Edit failed", "todoの内容を空にはできません。")
            return
        if new_text == item.text:
            return
        try:
            core.edit_todo(item.id, new_text)
            self.log(f"Todo編集 L{item.line}: {new_text[:40]}")
            self.reload_tasks()
            self._select_tree_id_for_line(item.line)
        except Exception as exc:
            messagebox.showerror("Edit failed", str(exc))

    def delete_todo_confirm(self) -> None:
        items = self.selected_items()
        if not items:
            messagebox.showinfo("No selection", "削除するtodoを選んでください。")
            return
        if len(items) == 1:
            message = f"このtodoを削除しますか？\n\nL{items[0].line}: {items[0].text}"
        else:
            preview = "\n".join(f"L{item.line}: {item.text}" for item in items[:8])
            if len(items) > 8:
                preview += f"\n... and {len(items) - 8} more"
            message = f"選択した{len(items)}件のtodoを削除しますか？\n\n{preview}"
        if not messagebox.askyesno("Delete Todo", message):
            return
        try:
            for item in sorted(items, key=lambda item: item.line, reverse=True):
                core.delete_todo(item.id)
            self.log(f"Todo削除: {len(items)}件")
            self.reload_tasks()
        except Exception as exc:
            messagebox.showerror("Delete failed", str(exc))

    def move_selected(self, direction: str) -> None:
        item = self.single_selected_item("移動")
        if item is None:
            return
        try:
            moved = core.move_todo(item.id, direction)
        except Exception as exc:
            messagebox.showerror("Move failed", str(exc))
            return
        if not moved:
            self.log(f"これ以上{('上' if direction == 'up' else '下')}に移動できません。")
            return
        self.log(f"Todo {direction}: L{item.line} {item.text[:30]}")
        self.reload_tasks()
        # Re-select the moved item by matching text
        for tree_id, new_item in self.task_by_tree_id.items():
            if new_item.text == item.text:
                self.task_tree.selection_set(tree_id)
                self.task_tree.see(tree_id)
                break

    def on_close(self) -> None:
        self.stop_auto_send(log_message=False)
        self.destroy()


if __name__ == "__main__":
    OrchestratorApp().mainloop()
