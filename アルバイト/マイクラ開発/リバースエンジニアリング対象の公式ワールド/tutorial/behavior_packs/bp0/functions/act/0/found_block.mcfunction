#> @e[tag=game]

# mark block as targeted
tag @s remove not_targeted

# player looking at the target block
scoreboard players add @s tick 1

# sound effect
execute @s[scores={tick=1}] ~ ~ ~ playsound block.bamboo.break @a ~ ~ ~ 1 2
execute @s[scores={tick=10}] ~ ~ ~ playsound block.bamboo.break @a ~ ~ ~ 1 2

# particle burst
execute @s[scores={tick=1,phase=2}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 52.5 0
execute @s[scores={tick=1,phase=3}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 50.5 3
execute @s[scores={tick=1,phase=4}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 48.5 0
execute @s[scores={tick=1,phase=5}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 50.5 -3
execute @s[scores={tick=1,phase=6}] ~ ~ ~ particle minecraft:critical_hit_emitter -45 50.5 0

execute @s[scores={tick=10,phase=2}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 52.5 0
execute @s[scores={tick=10,phase=3}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 50.5 3
execute @s[scores={tick=10,phase=4}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 48.5 0
execute @s[scores={tick=10,phase=5}] ~ ~ ~ particle minecraft:critical_hit_emitter -35 50.5 -3
execute @s[scores={tick=10,phase=6}] ~ ~ ~ particle minecraft:critical_hit_emitter -45 50.5 0

# Looking back at gate after finding all blocks
scoreboard players add @s[scores={phase=7}] phase 1
scoreboard players set @s[scores={phase=7}] tick 0

# Found block for at least 20 ticks
execute @s[scores={tick=20..}] ~ ~ ~ function act/0/next_block
