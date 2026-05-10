#> @e[tag=game,scores={act=0}]

execute @a[tag=!joined] ~ ~ ~ function act/0/join
execute @s[scores={phase=0}] ~ ~ ~ function act/0/set_join_delay
execute @s[scores={phase=1}] ~ ~ ~ function act/0/join_delay
execute @s[scores={phase=2..7}] ~ ~ ~ function act/0/look_activity
execute @s[scores={phase=8}] ~ ~ ~ function act/0/open_gate
