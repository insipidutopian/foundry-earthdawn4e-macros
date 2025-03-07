//Quarterstaff defense for targeted token(s)
let tokens = canvas.tokens.controlled; 

// Quarterstaff defense for active player's character. 
if(tokens.length == 0 || tokens.length > 1){
  ui.notifications.error("Please select a single token");
  return;
} else { 
  tokens.forEach(async (token) => { 
    const active = token.actor.getFlag("world", "quarterstaff-defense") ?? false;
    const quarterstaff = token.actor.getEmbeddedCollection('items').filter((talent) => talent.name === 'Quarterstaff'); 
    if (active) {
      ui.notifications.info("Setting " + token.name + " to no longer defensive.");

      // Update the token to remove defensive stance
      await token.actor.update({"system.tactics.defensive": false});
      await token.actor.update({"system.overrides.physicaldefense": 0});    
      return token.actor.setFlag("world", "quarterstaff-defense", false);
    } else {
      ui.notifications.info("Setting " + token.name + " to defensive.");
      // Update the token to add defensive stance 
      await token.actor.update({"system.tactics.defensive": true});
      if (quarterstaff && quarterstaff[0] && quarterstaff[0]?.system.worn === true) // with a quarterstaff bonus
        await token.actor.update({"system.overrides.physicaldefense": 1});

      return token.actor.setFlag("world", "quarterstaff-defense", true);
    }
  });
}

// Quarterstaff defense for active player's character
const active = actor.getFlag("world", "quarterstaff-defense") ?? false;
const quarterstaff = actor.getEmbeddedCollection('items').filter((talent) => talent.name === 'Quarterstaff'); 
if (active) {
  ui.notifications.info("Setting " + actor.name + " to no longer defensive.");

  // Update the token to remove defensive stance
  await actor.update({"system.tactics.defensive": false});
  await actor.update({"system.overrides.physicaldefense": 0});    
  return actor.setFlag("world", "quarterstaff-defense", false);
} else {
  ui.notifications.info("Setting " + actor.name + " to defensive.");
  // Update the token to add defensive stance 
  await actor.update({"system.tactics.defensive": true});
  if (quarterstaff && quarterstaff[0] && quarterstaff[0]?.system.worn === true) // with a quarterstaff bonus
    await actor.update({"system.overrides.physicaldefense": 1});

  return actor.setFlag("world", "quarterstaff-defense", true);
}
