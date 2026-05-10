#> @a[tag=!joined]

execute @a ~ ~ ~ function act/0/lookat

tag @s add not_targeted
execute @p[scores={lookat=1}] ~ ~ ~ execute @e[tag=game,scores={phase=2}] ~ ~ ~ function act/0/found_block
execute @p[scores={lookat=2}] ~ ~ ~ execute @e[tag=game,scores={phase=3}] ~ ~ ~ function act/0/found_block
execute @p[scores={lookat=3}] ~ ~ ~ execute @e[tag=game,scores={phase=4}] ~ ~ ~ function act/0/found_block
execute @p[scores={lookat=4}] ~ ~ ~ execute @e[tag=game,scores={phase=5}] ~ ~ ~ function act/0/found_block
execute @p[scores={lookat=5}] ~ ~ ~ execute @e[tag=game,scores={phase=6}] ~ ~ ~ function act/0/found_block
execute @p[scores={lookat=6}] ~ ~ ~ execute @e[tag=game,scores={phase=7}] ~ ~ ~ function act/0/found_block
scoreboard players set @s[tag=not_targeted] tick 0
tag @s remove not_targeted

execute @s[scores={phase=2..5}] ~ ~ ~ titleraw @a actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.0.instruction.actionbar.0"}]}
execute @s[scores={phase=6}] ~ ~ ~ titleraw @a actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.0.instruction.actionbar.1"}]}
execute @s[scores={phase=7}] ~ ~ ~ titleraw @a actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.0.instruction.actionbar.2"}]}
