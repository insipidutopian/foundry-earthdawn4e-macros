const _MACRONAME = "Journal Award"


//from https://sites.google.com/view/earthdawnwestmarches/rules ECR Rewards by Circle guidelines
// ECR                   1    2    3    4     5      6     7    8     9     10    11    12     13     14     15
// LP Required           0   600  2300 7000 16500   35k   70k  132k  255k  490k  922k  1695k  3175k  6050k  11.2M 
let lpJournalAward = [0, 10,  40,  70, 110,  200,   375,  650, 950,  1950, 3450, 6200,  9200, 17000, 31000, 48000];
let spJournalAward = [0, 37,  55,  75, 100,  125,   175,  200, 230,   260,  360,  515,  645,   900,   1030, 1285];

main()

function getLPJournalAwardForCircle(circle) {
  if (circle && Number.isInteger(circle) && circle > 0 && circle < 16) {
    return lpJournalAward[circle];
  }

  console.log("MACRO: " + _MACRONAME + "() Error calculating Journal LP Award for circle: `" + circle + "`.");
  return 0;

}

function getSPJournalAwardForCircle(circle) {
  if (circle && Number.isInteger(circle) && circle > 0 && circle < 16) {
    return spJournalAward[circle];
  }

  console.log("MACRO: " + _MACRONAME + "() Error calculating Journal SP Award for circle: `" + circle + "`.");
  return 0;

}


function calculatePcEffectiveCircle(pc) {
  console.log("MACRO: " + _MACRONAME + "() Calculating effective circle for " + pc.name + " with LP: " + pc.system.legendpointtotal)
  if (pc.system.legendpointtotal < 800)
    return 1;
  else if (pc.system.legendpointtotal < 2300) 
    return 2;
  else if (pc.system.legendpointtotal < 7000) 
    return 3;
  else if (pc.system.legendpointtotal < 16500) 
    return 4;
  else if (pc.system.legendpointtotal < 35000) 
    return 5;
  else if (pc.system.legendpointtotal < 70000) 
    return 6;
  else if (pc.system.legendpointtotal < 132000) 
    return 7;
  else if (pc.system.legendpointtotal < 255000) 
    return 8;
  else 
    return 9;
}


function main() {
  let selectedTokens = canvas.tokens.controlled; 

  //Remove non-PC tokens 
  const tokens = selectedTokens.filter((token) => token.actor.type === "pc");

  console.log("MACRO: " + _MACRONAME + "() # Selected Tokens: " + tokens.length)

  if (tokens.length < 1) {
    return ui.notifications.error("Please select at least 1 PC token.");
  }

  let consoleLogString = "<p><strong>Journal award!</strong></p>  <p>Given to:</p><ul>";
  let itemsProcessed = 0;
  tokens.forEach(async (pc) => { 
    circle = calculatePcEffectiveCircle(pc.actor);
    console.log("MACRO: " + _MACRONAME + "() PC/circle: " + pc.actor.name + "/" + circle)
    let lpAward = getLPJournalAwardForCircle(circle);
    let spAward = getSPJournalAwardForCircle(circle);
    consoleLogString = consoleLogString + "<li>" + pc.actor.name + " (Circle " + circle + ": " + lpAward + " LP and " + spAward + " Tavs)</li>";
    console.log("MACRO: " + _MACRONAME + "() LP was: " + pc.actor.getRollData().legendpointcurrent + "/" + pc.actor.getRollData().legendpointtotal);
    console.log("MACRO: " + _MACRONAME + "() SP was: " + pc.actor.getRollData().money.silver);
    
    await pc.actor.update({"system.legendpointtotal": +(pc.actor.getRollData().legendpointtotal) + lpAward});
    await pc.actor.update({"system.legendpointcurrent": +(pc.actor.getRollData().legendpointcurrent) + lpAward}); 
    await pc.actor.update({"system.money.silver": +(pc.actor.getRollData().money.silver) + +spAward});
    console.log("MACRO: " + _MACRONAME + "() LP now: " + pc.actor.getRollData().legendpointcurrent + "/" + pc.actor.getRollData().legendpointtotal);
    console.log("MACRO: " + _MACRONAME + "() SP now: " + pc.actor.getRollData().money.silver);
    itemsProcessed++;
    if(itemsProcessed === tokens.length) {  
      consoleLogString = consoleLogString + "</ul>";
      console.log("MACRO: " + _MACRONAME + "() LOGGING: " + consoleLogString);
      
      let chatData = {
        user: game.user._id,
        speaker: "Gamemaster",
        content: consoleLogString
      };

      ChatMessage.create(chatData, {});
    }
  });
  
return ui.notifications.info("Awarding Journals for " + tokens.length + " PC token(s).");


  new Dialog({
    title:'Legend Point Award',
    content: content,
    buttons:{
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: buttonLabel
      }},
    default:'yes',
    close: html => {
      if (tokens.length > 0) {


        //let consoleLogString = "<p><strong>Journal award!</strong></p>  <p>Given to:</p><ul>";
        tokens.forEach(async (token) => { 
          let c = calculatePcEffectiveCircle(token.actor);
          let lpAward = getLPJournalAwardForCircle(c);
          let spAward = getSPJournalAwardForCircle(c);
          console.log("MACRO: " + _MACRONAME + "() LP was: " + token.actor.getRollData().legendpointcurrent + "/" + token.actor.getRollData().legendpointtotal);
          consoleLogString = consoleLogString + "<li>" + token.name + " (C" + c + ": " + lpAward + " LP and " + spAward + " Tavs)</li>";
          
          await token.actor.update({"system.legendpointtotal": +(token.actor.getRollData().legendpointtotal) + +lpAward});
          await token.actor.update({"system.legendpointcurrent": +(token.actor.getRollData().legendpointcurrent) + +lpAward});

          //update silver
          await token.actor.update({"": +(token.actor.getRollData().legendpointtotal) + +lpAward});
          console.log("MACRO: " + _MACRONAME + "() LP now: " + token.actor.getRollData().legendpointcurrent + "/" + token.actor.getRollData().legendpointtotal);
        });
        return;
        consoleLogString = consoleLogString + "</ul>";
        
        console.log(consoleLogString);
        if (result.val()!== '') {
            let chatData = {
              user: game.user._id,
              speaker: "Gamemaster",
              content: consoleLogString
          };
          ChatMessage.create(chatData, {});
          }
        }
      }
  }).render(true);
}