#> @e[tag=game]

titleraw @a[x=-43,y=45,z=-3,dx=8,dy=16,dz=6] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.0"}]}

titleraw @a[x=-34,y=45,z=-3,dx=17,dy=16,dz=6] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.1"}]}

titleraw @a[x=-16,y=45,z=-3,dx=6,dy=16,dz=6] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.2"}]}

titleraw @a[x=-9,y=45,z=-8,dx=20,dy=16,dz=10] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.3"}]}

titleraw @a[x=12,y=45,z=-14,dx=4,dy=16,dz=15] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.4"}]}
titleraw @a[x=17,y=45,z=-13,dx=3,dy=16,dz=6] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.4"}]}

titleraw @a[x=14,y=45,z=-17,dx=10,dy=16,dz=2] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.5"}]}
titleraw @a[x=22,y=45,z=-17,dx=2,dy=16,dz=14] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.5"}]}
titleraw @a[x=18,y=45,z=-5,dx=3,dy=16,dz=10] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.5"}]}
titleraw @a[x=14,y=45,z=3,dx=3,dy=16,dz=6] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.5"}]}
titleraw @a[x=14,y=45,z=10,dx=5,dy=16,dz=7] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.5"}]}

titleraw @a[x=19,y=45,z=9,dx=6,dy=16,dz=8] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.6"}]}

titleraw @a[x=28,y=45,z=17,dx=6,dy=16,dz=-19] actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"act.1.instruction.actionbar.7"}]}

titleraw @a[x=35,y=45,z=-2,dx=5,dy=16,dz=4] actionbar {"rawtext":[{"text":"§r"}]}
execute @a[x=35,y=45,z=-2,dx=5,dy=16,dz=4] ~ ~ ~ scoreboard players add @e[tag=game,scores={phase=0}] phase 1

execute @e[tag=game,scores={phase=2}] ~ ~ ~ titleraw @a actionbar {"rawtext":[{"translate":"instruction.color"},{"translate":"lesson.complete.actionbar.0"}]}