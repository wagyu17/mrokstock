# RPG-style hub dressing for ONELife.
# Hub center: 500 -60 500. Floor is y=-61, player walks at y=-60.

gamerule commandblockoutput false
gamerule sendcommandfeedback false

# Base meadow and soft plaza paths.
fill 440 -61 440 560 -61 560 grass
fill 486 -61 440 514 -61 560 sand
fill 440 -61 486 560 -61 514 sand
fill 480 -61 480 520 -61 520 sandstone
fill 490 -61 490 510 -61 510 sand
fill 498 -61 498 502 -61 502 gold_block

# Rounded-feel path edges using grass patches.
fill 440 -61 440 454 -61 454 grass
fill 546 -61 440 560 -61 454 grass
fill 440 -61 546 454 -61 560 grass
fill 546 -61 546 560 -61 560 grass
fill 456 -61 456 478 -61 478 grass
fill 522 -61 456 544 -61 478 grass
fill 456 -61 522 478 -61 544 grass
fill 522 -61 522 544 -61 544 grass

# North-west wooden classroom.
fill 456 -60 452 486 -44 478 air
fill 458 -60 454 484 -60 476 oak_planks
fill 458 -59 454 484 -52 476 oak_planks
fill 459 -58 455 483 -53 475 log
fill 462 -59 454 466 -55 454 glass
fill 476 -59 454 480 -55 454 glass
fill 469 -59 454 473 -53 454 air
fill 456 -51 452 486 -50 478 dark_prismarine
fill 458 -49 454 484 -48 476 dark_prismarine
fill 461 -47 457 481 -47 473 dark_prismarine
fill 464 -46 460 478 -46 470 dark_prismarine
setblock 471 -60 453 air
setblock 471 -59 453 air
setblock 454 -60 464 red_concrete
setblock 454 -59 464 red_concrete
setblock 488 -60 466 oak_planks

# North-east mission center with bright roof.
fill 516 -60 452 552 -42 480 air
fill 518 -60 454 550 -60 478 stone
fill 518 -59 454 550 -51 478 smooth_stone
fill 520 -58 454 528 -54 454 glass
fill 540 -58 454 548 -54 454 glass
fill 532 -59 454 536 -53 454 air
fill 516 -50 452 552 -49 480 white_concrete
fill 518 -48 454 550 -45 478 orange_concrete
fill 522 -44 458 546 -44 474 orange_concrete
fill 526 -43 462 542 -43 470 orange_concrete
setblock 534 -60 453 air
setblock 534 -59 453 air
fill 530 -52 451 538 -50 451 orange_concrete
setblock 534 -51 450 glowstone
setblock 554 -60 466 stone_button

# South-west blue lab.
fill 452 -60 520 486 -43 552 air
fill 454 -60 522 484 -60 550 stone
fill 454 -59 522 484 -51 550 smooth_stone
fill 458 -58 522 466 -54 522 glass
fill 474 -58 522 482 -54 522 glass
fill 468 -59 522 472 -53 522 air
fill 452 -50 520 486 -49 552 white_concrete
fill 454 -48 522 484 -45 550 blue_concrete
fill 458 -44 526 480 -44 546 blue_concrete
fill 462 -43 530 476 -43 542 blue_concrete
setblock 470 -60 521 air
setblock 470 -59 521 air
fill 467 -52 519 473 -50 519 blue_concrete
setblock 470 -51 518 sea_lantern

# South-east staff house.
fill 518 -60 522 552 -44 552 air
fill 520 -60 524 550 -60 550 oak_planks
fill 520 -59 524 550 -52 550 oak_planks
fill 522 -58 524 530 -54 524 glass
fill 540 -58 524 548 -54 524 glass
fill 533 -59 524 537 -53 524 air
fill 518 -51 522 552 -50 552 dark_prismarine
fill 520 -49 524 550 -47 550 dark_prismarine
fill 524 -46 528 546 -46 546 dark_prismarine
setblock 535 -60 523 air
setblock 535 -59 523 air
setblock 516 -60 534 stone_button

# Sign board and entrance steps.
fill 490 -60 538 510 -58 540 oak_planks
fill 493 -57 539 507 -56 539 oak_planks
setblock 492 -60 537 oak_fence
setblock 508 -60 537 oak_fence
fill 492 -61 558 508 -61 560 stonebrick
fill 494 -60 554 506 -60 557 stonebrick
fill 496 -59 550 504 -59 553 stonebrick

# Mailbox-like accents.
setblock 454 -60 462 red_concrete
setblock 454 -59 462 red_concrete
setblock 554 -60 462 iron_block
setblock 554 -59 462 stone_button
setblock 516 -60 534 iron_block
setblock 516 -59 534 stone_button

# Flower clusters.
fill 466 -60 494 470 -60 497 red_flower
fill 472 -60 494 476 -60 497 yellow_flower
fill 526 -60 494 530 -60 497 white_flower
fill 532 -60 494 536 -60 497 blue_flower
fill 466 -60 526 470 -60 530 white_flower
fill 530 -60 526 534 -60 530 yellow_flower

# Perimeter trees, leaving gate lanes readable.
fill 442 -60 442 444 -55 444 log
fill 439 -54 439 447 -50 447 leaves
fill 456 -60 442 458 -55 444 log
fill 453 -54 439 461 -50 447 leaves
fill 542 -60 442 544 -55 444 log
fill 539 -54 439 547 -50 447 leaves
fill 556 -60 442 558 -55 444 log
fill 553 -54 439 561 -50 447 leaves

fill 442 -60 556 444 -55 558 log
fill 439 -54 553 447 -50 561 leaves
fill 456 -60 556 458 -55 558 log
fill 453 -54 553 461 -50 561 leaves
fill 542 -60 556 544 -55 558 log
fill 539 -54 553 547 -50 561 leaves
fill 556 -60 556 558 -55 558 log
fill 553 -54 553 561 -50 561 leaves

fill 442 -60 456 444 -55 458 log
fill 439 -54 453 447 -50 461 leaves
fill 442 -60 542 444 -55 544 log
fill 439 -54 539 447 -50 547 leaves
fill 556 -60 456 558 -55 458 log
fill 553 -54 453 561 -50 461 leaves
fill 556 -60 542 558 -55 544 log
fill 553 -54 539 561 -50 547 leaves

# Keep original command-block gate markers visible.
fill 496 -61 446 504 -61 448 light_blue_concrete
fill 552 -61 496 554 -61 504 lime_concrete
fill 496 -61 552 504 -61 554 orange_concrete
fill 446 -61 496 448 -61 504 pink_concrete

setworldspawn 500 -60 500
function onelife/hub/build_immersive_border
tp @a 500 -60 500
title @a title ONELife Hub
title @a subtitle 見下ろしRPG風のハブを生成しました
say §a RPG風ハブの生成が完了しました
