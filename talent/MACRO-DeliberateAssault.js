const _MACRONAME = "Deliberate Assault"
main()


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

async function updateActorInitiative(actor, newInitiative) {
	console.log("MACRO: " + _MACRONAME + "() Looking for initiative for actor id: " + actor._id);
	let matchingCombatant = game.combat.combatants.find((c) => c.actorId == actor._id);
	if (matchingCombatant) {
		console.log("MACRO: " + _MACRONAME + "() Got an initiative for actor id: " +actor._id + ", init: " + matchingCombatant.initiative);
		await matchingCombatant.update({initiative: newInitiative});
	}
}

async function main() {
	// Get selected token
	if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1){
    	ui.notifications.error("Please select a single token");
    	return;
  	}
	let actor = canvas.tokens.controlled[0].actor; 
	//console.log("MACRO: " + _MACRONAME + "() name: "actor.name);

	let talentRank = actor.items.find((item) => item.name.toLowerCase() == 'deliberate assault')?.system.ranks; 

	if (!talentRank) {
		ui.notifications.error("Selected token does not have Deliberate Assault talent.");
    	return;
	}
  	
  	// Get Target
	let targets = Array.from(game.user.targets)
  	if(targets.length == 0 || targets.length > 1 ){
    	ui.notifications.error("Please target one token");
    	return;
  	}
  	let targetActor = targets[0].actor;

	let actorName = actor.name;
	let strain = 1; //get the talent, then talent.system.strain shows the strain
	let chatString = actorName + " uses Deliberate Assault, taking " + strain + " strain, gaining a bonus on his next attack roll."
	console.log("MACRO: " + _MACRONAME + "() actor has " + actor.system.damage.value + " damage before strain");
	let dmgBefore = actor.system.damage.value;
	

	let selectedActorInitiative = getActorInitiative(actor)
	if (! selectedActorInitiative) {
		console.log("MACRO: " + _MACRONAME + "() cannot use deliberate assault outside of combat.");
		return;
	}
	
	console.log("MACRO: " + _MACRONAME + "() Selected actor has Deliberate Assault ranks: " + talentRank)
				
	// Select Initiative
	let actorInitOptions = ""; //[0,1,2] // from 0..rank so long as new initiative >= 0f
	for(var i=0;i<=selectedActorInitiative;i++) {
		actorInitOptions += `<option value=${i}>${i}</option>`
	}

	let dialogDiffStr = `${getActorInitiative(targetActor) - selectedActorInitiative} below`;
	if (getActorInitiative(targetActor) - selectedActorInitiative < 0)
		dialogDiffStr = `${selectedActorInitiative - getActorInitiative(targetActor)} above`
	else if (getActorInitiative(targetActor) - selectedActorInitiative == 0)
		dialogDiffStr = 'equal to';
	let dialogTemplate = `<style>div {text-align: center;}</style>
		<h2> Pick an amount to reduce your initiative</h2>
		<p>Your initiative is currently ${dialogDiffStr} your target, with a 
			maximum benefit of +${talentRank} (+1 for each point your initiative is below theirs).  
			How much would you like you reduce your initiative?  <i>Your initiative may not
			be reduced below 0.</i></p>
		<div style="display:flex">
			<div  style="flex:1">Reduce it by: <select id="initReduction">${actorInitOptions}</select></div>
		</div>`

	new Dialog({
		title: "Deliberate Assault", 
		content: dialogTemplate,
		buttons: {
		  useDA: {
		    label: "Use Deliberate Assault", 
		    callback: (html) => {

		    	let newInitiative = selectedActorInitiative
			    let initReduction = html.find("#initReduction")[0].value;
			      
			    let initReductionStr = ` to reduce their initiative by ${initReduction}`;
			    if (initReduction == 0) {
			      	initReductionStr = `, keeping their initiative as is.`;
			    } else {
			      	newInitiative = getActorInitiative(actor) - initReduction;
			      	updateActorInitiative(actor, newInitiative)
			    }

		      	let initiativeDifference = getActorInitiative(targetActor) - newInitiative;
				if (initiativeDifference < 1) {
					ui.notifications.error("Please select a token with a higher initiative than you, or lower your initiative");
					return;
				}

				//take the strain now
				actor.update({"system.damage.value": dmgBefore + strain})
				console.log("MACRO: " + _MACRONAME + "() " + actor.system.damage.value + " damage after strain");
				let dmgAfter = actor.system.damage.value;

				console.log("MACRO: " + _MACRONAME + "() initiative for difference: " + initiativeDifference)
				let attackBonus = Math.min(initiativeDifference, talentRank);

				//create an active Effect that lasts 1 turn that gives a closeAttack bonus of initiative diff up to the rank of deliberate assault talent 
				let itemData = {name: `Deliberate Assault Bonus (+${attackBonus})`,
				                icon: "icons/",
				                duration: {turns: 1},
				                origin: actor.id,
				                tint: "#228822",
				                changes: [{ key: "system.bonuses.closeAttack", mode: 2, value: attackBonus, priority: null }]
				               }
				actor.createEmbeddedDocuments('ActiveEffect', [itemData])


				ui.notifications.info(`${chatString} (Their current damage ${dmgBefore}->${dmgAfter})`)
		      	// Prepare a Chat message
		      	let chatTemplate = `<p> ${actor.name} used Deliberate Assault${initReductionStr}.</p><p>They also took 1 strain, 
		      						but gained a +${attackBonus} bonus to their next close attack roll this turn.</p>`
		      	// Send it to chat
		      	ChatMessage.create({
		        	speaker: {
		          		alias: actor.name
		        	},
		        	content: chatTemplate
		      	})
		   
		    }
		  }, 
		  close: {
		    label: "Close"
		  }
		}
	}).render(true)

}