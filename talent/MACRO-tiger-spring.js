const _MACRONAME = "Tiger Spring"
main()

function main() {
	let actor = getSingleSelectedToken();
	if (!actor) {
		return ui.notifications.error("Please select a single token");
	}

	let tigerSpringTalent = getTalentByName(actor, 'tiger spring');

	if (!tigerSpringTalent) {
		return ui.notifications.error("Selected token actor does not have the " + _MACRONAME + " talent.");
	}

	console.log("MACRO: " + _MACRONAME + "()Selected actor has " + _MACRONAME + " talent at rank: " + tigerSpringTalent.system.ranks);


	const parameters = {
					actorId: actor.id,
					roll: 'talent',
					attribute: 'strengthStep',
        			rolltype: 'initiative',
			        itemID: tigerSpringTalent._id,
			        talent: tigerSpringTalent.name,
			        talentID: tigerSpringTalent._id,
			        difficulty: 0,
			        karma: 1
			    };

	let results = actor.rollPrep(parameters);
    // listen for renderChatMessage to get the result
    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
    	if (message && message.rolls && message.rolls.length == 1) {
    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total)	;
    		updateActorInitiative(actor, message.rolls[0]._total)
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
	let talent = actor.items.find((item) => item.name.toLowerCase() == talentName); 
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



