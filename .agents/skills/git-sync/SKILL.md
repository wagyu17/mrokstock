---
name: git-sync
description: `/git` コマンドが入力された際、または Git の同期（add, commit, push）を求められた際に実行します。
argument-hint: [任意：コミットメッセージ]
allowed-tools: run_command
---

以下の手順でリポジトリの同期を実行してください。

1. `Scripts/git-sync.ps1` を PowerShell で実行する。
2. 実行結果（成功・失敗）をユーザーに報告する。

もし引数（$ARGUMENTS）が指定されている場合は、コミットメッセージとして利用することを検討してください（現在はスクリプト側で自動生成されますが、将来的に拡張可能です）。
