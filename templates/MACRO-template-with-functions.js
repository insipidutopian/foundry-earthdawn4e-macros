const _MACRONAME = "Template"
main()

function main() {
	let actor = getSingleSelectedToken();
	if (!actor) {
		return ui.notifications.error("Please select a single token");
	}

	let targets = getTargets(2);
	if (!targets) {
		return ui.notifications.error("Please target at exactly one token");
	} else {
		for (target in targets) {
			console.log("MACRO: " + _MACRONAME + "() target: " + targets[target].name);
		}
	}
}


//function to get the selected actor from token or the player's token
function getSingleSelectedToken() {
	if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
		if (game.users.current && game.users.current.character != null) {
			console.log("MACRO: " + _MACRONAME + "() selected current user's character's actor: " + game.users.current.character.name);
			return game.users.current.character
		}
    	console.log("MACRO: " + _MACRONAME + "() Please select a single token");
    	return;
  	}
	let actor = canvas.tokens.controlled[0].actor; 
	console.log("MACRO: " + _MACRONAME + "() selected actor: " + actor.name);

	return actor;
}

function getTargets(max = 1) {
	// Get Target
  	let targets = Array.from(game.user.targets)
  	if(targets.length == 0 || targets.length > max ){
    	console.log("MACRO: " + _MACRONAME + "() Please target at 1-" + max + " token(s)");
    	return;
  	}
  	return targets;
}

//get a Talent
function getTalentByName(actor, talentName) {
	let talent = actor.items.find((item) => item.name.toLowerCase() == talentName.toLowerCase()); 
	console.log("MACRO: " + _MACRONAME + "() looking for talent named '" + talentName + "', found: " + talent);

	return talent;
}

function spendRecoveryTest(actor, amount) {
	await actor.update({"system.recoverytestscurrent": actor.system.recoverytestscurrent-1})

	if (actor.system.damage.value - amount >= 0) {
		await actor.update({"system.damage.value": actor.system.damage.value - amount})
	} else {
		actor.system.damage.value = 0;
		await actor.update({"system.damage.value": 0})
	}
}

async function updateActorInitiative(actor, newInitiative) {
	console.log("MACRO: " + _MACRONAME + "() Looking for initiative for actor id: " + actor._id);
	let matchingCombatant = game.combat.combatants.find((c) => c.actorId == actor._id);
	if (matchingCombatant) {
		console.log("MACRO: " + _MACRONAME + "() Got an initiative for actor id: " +actor._id + ", init: " + matchingCombatant.initiative);
		await matchingCombatant.update({initiative: newInitiative});
	}
}

function getActorInitiative(actor) {
	console.log("MACRO: " + _MACRONAME + "() Looking for initiative for actor id: " + actor._id);

	//is combat active?
	if (! game.combat) {
		ui.notifications.error("Cannot use this talent outside of combat.");
		return;
	}
	let matchingCombatant = game.combat.combatants.find((c) => c.actorId == actor._id);
	if (matchingCombatant) {
		console.log("MACRO: " + _MACRONAME + "() Got an initiative for actor id: " +actor._id + ", init: " + matchingCombatant.initiative);
		return matchingCombatant.initiative;
	}
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
