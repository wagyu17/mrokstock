---
notion_id: 18511a71-fda7-80aa-9482-e0895bd95b99
created: 2025-01-24
---
**和訳**
📚 **Workspace SxS API評価コースへようこそ！**
**このコースで学べること**:
•	プロジェクトの概要
•	作業を始める方法
•	プロンプトの評価方法
•	APIコールの評価方法（心配しないでください、そんなに難しくありません！）
•	個別のレスポンスを評価する方法
•	レスポンスを並べて比較・ランク付けする方法
**さあ、始めましょう！🚀**
**詳細な指示はこちらから**: [here](https://www.notion.so/%E3%83%AA%E3%83%B3%E3%82%AF%E6%9C%AA%E8%A8%98%E8%BC%89)
[https://docs.google.com/document/d/e/2PACX-1vRPV1bdP0HysjrMZTND5j3yohoFcvO9hqk6Fjn6wBkfB8SqS8yeflJ7oIaexU5X_TNufz_dFXkT001n/pub](https://docs.google.com/document/d/e/2PACX-1vRPV1bdP0HysjrMZTND5j3yohoFcvO9hqk6Fjn6wBkfB8SqS8yeflJ7oIaexU5X_TNufz_dFXkT001n/pub)


**和訳**
**AIのパフォーマンスを評価するための手順を以下に従ってください**:
1.	**タスクのコンテキストを読む**
•	ユーザーのクエリ、日付、過去の会話（利用可能な場合）を含む。
2.	**ユーザーのクエリを適切なカテゴリに分類する**
•	「Summarize（要約）」、「Find（検索）」、「Unsupported（未対応）」などに分類。
3.	**APIコールを正確性と関連性で評価する**。
4.	**AIのレスポンスを以下の基準で分析する**
•	根拠の明確さ（groundedness）、完全性（completeness）、理解度（understanding）、および出典の明示（attribution）。
5.	**提供された選択肢の中から最適なレスポンスを選ぶ**。

**和訳**
•	**日付 / 時間 / メールを確認する**
•	このセクションには、ユーザーのクエリ（プロンプト）の日付、時間、メールアドレスが表示される。
•	**日付形式**: 日付は「月/日/年」の形式で表示され、プロンプトの日付を反映している。
•	**過去の会話を確認する**
•	このセクションには、ユーザーとAIアシスタントとの過去の会話が含まれる。
**注意**: このフィールドは、該当タスクに過去の会話がない場合は空白になることがあります。
**タスクコンテキストの例:**
**日付 / 時間**:
•	**時間**: 2023年5月3日 11:05:18.000 -0700
•	**タイムゾーン**: アメリカ / ロサンゼルス
•	**名前**: Elizabeth Moran
•	**メールアドレス**: moranelizabeth16@gmail.com
**過去の会話**:
•	**ユーザー**: 私のメールを確認して、誰がボーイフレンドを持っているか教えてください。
•	**モデル**: あなたのメールによると、友人のChristina Jonesにはボーイフレンドがいます。
•	**ユーザー**: 彼女は結婚する予定ですか？
•	**モデル**: はい、Christina Jonesは結婚する予定です。

**和訳**
•	**これはユーザーがAIアシスタントに尋ねている内容です。**
•	**プロンプトを確認した後、ユーザーのリクエストに最も適した**「カテゴリ」**を選択する必要があります。**
**例のプロンプト**
**Turn #1 - プロンプト**
**Text**: “When is she getting married?”（彼女はいつ結婚しますか？）
**プロンプトカテゴリ**
**プロンプトカテゴリ**
以下の質問に基づいてレスポンスを分類してください。
•	**Summarize（要約）**: 情報を要約したり、メールの主要なポイントを抽出するよう求めるプロンプト。
例: “What are the main points of Steven’s release plan doc?”
（スティーブンのリリース計画文書の主なポイントは何ですか？）
•	**Q/A from content（コンテンツからのQ/A）**: メールの内容から回答を求めるプロンプト。
例: “Look in my email and see how much money did Jake say I owe him for the car”
（私のメールを見て、ジェイクが車の件で私にいくら払うべきだと言っていたか確認してください。）
•	**Find（検索）**: 特定のメールを見つけるようにAIアシスタントに依頼するプロンプト。
例: “Show all my starred emails from Sarah.”
（サラからのスター付きメールをすべて表示して。）
•	**Unsupported feature（未対応機能）**: ユーザーの受信トレイやドライブ上で、要約、検索、Q/A以外の操作を要求するプロンプト。
例: メールの転送、返信、下書きの作成、ドキュメントの開始や移動、削除、共有など。
例: “How many emails do I have?”（私のメールは何通ありますか？）
“Send that to James.”（それをジェームズに送ってください。）
“Delete it.”（削除してください。）
**注**: 「show（表示）」プロンプトはこのタイプに分類されるべきです。例: “Show all my starred emails from Sarah.”（サラからのスター付きメールをすべて表示して。）
•	**Not workspace（ワークスペースに関連しない）**: このワークスペースに関連がなく、プロンプトまたは過去の会話でメールを特定的に言及していないもの。
例: “What is the capital of Spain?”（スペインの首都はどこですか？）
•	**Bad prompt（不適切なプロンプト）**: リクエストとして理解できないもの、またはAIアシスタントとやり取りする実際のユーザーが尋ねるとは考えにくい不自然なプロンプト。
不適切なプロンプトの例: “what’s the email?”（メールは何ですか？）
不自然なプロンプトの例: “check my email to see who is my daughter?”（私の娘が誰なのか確認するためにメールをチェックしてください。）
**回答の選択肢**
•	Summarize
•	Q/A from content
•	Find
•	Unsupported feature
•	Not workspace
•	Bad prompt
**Save and Continue**（保存して続行）

**和訳**
📍 **プロンプトの分類**
•	**Summarize**（要約）
•	**Q/A from content**（コンテンツからのQ/A）
•	**Find**（検索）
•	**Unsupported feature**（未対応機能）
•	**Not Workspace**（ワークスペース外）
•	**Bad Prompt**（不適切なプロンプト）
📍 **APIコールスコア**
APIコールを**1から3のスケール**で評価してください。
📍 **APIコール: 範囲外のドメイン**
APIコールが「DOMAIN_OUT_OF_SCOPE」と表示されているかを確認してください。
📍 **完全性（Completeness）**
このレスポンスがプロンプトの指示にどれだけ従っているかを評価してください。
📍 **理解度（Understanding）**
このレスポンスを**あなたがどれだけ理解できるか**を評価してください。
📍 **根拠の確実性（Groundedness）**
レスポンスの正確性を、ファイルやメール内のコンテキストに基づいて評価してください。
📍 **出典評価（Attribution Rating）**
AIアシスタントが行った**出典の質**を測定します。AIアシスタントはレスポンス内で事実データを「引用」する必要があります。


**和訳**
**APIコールスコア**
プロンプトに基づいて、APIコールの正確さを1～3のスケールで評価します：
•	**スコア = 1**: APIコールが不正確。構文的に誤っている、または正しいアイテムを取得できない場合。
•	**スコア = 2**: APIコールが部分的に正しい。不要なオペレーターや非効率的な論理構成、または条件の一部が欠けている場合。
•	**スコア = 3**: APIコールが完全に正しい。プロンプトに対して適切な結果を取得できる場合。
**APIコールの基本構造**
APIコールは、**キー:バリューのペア**で構成されています。キーは「検索オペレーター」（例: after や before など）です。詳細については、**APIコールの基本構造**を参照してください。
**重要な注意事項**
•	**空白のAPIコール**: スコアは1とするべきです。
•	**APIコールが行われていない場合**: これは失敗と見なされ、スコアは1とするべきです。
•	**評価の前提**: APIコールが誤っている場合でも、取得されたメールとレスポンスを評価に進む必要があります。
•	**同一の取得アイテム**: Response 1とResponse 2で取得されたアイテムは常に同じですが、モデルのレスポンスは異なる場合があります。
**正しいAPIコールの例**
プロンプトは、ユーザーの昨日の全メールを要約するよう求めています。タスクコンテキストによると、この日は**2024/11/27**です。以下のAPIコールは正確と見なされます：
•	GmailToolを使用し、引数afterを「2024/11/27」、beforeを「2024/11/28」に設定しています。
このように、正確なAPIコールはプロンプトの要求を満たし、適切な結果を取得できます。


**和訳**
**APIコール: 範囲外のドメイン (DOMAIN_OUT_OF_SCOPE)**
クエリが「DOMAIN_OUT_OF_SCOPE」とマークされる場合：
ユーザーのリクエストがGmailまたはDriveに関連していない場合。
**例**: “When did France gain independence?”（フランスが独立したのはいつ？）
このクエリは、GmailやDriveの情報を必要としません（たとえ以前の会話でそれらのサービスが関与していても）。
**選択方法**
•	**NOを選択する場合**:
ユーザーのプロンプトがGmailまたはDriveに関連しているにもかかわらず、アシスタントが誤って「DOMAIN_OUT_OF_SCOPE」とマークした場合。
•	**YESを選択する場合**:
ユーザーのプロンプトが本当にGmailまたはDriveに関連しておらず、「DOMAIN_OUT_OF_SCOPE」が正しく使用されている場合。
**例**
**Gmail/Driveに関連している場合 (DOMAIN_OUT_OF_SCOPEではない)**:
**会話履歴**:
ユーザー: “Check my email to see what time I’m meeting Suzy tomorrow.”
アシスタント: “10AM.”
フォローアップクエリ: “And where are we meeting?”（どこで会う予定？）
このフォローアップはSuzyのメールを確認する必要があるため、GmailToolを使用する範囲内です。（範囲内であり、DOMAIN_OUT_OF_SCOPEではありません）
**Gmail/Driveに関連していない場合 (DOMAIN_OUT_OF_SCOPE)**:
フォローアップクエリが以下の場合:
•	“Draft a reply to Suzy to let her know I can’t make the meeting.”（Suzyに会議に行けないことを知らせる返信を作成してください。）
→ GmailToolには返信を作成する機能がないため、範囲外です。
または:
•	“Where is the meeting?”（どこで会う予定？）
→ Mapsを使用しないと答えられない場合、このデータはGmail/Driveに直接含まれていないため範囲外です。


**和訳**
**取得されたアイテムはユーザープロンプトに関連していますか？**
•	**YES**:
メールスレッドやファイルがユーザーのクエリに関連する情報を含んでいる場合（たとえ完全に質問に答えていなくても）。
**例**: ユーザーが「会議の駐車場情報」について尋ね、Dianaからの会議詳細のメールがある場合（駐車場情報が含まれていなくても）、そのスレッドは関連していると見なされます。
•	**NO**:
メールスレッドやファイルがユーザープロンプトに全く関連していない場合。
•	**NO RETRIEVED ITEMS**:
取得されたメールスレッドやファイルがない場合、「N/A - No attached items」（該当なし - 添付アイテムなし）を選択します。
**関連するアイテムが取得された例**
（具体例が提示されていないため詳細は省略）


**和訳**
**誤った言語でのレスポンス**
**シナリオ**:
レスポンスがプロンプトとは異なる言語で提供された場合。
**対応**:
1.	レスポンスを「言語が不適切」としてマークする。
2.	残りの評価基準については通常通り評価を進める。
**誤った言語でのレスポンスの例**:
**プロンプト**:
（例: 英語の質問）
**レスポンス**:
（例: プロンプトとは異なる、スペイン語やフランス語などで回答）

**和訳**
**Groundedness（根拠の確実性）**
Groundednessでは、コンテキストファイルに基づいてレスポンスが提供された情報をどれだけ正確に反映しているかを評価します。コンテキストファイルを確認し、レスポンスがどれほど根拠を持っているかを判断してください。
**評価基準**
1.	**Not grounded（根拠なし）**:
•	少なくとも1つの重要な情報が、取得されたメールスレッドに基づいて不正確または矛盾している。
2.	**Reasonably grounded（ある程度根拠あり）**:
•	レスポンス内の重要な情報の大部分は正確または一貫している。ただし、取得されたメールスレッドに対して重要度が低い情報が矛盾している、または追加情報が含まれる場合がある。
3.	**Completely grounded（完全に根拠あり）**:
•	レスポンス内のすべての情報が正確であり、一貫している。これは取得されたメールスレッドに基づいている。
**プロンプト例**
**プロンプト**:
“What is the sponsorship fee in the ‘Team Sponsorship Document’?”
（「Team Sponsorship Document」に記載されているスポンサー費はいくらですか？）
**レスポンス**:
（モデルが実際には存在しない情報を生成している場合。）
このケースでは、モデルが情報を「幻覚」しています（情報が実際には存在しない）。この場合、レスポンスは根拠を持っていないと評価されます。

**和訳**
**Completeness（完全性）**
Completenessでは、レスポンスがユーザーのリクエストのすべての部分に対応しているかどうかを評価します。この評価項目はコンテキストファイルとは無関係です。
**評価基準**
1.	**Incomplete（不完全）**:
•	ユーザープロンプトの質問に答えておらず、大量の情報を見落としている場合、または取得されたメールスレッドに基づいて間違った回答を提供している場合。
2.	**Partially complete（部分的に完全）**:
•	ユーザープロンプトの質問の大部分に答えているが、関連する可能性のある詳細をいくつか見落としている場合、または不要な情報を含む場合。
3.	**Complete（完全）**:
•	ユーザーの質問のすべての部分に答えている。不要な情報は含まれていない。
**プロンプト例**
**プロンプト**:
“What is the patient’s name in the analysis?”
（「分析」における患者の名前は何ですか？）
**レスポンス**:
（具体的なレスポンスは記載されていませんが、評価の基準として以下のように考えます）
•	**Incomplete**: 患者の名前を提供しない、または間違った名前を挙げている。
•	**Partially complete**: 患者の名前を提供するが、他の関連情報や文脈が不足している。
•	**Complete**: 患者の名前を正確に答え、不要な情報が含まれていない。


この場合、レスポンスは以下のように評価されます：
**プロンプト**
“What is the patient’s name in the analysis?”
（「分析」における患者の名前は何ですか？）
**レスポンス**
“The patient’s name in the urine analysis results is Sergei Volkov.”
（「尿検査結果における患者の名前はSergei Volkovです。」）
**完全性（Completeness）の評価**
**評価**: **Complete（完全）**
•	理由: ユーザーの質問（患者の名前は何ですか？）に対し、適切な答えを提供しています。
•	取得されたコンテキストファイル（medical_test_results_sergei_volkov’s_urinalysis）から正確な情報を引き出しています。
•	不要な情報は含まれておらず、すべての質問に答えています。


**和訳**
**Understanding（理解度）**
Understandingでは、レスポンスが分かりやすく明確であるかを評価します。この評価項目はコンテキストファイルとは無関係です。
**評価基準**
1.	**Not understandable（理解不能）**:
•	レスポンスが解釈しにくく、理解が困難な場合。
2.	**Partially understandable（部分的に理解可能）**:
•	レスポンスを理解できるが、不自然な表現やロボット的な文体、長さやフォーマットの問題があり、注意をそらす要素がある場合。
3.	**Understandable（理解可能）**:
•	レスポンスが分かりやすく、よく書かれており、フォーマットや長さ、文体が適切な場合。
**プロンプト例**
**プロンプト**:
“How many days does the designer have to provide an initial estimated time for completion of services per the Graphic Design Contract on my drive?”
（グラフィックデザイン契約書に基づき、デザイナーがサービス完了の初期見積もり時間を提示するまでの日数は何日ですか？）
**レスポンス**:
（具体的なレスポンスが提示されていないため、以下の評価基準を適用）
•	**Not understandable**: レスポンスが曖昧で、意味を解釈するのが困難な場合。
•	**Partially understandable**: レスポンスが文法的に問題があったり、不自然で注意をそらす要素がある場合。
•	**Understandable**: レスポンスが一貫性があり、文法的にも適切で、読みやすい場合。
**このケースでは**:
「The response is coherent, well-written and understandable.」
（レスポンスは一貫性があり、よく書かれており、理解可能です。）と記載されているため、評価は以下となる。
**評価**: **Understandable**

この場合、以下の評価が適用されます：
**プロンプト**
“How many days does the designer have to provide an initial estimated time for completion of services per the Graphic Design Contract on my drive?”
（ドライブにあるグラフィックデザイン契約書に基づき、デザイナーがサービス完了の初期見積もり時間を提示するまでの日数は何日ですか？）
**APIコール**
**DriveTool ARGUMENT**:
•	full_text:'Graphic Design Contract'
•	full_text:'Estimated Completion Time'
**レスポンス**
“According to your Drive’s Graphic Design Services Contract, the designer must provide you with an initial estimate of the time it will take to complete the services within 10 days of signing the contract.”
（ドライブにあるグラフィックデザインサービス契約書によると、デザイナーは契約締結後10日以内にサービス完了の初期見積もり時間を提示する必要があります。）
**Understanding（理解度）の評価**
•	**評価基準**:
1.	レスポンスが分かりにくい、または意味を解釈できない → **Not understandable**
2.	レスポンスを理解できるが、不自然な表現や文体、フォーマットが目立つ → **Partially understandable**
3.	レスポンスが分かりやすく、一貫性があり、文法やフォーマットが適切 → **Understandable**
•	**このレスポンスの評価**: **Understandable**
•	理由:
•	レスポンスは一貫性があり、適切な文法で書かれており、質問に正確に答えています。
•	フォーマットや文体も自然で、読みやすいです。


**和訳**
**Attribution（出典）**
Attributionでは、AIアシスタントのレスポンス内での出典の質を評価します。アシスタントは、使用した事実情報について、取得したメールやファイルを参照してユーザープロンプトに答える必要があります。
アシスタントは**インライン出典形式**を使用する必要があります。取得された情報を含む各文には、文末に番号（例: [1]）を付け、その番号が取得されたメールスレッド番号に対応している必要があります。
**評価基準**
1.	**Attribution is incorrect（出典が不適切）**:
•	情報の大部分に出典が付けられていない、または古い「Reference:」形式などの代替形式を使用している場合。
2.	**Attribution is partially correct（出典が部分的に正しい）**:
•	取得された情報を含む文の少なくとも半分には適切に出典が付けられているが、一部の情報に出典がない、または誤った出典がある場合。
3.	**Attribution is correct（出典が正しい）**:
•	レスポンス内で使用されたすべての情報が正しい形式で適切に出典されている場合。
**注意**:
箇条書き形式の出典（Bullet-point attribution）は有効な形式とみなされ、許容されます。
**例**
1.	**不適切な出典の例**（Attribution is incorrect）
•	アシスタント:
“Alexandra’s dog passed away [1]. She is very sad about it and is going to take some time to grieve. She wanted to let her family know about her dog’s passing and asked them to share any photos or memories they have of him.”
**理由**: 取得された情報に出典がほとんど付けられていない。
2.	**部分的に正しい出典の例**（Attribution is partially correct）
•	アシスタント:
“Alexandra’s dog passed away [1]. She is very sad about it and is going to take some time to grieve [1]. She wanted to let her family know about her dog’s passing and asked them to share any photos or memories they have of him.”
**理由**: 一部の文に出典がない。
3.	**正しい出典の例**（Attribution is correct）
•	アシスタント:
“Alexandra’s dog passed away [1]. She is very sad about it and is going to take some time to grieve [1]. She wanted to let her family know about her dog’s passing and asked them to share any photos or memories they have of him [1].”
**理由**: すべての文に正しく出典が付けられている。


**和訳**
**どちらのレスポンスが優れているか選択し、1～2文でその理由を記述してください。**
APIコール、根拠の確実性（Groundedness）、完全性（Completeness）、理解度（Understanding）、および出典（Attribution）の観点でより優れたレスポンスを選んでください。
**注意**:
2つのレスポンスが全く同一の場合は、どちらか一方を選択して構いません。これらは互換性があります。


1.	**Response 1**と**Response 2**のAPIコールやレスポンスが正確にどのような内容なのか。
2.	それぞれの回答の根拠（Groundedness）、完全性（Completeness）、理解度（Understanding）、出典（Attribution）のどの評価基準が高いかを確認する。
あなたが提供したスクリーンショットを見る限り、以下のアプローチでどちらが優れているかを判断します：
**基準に基づく評価**
1.	**APIコールの適切性**:
•	Response 1 と Response 2 の API コールが、プロンプトに対して適切であるか。
2.	**根拠（Groundedness）**:
•	提供されたメール内容に基づいて、レスポンスが正確か。
3.	**完全性（Completeness）**:
•	レスポンスがプロンプトの要求を完全に満たしているか。
4.	**理解度（Understanding）**:
•	レスポンスが分かりやすく、適切に書かれているか。
5.	**出典（Attribution）**:
•	情報が正しく引用されているか。
どちらが良いレスポンスか選び、その理由を1〜2文で説明する際は、これらの基準を基にしてください。
もし具体的なガイドラインが必要であれば教えてください！


