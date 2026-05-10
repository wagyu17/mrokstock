#> @s

# Reset player/game after placing blackboard in world
tp @a -40 47 0 270 0
gamemode 2 @a
fill -35 47 -3 -34 51 3 iron_block 0 replace gold_block 0
titleraw @a actionbar {"rawtext":[{"text":"§r"}]}

execute @a ~ ~ ~ kill @c
tag @e[type=rwm:utility] add despawn
kill @e[type=item]

summon rwm:utility 0 2 0
tag @e[type=rwm:utility] add game
tag @e[tag=game] add scale
scoreboard players set @e[tag=game] act 0
scoreboard players set @e[tag=game] goal 0
scoreboard players set @e[tag=game] phase 0
scoreboard players set @e[tag=game] tick -1

setblock 1 0 0 wool 0

tag @s remove joined