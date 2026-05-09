---
notion_id: 16911a71-fda7-80c1-9a9c-fda7a8936666
created: 2024-12-27
---
[[具体例1]]
[[具体例2]]
[[具体例3]]
[[具体例4]]

**Instruction Followingについて**
Instruction Followingの評価は、タスクの重要な部分を占める.目標は、モデルの応答がユーザーの意図を正確に反映しているか確認することである.
---

### **Instruction Followingの評価基準**
1. **Prompt Request Coverage (プロンプトのカバレッジ)**
  - 応答がプロンプトで求められたすべての要素を網羅しているかどうかを評価する.
  - プロンプトの明示的（Explicit）および暗黙的（Implicit）な指示を満たしているか確認.
  **例:**
  - **プロンプト**: "Provide me some of the main causes of air pollution and describe their impacts."
  - **悪い応答**: "Air pollution is bad. It has many causes."
    - **問題点**: 原因や影響について具体的に述べておらず、プロンプトの要求を満たしていない.
  - **良い応答**:
    - "Air pollution is caused by things like car emissions, factories, and burning fossil fuels. These causes release harmful chemicals into the air, which can make it harder to breathe and cause health problems like asthma. It also harms the environment by damaging plants and contributing to climate change."
    - **理由**: 明示的な指示（原因と影響を説明）に応え、暗黙的な詳細説明も提供している.
1. **Constraints (制約)**
  - プロンプトが応答に求めるルールや条件をモデルが守っているか確認する.
  - 制約は、応答に含めるべき内容や避けるべき内容を定義する.
  **例:**
  - **プロンプト**: "Explain quantum physics like I'm 5 years old."
  - **良い応答**:
    - "Quantum physics is about how tiny things, like the building blocks of everything around us, behave. Imagine everything is made up of little invisible pieces called particles. These particles don’t follow the normal rules like a ball or a car does. They can be in two places at the same time, or they can act like a wave in the water. It’s like magic rules for the smallest things in the world! Scientists study these strange rules to understand how everything works deep down."
    - **理由**: 簡単な言葉を使用し、5歳の子供が理解できるように具体例を用いている.
  - **悪い応答**:
    - "Quantum physics is a branch of science that deals with the behavior of particles at the atomic and subatomic level. It explores concepts such as wave-particle duality, the uncertainty principle, and quantum entanglement. These phenomena are described using complex mathematical models and require an understanding of advanced physics to fully grasp."
    - **問題点**: 難解な用語や技術的な説明を使用し、5歳の子供が理解できない内容となっている.
---

### **明示的 (Explicit) vs 暗黙的 (Implicit) 指示**
1. **明示的 (Explicit)**:
  - プロンプトに直接記載されている指示.
  - 例: "Rewrite the following paragraph using a tone that is directed to kindergarten students."
    - **明示的な指示**: 幼稚園児向けのトーンで段落を書き直す.
1. **暗黙的 (Implicit)**:
  - プロンプトに直接記載されていないが、文脈から推測される指示.
  - 例: "I am a kindergarten teacher... Please rewrite the following paragraph in a way that I can talk about it during class."
    - **暗黙的な指示**: 幼稚園児向けに適したトーンで段落を書く.
---

### **評価の質問**
- 応答はプロンプトの明示的および暗黙的な要求に応えているか?
- 制約（特定のトピック、スタイル、言葉遣いなど）を守っているか?
この基準を使用して、モデルの応答がユーザーの期待に応えているかを評価することができる.

---


### **重要なポイント**
1. **正確な内容だけでなく、フォーマットも評価対象**:
  - プロンプトで指定されたフォーマットに従うことが求められる。
  - 正しい内容であっても、フォーマットが守られていなければ減点対象。
1. **評価基準**:
  - 「指示に従ったかどうか」を確認する際、フォーマットの遵守が含まれる。