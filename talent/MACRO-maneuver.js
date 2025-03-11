const _MACRONAME = "Maneuver"
main()

function main() {
	let actor = getSingleSelectedToken();
	let targetedActor;
	if (!actor) {
		return ui.notifications.error("Please select a single token");
	}

	let targets = getTargets(1);
	if (!targets) {
		return ui.notifications.error("Please target at least one token");
	} else {
		for (target in targets) {
			console.log("MACRO: " + _MACRONAME + "() target: " + targets[target].name);
			targetedActor = targets[target];
			console.log("MACRO: " + targets[target].actor.system.physicaldefense);
		}
	}

	let maneuverTalent = getTalentByName(actor, "maneuver");
	if (!maneuverTalent) {
		return ui.notifications.error("Selected token actor does not have maneuver talent.");
	}

	console.log("MACRO: " + _MACRONAME + "()Selected actor has maneuver talent at rank: " + maneuverTalent.system.ranks);

	//try to bring up the rollPrep dialog with the selected actor's maneuver bonus preset
	const parameters = {
		actorId: actor.id,
		roll: 'talent',
        itemID: maneuverTalent._id,
        talent: maneuverTalent.name,
        talentID: maneuverTalent._id,
        difficulty: targetedActor.actor.system.physicaldefense
    };
    actor.rollPrep(parameters);

	// listen for renderChatMessage to get the result
    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
    	if (message && message.rolls && message.rolls.length == 1) {
    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total)	;
    		//see if roll was successful...
    		if (message.rolls[0]._total >= targetedActor.actor.system.physicaldefense) {
    			let successes = 1 + Math.floor((message.rolls[0]._total-targetedActor.actor.system.physicaldefense)/5);

    			//create an active Effect that lasts 1 turn that gives a closeAttack bonus of initiative diff up to the rank of deliberate assault talent 
				let itemData = {name: `Maneuver`,
				                icon: "icons/maneuver.svg",
				                duration: {rounds: 1},
				                origin: actor.id,
				                tint: "#228822",
				                changes: [{ key: "system.bonuses.closeAttack", mode: 2, value: successes*2, priority: null }]
				               }
				actor.createEmbeddedDocuments('ActiveEffect', [itemData])

    			ui.notifications.info(`${actor.name} gains a +${successes*2} bonus to physical defense vs that target as well as damage.`);
    			console.log("MACRO: " + _MACRONAME + "() got " + successes + " successes");

    			let chatTemplate = `<p> ${actor.name} gains a +${successes*2} bonus to physical defense against ${targetedActor.actor.name}.</p>
    								<p>They also took 1 strain, but gained a +${successes*2} bonus to their next close attack roll this turn.</p>`
		      	// Send it to chat
		      	ChatMessage.create({
		        	speaker: {
		          		alias: actor.name
		        	},
		        	content: chatTemplate
		      	})
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

function getTargets(min = 1, max = 1) {
	// Get Target
  	let targets = Array.from(game.user.targets)
  	if(targets.length < min || targets.length > max ){
    	console.log("MACRO: " + _MACRONAME + "() Please target at " + min + "-" + max + " token(s)");
    	return;
  	}
  	return targets;
}

//get a Talent
function getTalentByName(actor, talentName) {
	let talent = actor.items.find((item) => item.name.toLowerCase() == talentName); 
	console.log("MACRO: " + _MACRONAME + "() looking for talent named '" + talentName + "', found: " + talent);

	return talent;
}

function spendRecoveryTest(actor, amount) {
	actor.update({"system.recoverytestscurrent": actor.system.recoverytestscurrent-1})

	if (actor.system.damage.value - amount >= 0) {
		actor.update({"system.damage.value": actor.system.damage.value - amount})
	} else {
		actor.system.damage.value = 0;
		actor.update({"system.damage.value": 0})
	}
}