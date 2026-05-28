# AI Team Auto Launcher

`00_NEXT_ACTION.md` と `04_LOOP_LOG.md` を監視し, `HANDOFF_DONE` マーカーに従って次の AI アプリを前面化し, 起動文を貼り付けて Enter します.

## セットアップ

```powershell
python -m pip install pyautogui pywinauto pyperclip
```

## 事前確認

```powershell
python .\ai_team_auto_launcher.py --dry-run --once
python .\ai_team_auto_launcher.py --list-windows
```

ウィンドウタイトルが合わない場合は `AUTO_RUNNER_CONFIG.json` を作り, `AUTO_RUNNER_CONFIG.example.json` を参考に `title_re` を調整します.

## 起動

```powershell
python .\ai_team_auto_launcher.py --max-launch-count 3
```

初回だけ `HANDOFF_DONE` がまだ無い状態から開始したい場合:

```powershell
python .\ai_team_auto_launcher.py --bootstrap --max-launch-count 3
```

## 停止

`AUTO_RUNNER_STOP.md` を作り, 中身に `STOP` と書くと停止します.

```powershell
Set-Content .\AUTO_RUNNER_STOP.md STOP -Encoding UTF8
```

緊急停止はマウスを画面左上へ移動します. `pyautogui.FAILSAFE = True` にしているため, GUI 操作中に停止できます.

## 完了マーカー

各 AI は作業終了時に `00_NEXT_ACTION.md` を先に更新し, その後 `04_LOOP_LOG.md` の末尾へ以下の形式を追記します.

```text
<<<HANDOFF_DONE agent=claude next_agent=codex>>>
<<<HANDOFF_DONE agent=codex next_agent=antigravity>>>
<<<HANDOFF_DONE agent=antigravity next_agent=claude>>>
```

自動起動スクリプトは, 最新マーカーの `next_agent` と `00_NEXT_ACTION.md` の `next_agent` が一致したときだけ起動します.
