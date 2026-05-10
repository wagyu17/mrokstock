#> @s

gamerule sendcommandfeedback false

gamerule commandblockoutput false
gamerule commandblocksenabled true
gamerule dodaylightcycle false
gamerule doentitydrops false
gamerule dofiretick false
gamerule doimmediaterespawn false
gamerule doinsomnia false
gamerule domobloot false
gamerule domobspawning false
gamerule dotiledrops false
gamerule doweathercycle false
gamerule drowningdamage false
gamerule falldamage false
gamerule firedamage false
gamerule functioncommandlimit 10000
gamerule keepinventory true
gamerule maxcommandchainlength 65536
gamerule mobgriefing false
gamerule naturalregeneration true
gamerule pvp false
gamerule randomtickspeed 0
gamerule showcoordinates false
gamerule showdeathmessages true
gamerule showtags true
gamerule spawnradius 0
gamerule tntexplodes false

difficulty easy

tickingarea add -43 0 -3 -32 0 3
tickingarea add 0 0 0 15 0 15

scoreboard objectives remove act
scoreboard objectives remove goal
scoreboard objectives remove makecode
scoreboard objectives remove phase
scoreboard objectives remove tick
scoreboard objectives remove lookat

scoreboard objectives add act dummy
scoreboard objectives add goal dummy
scoreboard objectives add makecode dummy
scoreboard objectives add phase dummy
scoreboard objectives add tick dummy
scoreboard objectives add lookat dummy

execute @a ~ ~ ~ kill @c
tag @e[type=rwm:utility] add despawn
# tag @e[type=TYPE,tag=!lobby] add despawn
kill @e[type=item]

summon rwm:utility 0 2 0
tag @e[type=rwm:utility] add game
tag @e[tag=game] add scale
scoreboard players set @e[tag=game] act 0
scoreboard players set @e[tag=game] goal 0
scoreboard players set @e[tag=game] phase 0
scoreboard players set @e[tag=game] tick -1

tag @a remove joined
clear @a
effect @a clear
gamemode adventure @a
tp @a -40 47 0 270 0

titleraw @a title {"rawtext":[{"text":"§r"}]}
titleraw @a subtitle {"rawtext":[{"text":"§r"}]}
titleraw @a actionbar {"rawtext":[{"text":"§r"}]}

# clone FULL_RESET
clone -43 20 -3 -32 27 3 -43 46 -3

# Reset time
time set day
