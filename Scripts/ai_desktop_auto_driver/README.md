# AI Desktop Auto Driver

Claude Code、Codex、Antigravity などのデスクトップAIアプリを定期巡回し、入力待ち状態のスクリーンショット画像が画面上に見つかったときだけ、定型プロンプトを入力して Enter を送ります。

この版はまず Windows で動かすことを優先しています。macOS でも動きますが、Windows では貼り付けショートカットに `Ctrl+V` を自動使用します。

明示的な承認ボタン、権限許可ダイアログ、危険操作の確認ボタンは基準画像に登録しないでください。このスクリプトは通常のプロンプト入力欄だけを対象にします。

## 推奨ディレクトリ構成

```text
ai_desktop_auto_driver/
├── auto_driver.py
├── requirements.txt
├── setup_windows.ps1
├── run_windows.ps1
├── targets.example.json
├── README.md
└── assets/
    ├── README.md
    ├── claude_code_input_ready.png
    ├── codex_input_ready.png
    └── antigravity_input_ready.png
```

## Windows 環境構築

PowerShell でこのフォルダへ移動します。

```powershell
cd C:\Users\tomot\Desktop\management\Scripts\ai_desktop_auto_driver
```

セットアップスクリプトを実行します。

```powershell
powershell -ExecutionPolicy Bypass -File .\setup_windows.ps1
```

手動で行う場合は以下です。

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

必要ライブラリ:

- `pyautogui`: 画面キャプチャ、画像検索、クリック、キー送信
- `opencv-python`: `confidence` 付き画像マッチングに必要
- `pillow`: スクリーンショット画像処理に必要
- `pyperclip`: 日本語プロンプトを安定して貼り付けるために使用

## Windows 実行前の注意

- Windows がロック画面に入ると GUI 操作はできません。実行中はロックしない設定にしてください。
- スリープやディスプレイ電源オフも避けてください。`run_windows.ps1` は実行中だけスリープ抑止を試みます。
- 対象アプリを管理者権限で起動している場合、このスクリプトも管理者権限の PowerShell から実行してください。
- リモートデスクトップを切断すると画面キャプチャ結果が変わることがあります。長時間運用は物理ログイン中、または常時表示されるセッションで確認してください。
- Windows の拡大縮小率、テーマ、アプリのズーム倍率を固定してから基準画像を撮ってください。
- Windows では既定で拡張ディスプレイを含む仮想デスクトップ全体を検索します。主モニターだけに戻したい場合は `--screen-capture primary` を指定します。
- 画面取得は既定で `imagegrab` を使います。Windows の表示スケールが混ざる環境では `mss` より `imagegrab` の方がクリック座標と一致しやすいです。

## 基準画像の配置

`assets/` に以下のファイル名で保存します。

- Claude Code: `claude_code_input_ready.png`
- Codex: `codex_input_ready.png`
- Antigravity: `antigravity_input_ready.png`

拡張ディスプレイで見え方が変わる場合は、同じアプリの入力欄をその画面上で撮り直し、別テンプレートとして併用します。このリポジトリでは現在、以下も `targets.json` に登録済みです。

- Claude Code: `claude_code_input_ready_extended.png`
- Codex: `codex_input_ready_extended.png`
- Antigravity: `antigravity_input_ready_extended.png`

撮るべき場所の目安:

- Claude Code: VS Code の Claude Code ターミナルまたはパネルで、入力を受け付ける最下部のプロンプト記号、カーソル、入力欄の一部
- Codex: Codex アプリ下部の入力ボックス、プレースホルダー、送信アイコンの近辺
- Antigravity: チャット/エージェント入力欄の枠、送信ボタン、待機時だけ表示される安定したUI

コツ:

- 動的な本文、進捗ログ、時刻、ファイル名は含めない
- 80〜400px 程度の小さめの切り抜きにする
- クリックしたい入力欄の近くを切り抜く
- Windows のディスプレイ拡大率を変えたら撮り直す
- うまく検知しない場合は `--confidence 0.75` へ下げ、誤検知する場合は `0.85` へ上げる

## Windows での動作確認

まず検知だけ確認します。

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose
```

拡張ディスプレイを明示的に含めて確認する場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose --screen-capture all
```

検知できない原因を見たい場合は、スクリプトが実際に見ている画面を保存します。

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose --screen-capture all --save-capture diagnostics\capture.png
```

`diagnostics\capture.png` に対象アプリの入力欄が写っていなければ、最小化、ロック画面、リモートデスクトップ切断、別デスクトップ表示などが原因です。写っているのに検知しない場合は、基準画像と現在の表示がズレています。

拡大率やウィンドウサイズ差に少し強くする場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose --screen-capture all --scale-tolerance 0.10
```

色やテーマ差に少し強くする場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose --screen-capture all --grayscale
```

主モニターだけを確認する場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --dry-run --verbose --screen-capture primary
```

問題なければ 3分間隔で巡回します。

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --interval 180 --confidence 0.8
```

初回だけ1アプリに絞って実送信する場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --only "Claude Code"
```

複数指定もできます。

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --once --only "Claude Code" --only "Antigravity"
```

24時間運用は、スリープ抑止付きのラッパーで起動します。

```powershell
powershell -ExecutionPolicy Bypass -File .\run_windows.ps1
```

間隔や信頼度を変える場合:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_windows.ps1 -Interval 180 -Confidence 0.8
```

拡張ディスプレイ検索を明示する場合:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_windows.ps1 -ScreenCapture all
```

スケール差も許容して長時間運用する場合:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_windows.ps1 -ScreenCapture all -ScaleTolerance 0.10 -Grayscale
```

`imagegrab` で画面が保存されない、または真っ黒になる環境だけ、代替として `mss` を試します。

```powershell
powershell -ExecutionPolicy Bypass -File .\run_windows.ps1 -ScreenCapture all -CaptureBackend mss
```

## Todo順入力・オーケストレーションUI

`ai_team/task_queue.md` のチェックボックスTodoを読み、未完了タスクを順番に各AIアプリへ送る管制UIを追加しています。

起動:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_orchestrator_ui.ps1
```

UIの役割:

- `Todo Queue`: `ai_team/task_queue.md` から `- [ ]` / `- [~]` / `- [x]` / `- [!]` を読み込む
- `Agent`: `Auto` の場合はタスク文から `claude` / `codex` / `antigravity` を推定する
- `Dispatch Selected`: 選択中のTodoを対象AIへ送る
- `Dispatch Next`: 次の未完了Todoを対象AIへ送る
- `Start Auto Loop`: 未完了Todoを上から順に送る
- `Dry run`: クリック・入力・送信をせず、検知だけ確認する

プロンプト連携:

- 役割プロンプト: `C:\Users\tomot\Desktop\management\ai_team\prompts`
- AIごとの入力ファイル:
  - Claude: `ai_team\inbox\to_claude.md`
  - Codex: `ai_team\inbox\to_codex.md`
  - Antigravity: `ai_team\inbox\to_antigravity.md`
- 送信用一時ファイル: `Scripts\ai_desktop_auto_driver\runtime\current_prompt.md`
- 状態ファイル: `ai_team\desktop_orchestrator_state.json`

最初は `Dry run` をオンにしたまま `Dispatch Selected` を押し、ログに `detected input-ready state` が出ることを確認してください。問題なければ `Dry run` を外して実送信します。

停止方法:

- PowerShell で `Ctrl+C`
- PyAutoGUI の fail-safe: マウスを画面左上へ移動

## 送信されるプロンプト

既定では次の文を貼り付けて Enter を送ります。

```text
予定通り、プロジェクトのtodoファイルに従って、次の未完了タスクの処理を進めてください。
```

変更する場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --prompt "次の未完了タスクを進めてください。"
```

Windows では既定で `Ctrl+V` を使います。もし別の環境で明示したい場合:

```powershell
.\.venv\Scripts\python.exe .\auto_driver.py --paste-modifier ctrl
```

## ターゲット追加

`targets.example.json` を `targets.json` にコピーして編集します。

```powershell
Copy-Item .\targets.example.json .\targets.json
```

例:

```json
{
  "targets": [
    {
      "name": "Extra Agent",
      "image": "extra_agent_input_ready.png",
      "confidence": 0.82,
      "enabled": true
    }
  ]
}
```

`image` は `assets/` からの相対パス、または絶対パスを指定できます。
