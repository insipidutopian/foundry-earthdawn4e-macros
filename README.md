# foundry-earthdawn4e-macros
Several macros that might be helpful for playing Earthdawn 4E on foundry VTT.

## List of Macros
Here you can see the macros, broken into several groups.

### Talent Macros
Macros for automating (within reason) various talents

1. fireblood - selected token spends a healing surge (must have surge available) with the fireblood talent rank as bonus and actor's damage is reduced by amount rolled.
2. maneuver - selected token gains a active effect for 1 round which gives a close attack bonus.  Does not give selective attack bonus vs only the target, rather it is to all close attacks while the active effect is enabled.  Nor does it grant the a maneuver bonus to the close next attack that round from the selected target. WARNING: multiple attacks in a round will still erroneously get this bonus.
3. deliberate assault - when a token with DA is selected, and another token targeted, calculates the DA bonus possible, and allows you to change the selected targets initiative.  Then adds a close combat bonus to the selected token for the rest of the round (and updates an active effect).  WARNING: multiple attacks in a round will still erroneously get this bonus.
4. taunt - applies an active effect on the target token if successful which causes the target to incur a –1 test penalty and subtract –1 from his Social Defense for each success achieved, for a number of rounds equal to the adept’s Taunt rank.  WARNING: earthdawn system 0.8.0 does not seem to support social defense modifiers via active effects.
5. woodskin - checks that token's actor has a recovery test available, uses it, and sets up the roll. The result is then added to the token's unconsciousness and death ratings for woodskin rank hours.
6. battle shout - applies an active effect to the targeted token on success which gives a -2 penalty to all rolls per success for 1 round.
7. fire heal - queries the player to choose the number of recovery tests to attempt to gain, then rolls the step 5 + extra tests modifier GM difficulty, and sets up the fire heal roll.  Once rolled, the result is calculated and the damage & wound(s) are applied on a failure, or an active effect is added to the player token which grants the number of recovery tests as a bonus.  WARNING, resting does not remove this status automatically, it needs to be cleared by the player or GM.
8. tiger spring - sets up the roll for the player and changes their initiative to the rolled value. Must be used in combat.  Strain is taken care of via the roll.

### General GM Macros
1. Award Legend Points - Give legend points to the selected tokens (each token awarded x LP), with option to split (eg. award 400 LP split amongst 2 actors).
2. Award Coins - Give coins to the selected tokens (each token awarded x Tavs/Merchants/Hammers), with option to split (eg. award 400 Tavs split amongst 2 actors).

   
### General Player Macros
1. Weave thread to Item - will open a dialog showing all thread items on a selected token that can have a thread woven or upgraded to (takes into account thread weaving talent rank, threads woven, LP available, and key knowledge), and allows you to roll for the thread weaving if possible.  Then, if succussful, updates the item's threads woven, adds an entry in the LP Tracker, and spends the LP.
2. Quarterstaff Defense - adds the +1 bonus to selected target to defense while weilding a quarterstaff and sets the token to "Defensive", or turns it off it is engaged.

# Acknowledgements
Icons made by Lorc, sbed, Cathelineau, Skoll, and Delapouite. Available on https://game-icons.net/. Game-icons.net is an online repository providing heaps of cool game related graphics. They are provided provided under the terms of the Creative Commons 3.0 BY license.


