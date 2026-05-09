---
notion_id: 2a011a71-fda7-80d4-a630-ce01c16669aa
created: 2025-11-03
---
AI と LLM の学習は、段階的かつ実践的なアプローチで進めるのが最も効果的です。エンジニアリング背景を活かし、数学と実装スキルから始めて、応用に進むのがお勧めです。[1][2][3]

## 基礎知識の確認と習得
まず Python、線形代数、微積分、確率統計の基礎を固めます。既に工学部に在籍しているので、これらの概念は習熟しているはずですが、機械学習視点での復習が有益です。3Blue1Brown の「Essence of Linear Algebra」と StatQuest の統計シリーズで直感的な理解を深めます。[1]
機械学習の基礎は Andrew Ng の Machine Learning Specialization（Coursera または YouTube で無料）を 3 週間で完習すると良いでしょう。回帰、分類、クラスタリングの基本概念を習得できます。[1]

## Transformer アーキテクチャと NLP の理解
LLM の中核をなす Transformer 構造を学びます。3Blue1Brown の「Visual intro to Transformers」で視覚的な直感を得た後、Andrej Karpathy の「nanoGPT」（YouTube 2時間）で GPT をゼロから実装しながら理解します。[3]
次に注意機構（attention mechanism）を深掘りします。トークン化、自己注意、マルチヘッド注意、位置エンコーディングを順序立てて学び、実際に Hugging Face Transformers ライブラリで実装練習をします。[3]

## LLM 特化学習
LLM University（Cohere）または Stanford CS324: Large Language Models で、理論と実践の双方を学びます。設計、倫理、評価方法を含めた包括的な理解が得られます。[1]
Maxime Labonne の LLM コース（GitHub の mlabonne/llm-course）では LLM Scientist と LLM Engineer の 2 つのパスを提供しており、どちらに進むか選択できます。モデル構築志向なら Scientist、アプリケーション開発志向なら Engineer を選択してください。[3]

## 実践的なスキル習得
**微調整（Fine-tuning）**: QLoRA や LoRA を使った効率的なパラメータ調整を Hugging Face、Unsloth、Axolotl を使って実装します。実際に小規模なカスタムデータセットで Llama や Mistral モデルを調整する演習が効果的です。[1]
**RAG パイプライン**: LangChain または LlamaIndex を使い、ベクターデータベース（Chroma、FAISS）と連携した検索拡張生成を構築します。これにより外部知識をモデルに提供できます。[1]
**デプロイメント**: Streamlit または Gradio でプロトタイプ実装し、Hugging Face Spaces や ローカルサーバー（Ollama、LM Studio）で運用経験を積みます。[1]

## 推奨学習スケジュール
月 1～2 週：基礎（Python、数学、ML）
月 2～3 週：NLP と Transformer アーキテクチャ
月 4～6 週：LLM コース（LLM Scientist または Engineer 選択）
月 7～8 週：微調整とベクターデータベース実装
月 9～10 週：RAG パイプライン構築
月 11～12 週：本格的なアプリケーション開発またはモデル研究
学習を加速させるコンサルティング企業への就職志望を考えると、実装スキルと理論の両立、および実務的なアプリケーション構築経験が評価されます。GitHub でのプロジェクト公開や、個人開発による LLM ベースツール作成を並行すると、面接時の強力なポートフォリオになります。[4]
情報源
[1] The Roadmap for Mastering Language Models in 2025 [https://machinelearningmastery.com/the-roadmap-for-mastering-language-models-in-2025/](https://machinelearningmastery.com/the-roadmap-for-mastering-language-models-in-2025/)
[2] Learning Path for AI - Complete Guide to Mastery [https://zenvanriel.nl/ai-engineer-blog/ai-learning-path-complete-guide/](https://zenvanriel.nl/ai-engineer-blog/ai-learning-path-complete-guide/)
[3] mlabonne/llm-course [https://github.com/mlabonne/llm-course](https://github.com/mlabonne/llm-course)
[4] 25 Free Resources to Learn Generative AI in 2025 [https://www.linkedin.com/pulse/25-free-resources-learn-generative-ai-2025-subha-ilamathy-lknyc](https://www.linkedin.com/pulse/25-free-resources-learn-generative-ai-2025-subha-ilamathy-lknyc)
[5] Where to Start Learning LLMs? Any Practical Resources? [https://www.reddit.com/r/LLMDevs/comments/1imwn1y/where_to_start_learning_llms_any_practical/](https://www.reddit.com/r/LLMDevs/comments/1imwn1y/where_to_start_learning_llms_any_practical/)
[6] Top LLMs Courses for Beginners [2025] [https://www.coursera.org/courses?query=large+language+models&productDifficultyLevel=Beginner](https://www.coursera.org/courses?query=large%20language%20models&productDifficultyLevel=Beginner)
[7] Introduction to Large Language Models | Machine Learning [https://developers.google.com/machine-learning/resources/intro-llms](https://developers.google.com/machine-learning/resources/intro-llms)
[8] Start with Large Language Models (LLMs) [https://github.com/louisfb01/start-llms](https://github.com/louisfb01/start-llms)
[9] Machine Learning/AI Engineer | Codecademy [https://www.codecademy.com/learn/paths/machine-learning-engineer](https://www.codecademy.com/learn/paths/machine-learning-engineer)
[10] How I use LLMs [https://www.youtube.com/watch?v=EWvNQjAaOHw](https://www.youtube.com/watch?v=EWvNQjAaOHw)

