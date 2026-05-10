#> cua | execute @e[tag=game] ~ ~ ~ function loop

scoreboard players add @s act 0
execute @s[scores={act=0}] ~ ~ ~ function act/0/lobby
execute @s[scores={act=1}] ~ ~ ~ function act/1/phase

effect @a saturation 20 0 true
execute @a ~ ~ ~ kill @c
