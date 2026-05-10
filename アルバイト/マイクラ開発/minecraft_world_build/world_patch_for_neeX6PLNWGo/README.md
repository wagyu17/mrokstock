# neeX6PLNWGo= 実ワールド投入用パッチ

このフォルダは、既存 Behavior Pack `onelife_setup` に function だけ追加するためのパッチ。

コピー先:

```text
C:\Users\tomot\AppData\Local\Packages\Microsoft.MinecraftEducationEdition_8wekyb3d8bbwe\LocalState\games\com.mojang\minecraftWorlds\neeX6PLNWGo=\behavior_packs\onelife_setup\functions\
```

投入後、Minecraft Education 内で次を実行する。

```mcfunction
/function onelife/init
/function onelife/math01/start
```

RPG風ハブを作る:

```mcfunction
/function onelife/hub/build_rpg_hub
```

外周だけ追加・再生成する:

```mcfunction
/function onelife/hub/build_immersive_border
```

リセット:

```mcfunction
/function onelife/math01/reset_area
```
