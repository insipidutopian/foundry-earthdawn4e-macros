const _MACRONAME = "Taunt "
const iconFile = '/icons/taunt.png' //set to the icon you want to use for the active effect on the affected token
main()

function main() {
	let actor = getSingleSelectedToken();
	if (!actor) {
		return ui.notifications.error("Please select a single token");
	}

	let tauntTalent = getTalentByName(actor, _MACRONAME);

	if (!tauntTalent) {
		return ui.notifications.error("Selected token actor does not have the " + _MACRONAME + " talent.");
	}

	console.log("MACRO: " + _MACRONAME + "()Selected actor has " + _MACRONAME + " talent at rank: " + tauntTalent.system.ranks);


	const targets = getTargets(1);
	if (targets === undefined) {
		return ui.notifications.error("Select extactly one token as target of " + _MACRONAME + " talent.");
	}
	const targetActor = targets[0].actor;

	const parameters = {
					actorId: actor.id,
					roll: 'talent',
					attribute: 'charismaStep',
        			// rolltype: 'initiative',
			        itemID: tauntTalent._id,
			        talent: tauntTalent.name,
			        talentID: tauntTalent._id,
			        difficulty: targetActor.system.socialdefense,
			        karma: 1
			    };

	let results = actor.rollPrep(parameters);
    // listen for renderChatMessage to get the result
    let tint = "#ffffff";
    const p = findPlayerOwnerForActor(actor._id);
    if (p) {
    	tint = p.color;
    }
    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
    	if (message && message.rolls && message.rolls.length == 1) {
    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total);
    		
    		if (message.rolls[0]._total >= targetActor.system.socialdefense) {
    			let extraSuccesses = Math.floor((message.rolls[0]._total - targetActor.system.socialdefense) / 5)
    			console.log("MACRO: " + _MACRONAME + "() There are : " + extraSuccesses + " extra successes scored.");
    			let amt = 1 + extraSuccesses;
	    		sendChatMessage(actor, [ actor.name + " used " + _MACRONAME + " on " + targetActor.name, 
	    								 "This causes a -" + amt + " penalty to all of " + targetActor.name + "'s rolls and social defense for " + tauntTalent.system.ranks + " rounds."])

				addActiveEffectsToActor( targetActor, 
	    								`Taunt`,                        // Effect Name
	    								[{ key: `system.bonuses.allRollsStep`, mode: 2, value: `${0 - amt}`, priority: null }, 
	    								 { key: `system.socialdefense`, mode: 2, value: `${0 - amt}`, priority: null } ],  // Taunt Penalty
	    								tauntTalent.system.ranks, // numRounds
	    								0,                              // numTurns
	    								tint,                           // effectTint
	    								iconFile                        // iconName
	    							   )
    			
    		}

    		Hooks.off("renderChatMessage", myHookId);
    	}
	});

}


//function to get the selected actor from token
function getSingleSelectedToken() {
	if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1){
    	console.log("MACRO: " + _MACRONAME + "() Please select a single token");
    	return;
  	}
	let actor = canvas.tokens.controlled[0].actor; 
	console.log("MACRO: " + _MACRONAME + "() selected actor: " + actor.name);

	return actor;
}


//get a Talent
function getTalentByName(actor, talentName) {
	let talent = actor.items.find((item) => item.name.toLowerCase() == talentName.toLowerCase()); 
	console.log("MACRO: " + _MACRONAME + "() looking for talent named '" + talentName + "', found: " + talent);

	return talent;
}

async function updateActorInitiative(actor, newInitiative) {
	console.log("MACRO: " + _MACRONAME + "() Looking for initiative for actor id: " + actor._id);
	let matchingCombatant = game.combat.combatants.find((c) => c.actorId == actor._id);
	if (matchingCombatant) {
		console.log("MACRO: " + _MACRONAME + "() Got an initiative for actor id: " +actor._id + ", init: " + matchingCombatant.initiative);
		await matchingCombatant.update({initiative: newInitiative});
	}
}

function getTargets(maxTargets=1) {
	// Get Target
	let targets = Array.from(game.user.targets)
  	if(targets.length == 0 || targets.length > maxTargets ){
    	console.log("MACRO: " + _MACRONAME + "() Please target 1-" + maxTargets + " token");
    	return;
  	}
  	return targets;
}


function findPlayerOwnerForActor(actorId) {
	for (const p of game.users.players) {
		if (p.character?._id === actorId)
			return p
	}
}


function addActiveEffectToActor(actor, effectName = _MACRONAME + " Effect", changes = "system.bonuses.closeAttack", amount = 1, numRounds=1, numTurns=0, effectTint = "#ffffff", iconName = "systems/earthdawn4e/assets/effect.png") {
	let itemData = {name: `${effectName}`,
	                icon: `${iconName}`,
	                duration: { turns: `${numTurns}`, rounds: `${numRounds}`},
	                origin: `${actor.id}`,
	                tint: `${effectTint}`,
	                changes: [{ key: `${changes}`, mode: 2, value: `${amount}`, priority: null }]
	               }
				actor.createEmbeddedDocuments('ActiveEffect', [itemData])

}

function addActiveEffectsToActor(actor, effectName = _MACRONAME + " Effect", changes = [{ key: `system.bonuses.closeAttack`, mode: 2, value: 1, priority: null }], numRounds=1, numTurns=0, effectTint = "#ffffff", iconName = "systems/earthdawn4e/assets/effect.png") {
	let itemData = {name: `${effectName}`,
	                icon: `${iconName}`,
	                duration: { turns: `${numTurns}`, rounds: `${numRounds}`},
	                origin: `${actor.id}`,
	                tint: `${effectTint}`,
	                changes: changes
	               }
				actor.createEmbeddedDocuments('ActiveEffect', [itemData])

}

function sendChatMessage(actor, paragraphs) {
	let chatTemplate = "";
	if (paragraphs && paragraphs.length > 0) {
		paragraphs.forEach( (line) => {
			chatTemplate += "<p>" + line + "</p>";
		});
	} else {
		chatTemplate = paragraphs;
	}

  	// Send it to chat
  	ChatMessage.create({
    	speaker: {
      		alias: actor.name
    	},
    	content: chatTemplate
	})
}
