///<reference path="foundry.js"/>

const _MACRONAME = "Wood Skin"
const iconFile = '/icons/woodskin.png' //set to the icon you want to use for the active effect on the affected token
main()

function main() {
	let actor = getSingleSelectedToken();
	if (!actor) {
		return ui.notifications.error("Please select a single token");
	}

	let woodskinTalent = getTalentByName(actor, _MACRONAME);

	if (!woodskinTalent) {
		return ui.notifications.error("Selected token actor does not have the " + _MACRONAME + " talent.");
	}

	console.log("MACRO: " + _MACRONAME + "()Selected actor has " + _MACRONAME + " talent at rank: " + woodskinTalent.system.ranks);

	console.log("MACRO: " + _MACRONAME + "() Selected actor has " + actor.system.recoverytestscurrent + " of " + actor.system.recoverytestsrefresh + " recovery tests");
	if (actor.system.recoverytestscurrent < 1) {
		return ui.notifications.error("Selected token actor does not have any remaining recovery tests to spend.");
	}

	const parameters = {
					actorId: actor.id,
					roll: 'talent',
        			// rolltype: 'initiative',
			        itemID: woodskinTalent._id,
			        talent: woodskinTalent.name,
			        talentID: woodskinTalent._id,
			        karma: 1
			    };

    actor.rollPrep(parameters);
    
    // listen for renderChatMessage to get the result
    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
    	if (message && message.rolls && message.rolls.length == 1)
    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total)	;
    		//Spend the Recovery Test
    		actor.update({"system.recoverytestscurrent": actor.system.recoverytestscurrent-1})
    		//key: system.unconscious.max mode: 2, value: message.rolls[0]._total, priority: null
    		//key: system.damage.max mode: 2, value: message.rolls[0]._total, priority: null
    		//duration: woodskinTalent.system.ranks * 60 * 10 //10r/min 60m/hour 
    		addActiveEffectsToActor(actor, 
    								_MACRONAME, 
    								[{key: `system.unconscious.max`, mode: 2, value: message.rolls[0]._total, priority: null },
    								 {key: `system.damage.max`, mode: 2, value: message.rolls[0]._total, priority: null }],
    								woodskinTalent.system.ranks * 60 * 10, 
    								0, 
    								undefined, 
    								iconFile);

    		ui.notifications.info(`${actor.name} skin hardens increasing their unconsciousness and death ratings by ${message.rolls[0]._total}, and they now have ${actor.system.recoverytestscurrent} recovery tests remaining.`);
    		Hooks.off("renderChatMessage", myHookId);
	});

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
