---
notion_id: 16911a71-fda7-80e7-a0dc-fb8313f6cf7d
created: 2024-12-27
---

### **プロンプトカテゴリー別のInstruction Following評価基準**
1. **Content Extraction（内容抽出）**
  - **Execution Correctness（実行の正確性）**:プロンプト指示が正確に実行されたかを確認する（Truthfulnessと重なる部分がある）。
1. **Summarization（要約）**
  - **実行確認**:
    - モデルが要約を試みたか？
    - 制約（例: 500語以内）を満たしているか？
1. **Rewrite（リライト）**
  - **実行確認**:
    - モデルがリライトを試みたか？
    - 制約を満たしているか（例: 500語以内）？
    - 外部情報を引き込んだ場合、それがプロンプトに基づき有益だったか？
1. **Closed QA（クローズドQ&A）**
  - **Execution Attempt（実行の試み）**:モデルが参照テキストに基づいて質問に答えようとしたか（正解である必要はない）。
  - **Constraint Correctness（制約の正確性）**:その他の制約（通常はフォーマット）を満たしたか。
1. **Classification（分類）**
  - **Execution Attempt（実行の試み）**:モデルが参照テキストに基づいて分類を試みたか（正確な分類である必要はない）。
  - **Constraint Correctness（制約の正確性）**:その他の制約を満たしたか。
1. **Brainstorming（ブレインストーミング）**
  - **Execution Attempt（実行の試み）**:モデルがユーザーが求めるアイデアをブレインストーミングしようとしたか。
  - **Constraint Correctness（制約の正確性）**:その他の制約を満たしたか。
1. **Open QA（オープンQ&A）**
  - **Execution Attempt（実行の試み）**:モデルが参照テキストに基づいて質問に答えようとしたか（正解である必要はない）。
  - **Constraint Correctness（制約の正確性）**:その他の制約を満たしたか。
---

### **ポイント**
- 各カテゴリーに応じたプロンプト指示と制約を理解し、それに基づいて応答を評価する。
- 特に**Execution Attempt（実行の試み）**と**Constraint Correctness（制約の正確性）**の両方を確認することが重要。