const _MACRONAME = "Fireblood"
main()

async function main() {
	//get the selected token
	let actor = getSingleSelectedToken();
	if (!actor) {
		return ui.notifications.error("Please select a single token.");
	}

	let firebloodTalent = getTalentByName(actor, "fireblood");
	if (!firebloodTalent) {
		return ui.notifications.error("Selected token actor does not have fireblood talent.");
	}

	console.log("MACRO: " + _MACRONAME + "() Selected actor has fireblood talent at rank: " + firebloodTalent.system.ranks);

	console.log("MACRO: " + _MACRONAME + "() Selected actor has " + actor.system.recoverytestscurrent + " of " + actor.system.recoverytestsrefresh + " recovery tests");
	if (actor.system.recoverytestscurrent < 1) {
		return ui.notifications.error("Selected token actor does not have any remaining recovery tests to spend.");
	}
	
	let karma = 1;

	//try to bring up the rollPrep dialog with the selected actor's fireblood bonus preset
	const parameters = {
		actorId: actor.id,
		roll: 'talent',
        itemID: firebloodTalent._id,
        talent: firebloodTalent.name,
        talentID: firebloodTalent._id,
        karma: karma
    };
    actor.rollPrep(parameters);
    
    // listen for renderChatMessage to get the result
    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
    	if (message && message.rolls && message.rolls.length == 1)
    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total)	;
    		spendRecoveryTest(actor, message.rolls[0]._total);
    		
    		ui.notifications.info(`${actor.name} heals ${message.rolls[0]._total} damage, and has ${actor.system.recoverytestscurrent-1} surges remaining.`);
    		Hooks.off("renderChatMessage", myHookId);
	});


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


