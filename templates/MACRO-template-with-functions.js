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


