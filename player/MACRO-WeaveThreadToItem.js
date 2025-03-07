const {StringField} = foundry.data.fields;

const _MACRONAME = "WeaveThreadToItem"
main()



function getThreadWeavingCostStatus(itemThreadWeavingInfo) {
	let style = "color:green";

	let costStr = itemThreadWeavingInfo.nextThreadLPCost + "LP"
	if (!itemThreadWeavingInfo.currentlyCanWeave) {
		style = "color:red";
		costStr = itemThreadWeavingInfo.currentlyCantWeaveReason;
	}
	return '<section class="flex" style="' + style + '">' + costStr + "</section>";

}

function getThreadItemTierAbbrev(itemTier) {
	console.log("MACRO: " + _MACRONAME + "() item tier is: " + itemTier);
	
	if (itemTier === "tierJourneyman") return "JRNY";
	if (itemTier === "tierWarden") return "WRDN";
	if (itemTier === "tierMaster") return "MSTR";
 	return "NOVC";
	
}


function getThreadWeavingInfo(itemId) {
	const threadCosts = {
		tierNovice: [100, 200, 300, 500, 800, 1300, 2100, 3400, 5500],
		tierJourneyman: [200, 300, 500, 800, 1300, 2100, 3400, 5500, 8900],
		tierWarden: [300, 500, 800, 1300, 2100, 3400, 5500, 8900, 14400],
		tierMaster: [500, 800, 1300, 2100, 3400, 5500, 8900, 14400, 23300]
	}

	let itemThreadWeavingInfo = {
		itemName: "",
		id: itemId,
		threadsWoven: 0,
		nextThreadRank: 0,
		nextThreadWeavingDifficulty: 0,
		nextThreadLPCost: 0,
		itemTier: "",
		itemTierAbbrev: "",
		currentlyCanWeave: true,
		currentlyCantWeaveReason: "",
	}

	const threadItems = actor.getEmbeddedCollection('items').filter((item) => item._id === itemId);

	for (let j=0; j < threadItems[0].system.numberthreads; j++) {
		if (threadItems[0].system.threads['rank' + (j+1).toString()]?.threadactive)
			itemThreadWeavingInfo.threadsWoven++;
	}

	itemThreadWeavingInfo.itemName = threadItems[0].name;
	itemThreadWeavingInfo.nextThreadRank = itemThreadWeavingInfo.threadsWoven +1;
	itemThreadWeavingInfo.nextThreadWeavingDifficulty = itemThreadWeavingInfo.nextThreadRank + 7;
	itemThreadWeavingInfo.nextThreadLPCost = threadCosts[threadItems[0].system.threadItemTier || 'tierNovice'][itemThreadWeavingInfo.threadsWoven];
	itemThreadWeavingInfo.itemTier = threadItems[0].system.threadItemTier;
	itemThreadWeavingInfo.itemTierAbbrev = getThreadItemTierAbbrev(itemThreadWeavingInfo.itemTier);

	if (itemThreadWeavingInfo.nextThreadLPCost > actor.system.legendpointcurrent) {
		itemThreadWeavingInfo.currentlyCanWeave = false;
		itemThreadWeavingInfo.currentlyCantWeaveReason = "Not enough LP";
		console.log("MACRO: " + _MACRONAME + "() Can't weave thread to item: " + itemThreadWeavingInfo.currentlyCantWeaveReason);
	}
	let costStr = 'Cost: ' + itemThreadWeavingInfo.nextThreadLPCost + " LP";
	if (itemThreadWeavingInfo.threadsWoven >= threadItems[0].system.numberthreads) {
		itemThreadWeavingInfo.currentlyCanWeave = false;
		itemThreadWeavingInfo.currentlyCantWeaveReason = "MAX item threads already woven";
		console.log("MACRO: " + _MACRONAME + "() Can't weave thread to item: " + itemThreadWeavingInfo.currentlyCantWeaveReason);
	}

	if (itemThreadWeavingInfo.nextThreadRank > actor.items.find((item) => item.name.toLowerCase().startsWith('thread weaving'))?.system.ranks) {
		itemThreadWeavingInfo.currentlyCanWeave = false;
		itemThreadWeavingInfo.currentlyCantWeaveReason = "Thread Weaving talent limit reached";
		console.log("MACRO: " + _MACRONAME + "() Can't weave thread to item: " + itemThreadWeavingInfo.currentlyCantWeaveReason);
	}

	//Is there a Key knowledge required, and if so, is the test knowledge there?
	const nRank = 'rank' + itemThreadWeavingInfo.nextThreadRank.toString();
	if (threadItems[0].system.threads[nRank]?.keyknowledge !== "" && threadItems[0].system.threads[nRank]?.testknowledge === "")  {
		itemThreadWeavingInfo.currentlyCanWeave = false;
		itemThreadWeavingInfo.currentlyCantWeaveReason = "Test Knowledge for rank " + itemThreadWeavingInfo.nextThreadRank.toString() + " required";
		console.log("MACRO: " + _MACRONAME + "() Can't weave thread to item: " + itemThreadWeavingInfo.currentlyCantWeaveReason);
	}

	return itemThreadWeavingInfo;
}


async function weaveThreadToItem(actor, threadWeavingTestResult, itemChosen, threadWeavingInfo) {
	console.log("MACRO: " + _MACRONAME + "() Weave thread to item: " + itemChosen + ", got a " + threadWeavingTestResult);
	if (threadWeavingTestResult >= threadWeavingInfo.nextThreadWeavingDifficulty) {
		console.log("MACRO: " + _MACRONAME + "() Weave thread to item: " + itemChosen + ", success! (difficulty: " + threadWeavingInfo.nextThreadWeavingDifficulty + ")");
		
		actor._writeLPspending({id: itemChosen}, 
				{
					data: { itemType: "thread", 
							itemName: threadWeavingInfo.itemName + " Thread",
						  	changeDescription: "Rank Increase: " + (+threadWeavingInfo.nextThreadRank-1).toString() + "↣" + threadWeavingInfo.nextThreadRank,
						  	valueBefore: threadWeavingInfo.nextThreadRank-1,
						  	valueAfter: threadWeavingInfo.nextThreadRank,
						  	currentAvailableLP: actor.system.legendpointcurrent,
						  	lpTotalAtCreationTime: actor.system.legendpointtotal

						  },
					creationTime: Date.now(),
					lpCost: threadWeavingInfo.nextThreadLPCost
				});

		
		actor.update({"system.legendpointcurrent": actor.system.legendpointcurrent - threadWeavingInfo.nextThreadLPCost})
		const threadItems = actor.getEmbeddedCollection('items').filter((item) => item._id === itemChosen);
		console.log("MACRO: " + _MACRONAME+ "() Item Weaving to: " + threadItems[0].name + ", id=" + threadItems[0]._id);
		//update actor's item with id itemChosen item.system.threads['rank' + (threadWeavingInfo.nextThreadRank).toString()].threadactive)
		let tPath = 'system.threads.rank' + threadWeavingInfo.nextThreadRank + '.threadactive';
		let itemUpdate = {};
		itemUpdate[tPath] = true;
		await threadItems[0].update(itemUpdate);
		
		ui.notifications.info("Weave a Rank " + threadWeavingInfo.nextThreadRank + " thread to item: " + itemChosen + ", , success!  Cost was " + threadWeavingInfo.nextThreadLPCost + " LP.");
		// Prepare a Chat message
      	let chatTemplate = `<p> ${actor.name} wove a Rank ${threadWeavingInfo.nextThreadRank} Thread to ${threadWeavingInfo.itemName}.</p>
      						<p>They spent ${threadWeavingInfo.nextThreadLPCost} Legend Points.</p>`
      	// Send it to chat
      	ChatMessage.create({
        	speaker: {
          		alias: actor.name
        	},
        	content: chatTemplate
      	})
	} else {
		console.log("MACRO: " + _MACRONAME + "() Weave thread to item: " + itemChosen + ", failed! (difficulty: " + threadWeavingInfo.nextThreadWeavingDifficulty + ")");
		ui.notifications.warn("Weave thread to item: " + itemChosen + ", failed! You cannot try again until tomorrow.");
	}
}


async function main() {
	// Get selected token
	if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
    	ui.notifications.error("Please select a single token");
    	return;
  	}
	let actor = canvas.tokens.controlled[0].actor; 
	let talentRank = actor.items.find((item) => item.name.toLowerCase().startsWith('thread weaving'))?.system.ranks; 

	let threadWeavingTalent = actor.items.find((item) => item.name.toLowerCase().startsWith('thread weaving'));

	if (!talentRank) {
		ui.notifications.error("Selected token does not have suitable Thread Weaving talent.");
    	return;
	}
  	console.log("MACRO: " + _MACRONAME + "() actor has " + talentRank + " ranks in Thread Weaving");


  	const threadItems = actor.getEmbeddedCollection('items').filter((item) => item.system.isthread === true);
  	console.log("MACRO: " + _MACRONAME + "() actor has " + threadItems.length + " Thread Items");
  	if (threadItems.length === 0) {
  		ui.notifications.error("Selected token does not appear to have any suitable Thread Items.");
    	return;
  	}

  	
	let threadWeavingInfo = {};
  	let actorTIOptions = "";
  	//let actorsThreadItems = "<ul>";//
  	let actorsThreadItems = "<ul><li class='flexrow lihead'><section class='flex0'></section><section class='flex2'><strong>Name</strong></section><section class='flex1'>Tier</section><section class='flex1'>Threads</section><section class='flex2'>Cost</section></li>"

	for(var i=0;i<threadItems.length;i++) {
		console.log("MACRO: " + _MACRONAME + "() adding " + i + ". " + threadItems[i].name + " to selector");
		let threadsWoven = 0; //figure out how many thread ranks are woven to the item
		for (let j=0; j < threadItems[i].system.numberthreads; j++) {
			if (threadItems[i].system.threads['rank' + (j+1).toString()]?.threadactive)
				threadsWoven++;
		}
		threadWeavingInfo[threadItems[i]._id] = getThreadWeavingInfo(threadItems[i]._id);

		actorTIOptions += `<option value="${threadItems[i].name}" ${(threadWeavingInfo[threadItems[i]._id].currentlyCanWeave?"":"disabled")}>${threadItems[i].name}</option>`;
		actorsThreadItems += `<li class="flexrow"><img class="flex0" src="${threadItems[i].img}" width="30" height="30"/>`
		actorsThreadItems += `<section class="flex2">${threadItems[i].name}</section>`
		actorsThreadItems += `<section class="flex1">${threadWeavingInfo[threadItems[i]._id].itemTierAbbrev}</section>`
		actorsThreadItems += `<section class="flex1">${threadsWoven}/${threadItems[i].system.numberthreads}</section>`
		actorsThreadItems += `<section class="flex2">${getThreadWeavingCostStatus(threadWeavingInfo[threadItems[i]._id])}</section></li>`
	}
	actorsThreadItems += "</ul>"


  	let itemChosen;
  	for (let k=0; k< threadItems.length; k++) {
  		if (threadWeavingInfo[threadItems[k]._id].currentlyCanWeave) {
  			itemChosen = threadItems[k]._id;
  			break;
  		}
  	}

  	let currentWeaveString = "No items qualify";
  	if (itemChosen) {
		currentWeaveString = `Weaving a Rank ${threadWeavingInfo[itemChosen].nextThreadRank} Thread to ${threadWeavingInfo[itemChosen].itemName}, costing ${threadWeavingInfo[itemChosen].nextThreadLPCost} LP.`;
  	} else {
  		ui.notifications.warn("Selected token does not appear to have any suitable Thread Items.");
  	}

	let choices = threadItems.filter((ti) => threadWeavingInfo[ti._id].currentlyCanWeave).reduce((acc, ti) => {
	    acc[ti._id] = ti.name;
	    return acc;
	}, {});
	console.log("MACRO: " + _MACRONAME + "() actor has " + threadItems.length + " thread items to select from.");

	const itemField = new StringField({
    	label: "Select an Item to Weave to:",
    	choices,
    	required: true
	}).toFormGroup({}, { name: "item", disabled: false }).outerHTML;


	let dialogTemplate = `<style>div {text-align: center;} 
		 li.lihead {text-align: center; font-size: 1.2rem;}</style>
		<form>
			<h3> Weave a Thread to an Item</h3>
			<p>${actor.name} Thread Weaving: Rank ${talentRank}<br/>
			   ${actor.name} Current LP Available: ${actor.system.legendpointcurrent} LP</p>
			
			<h4>Available Items</h4>
			<ul>
				${actorsThreadItems}
			</ul>
			<div style="display:flex">
				${itemField}
			</div>
			<div style="display:flex">
				<div  style="flex"><p id="fillMeUp">${currentWeaveString}</p></div>
			</div>
		</form>`;


	const d = new foundry.applications.api.DialogV2({
		title: "Weave a Thread to an Item", 
		content: dialogTemplate,
		buttons: [
		  
		  { 
		    label: "Choose Item", 
		    callback: async (_event, button) => {
		    	console.log("MACRO: " + _MACRONAME + "() " + actor.name + " chose an item.");
				console.log("MACRO: " + _MACRONAME + "() Item Chosen - " + itemChosen);

				const parameters = {
					actorId: actor.id,
					roll: 'talent',
			        itemID: threadWeavingTalent._id,
			        talent: threadWeavingTalent.name,
			        talentID: threadWeavingTalent._id,
			        difficulty: threadWeavingInfo[itemChosen].nextThreadWeavingDifficulty,
			        karma: 1
			    };
			    let results = actor.rollPrep(parameters);
			    // listen for renderChatMessage to get the result
			    const myHookId = Hooks.on("renderChatMessage", (message, i, d) => {
			    	if (message && message.rolls && message.rolls.length == 1) {
			    		console.log("MACRO: " + _MACRONAME + "() I intercepted a chat message: " + message.rolls[0]._total)	;
			    		weaveThreadToItem(actor, message.rolls[0]._total, itemChosen, threadWeavingInfo[itemChosen]);
			    		Hooks.off("renderChatMessage", myHookId);
			    	}
				});
		    }
		  },
		],
		position: {
	      left: 100,
    	  top: 100,
          width: 650
      	}

	})

	d.addEventListener("render", () => {
		console.log("MACRO: " + _MACRONAME + "() " + actor.name + " in render callback.");
	    const html = d.element;
	    html.querySelector("[name=item]").addEventListener("change", (event) => {
	    	console.log("MACRO: " + _MACRONAME + "() " + actor.name + " in event listener.");
	        const select = html.querySelector("[name=item]");
	        itemChosenFlag = true;
	        console.log("MACRO: " + _MACRONAME + "() " + actor.name + " weaving thread to " + select.value);
	        itemChosen = select.value;

	        html.querySelector("[id=fillMeUp]").innerHTML = `Weaving a Rank ${threadWeavingInfo[itemChosen].nextThreadRank} Thread to ${threadWeavingInfo[itemChosen].itemName}, costing ${threadWeavingInfo[itemChosen].nextThreadLPCost} LP.`;

    	});
    //html.querySelectorAll(".form-footer > button").forEach(e => e.style["min-width"] = "133px");
});


	d.render(true);

}