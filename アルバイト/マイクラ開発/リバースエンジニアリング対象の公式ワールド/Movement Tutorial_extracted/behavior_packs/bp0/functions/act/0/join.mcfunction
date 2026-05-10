#> @a[tag=!joined]

codebuilder navigate @s false https://minecraft.makecode.com/?ipc=1&inGame=1&noRunOnX=1#tutorial:github:Mojang/EducationContent/no_coding
titleraw @s times 0 30 30
tag @s add joined
scoreboard players add @e[tag=game] act 0
scoreboard players add @e[tag=game] goal 0
scoreboard players add @e[tag=game] phase 0
scoreboard players add @e[tag=game] tick 0
