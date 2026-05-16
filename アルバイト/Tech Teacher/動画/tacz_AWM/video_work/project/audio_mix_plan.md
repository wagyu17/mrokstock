# Audio Mix Plan — TaCZ AWM Shorts

## 現状（tacz_shorts_001.mp4）
- ゲーム音のみ。`loudnorm=I=-15:TP=-1.5:LRA=11` でラウドネス均一化済み。
- BGM・ナレーションは未追加。

## AI音声を追加する場合
1. TTSサービス/CLI を設定（例: 環境変数や設定ファイル）。本リポジトリには未設定。
2. `narration_script_en.md` のプレーンテキストを音声化 → `work/voice/narration_en.wav`。
3. ffmpeg で合成（目安レベル）:
   - AI voice: -14 LUFS 付近（前に出す）
   - Game audio: -16 LUFS 付近（射撃音は残す）
   - BGM: -24〜-20 LUFS（小さく敷く）
   - Final mix peak: -1.0 dB 以下
4. ナレーション中は `sidechaincompress` でゲーム音/BGMを軽く下げると聞き取りやすい。

## BGMを追加する場合
- `input/music/` に**利用許可が明確な**ファイルを置く（著作権不明のものは使用禁止）。
- 現在 `input/music/` は空のため未追加。

## 合成コマンド例（音声が揃った場合）
```
ffmpeg -i output/shorts/tacz_shorts_001.mp4 -i work/voice/narration_en.wav -i input/music/bgm.mp3 \
  -filter_complex "[0:a]loudnorm=I=-16:TP=-1.5[game]; \
                   [1:a]loudnorm=I=-14:TP=-1.5[voice]; \
                   [2:a]loudnorm=I=-22:TP=-1.5,volume=0.5[bgm]; \
                   [game][bgm]amix=inputs=2:duration=first[bed]; \
                   [bed][voice]amix=inputs=2:duration=first,alimiter=limit=0.9[mix]" \
  -map 0:v -map "[mix]" -c:v copy -c:a aac -b:a 192k output/shorts/tacz_shorts_001_mixed.mp4
```
