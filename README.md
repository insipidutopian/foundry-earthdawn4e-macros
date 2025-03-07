# foundry-earthdawn4e-macros
Several macros that might be helpful for playing Earthdawn 4E on foundry VTT.

## List of Macros
Here you can see the macros, broken into several groups.

### Talent Macros
Macros for automating (within reason) various talents

1. fireblood - selected token spends a healing surge (must have surge available) with the fireblood talent rank as bonus and actor's damage is reduced by amount rolled.
2. maneuver - selected token gains rolls an attack against the targeted token, and gains a maneuver bonus to the close next attack that round (assumes selected token will attack target).  Does not give selective bonus vs the target
3. deliberate assault - when a token with DA is selected, and another token targeted, calculates the DA bonus possible, and allows you to change the selected targets initiative.  Then adds a close combat bonus to the selected token for the rest of the round (and updates an active effect).  WARNING: multiple attacks in a round will still erroneously get this bonus.

### General GM Macros
1. Award Legend Points - Give legend points to the selected tokens (each token awarded x LP), with option to split (eg. award 400 LP split amongst 2 actors).
2. Award Coins - Give coins to the selected tokens (each token awarded x Tavs/Merchants/Hammers), with option to split (eg. award 400 Tavs split amongst 2 actors).

   
### General Player Macros
1. Weave thread to Item - will open a dialog showing all thread items on a selected token that can have a thread woven or upgraded to (takes into account thread weaving talent rank, threads woven, LP available, and key knowledge), and allows you to roll for the thread weaving if possible.  Then, if succussful, updates the item's threads woven, adds an entry in the LP Tracker, and spends the LP.
2. Quarterstaff Defense - adds the +1 bonus to selected target to defense while weilding a quarterstaff and sets the token to "Defensive", or turns it off it is engaged.
