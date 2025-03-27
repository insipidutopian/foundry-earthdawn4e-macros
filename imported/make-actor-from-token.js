// Clones actor details from the selected token(s) into a new Actor in the item list.
// from https://github.com/foundry-vtt-community/
// Useful if you made changes to the actor associated with the token, but want to save that
//  updated Actor for later use or into a Compendium.
// Created Actor will default to the name of the token with the actorNameSuffix (default: ' (New)')
//  and the prototype token for the new actor will default to the token's current name


// WORKS ONLY FOR UNLINKED ACTORS

const actorNameSuffix = " (New)";

canvas.tokens.controlled.forEach(o => {
  Actor.create(o.actor).then(a => {
    a.update({name: o.name + actorNameSuffix});  
    a.update({prototypeToken: {name: o.name}
             }); 
  });
});