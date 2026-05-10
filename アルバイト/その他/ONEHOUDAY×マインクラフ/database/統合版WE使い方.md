---
notion_id: 2f811a71-fda7-80d5-a44b-cd3412770940
created: 2026-01-30
---
[https://n5v.net/command/block-item-id/](https://n5v.net/command/block-item-id/)


Minecraft Education Edition版WorldEditの使い方を総合的にまとめます。

## 基本セットアップ

## 初期設定
1. ワールドで `/tag @s add worldedit` を実行して権限を付与[[worldedit-be-docs.readthedocs](https://worldedit-be-docs.readthedocs.io/en/stable/commands/)]
1. 設定 → 遊び方（How to Play）でゲーム内ガイドを確認[[9minecraft](https://www.9minecraft.net/category/minecraft-shaders/)]
1. クリエイティブモードでの使用を推奨[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/f64de48d-fa34-4e8b-916f-8ddc01e14821/image.jpg)]

## ツールの入手方法
- コマンド：`/give @s bni:selection_wand`など[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/f64de48d-fa34-4e8b-916f-8ddc01e14821/image.jpg)]
- または、青い歯車の**Settings Tool**から各種ツールにアクセス[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/f64de48d-fa34-4e8b-916f-8ddc01e14821/image.jpg)]

## 基本ワークフロー：「選択 → 編集」

## 1. 範囲選択（Selection Wand）

## 選択ツールの入手[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/7c41ee34-8949-4a6a-b0f9-1cd47c56a42c/image.jpg)]
ツールボックスから「Selection Wand」（木の斧）を取得

## 範囲の選択方法[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/7c41ee34-8949-4a6a-b0f9-1cd47c56a42c/image.jpg)]
1. **Pos A（第1地点）**：ブロックを照準して**左クリック**（採掘動作）→ "Pos A Set"と表示
1. **Pos B（第2地点）**：対角線上のブロックを照準して**右クリック**（樹皮を剥ぐ動作）→ "Pos B Set"と表示
1. 選択範囲が青い線で表示されます

## 高度な選択機能（Sneak + Use）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/7c41ee34-8949-4a6a-b0f9-1cd47c56a42c/image.jpg)]
- **Expand/Contract**：各軸（X, Y, Z）に沿って範囲を拡大・縮小
- **Selection Info**：座標、サイズ、体積を表示
- **Clear Selection**：選択をリセット

## 2. 編集ツール（Edit Tool）
Selection Wandで範囲選択後、Edit Toolを使用してSelection Editor Menuにアクセス。[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/06bb1891-f734-473a-89eb-698fd66c07ba/image.jpg)]

## Fill Options（塗りつぶし）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/06bb1891-f734-473a-89eb-698fd66c07ba/image.jpg)]
| オプション | 機能 |
|---|---|
| Fill (Solid) | 選択範囲全体を埋める |
| Fill (Hollow) | 外殻のみ（1ブロック厚）を作り、内部を空洞に |
| Fill (Frame/Edges) | 12本のエッジと8つの角のみ |
| Fill (Walls) | 4つの垂直な壁のみ |

## Replace Blocks（ブロック置換）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/06bb1891-f734-473a-89eb-698fd66c07ba/image.jpg)]
- 置換元ブロックを指定（例：`stone,dirt,grass_block`）
- 置換先ブロックを指定（例：`glass`）
- 選択範囲内のすべての該当ブロックを置換

## その他の機能[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/06bb1891-f734-473a-89eb-698fd66c07ba/image.jpg)]
- **Count Blocks**：選択範囲内のすべてのブロックタイプと数をリスト表示
- **Generate Terrain**：地形を自動生成（後述）

## コピー・ペースト機能

## Copy Tool（コピー）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/b1d0fc61-4b62-4221-9add-adb8e5700333/image.jpg)]
- **Use**：選択範囲をクリップボードにコピー
- **Sneak + Use**：エンティティ（動物、アイテムフレームなど）を含めるか選択

## Cut Tool（切り取り）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/b1d0fc61-4b62-4221-9add-adb8e5700333/image.jpg)]
- **Use**：選択範囲をコピーして元のブロックを削除（空気で埋める）
- **Sneak + Use**：コピーオプションを開く

## Paste Tool（貼り付け）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/b1d0fc61-4b62-4221-9add-adb8e5700333/image.jpg)]
- **Use**：視線方向に対して相対的に貼り付け
- **Sneak + Use**：高度なオプション
  - **Paste at Original Location**：元の座標に正確に貼り付け
  - **Place Entities**：エンティティも貼り付けるか切り替え
  - **Integrity (0-100%)**：配置されるブロックの割合（低いと「崩れた」見た目）
  - **Rotation**：0°、90°、180°、270°回転
  - **Mirror**：X、Z、XZ軸で反転

## ブロック指定の方法

## 1. Single Block（単一ブロック）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/d6eaee46-896b-48db-82dc-bf41d437f28b/image.jpg)]
ブロックIDを入力：`stone`, `oak_log`, `minecraft:glass`

## 2. Weighted Block Mix（重み付きミックス）[ppl-ai-file-upload.s3.amazonaws+1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/b4cc1f60-1004-4b64-beeb-63c3b41258ce/image.jpg)
**フォーマット**：`block_id1:weight1,block_id2:weight2,block_id3:weight3`
**例**：`stone:5,cobblestone:3,andesite:2`
- Stone：50%（5/10）
- Cobblestone：30%（3/10）
- Andesite：20%（2/10）
**活用例**：[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/b4cc1f60-1004-4b64-beeb-63c3b41258ce/image.jpg)]
- 自然な壁：`stone:10,cobblestone:2,mossy_stone_bricks:1`
- ランダムパターン：`stone:20,coal_ore:1,iron_ore:1`
重みを省略すると各ブロックは同じ確率：`stone,dirt,gravel` = `stone:1,dirt:1,gravel:1`[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/b4cc1f60-1004-4b64-beeb-63c3b41258ce/image.jpg)]

## ブラシツール
すべてのブラシで**Sneak + Use**で設定メニューが開きます。[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/606ea93f-dc9d-4581-afa6-3a6b14a775a8/image.jpg)]

## Regular Brush（通常ブラシ）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/606ea93f-dc9d-4581-afa6-3a6b14a775a8/image.jpg)]
**用途**：ブロックのボリュームを配置
**設定**：
- **Shape**：Sphere、Cube、Cylinder、Pyramid、Octahedron、Dome、Bowl、Cone、Disk、Plate、Torus
- **Size**：半径または半分の幅
- **Hollow Shape**：外殻のみ配置
- **Material Source**：Manual Input、Active Palette、Saved Palette

## Paint Brush（ペイントブラシ）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/bcf99635-14dc-48c2-8f0d-b5050817c45a/image.jpg)]
**用途**：既存の空気以外のブロックを置換
**設定**：
- **Enable Masking**：特定のブロックのみをペイント
- **Mask Blocks**：カンマ区切りでブロックIDを指定（例：`stone,dirt`）
- **Mask Picker Tool**：ブロックを照準してUseで追加、Sneak + Useで削除

## Height Brush（高さブラシ）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/bcf99635-14dc-48c2-8f0d-b5050817c45a/image.jpg)]
**用途**：地形を上下させる
**Mode**：
- **Raise**：地形を上方向に引き上げ
- **Lower**：地形を下方向に押し下げ
**Amount**：使用ごとに何ブロック高く/低くするか

## Foliage Brush（植生ブラシ）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/2f918997-51f9-4a62-b7b9-77583ed2a2aa/image.jpg)]
**用途**：植物や植生を散布
**設定**：
- **Scatter Radius**：中心からの散布半径
- **Density (%)**：配置試行回数
- **Plant Source**：Preset（バイオームテーマ）、Custom Input、Active Palette、Saved Palette

## Line Tool（ラインツール）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/2f918997-51f9-4a62-b7b9-77583ed2a2aa/image.jpg)]
**用途**：2点間に直線を描画
**使い方**：
1. Pos Aを設定：開始地点で使用
1. Pos Bを設定 & 描画：終了地点（9ブロック以内）で使用

## パレットシステム

## Active Palette（アクティブパレット）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/e94adf4d-f6e5-47e5-9301-22902195356a/image.jpg)]
現在使用中の一時的なブロックミックス。
**作成方法**：
- **Palette Picker Tool**でブロックを照準してUse（追加）、Sneak + Use（削除）
- Saved Paletteを読み込む

## Saved Palette（保存パレット）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/e94adf4d-f6e5-47e5-9301-22902195356a/image.jpg)]
**Edit Tool → Manage Palettes**でアクセス：
| 機能 | 説明 |
|---|---|
| Load Saved Palette | Saved PaletteをActive Paletteにコピー |
| Edit Saved Palette | 名前とブロック文字列を直接編集 |
| Save Active Palette as New | 現在のActive Paletteを新しい名前で保存 |
| Update Saved | 読み込み済みSaved Paletteを現在の内容で上書き |
| Discard Active Palette Changes | Active Paletteをクリアしてリセット |
| Create from Selection | 選択範囲内のブロックを分析して新しいパレット作成 |
| Duplicate Loaded Saved Palette | 読み込み済みパレットを新しい名前でコピー |
| Delete Saved Palette | 完全に削除 |

## 地形生成（Terrain Generation）
**Edit Tool → Generate Terrain**からアクセス。[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/fadff488-edc9-403f-8edb-4ffeb938592d/image.jpg)]

## Material Settings（材料設定）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/fadff488-edc9-403f-8edb-4ffeb938592d/image.jpg)]
| 設定 | 説明 | 例 |
|---|---|---|
| Manual Base Material | 地形の主要部分 | `stone:10,deepslate:3,andesite:1` |
| Surface Material | 表層（トップレイヤー） | `grass_block:7,dirt:2,podzol:1` |
| Surface Layer Depth | 表層の厚さ | 3-5ブロック |

## Noise Type（ノイズタイプ）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/fadff488-edc9-403f-8edb-4ffeb938592d/image.jpg)]
- **Simplex**：一般的な起伏のあるノイズ
- **FBM (Fractional Brownian Motion)**：詳細で自然な地形（複数オクターブ）
- **Worley (Cellular)**：セルラーパターン、洞窟システム、結晶構造

## 主要パラメータ[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/fadff488-edc9-403f-8edb-4ffeb938592d/image.jpg)]
| パラメータ | 機能 | 推奨値 |
|---|---|---|
| Amplitude (Height) | 垂直範囲 | 穏やかな丘：5-15、劇的な山：30-60+ |
| Frequency (Scale) | ズームレベル | 広い特徴：0.01-0.03、小さい詳細：0.05-0.1 |
| Seed Source | 乱数の開始点 | Random、World Seed、Custom |

## FBMパラメータ[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/fadff488-edc9-403f-8edb-4ffeb938592d/image.jpg)]
- **Octaves**：ノイズレイヤーの数（1-8、推奨4-6）
- **Lacunarity**：連続オクターブの周波数乗数（典型的に約2.0）
- **Persistence (Gain)**：振幅の乗数（典型的に約0.5）

## Domain Warp（ドメインワープ）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/fadff488-edc9-403f-8edb-4ffeb938592d/image.jpg)]
別のノイズ関数で座標を変形させ、蛇行する川や侵食された地形を作成。
- **Warp Amplitude**：歪みの強さ
- **Warp Frequency**：ワープノイズのスケール

## その他の便利機能

## Undo & Redo[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/d6eaee46-896b-48db-82dc-bf41d437f28b/image.jpg)]
- **Undo Tool**：最後の操作を取り消し（複数ステップ可能）
- **Redo Tool**：取り消した操作を再適用

## Settings Tool（設定ツール）[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/118027375/f64de48d-fa34-4e8b-916f-8ddc01e14821/image.jpg)]
青い歯車アイコンで、Use時にメニューを開く：
**World Settings**：
- アクションバー情報の表示
- プレビューパーティクルエフェクト
- 最大Undo履歴
- デフォルトブラシサイズ
**Player Settings**：
- クリエイティブモード移動速度倍率
- Auto Spectator機能（壁に詰まらない）
- Extended Reach（遠距離配置）

## Navigation Wand（ナビゲーション）[[worldedit-be-docs.readthedocs](https://worldedit-be-docs.readthedocs.io/en/stable/quick_start/)]
`;navwand`コマンドでエンダーパールを入手：
- 普通に使用：見ている場所にテレポート
- Sneak + 使用：壁を貫通してテレポート

## 実践例

## 例1：石のプラットフォーム作成
1. Selection Wandで範囲選択（左クリック → 右クリック）
1. Edit Toolを使用
1. Fill (Solid)を選択
1. `stone`と入力

## 例2：自然な石の壁を作る
1. 範囲選択
1. Edit Tool → Fill (Walls)
1. `stone:10,cobblestone:2,mossy_stone_bricks:1`と入力

## 例3：建物をコピーして配置
1. Selection Wandで建物の範囲選択
1. Copy Toolを使用
1. 新しい場所に移動
1. Paste Tool → Sneak + Useで回転/ミラーオプション設定
1. 貼り付け

## 例4：丘陵地形を生成
1. 広い範囲を選択
1. Edit Tool → Generate Terrain
1. Base Material: `stone`、Surface Material: `grass_block`
1. Noise Type: FBM、Amplitude: 10、Frequency: 0.03
1. 生成実行

## トラブルシューティング

## 広範囲でエラーが出る場合[[youtube](https://www.youtube.com/watch?v=iEw24XJR4wc)]
`text/tickingarea add ~ ~ ~ ~111 ~111 ~111`
でチャンクを強制読み込み。終了後：
`text/tickingarea remove_all`

## バージョン互換性
v1.21.93の場合は1.21.80+版をダウンロード。必ずBehavior PackとResource Packの両方を有効化し、実験的機能（Holiday Creator Features、Beta APIs）をONにする。[[9minecraft](https://www.9minecraft.net/category/minecraft-shaders/)]
このまとめを参考に、効率的で創造的な建築をお楽しみください！