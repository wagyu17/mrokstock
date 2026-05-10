#> @e[tag=game]
scoreboard players add @s tick 1

execute @s[scores={tick=10}] ~ ~ ~ clone -32 45 55 -31 51 59 -34 47 -2
execute @s[scores={tick=20}] ~ ~ ~ clone -22 45 55 -20 51 59 -34 47 -2
execute @s[scores={tick=30}] ~ ~ ~ clone -12 45 55 -10 51 59 -34 47 -2
execute @s[scores={tick=30}] ~ ~ ~ fill -41 47 1 -39 48 -1 air
execute @s[scores={tick=30}] ~ ~ ~ setblock -40 46 0 concrete 8
execute @s[scores={tick=30}] ~ ~ ~ function generic/next_act
