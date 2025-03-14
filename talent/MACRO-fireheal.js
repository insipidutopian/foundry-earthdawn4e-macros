const _MACRONAME = "Fire Heal"
const iconFile = "icons/fireheal.png"
main()


function evaluateFireHealSuccess(actor, testsToGain, roll, difficulty) {
	let chatMessage = `<p>${actor.name} used their Fire Heal talent attempting to gain ${testsToGain} Recovery Test(s).<p>`;
	chatMessage += `<p>They rolled a ${roll} against a difficulty of ${difficulty}.</p>`;
	console.log("MACRO: " + _MACRONAME + "() " + chatMessage);
	if (roll >= difficulty) {
		//increase recovery tests max + current by num successes
		console.log("MACRO: " + _MACRONAME + "() success! increase recovery tests max + current by num successes");
		chatMessage += `<p>They were successful, and gained ${testsToGain} Recovery Test(s) until they gain their Recovery Tests the following day.</p>`;
		addActiveEffectsToActor( actor, 
	    								`${_MACRONAME}`,                // Effect Name
	    								[{ key: `system.recoverytestsrefreshFinal`, mode: 2, value: `${testsToGain}`, priority: null }, 
	    								 { key: `system.recoverytestscurrent`, mode: 2, value: `${testsToGain}`, priority: null } ],  // Gained Tests
	    								9999,                           // numRounds
	    								0,                              // numTurns
	    								undefined,                      // effectTint
	    								iconFile                        // iconName
	    							   )
	} else {
		//take wound + damage step difficulty - roll (and possibly additional wounds)
		let damageTaken = difficulty - roll;
		let woundsTaken = 1 + Math.floor(damageTaken/actor.system.woundThreshold);
		actor.update({"system.damage.value": actor.system.damage.value + damageTaken})
		actor.update({"system.wounds": actor.system.wounds + woundsTaken})
		console.log("MACRO: " + _MACRONAME + "() failure! take wound + damage step difficulty - roll (and possibly additional wounds)");
		chatMessage += `<p>They were unsuccessful, and took ${damageTaken} damage and ${woundsTaken} wound(s).</p>`;
	}

	// Send it to chat
  	ChatMessage.create({
    	speaker: {
      		alias: actor.name
    	},
    	content: chatMessage
  	})


}


async function main() {
	let actor = getSingleSelectedToken();
	if (!actor) {
		return ui.notifications.error("Please select a single token");
	}

	let fireHealTalent = getTalentByName(actor, _MACRONAME);

	if (!fireHealTalent) {
		return ui.notifications.error("Selected token actor does not have the " + _MACRONAME + " talent.");
	}

	console.log("MACRO: " + _MACRONAME + "() Selected actor has " + _MACRONAME + " talent at rank: " + fireHealTalent.system.ranks);

	let actorFirehealOptions = ""; //[0,1,2] // from 0..rank so long as new initiative >= 0f
		for(var i=1;i<=10;i++) {
			actorFirehealOptions += `<option value=${i}>${i}</option>`
		}
	let dialogTemplate = `<style>div {text-align: center;}</style>
			<h2> Pick an amount of Reecovery Tests</h2>
			<p>You may choose any number of recovery tests to attempt to gain.</p> 
			<p><i>Each Recovery Test you attempt to gain past the first will require an additional success on your 
				  Fire Heal Test compared to the result of a Step 5/d8 test made by the gamemaster.</i></p>
			<div style="display:flex">
				<div  style="flex:1">Tests to Gain: <select id="testsToGain">${actorFirehealOptions}</select></div>
			</div>`

	new Dialog({
		title: "Fire Heal", 
		content: dialogTemplate,
		buttons: {
		  useDA: {
		    label: "Use Fire Heal", 
		    callback: (html) => {

			    let testsToGain = html.find("#testsToGain")[0].value;
			    console.log("MACRO: " + _MACRONAME + "() tests to gain: " + testsToGain );



			    console.log("MACRO: " + _MACRONAME + "() setting difficulty to the result of Step 5/d8 + " + (testsToGain-1) *5);
			    //let difficulty = getRollResult('1d8x').resolve();
			    let targetDifficulty = 0;

			    (async () => {
    				//await undefined;
    				let difficulty = await new Roll('1d8x').roll();
    				targetDifficulty = difficulty._total + (testsToGain-1) *5;
					console.log("MACRO: " + _MACRONAME + "() difficulty roll was:" + targetDifficulty);
				    const parameters = {
							actorId: actor.id,
							roll: 'talent',
							attribute: 'willpowerStep',
					        itemID: fireHealTalent._id,
					        talent: fireHealTalent.name,
					        talentID: fireHealTalent._id,
					        difficulty: targetDifficulty,
					        karma: 1
			    };

				let results = actor.rollPrep(parameters);
				})();		

				
			    // listen for renderChatMessage to get the result
			    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
			    	if (message && message.rolls && message.rolls.length == 1) {
			    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total)	;
			    		evaluateFireHealSuccess(actor, testsToGain, message.rolls[0]._total, targetDifficulty)
			    		Hooks.off("renderChatMessage", myHookId);
			    	}
				});
		   
		    }
		  }, 
		  close: {
		    label: "Close"
		  }
		}
	}).render(true)


	
}

async function getRollResult(rollParam) {
	let rollResult = await new Roll(rollParam).roll();
	console.log("MACRO: " + _MACRONAME + "() Rolled: " + rollParam + ", result is: " + rollResult._total);
	return rollResult._total;
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

