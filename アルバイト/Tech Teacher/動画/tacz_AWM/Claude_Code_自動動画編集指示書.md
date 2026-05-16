# Claude Code 自動動画編集指示書

このMarkdownは、Minecraft MOD解説動画をできるだけ自動編集するために Claude Code へ渡す作業指示書です。  
目的は、撮影済み素材から Shorts・長尺動画・サムネ用静止画を半自動で作成することです。

## 基本方針

私はMinecraftを実際に操作して録画するところだけを担当します。  
Claude Codeは、録画素材の整理、必要な切り抜き、字幕入れ、音量調整、Shorts化、長尺動画化、出力確認を担当してください。

元動画は絶対に上書きしないでください。  
編集済み動画、途中生成ファイル、ログ、編集判断の記録は必ず別フォルダに保存してください。

## 想定する動画内容

主な対象は Minecraft MOD 解説です。最初の優先対象は TaCZ です。

Shortsの役割:
- 視聴者に「このMODを使ってみたい」と思わせる
- 操作が直感的に分かるように、キーボード・マウス操作表示を見せる
- 長尺動画や販売PDFへ誘導する

長尺動画の役割:
- 導入方法、前提MOD、キー割り当て、基本操作、よくあるミスを順番に説明する
- 初心者が動画を見ながら同じ操作を再現できる状態にする

## 推奨フォルダ構成

動画編集用の作業フォルダは、以下のように作成してください。

```text
video_work/
├── input/
│   ├── raw/              # 録画した元動画
│   ├── voice/            # 別録り音声がある場合
│   ├── music/            # 使用許可があるBGMのみ
│   └── assets/           # ロゴ、画像、効果音、オーバーレイ素材
├── project/
│   ├── edit_plan.md      # 編集方針
│   ├── edit_decisions.csv
│   └── project.json
├── scripts/
│   ├── analyze_media.py
│   ├── make_shorts.py
│   └── make_longform.py
├── work/
│   ├── clips/
│   ├── captions/
│   └── thumbnails/
└── output/
    ├── shorts/
    ├── longform/
    └── preview/
```

## 使用ツール

優先して使うツール:
- `ffmpeg`: 切り抜き、結合、クロップ、字幕焼き込み、音量調整
- `ffprobe`: 動画の長さ、解像度、fps、音声情報の確認
- `python`: 編集用スクリプト、ファイル整理、CSV/JSON生成

あると便利なツール:
- Whisper系の文字起こしツール
- ImageMagick
- yt-dlpは必要な場合のみ。ただし他者動画の無断利用はしない

ツールが入っていない場合は、勝手に大きな環境変更をせず、必要なコマンドと理由を `edit_plan.md` に記録してください。

## Claude Codeへの作業ルール

1. まず `input/raw/` の動画をすべて調べる
2. `ffprobe` で各動画の長さ、解像度、fps、音声有無を確認する
3. 元動画を変更しない
4. 編集判断を `project/edit_decisions.csv` に残す
5. いきなり完成版だけ作らず、まず `output/preview/` に低容量プレビューを作る
6. プレビュー作成後、問題がなければ本番出力を作る
7. 出力後にファイルサイズ、尺、解像度、音声有無を確認する

## edit_decisions.csv の形式

```csv
source,start,end,use,caption,zoom,notes
raw/tacz_001.mp4,00:00:03.000,00:00:06.500,hook,"Realistic guns in Minecraft?",1.10,"射撃シーン"
raw/tacz_001.mp4,00:00:08.000,00:00:12.000,ads,"Right Click: Aim",1.15,"ADSを見せる"
raw/tacz_001.mp4,00:00:13.000,00:00:17.000,reload,"R: Reload",1.05,"リロード"
```

## Shortsの編集ルール

出力形式:
- 解像度: 1080x1920
- アスペクト比: 9:16
- fps: 元動画に合わせる。迷ったら60fps
- 尺: 20秒から35秒を基本にする
- 音声: ゲーム音を残し、必要なら少し強調する

構成:

```text
0-2秒:
Hook
"Realistic guns in Minecraft?"

2-7秒:
射撃
"Left Click: Fire"

7-12秒:
ADS
"Right Click: Aim"

12-17秒:
リロード・射撃モード
"R: Reload" / "G: Fire Mode"

17-24秒:
カスタム
"Z: Customize"

24-30秒:
誘導
"Full beginner guide on my channel"
```

字幕ルール:
- 海外向けなので英語を基本にする
- 1画面の文字量は少なくする
- 画面中央の照準、重要UI、キーボード表示を隠さない
- 文字は大きく、白文字＋黒縁を基本にする

推奨テキスト:
- `Realistic guns in Minecraft?`
- `Left Click: Fire`
- `Right Click: Aim`
- `R: Reload`
- `G: Fire Mode`
- `Z: Customize`
- `Full TaCZ guide on my channel`

## 長尺動画の編集ルール

出力形式:
- 解像度: 1920x1080
- アスペクト比: 16:9
- 尺: 8分から12分を目安にする

構成:

```text
1. What is TaCZ?
2. Required mods and Minecraft version
3. How to get guns and ammo
4. Basic controls
5. Aiming and shooting
6. Reloading and fire mode
7. Attachments and customization
8. Common beginner mistakes
9. PDF guide / website link
```

長尺では操作の再現性を重視してください。  
Shortsよりもテンポを少し落として、キー表示が読める時間を確保してください。

## TaCZ 操作表示の扱い

OBS録画時点で Input Overlay を重ねている場合は、その表示を活かしてください。  
キーボード・マウス表示が画面の重要部分を隠している場合は、クロップやズームの位置を調整してください。

TaCZで強調したい操作:

```text
Left Click: Fire
Right Click: Aim
R: Reload
G: Fire Mode
Z: Customize
H: Inspect
V: Melee / Zoom
O: Interact
C: Crawl
Alt + T: Settings
```

## ffmpeg処理の基本方針

Claude Codeは、毎回一発の長いコマンドで無理に処理せず、必要ならPythonスクリプトを作って管理してください。

例:

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input/raw/tacz_001.mp4
```

Shorts用の基本処理:
- 9:16にクロップ
- 必要なら中央やや上にゲーム画面を寄せる
- キーボード表示が見える位置を維持する
- 音量を均一化する
- 字幕を焼き込む

長尺用の基本処理:
- 16:9のまま使う
- 不要な待ち時間を切る
- 重要操作の前後は少し余白を残す
- チャプターごとに短いタイトルを入れる

## 自動解析で見るべきポイント

録画素材から以下を探してください。

- 銃を撃っている瞬間
- ADSしている瞬間
- リロードしている瞬間
- アタッチメント画面を開いている瞬間
- 敵や的に命中している瞬間
- 操作表示が光っている瞬間
- 失敗や詰まりが起きている瞬間

完全自動で判断できない場合は、候補クリップを `output/preview/clip_candidates.mp4` として並べ、どの箇所を使ったか `edit_decisions.csv` に記録してください。

## サムネイル用静止画

Shorts用:
- 基本的には不要

長尺用:
- `output/thumbnails/` に候補を3枚作る
- 銃を構えている場面を使う
- 文字案を別途 `thumbnail_text.txt` に出す

サムネ文字案:

```text
TaCZ Beginner Guide
Minecraft Gun Mod
All Controls Explained
```

## 禁止事項

- 元動画を上書きしない
- 著作権的に不明なBGMを勝手に追加しない
- 画面いっぱいに説明文を出さない
- キーボード表示や照準を字幕で隠さない
- 低画質な再エンコードを繰り返さない
- 失敗したコマンドを黙って無視しない

## 成果物

Claude Codeは作業完了時に以下を出してください。

```text
output/shorts/tacz_shorts_001.mp4
output/longform/tacz_beginner_guide.mp4
output/preview/
project/edit_plan.md
project/edit_decisions.csv
project/project.json
```

作成できなかったものがある場合は、理由と次に必要な素材を明記してください。

## 複数動画からのハイライト自動編集

複数の録画素材を渡された場合は、Claude Codeはハイライト抽出から編集までを自動化してください。

目的:
- いらない待ち時間、移動時間、メニュー操作の迷いをカットする
- 射撃、ADS、リロード、命中、カスタム画面など見どころを優先して使う
- 複数動画を自然につなげて、Shortsまたは長尺ハイライト動画にする
- 英字幕、AI音声、BGMを追加して海外向けに見やすくする

入力:

```text
video_work/input/raw/       # 複数の録画動画
video_work/input/music/     # 使用許可が明確なBGM
video_work/input/sfx/       # 使用許可が明確な効果音
video_work/input/voice/     # 別録り音声、またはAI音声用の設定
video_work/input/assets/    # ロゴ、キーボード表示、画像素材
```

追加で作成するファイル:

```text
project/highlight_candidates.csv
project/narration_script_en.md
project/subtitle_script_en.srt
project/audio_mix_plan.md
output/preview/highlight_candidates.mp4
output/shorts/highlight_shorts_001.mp4
```

## ハイライト候補の判定基準

Claude Codeは、完全自動で断定せず、まず候補をスコア化してください。

優先度が高い場面:
- 銃を撃っている
- 敵や的に命中している
- ADSして照準を合わせている
- リロードしている
- 射撃モードを切り替えている
- アタッチメントやカスタム画面を開いている
- 操作表示のキーやクリックが光っている
- 見た目に派手な反動、音、エフェクトがある

優先度が低い場面:
- 何もしていない待ち時間
- 移動だけが長い場面
- インベントリや設定画面で迷っている場面
- 同じ操作の繰り返し
- 画面が暗い、ブレている、見どころが少ない場面

`highlight_candidates.csv` は以下の形式にしてください。

```csv
source,start,end,score,category,reason,caption,narration
raw/tacz_001.mp4,00:00:03.000,00:00:06.800,92,fire,"gunfire and visible recoil","Left Click: Fire","This is TaCZ, a realistic gun mod for Minecraft."
raw/tacz_002.mp4,00:00:11.000,00:00:15.500,85,ads,"aiming down sight","Right Click: Aim","Right click to aim down sights."
```

## 自動カットのルール

カット方針:
- 見どころの前後に0.2秒から0.5秒の余白を残す
- 無音や動きが少ない部分は短くする
- 同じ操作が続く場合は一番見栄えの良い1回だけ残す
- 操作説明に必要な場面は、少し長めに残す
- Shortsではテンポを優先し、長尺では再現性を優先する

複数動画の連結:
- アクション同士は基本ハードカットでつなぐ
- 場面が大きく変わるときだけ短いクロスフェードを使う
- クロスフェードは0.15秒から0.35秒まで
- ズーム演出、画面揺れ、フラッシュは多用しない
- 視聴者が操作を理解するため、キーボード・マウス表示はなるべく見える状態にする

## 英字幕のルール

字幕は海外向けの短い英語にしてください。

基本ルール:
- 1字幕は1行から2行まで
- 1行は短くする
- 白文字、黒縁、やや太字
- 画面中央の照準やキーボード表示を隠さない
- Shortsでは画面下すぎるとUIで隠れるため、やや中央寄りに配置する

字幕例:

```text
Realistic guns in Minecraft?
Left Click: Fire
Right Click: Aim
R: Reload
G: Fire Mode
Z: Customize your gun
Full beginner guide on my channel
```

字幕は最終動画に焼き込みつつ、別ファイルでも保存してください。

```text
work/captions/highlight_shorts_001.ass
work/captions/highlight_shorts_001.srt
```

## AI音声のルール

Claude Codeはまず英語ナレーション原稿を作成してください。

保存先:

```text
project/narration_script_en.md
work/voice/narration_en.wav
```

AI音声生成のルール:
- 使用するTTSサービスやCLIが設定されている場合のみ音声生成する
- 未設定の場合は、ナレーション原稿だけ作り、必要な設定を `project/audio_mix_plan.md` に書く
- 他人の声を無断でクローンしない
- ナレーションは短く、動画内の操作を邪魔しない
- Shortsでは1文を短くする

ナレーション例:

```text
This is TaCZ, a realistic gun mod for Minecraft.
Left click to fire.
Right click to aim.
Press R to reload.
Press Z to customize your weapon.
```

音量目安:
- AI音声: 聞き取りやすく前に出す
- ゲーム音: 射撃音は残すが、声を邪魔しない
- BGM: 小さめに敷く

## BGMと効果音のルール

BGMは `video_work/input/music/` に入っている、利用許可が明確なものだけ使ってください。  
Claude Codeは著作権が不明なBGMを勝手に取得・追加しないでください。

ミックス方針:
- BGMは主役にしない
- 銃声、クリック音、リロード音は残す
- ナレーション中はBGMを少し下げる
- 音割れを防ぐ

目安:

```text
AI voice: -14 LUFS 付近
Game audio: -16 LUFS 付近
BGM: -24 LUFS から -20 LUFS 付近
Final mix peak: -1.0 dB 以下
```

効果音:
- 使用許可が明確なものだけ使う
- トランジション音は控えめにする
- 銃声やゲーム音を邪魔しない

## ハイライト動画の推奨構成

Shorts 30秒版:

```text
0-2秒:
Hook
"Realistic guns in Minecraft?"

2-8秒:
射撃ハイライト
"Left Click: Fire"

8-13秒:
ADS
"Right Click: Aim"

13-18秒:
Reload / Fire Mode
"R: Reload" / "G: Fire Mode"

18-24秒:
Customize
"Z: Customize"

24-30秒:
誘導
"Full guide on my channel"
```

60秒版:

```text
0-3秒:
Hook

3-15秒:
射撃とADS

15-25秒:
リロード、射撃モード、反動

25-40秒:
カスタム、アタッチメント

40-52秒:
初心者がつまずくポイント

52-60秒:
長尺動画・PDFへの誘導
```

## 複数動画ハイライト編集用プロンプト

Claude Codeに複数の動画を渡すときは、以下のプロンプトを使ってください。

```text
このフォルダ内の Claude_Code_自動動画編集指示書.md に従って、video_work/input/raw/ に入っている複数のMinecraft TaCZ録画からハイライト動画を自動編集してください。

やってほしいこと:
1. すべての動画を ffprobe で解析する
2. 見どころ候補を抽出して project/highlight_candidates.csv に記録する
3. いらない待ち時間や移動だけの部分をカットする
4. 複数動画を自然につなぐ
5. 英字幕を作成して焼き込む
6. 英語ナレーション原稿を作る
7. TTS環境が使える場合はAI音声を生成する
8. input/music/ に利用許可済みBGMがある場合だけBGMを追加する
9. まず output/preview/ にプレビューを作成する
10. 問題がなければ output/shorts/ に本番動画を出力する

元動画は絶対に上書きしないでください。
使ったクリップ、カット理由、字幕、ナレーションは必ず project/ に記録してください。
```

## Claude Codeに最初に渡すプロンプト

```text
このフォルダ内の Claude_Code_自動動画編集指示書.md に従って、Minecraft TaCZ解説動画の自動編集環境を作ってください。

まず input/raw/ の動画を解析し、Shorts 1本分の候補クリップを選び、output/preview/ にプレビュー動画を作成してください。

元動画は絶対に上書きしないでください。
編集判断は project/edit_decisions.csv に記録してください。
必要なスクリプトは scripts/ に作成してください。
```
