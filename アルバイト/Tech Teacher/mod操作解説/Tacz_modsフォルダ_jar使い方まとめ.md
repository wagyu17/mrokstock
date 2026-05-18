# Tacz インスタンス mods フォルダ jar 使い方まとめ

解析対象フォルダ:

```text
C:\Users\tomot\curseforge\minecraft\Instances\Tacz\mods
```

解析日: 2026-05-18  
対象環境: Minecraft 1.20.1 / Forge 系

このメモは、jar 内の `META-INF/mods.toml`、言語ファイル、キー登録クラス、コマンド登録クラスを確認してまとめたものです。  
コマンドは基本的にチート許可または OP 権限が必要です。授業や解説用ワールドでは、作業前にバックアップを取ってください。

## 1. 早見表

| jar | Mod名 | 主な役割 | コマンド |
|---|---|---|---|
| `tacz-1.20.1-1.1.8-release.jar` | Timeless & Classics Guns: Zero | 銃、弾薬、アタッチメント、ガンスミステーブル | `/tacz ...` |
| `simpleenemymod-1.20.1-0.1.4-beta.jar` | [SEM] Simple Enemy Mod | TaCZ 用の武装 NPC、部隊、イベント | `/sem ...` |
| `mobbattle-1.20.1-2.5.3-forge.jar` | Mob Battle Mod | Mob 同士を戦わせるクリエイティブ用ツール | 専用コマンドなし |
| `infernalmobs-1.20.1.11.jar` | Infernal Mobs | 強化 Mob、ランダム能力、追加ドロップ | `/feclass`, `/spawninfernal` |
| `worldedit-mod-7.2.15.jar` | WorldEdit | 大規模建築、範囲編集、コピー、ブラシ | `//...`, `/brush`, `/schem` など |
| `born_in_chaos_[Forge]1.20.1_1.7.5.jar` | Born in Chaos | 敵 Mob、武器、素材、構造物系追加 | 専用コマンドなし |
| `Neat-1.20.1-41-FORGE.jar` | Neat | Mob の体力バー表示 | 専用コマンドなし |
| `geckolib-forge-1.20.1-4.8.3.jar` | GeckoLib 4 | アニメーション用ライブラリ | 専用コマンドなし |
| `cloth-config-11.1.136-forge.jar` | Cloth Config v10 API | Mod 設定画面用ライブラリ | 専用コマンドなし |
| `player-animation-lib-forge-1.0.2-rc1+1.20.jar` | Player Animator | プレイヤーアニメーション用ライブラリ | 専用コマンドなし |

## 2. 依存関係の見方

この構成では、主役は `TaCZ`、`Simple Enemy Mod`、`WorldEdit`、`Mob Battle`、`Infernal Mobs` です。

- `simpleenemymod` は `tacz` が必須です。TaCZ がないと起動できません。
- `geckolib` は Mob や銃系 Mod のアニメーション補助として使われます。
- `cloth-config` は TaCZ などの設定画面を開くための補助です。
- `player-animation-lib` はアニメーション系の補助ライブラリです。
- `Neat` は見た目補助で、ゲーム内容そのものはほぼ変えません。

## 3. TaCZ

jar: `tacz-1.20.1-1.1.8-release.jar`  
Mod ID: `tacz`

銃、弾薬、アタッチメント、ガンスミステーブルを追加する Mod です。授業では「銃を作る」「弾を込める」「撃つ」「アタッチメントを付け替える」の流れを説明すると使いやすいです。

### 基本操作

| 操作 | 初期キー | 内容 |
|---|---|---|
| 射撃 | 左クリック | 銃を撃つ |
| エイム / ADS | 右クリック | 狙う |
| リロード | `R` | 対応する弾薬を装填 |
| 射撃モード切替 | `G` | セミ、バースト、フルオートなどを切替 |
| 武器を見る | `H` | 銃の確認アニメーション |
| カスタマイズ | `Z` | アタッチメント編集画面を開く |
| 銃を持ったままインタラクト | `O` | チェストや作業台などを開く時に使う |
| ズーム / 近接 | `V` | ADS 中はズーム、通常時は近接攻撃 |
| 伏せる | `C` | 伏せ動作 |
| 設定画面 | `Alt + T` | Cloth Config がある場合に TaCZ 設定を開く |

`V` はズームと近接が同じキーです。ADS 中かどうかで挙動が変わります。

### 基本の遊び方

1. クリエイティブタブまたはレシピから `Gun Smith Table` を用意します。
2. 銃、弾薬、アタッチメントを作成します。
3. 銃と対応弾薬をインベントリに入れます。
4. 銃を持って `R` でリロードします。
5. 右クリックで狙い、左クリックで撃ちます。
6. `Z` でアタッチメントを付け替えます。
7. 必要に応じて `G` で射撃モードを切り替えます。

### TaCZ コマンド

jar 内の `com.tacz.guns.command.RootCommand` から確認したルートコマンドは `/tacz` です。権限レベル 2 以上が必要です。

| コマンド | 用途 | 例 |
|---|---|---|
| `/tacz reload` | TaCZ の銃パック、リソース、設定を再読み込み | `/tacz reload` |
| `/tacz overwrite <true|false>` | デフォルト銃パックの上書き設定を切替 | `/tacz overwrite false` |
| `/tacz config <key> <true|false>` | 同期設定を切替 | `/tacz config defaultTableLimit true` |
| `/tacz debug <true|false>` | TaCZ のデバッグモードを切替 | `/tacz debug true` |
| `/tacz dummy <target> <amount>` | 対象が持っている銃にダミー弾数を設定 | `/tacz dummy @p 999` |
| `/tacz attachment_lock <target> <true|false>` | 対象が持つ銃のアタッチメントロックを切替 | `/tacz attachment_lock @p true` |
| `/tacz hide_tooltip_part <target> <mask>` | 銃ツールチップの一部を非表示にするビットマスクを設定 | `/tacz hide_tooltip_part @p 0` |
| `/tacz convert` | 旧形式パックなどの変換処理を実行 | `/tacz convert` |

`/tacz config` の `key` は以下を確認済みです。

| key | 内容 |
|---|---|
| `defaultTableLimit` | ガンスミステーブルのデフォルトレシピ制限 |
| `serverShootNetworkCheck` | サーバー側の射撃ネットワークチェック |
| `serverShootCooldownCheck` | サーバー側の射撃クールダウンチェック |

`serverShootCooldownCheck` を無効にすると不正対策が弱くなる可能性があります。銃がどうしても撃てない時だけ変更するのが安全です。

## 4. Simple Enemy Mod

jar: `simpleenemymod-1.20.1-0.1.4-beta.jar`  
Mod ID: `simpleenemymod`

TaCZ の銃を使う NPC 兵士を追加するアドオンです。`US Unit`、`RU Unit`、`PMC Unit`、各種スポーンエッグ、`Recruit Table` が確認できます。

### 主な使い方

- スポーンエッグでユニットを出します。
- 部隊長と部隊員のスポーンエッグを使うと、隊列や追従の挙動を確認しやすいです。
- `Recruit Table` はユニット関連の操作台として使う想定です。
- 友好ユニットはコマンダーメニューから指示できます。

### コマンダーメニュー

キー登録から、初期キーは `C`、さらに `Ctrl` キー押下が条件になっています。つまり初期操作は `Ctrl + C` です。

メニュー内で確認できる操作:

| 表示 | 内容 |
|---|---|
| `Select Unit` | ユニットを選択 |
| `Select All` / `Deselect All` | 全選択 / 全解除 |
| `Hold Position` | その場で待機 |
| `Follow Me` | プレイヤーについてこさせる |
| `Move To...` | 指定地点へ移動 |
| `Attack that...` | 指定対象を攻撃 |
| `Cease Fire` | 射撃停止 |
| `Free Fire` | 射撃許可 |
| `F: Wedge` | ウェッジ隊形 |
| `F: Column` | 縦列隊形 |

基本の流れ:

1. 友好ユニットをスポーンします。
2. `Ctrl + C` でコマンダーメニューを開きます。
3. `Select Unit` または `Select All` で対象ユニットを選びます。
4. `Follow Me`、`Hold Position`、`Move To...` などを選びます。
5. `Move To...` は地点選択、`Attack that...` は対象選択の操作に進みます。

### Simple Enemy Mod コマンド

jar 内の `ModCommands` と `SemEventCommand` から、ルートコマンドは `/sem` です。権限レベル 2 以上が必要です。

| コマンド | 用途 | 例 |
|---|---|---|
| `/sem event <eventId> spawn` | 指定イベントを強制発生 | `/sem event military_patrol spawn` |
| `/sem event <eventId> active <true|false>` | 指定イベントの有効 / 無効を切替 | `/sem event far_combat active false` |

jar 内で確認できたイベント ID:

| eventId | 内容の目安 |
|---|---|
| `military_patrol` | パトロール部隊イベント |
| `far_combat` | 遠方での戦闘イベント |
| `cave_extraction` | 洞窟周辺の部隊イベント |

## 5. Mob Battle Mod

jar: `mobbattle-1.20.1-2.5.3-forge.jar`  
Mod ID: `mobbattle`

Mob 同士を戦わせたり、装備や効果を編集したりするクリエイティブ向け Mod です。専用コマンド登録は jar 内で見つかりませんでした。操作は追加アイテム中心です。

### 追加アイテムと使い方

| アイテム | 使い方 |
|---|---|
| `Mob Enrager` | 左クリックで1体目を指定し、別の Mob を左クリックすると攻撃対象を設定 |
| `Mob Enrager (Multi)` | 左クリックで複数選択、右クリックで攻撃対象を設定、Shift+右クリックでリセット |
| `Mob Killer` | 左クリックした Mob を倒す |
| `Mob Healer` | 左クリックした Mob を回復 |
| `Effect Remover` | 左クリックした Mob のポーション効果を解除 |
| `Effect Giver` | 右クリックで付与する効果を編集、左クリックで Mob に付与 |
| `Armor Editor` | Mob を右クリックして装備を編集 |
| `Mob Army` | 範囲を指定して Mob をチームに追加。アイテム名がチーム名になります |
| `Mob Mount` | 1体目を左クリックで選択し、2体目を左クリックして騎乗関係を作る |
| `Mob Equip` | Mob がアイテムを拾えるようにする。範囲指定にも対応 |
| `Mob Spawner` | 左クリックで Mob を保存し、右クリックでスポーン。Shift+左クリックで NBT も保存 |

### チーム色の変更

Mob Battle のツールチップ内に、バニラの `/team` コマンドを使う案内があります。

```text
/team add red
/team modify red color red
/team join red <対象>
```

授業では、`Mob Army` でチームを作ってから `/team modify` で色を変えると見た目で説明しやすいです。

## 6. Infernal Mobs

jar: `infernalmobs-1.20.1.11.jar`  
Mod ID: `infernalmobs`

通常 Mob にランダムな強化能力を付ける Mod です。敵が硬くなったり、特殊攻撃を持ったり、倒すと追加報酬が出るタイプの難易度上昇 Mod です。

### 基本の使い方

- 通常プレイでは、自然湧きした Mob の一部が強化個体になります。
- 強化個体は名前や体力、特殊能力で見分けます。
- 検証や授業では、コマンドで強化 Mob を直接スポーンできます。

### Infernal Mobs コマンド

jar 内の `InfernalCommandFindEntityClass` と `InfernalCommandSpawnInfernal` から確認しました。どちらも権限レベル 2 以上が必要です。

| コマンド | 用途 | 例 |
|---|---|---|
| `/feclass <entClass>` | エンティティ ID を部分検索 | `/feclass zombie` |
| `/spawninfernal <x> <y> <z> <entClass> <modifiers>` | 指定座標に強化 Mob をスポーン | `/spawninfernal ~ ~ ~ minecraft:zombie Fiery Regen` |

`entClass` は `minecraft:zombie` のようなエンティティ ID です。まず `/feclass zombie` で候補を探すと安全です。

jar 内で確認できた主な modifier 名:

```text
1UP, Alchemist, Berserk, Blastoff, Bulwark, Choke, Cloaking, Darkness,
Ender, Exhaust, Fiery, Ghastly, Gravity, LifeSteal, Ninja, Poisonous,
Quicksand, Regen, Rust, Sapper, Sprint, Sticky, Storm, Unyielding,
Vengeance, Weakness, Webber, Wither
```

例:

```text
/feclass skeleton
/spawninfernal ~ ~ ~ minecraft:skeleton Fiery Regen
/spawninfernal ~ ~ ~ minecraft:zombie Berserk LifeSteal Sprint
```

## 7. WorldEdit

jar: `worldedit-mod-7.2.15.jar`  
Mod ID: `worldedit`

建築や地形編集を一気に行う編集ツールです。範囲選択してから、置換、コピー、貼り付け、ブラシなどを使います。非常に強力なので、授業では小さい範囲から始めるのが安全です。

### 基本操作

| 操作 | 内容 |
|---|---|
| `/worldedit help` | ヘルプを表示 |
| `//wand` | 選択用の木の斧を取得 |
| 木の斧で左クリック | 選択範囲の1点目を指定 |
| 木の斧で右クリック | 選択範囲の2点目を指定 |
| `//pos1` / `//pos2` | 現在位置を1点目 / 2点目に設定 |
| `//hpos1` / `//hpos2` | 見ているブロックを1点目 / 2点目に設定 |

### 範囲編集

| コマンド | 内容 | 例 |
|---|---|---|
| `//set <block>` | 選択範囲を指定ブロックで埋める | `//set stone` |
| `//replace <from> <to>` | 範囲内のブロックを置換 | `//replace dirt grass_block` |
| `//walls <block>` | 壁だけ作る | `//walls stone_bricks` |
| `//faces <block>` | 外側の面を作る | `//faces glass` |
| `//outline <block>` | 枠線を作る | `//outline oak_planks` |
| `//hollow [thickness] [block]` | 中を空洞にする | `//hollow 1 air` |
| `//center <block>` | 中心にブロックを置く | `//center glowstone` |

### 選択範囲の調整

| コマンド | 内容 | 例 |
|---|---|---|
| `//expand <amount> [direction]` | 選択範囲を広げる | `//expand 10 up` |
| `//contract <amount> [direction]` | 選択範囲を縮める | `//contract 3 north` |
| `//shift <amount> <direction>` | 選択範囲だけ移動 | `//shift 5 east` |
| `//outset <amount>` | 外側へ広げる | `//outset 2` |
| `//inset <amount>` | 内側へ縮める | `//inset 1` |
| `//size` | 選択範囲のサイズ確認 | `//size` |
| `//count <block>` | 範囲内の指定ブロック数を数える | `//count stone` |
| `//distr` | 範囲内のブロック分布を表示 | `//distr` |

### コピー・貼り付け

| コマンド | 内容 | 例 |
|---|---|---|
| `//copy` | 選択範囲をコピー | `//copy` |
| `//cut` | 選択範囲を切り取り | `//cut` |
| `//paste` | コピー内容を貼り付け | `//paste` |
| `//paste -a` | 空気を無視して貼り付け | `//paste -a` |
| `//rotate <angle>` | コピー内容を回転 | `//rotate 90` |
| `//flip [direction]` | コピー内容を反転 | `//flip north` |
| `//undo` | 直前の操作を取り消し | `//undo` |
| `//redo` | 取り消しをやり直し | `//redo` |

コピーは「自分の立っている位置」が貼り付け基準になります。建物の角や中心など、基準にしたい場所に立ってから `//copy` すると説明しやすいです。

### 複製・移動

| コマンド | 内容 | 例 |
|---|---|---|
| `//stack <count> [direction]` | 選択範囲を連続複製 | `//stack 5 east` |
| `//move <distance> [direction]` | 選択範囲の中身を移動 | `//move 3 up` |

### 図形生成

| コマンド | 内容 | 例 |
|---|---|---|
| `//sphere <block> <radius>` | 球を生成 | `//sphere glass 5` |
| `//hsphere <block> <radius>` | 中空の球を生成 | `//hsphere glass 8` |
| `//cyl <block> <radius> [height]` | 円柱を生成 | `//cyl stone 5 10` |
| `//hcyl <block> <radius> [height]` | 中空円柱を生成 | `//hcyl stone 5 10` |
| `//pyramid <block> <size>` | ピラミッドを生成 | `//pyramid sandstone 8` |
| `//hpyramid <block> <size>` | 中空ピラミッドを生成 | `//hpyramid sandstone 8` |

### ブラシ

| コマンド | 内容 | 例 |
|---|---|---|
| `/brush sphere <block> <radius>` | 球形ブラシ | `/brush sphere stone 3` |
| `/brush cylinder <block> <radius> [height]` | 円柱ブラシ | `/brush cylinder dirt 4 2` |
| `/brush smooth` | 地形をなめらかにする | `/brush smooth` |
| `/brush clipboard` | クリップボードをブラシ化 | `/brush clipboard` |
| `/mask <block>` | ブラシの対象ブロックを制限 | `/mask grass_block` |
| `/mask` | マスク解除 | `/mask` |
| `/brush none` | ブラシ解除 | `/brush none` |

ブラシは持っているアイテムに効果を割り当てます。解除し忘れると意図せず地形を変えるので、最後に `/brush none` を使います。

### 移動・地形補助

| コマンド | 内容 | 例 |
|---|---|---|
| `/jumpto` | 見ている地点へ移動 | `/jumpto` |
| `/thru` | 見ている壁を抜ける | `/thru` |
| `/up <distance>` | 足元にブロックを置いて上へ移動 | `/up 10` |
| `/unstuck` | ブロックにはまった状態から抜ける | `/unstuck` |
| `/fill <block> <radius> [depth]` | 周囲を指定ブロックで埋める | `/fill water 5 1` |
| `/drain <radius>` | 水や溶岩を除去 | `/drain 20` |
| `/fixwater <radius>` | 水流を整える | `/fixwater 20` |
| `/fixlava <radius>` | 溶岩流を整える | `/fixlava 20` |
| `/removenear <block> <radius>` | 近くの指定ブロックを削除 | `/removenear stone 10` |
| `/butcher [radius]` | 周囲の Mob を削除 | `/butcher 30` |

### schematic

| コマンド | 内容 | 例 |
|---|---|---|
| `//schem list` | schematic 一覧 | `//schem list` |
| `//schem save <name>` | コピー中の建築を保存 | `//schem save house01` |
| `//schem load <name>` | schematic を読み込み | `//schem load house01` |
| `//schem delete <name>` | schematic を削除 | `//schem delete house01` |
| `//paste` | 読み込んだ schematic を貼り付け | `//paste` |

### WorldEdit の授業用ミニ手順

```text
//wand
木の斧で1点目と2点目を選択
//set oak_planks
//undo
//set glass
```

```text
建物を選択
//copy
5ブロック横へ移動
//paste -a
```

```text
/brush sphere stone 3
地面を右クリックして試す
/brush none
```

## 8. Born in Chaos

jar: `born_in_chaos_[Forge]1.20.1_1.7.5.jar`  
Mod ID: `born_in_chaos_v1`

敵 Mob、武器、防具、素材、ブロック、ポーション効果などを大量に追加するサバイバル向け Mod です。専用コマンド登録は jar 内で見つかりませんでした。

### 主な使い方

- サバイバルでは新しい敵が自然に出現し、戦闘難易度が上がります。
- クリエイティブでは `Born in Chaos Mobs`、`Born in Chaos Weapons`、`Born in Chaos Items`、`Born in Chaos Blocks` などのタブから確認できます。
- スポーンエッグを使えば、解説用に個別の敵を出せます。
- 追加武器や防具には特殊効果付きのものがあります。アイテム説明を確認しながら紹介するとよいです。

### 解説しやすい流れ

1. クリエイティブタブで追加 Mob のスポーンエッグを選びます。
2. 1体ずつ出して、通常 Mob との違いを見せます。
3. 追加武器や防具を装備して、戦闘の変化を確認します。
4. TaCZ や Simple Enemy Mod と組み合わせる場合は、難易度が上がりすぎないよう小規模で試します。

## 9. Neat

jar: `Neat-1.20.1-41-FORGE.jar`  
Mod ID: `neat`

Mob の頭上に体力バーを表示する補助 Mod です。専用コマンド登録はありません。

### 使い方

- 導入して起動するだけで、Mob の体力が見やすくなります。
- 戦闘解説や Mob 比較に向いています。
- TaCZ や Infernal Mobs のようにダメージ量を確認したい Mod と相性が良いです。

## 10. GeckoLib

jar: `geckolib-forge-1.20.1-4.8.3.jar`  
Mod ID: `geckolib`

アニメーション用ライブラリです。プレイヤーが直接操作する Mod ではありません。専用コマンド登録はありません。

### 使い方

- 他 Mod が要求する前提ライブラリとして入れておきます。
- 抜くと、アニメーションを使う Mob やアイテムが正しく動かない可能性があります。

## 11. Cloth Config

jar: `cloth-config-11.1.136-forge.jar`  
Mod ID: `cloth_config`

Mod の設定画面を提供するためのライブラリです。専用コマンド登録はありません。

### 使い方

- TaCZ の `Alt + T` 設定画面などで使われます。
- 直接遊ぶ Mod ではないため、基本的には入れたままにします。

## 12. Player Animator

jar: `player-animation-lib-forge-1.0.2-rc1+1.20.jar`  
Mod ID: `playeranimator`

プレイヤーアニメーションを追加するためのライブラリです。専用コマンド登録はありません。

### 使い方

- 他 Mod のアニメーション動作を支える前提ライブラリです。
- 直接操作する項目は基本的にありません。

## 13. コマンド早見表

### TaCZ

```text
/tacz reload
/tacz overwrite <true|false>
/tacz config defaultTableLimit <true|false>
/tacz config serverShootNetworkCheck <true|false>
/tacz config serverShootCooldownCheck <true|false>
/tacz debug <true|false>
/tacz dummy <target> <amount>
/tacz attachment_lock <target> <true|false>
/tacz hide_tooltip_part <target> <mask>
/tacz convert
```

### Simple Enemy Mod

```text
/sem event military_patrol spawn
/sem event military_patrol active true
/sem event far_combat spawn
/sem event far_combat active false
/sem event cave_extraction spawn
```

### Infernal Mobs

```text
/feclass zombie
/spawninfernal ~ ~ ~ minecraft:zombie Fiery Regen
/spawninfernal ~ ~ ~ minecraft:skeleton Berserk Sprint
```

### WorldEdit

```text
//wand
//pos1
//pos2
//set stone
//replace dirt grass_block
//copy
//paste -a
//undo
//redo
//stack 5 east
/brush sphere stone 3
/brush none
//schem save house01
//schem load house01
```

## 14. よくあるつまずき

| 状況 | 確認すること |
|---|---|
| コマンドが使えない | チート許可、OP 権限、権限レベルを確認 |
| TaCZ の銃が撃てない | 対応弾薬、リロード、サーバー側射撃チェック設定を確認 |
| TaCZ の設定画面が開かない | `cloth-config` が入っているか、キー設定が競合していないか確認 |
| Simple Enemy Mod のメニューが開かない | 初期操作は `Ctrl + C`。キー設定で変更されていないか確認 |
| WorldEdit で大きく壊した | すぐ `//undo`。それでも戻せない場合に備えて事前バックアップ |
| WorldEdit ブラシが残る | `/brush none` で解除 |
| Mob Battle のチーム色が分からない | バニラの `/team modify <team> color <color>` を使う |

