# Claude Code 複数動画ハイライト編集プロンプト

以下をClaude Codeに貼り付けて使ってください。

```text
このフォルダ内の Claude_Code_自動動画編集指示書.md に従って、video_work/input/raw/ に入っている複数のMinecraft TaCZ録画からハイライト動画を自動編集してください。

目的:
- いらない待ち時間や移動だけの部分を自動でカットする
- 射撃、ADS、リロード、カスタム、命中などの見どころを優先して使う
- 複数動画を自然につなぐ
- 海外向けの英字幕を追加する
- 英語ナレーション原稿を作る
- TTS環境が使える場合はAI音声を生成する
- input/music/ に利用許可済みBGMがある場合のみBGMを追加する
- まずプレビューを作り、問題がなければ本番動画を出力する

作業手順:
1. すべての動画を ffprobe で解析する
2. 見どころ候補を project/highlight_candidates.csv に記録する
3. 候補クリップを output/preview/highlight_candidates.mp4 にまとめる
4. 30秒前後のShorts版を作る
5. 英字幕を work/captions/ に保存し、動画にも焼き込む
6. 英語ナレーション原稿を project/narration_script_en.md に保存する
7. AI音声が生成できる環境なら work/voice/narration_en.wav を作成する
8. BGMがある場合は音量を下げて追加する
9. output/preview/ に低容量プレビューを書き出す
10. 最終版を output/shorts/highlight_shorts_001.mp4 に保存する

重要:
- 元動画は絶対に上書きしない
- 著作権が不明なBGMや効果音を勝手に使わない
- 画面中央の照準やキーボード表示を字幕で隠さない
- 使ったクリップ、カット理由、字幕、ナレーションは必ず project/ に記録する
- できない作業があれば、理由と次に必要な素材を project/edit_plan.md に書く
```

## 動画を入れる場所

```text
video_work/input/raw/
```

## BGMを入れる場所

```text
video_work/input/music/
```

利用許可が明確なBGMだけ入れてください。  
BGMが入っていない場合、Claude CodeはBGMなしで編集して構いません。

