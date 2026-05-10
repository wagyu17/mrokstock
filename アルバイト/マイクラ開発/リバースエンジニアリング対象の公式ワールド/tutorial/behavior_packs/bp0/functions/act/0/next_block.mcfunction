#> @e[tag=game]

scoreboard players add @s phase 1

execute @a ~ ~ ~ playsound note.harp @a ~ ~ ~ 1 1

fill -45 47 -3 -35 51 3 iron_block 0 replace gold_block 0
execute @s[scores={phase=7}] ~ ~ ~ fill -35 47 -3 -35 51 3 air 0 replace iron_block 0
execute @s[scores={phase=7}] ~ ~ ~ fill -36 48 -1 -35 49 1 air

execute @s[scores={phase=2}] ~ ~ ~ setblock -35 51 0 gold_block
execute @s[scores={phase=3}] ~ ~ ~ setblock -35 49 3 gold_block
execute @s[scores={phase=4}] ~ ~ ~ setblock -35 47 0 gold_block
execute @s[scores={phase=5}] ~ ~ ~ setblock -35 49 -3 gold_block
execute @s[scores={phase=6}] ~ ~ ~ setblock -45 49 0 gold_block

execute @s[scores={phase=2}] ~ ~ ~ particle minecraft:totem_particle -35 51 0
execute @s[scores={phase=3}] ~ ~ ~ particle minecraft:totem_particle -35 49 3
execute @s[scores={phase=4}] ~ ~ ~ particle minecraft:totem_particle -35 47 0
execute @s[scores={phase=5}] ~ ~ ~ particle minecraft:totem_particle -35 49 -3
execute @s[scores={phase=6}] ~ ~ ~ particle minecraft:totem_particle -45 49 0
