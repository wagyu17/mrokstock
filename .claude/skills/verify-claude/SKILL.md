---
name: verify-claude
description: Claude Code や Claude API に関する主張・投稿内容を公式ドキュメントで事実確認する。「この情報は正しい？」「この設定方法は合ってる？」に使う。
argument-hint: [確認したい内容]
disable-model-invocation: true
allowed-tools: WebFetch WebSearch
---

以下の主張・内容を公式ドキュメントで事実確認してください。

## 確認対象

$ARGUMENTS

## 手順

1. `WebSearch` または `WebFetch` で公式ドキュメント（code.claude.com/docs、claude.com/blog、anthropic.com/engineering）を参照する
2. 主張を1つずつ照合する
3. 結果を以下の形式で報告する:

### 事実確認レポート

各主張について:
- ✅ 正確 / ⚠️ 部分的に正確（補正あり） / ❌ 誤り / ❓ 確認できず

補正情報（ある場合）と出典URLを併記すること。

### 正確な情報まとめ

事実確認済みの正確な内容を簡潔にまとめる。

### 出典

参照した公式URLをリストアップする。
