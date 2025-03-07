let selectedTokens = canvas.tokens.controlled; 

//Remove non-PC tokens 
const tokens = selectedTokens.filter((token) => token.actor.type === "pc");

console.log("# Selected Tokens: " + tokens.length)

let buttonLabel = `Award`
let dialogContent = `  
      <form>
        <div class="form-group">
          <label>Gold</label>
          <input type='text' name='goldInput' value="0"></input>
        </div>
        <div class="form-group">
          <label>Silver</label>
          <input type='text' name='silverInput' value="0"></input>
        </div>
        <div class="form-group">
          <label>Copper</label>
          <input type='text' name='copperInput' value="0"></input>
        </div>
        <div>
          <input type="checkbox" id="split" name="split" value="split">
          <label for="split">Split coins amongst selected Adepts?</label>
      </div>
      </form>`
if (tokens.length == 0) {
  console.log("No tokens selected");
  dialogContent = `<div class="form-group"><label>No tokens selected for Coin Grant</label></div>`
  buttonLabel = `Got it`
}
new Dialog({
  title:'Coin Award',
  content: dialogContent,
  buttons:{
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: buttonLabel
    }},
  default:'yes',
  close: html => {
    if (tokens.length > 0) {
        let gpAwardInput = html.find('input[name=\'goldInput\']');
        let spAwardInput = html.find('input[name=\'silverInput\']');
        let cpAwardInput = html.find('input[name=\'copperInput\']');
        let splitFlag = html.find('input[name=\'split\']');
    

        
        let gpAward = parseInt(gpAwardInput.val());
        let spAward = parseInt(spAwardInput.val());    
        let cpAward = parseInt(cpAwardInput.val());

        //console.log('split? ' + (splitFlag[0].checked ? "yes" : "no"));
        if (splitFlag[0].checked) {
          console.log('splitting coins amongst ' + tokens.length + ' tokens.');
          let tGp = gpAward / tokens.length
          let tSpAward = spAward
          let tCpAward = cpAward

          console.log('split coins.  gp=' + tGp);

          if (tGp != Math.floor(gpAward / tokens.length)) {
            console.log('split coins has leftover gp' );
            tGp = Math.floor(gpAward / tokens.length);
            tSpAward = tSpAward + 10;
          } 
          gpAward = tGp


          let tSp = tSpAward / tokens.length
          console.log('split coins.  sp=' + tSp);

          if (tSp != Math.floor(tSpAward / tokens.length)) {
            console.log('split coins has leftover sp' );
            tSp = Math.floor(tSpAward / tokens.length);
            tCpAward = tCpAward + 10;
          } 
          spAward = tSp

          tCpAward = Math.floor(tCpAward / tokens.length);
          console.log('split coins.  cp=' + tCpAward);
          cpAward = tCpAward
        }
    
        if (! isNaN(gpAward) && ! isNaN(spAward) && ! isNaN(cpAward)) {
    
          let consoleLogString = "<p><strong>Coin award!</strong> (" + gpAward + " GP, " + spAward + " SP, " + cpAward + " CP)</p><p>Given to:</p><ul>";
          
          //TODO: update the award message if split flag set
          tokens.forEach(token => { 
            consoleLogString = consoleLogString + "<li>" + token.name + "</li>";
            console.log("GP was: " + token.actor.getRollData().money.gold + ", SP: " + token.actor.getRollData().money.silver + ", CP: " + token.actor.getRollData().money.copper);
    
            token.actor.getRollData().money.gold = parseInt(token.actor.getRollData().money.gold) + gpAward;
            token.actor.getRollData().money.silver = parseInt(token.actor.getRollData().money.silver) + spAward;
            token.actor.getRollData().money.copper = parseInt(token.actor.getRollData().money.copper) + cpAward;
    
            console.log("GP now: " + token.actor.getRollData().money.gold + ", SP: " + token.actor.getRollData().money.silver);
          });
          consoleLogString = consoleLogString + "</ul>";
          
          console.log(consoleLogString);
          
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
