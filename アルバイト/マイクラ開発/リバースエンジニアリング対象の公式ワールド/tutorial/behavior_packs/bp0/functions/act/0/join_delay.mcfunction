#> @a[tag=!joined]

scoreboard players remove @s tick 1
execute @s[scores={tick=0}] ~ ~ ~ function act/0/next_block
