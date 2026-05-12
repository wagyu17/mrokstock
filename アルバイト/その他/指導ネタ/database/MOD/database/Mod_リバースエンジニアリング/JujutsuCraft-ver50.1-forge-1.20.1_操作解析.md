# Jujutsu Craft ver50.1 操作解析メモ

解析対象:

`JujutsuCraft-ver50.1-forge-1.20.1.jar`

作成日: 2026-05-12

## 結論

この mod は「技ごとに直接ホットキーが割り当てられている」方式ではなく、基本的には **技を選択してから発動する** 方式です。

基本操作は次の流れです。

1. `R` で使用する技を切り替える
2. `Z` で選択中の技を発動する
3. `V` は現在の術式に応じた「メイン技」を自動選択して即発動する

## 基本キー

| キー | 内部キー名 | 動作 |
|---|---|---|
| `R` | `key_change_technique` | 技切替 |
| `Shift + R` | `key_change_technique` | 技を逆順に切替 |
| `Z` | `key_start_technique` | 選択中の技を発動 |
| `X` | `key_reset_technique` | 技選択をリセット |
| `M` | `key_reverse_cursed_technique` | 反転術式を使用。押している間有効、離すと解除 |
| `S` | `key_backstep` | バックステップ用フラグ。説明上はジャンプが必要 |
| `N` | `key_domain_amplification` | 領域展延の ON/OFF |
| `Space` | `key_space` | ダブルジャンプ |
| `W` | `key_forward` | mod 内部の前進入力フラグ |
| `C` | `key_switch_cursed_technique` | 1つ目/2つ目の術式を切替 |
| `V` | `key_use_main_skill` | 現在の術式のメイン技を即使用 |
| `A` | `key_a` | mod 内部の左入力フラグ |
| `D` | `key_d` | mod 内部の右入力フラグ |

キー設定は Minecraft の操作設定に `Jujutsu Craft` カテゴリとして登録されています。必要ならゲーム内の「設定 → 操作設定」から変更できます。

## 操作の考え方

### 技切替

`R` を押すと、現在の術式で使用可能な技候補を順番に切り替えます。

プレイヤーがスニーク中、つまり通常設定なら `Shift` を押しながら `R` を押すと、逆順に切り替わります。

内部では `PlayerSelectCurseTechnique` という数値が増減し、その番号に対応する技名、消費呪力、物理攻撃扱いかどうか、パッシブ技かどうかが決まります。

### 技発動

`Z` を押すと、現在選択されている技が発動します。

内部では `StartCursedTechniqueProcedure` が呼ばれ、以下のようなチェックが行われます。

- 呪力が足りているか
- クールタイム中ではないか
- 呪術使用不可状態ではないか
- スペクテイターではないか
- 技に必要な習得条件を満たしているか

条件を満たさない場合は「使用できない」系のメッセージが表示されます。

### メイン技ショートカット

`V` は、現在の術式に応じた代表技を一時的に選択して、そのまま `Z` 相当の発動処理を実行します。

内部処理としては次の流れです。

1. 現在の選択技を保存
2. 術式ごとのメイン技番号に切替
3. 技切替処理を実行
4. 選択できた場合に発動
5. 元の選択技へ戻す

## `V` で発動する主なメイン技

| 術式/キャラ | `V` の選択番号 | 発動する主力技 |
|---|---:|---|
| 両面宿儺 | 5 | 解 |
| 五条悟 | 5 | 無下限呪術 |
| 狗巻棘 | 8 | 「動くな」 |
| 漏瑚 | 6 | 焼尽 |
| 乙骨憂太 | 10 | 里香/リカ系 |
| 伏黒恵 | 4 | 術式解除 |
| 鹿紫雲一 | 5 | 稲妻 |
| 陀艮 | 7 | 式神 猛魚 |
| 九十九由基 | 10 | 星の怒り |
| 脹相 | 6 | 百斂 |
| 冥冥 | 15 | 神風 |
| 石流龍 | 5 | グラニテブラスト |
| 七海建人 | 5 | 線分 |
| 花御 | 6 | 木の毬 |
| 真人 | 5 | 無為転変 |
| 魔虚羅 | 5 | 速攻撃 |
| 髙羽史彦 | 6 | 飛び蹴り |
| 夏油傑 | 10 | 術式解除 |
| 禪院直哉 | 5 | 投射呪法 |
| 東堂葵 | 5 | 不義遊戯 |
| 虎杖悠仁 | 5 | 逕庭拳 |
| 禪院甚壱 | 5 | 「拳」 |
| 黒沐死 | 6 | ゴキブリの波 |
| 裏梅 | 5 | 氷の槍 |
| 疱瘡婆 | 5 | 墓 |
| 禪院扇 | 11 | 剣技-1- |
| 日車寛見 | 20 | 領域展開 誅伏賜死 |
| 天使 | 15 | 邪去侮の梯子 |
| 秤金次 | 6 | シャッター |
| ミゲル | 5 | 祈祷の歌 |
| 日下部篤也 | 5 | シン・陰流 簡易領域 |
| 禪院長寿郎 | 5 | 石槍 |
| 夜蛾正道 | 20 | 領域展開 |
| 釘崎野薔薇 | 6 | 簪 |
| 吉野順平 | 5 | 澱月 |
| 西宮桃 | 5 | 鎌異断 |
| ドルゥヴ・ラクダワラ | 10 | 術式解除 |
| 烏鷺亨子 | 10 | 宇守羅彈 |
| 万 | 8 | 液体金属: 矢 |
| 猪野琢真 | 5 | 一番 獬豸 |
| 虎杖香織 | 10 | 反重力機構 術式反転 |
| 朧絶 | 5 | 朧絶の呪霊 |
| レジィ・スター | 5 | 包丁 |
| 黄櫨折 | 5 | 歯 |
| 禪院蘭太 | 10 | 邪視 |
| 水晶の呪霊 | 5 | 転がる |

## 特殊キー

### `G`: 簡易領域

`G` は簡易領域を使用します。

条件を満たしている場合、落花の情が優先される場合があります。習得状態、呪力、クールタイム、現在の効果状態によって挙動が変わります。

### `M`: 反転術式

`M` は反転術式です。

押したときに `PRESS_M` が true になり、反転術式効果が付与されます。キーを離すと効果が解除され、`PRESS_M` が false に戻ります。

プレイヤーの場合は、反転術式の習得状況と呪力量が条件になります。

### `N`: 領域展延

`N` は領域展延の切替です。

すでに領域展延が付いている場合は解除し、付いていない場合は習得条件を確認して付与します。

### `Space`: ダブルジャンプ

`Space` は通常の Minecraft ジャンプとは別に、mod 側で `DOUBLE_JUMP_EFFECT` が付いているときに追加移動を行います。

`W` または `S` を押している場合、視線方向または逆方向へ勢いが付きます。

### `S`: バックステップ

`S` は単体で即座にバックステップするというより、内部的には `PRESS_S` フラグを立てます。

実際のバックステップ処理はジャンプイベント側で判定されており、英語のキー説明にも `Backstep (Need to jump)` とあります。

## 内部実装メモ

キー登録クラス:

`net.mcreator.jujutsucraft.init.JujutsucraftModKeyMappings`

主な入力メッセージ:

- `KeyChangeTechniqueMessage`
- `KeyStartTechniqueMessage`
- `KeyResetTechniqueMessage`
- `KeyReverseCursedTechniqueMessage`
- `KeySimpleDomainMessage`
- `KeyDomainAmplificationMessage`
- `KeyUseMainSkillMessage`
- `KeySpaceMessage`
- `KeyForwardMessage`
- `KeyBackstepMessage`
- `KeyAMessage`
- `KeyDMessage`

主な処理クラス:

- `KeyChangeTechniqueOnKeyPressedProcedure`
- `KeyChangeTechniqueOnKeyPressed2Procedure`
- `KeyChangeTechniqueOnKeyPressed3Procedure`
- `KeyChangeTechniqueOnKeyPressed4Procedure`
- `KeyChangeTechniqueOnKeyPressed5Procedure`
- `KeyStartTechniqueOnKeyPressedProcedure`
- `StartCursedTechniqueProcedure`
- `TechniqueDecideProcedure`
- `KeyUseMainSkillOnKeyPressedProcedure`

言語ファイル:

- `assets/jujutsucraft/lang/ja_jp.json`
- `assets/jujutsucraft/lang/en_us.json`
- `assets/jujutsucraft/lang/ko_kr.json`

## 解析時の注意

この mod は MCreator 製で、クラス名と処理名がかなり自動生成寄りです。

技そのものの発動は `Z` だけで完結しているわけではなく、事前に `R` によって `PlayerSelectCurseTechnique` が正しく選択されている必要があります。

また、表示上の技名は言語ファイルから取得されるため、内部コードでは技名そのものではなく `jujutsu.technique...` や `entity.jujutsucraft...` の翻訳キーとして扱われています。
