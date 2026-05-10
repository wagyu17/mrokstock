# Minecraft Education .mcworld 作成方針

最終更新: 2026-05-09

## 方針

Codex では、Minecraft Education の完成ワールドを「外部だけで完全生成」するのではなく、次の分担で作る。

- Minecraft Education 上でベースワールドを作成する
- Codex で Behavior Pack / Resource Pack / `.mcfunction` / 設計ドキュメントを生成する
- 生成した pack をワールドに同梱し、`.mcworld` としてエクスポートして納品する

この方式なら、ゲーム内の実ワールドデータは Minecraft 側で保証しつつ、建築・進行・スコア・案内文はテキストファイルとして管理できる。

## 基本構成

```text
world_template/
├─ behavior_packs/
│  └─ onelife_bp/
│     ├─ manifest.json
│     └─ functions/
│        └─ onelife/
│           ├─ init.mcfunction
│           └─ math01/
│              ├─ start.mcfunction
│              ├─ build_flower_park.mcfunction
│              └─ reset_area.mcfunction
├─ resource_packs/
│  └─ onelife_rp/
│     ├─ manifest.json
│     └─ texts/
│        ├─ languages.json
│        ├─ ja_JP.lang
│        └─ en_US.lang
├─ world_behavior_packs.json
└─ world_resource_packs.json
```

## 使い方

1. Minecraft Education で空のベースワールドを作る
2. エクスポートした `.mcworld` を zip として展開する
3. `world_template/` の中身を、展開したワールド直下へコピーする
4. 再度 zip 化し、拡張子を `.mcworld` に戻す
5. Minecraft Education で読み込み、チート有効状態で次を実行する

```mcfunction
/function onelife/init
/function onelife/math01/start
```

`.mcfunction` 内では先頭の `/` は書かない。

## 次に足すもの

- ハブから算数ミッションへのテレポート導線
- 5〜7問構成の進行管理
- 問題ごとのボタン、スコアボード、称号表示
- NPC または看板によるスタッフ不要の案内
- アドベンチャーモード保護範囲の整理

## 2026-05-09 実ワールド確認

対象ワールド:

```text
C:\Users\tomot\AppData\Local\Packages\Microsoft.MinecraftEducationEdition_8wekyb3d8bbwe\LocalState\games\com.mojang\minecraftWorlds\neeX6PLNWGo=
```

確認できた構成:

- 既存 Behavior Pack: `behavior_packs/onelife_setup`
- 既存 pack UUID: `a1b2c3d4-1234-5678-abcd-ef0123456789`
- 適用済み Behavior Pack: `world_behavior_packs.json` に登録済み
- Resource Pack: 未適用、`world_resource_packs.json` は空配列
- ハブ中心: `500 -60 500`
- 初期セットアップ関数: `/function setup`
- まちをつくろう / やさしい: `500 -60 330`

当面は既存の `onelife_setup` を土台として活かし、追加ミッションを別 pack または同 pack 内の追加 function として載せる。
