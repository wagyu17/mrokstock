#> execute @e[tag=game]

titleraw @a actionbar {"rawtext":[{"text":"§r"}]}
titleraw @a times 0 100 50
titleraw @a title {"rawtext":[{"text":"§6"},{"translate":"lesson.title.complete"}]}
fill -43 47 -3 -35 48 3 air 0 replace barrier
fill -43 47 -3 -35 48 3 air 0 replace fence
scoreboard players add @s phase 1

# Set bit indicating lesson completed
setblock 1 0 0 wool 1
