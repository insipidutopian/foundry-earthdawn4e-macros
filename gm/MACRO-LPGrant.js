let selectedTokens = canvas.tokens.controlled; 

//Remove non-PC tokens 
const tokens = selectedTokens.filter((token) => token.actor.type === "pc");

console.log("# Selected Tokens: " + tokens.length)

let content = `<form>
      <div class="form-group">
        <label>Legend Point Award</label>
        <input type='text' name='inputField' value='100'></input>
      </div>
      <div>
        <input type="checkbox" id="split" name="split" value="split">
        <label for="split">Split Legend Points amongst selected Adepts?</label>
      </div>
    </form>`
let buttonLabel = `Award`

if (tokens.length == 0) {
  content = `<form>
      <div class="form-group">
        <label>No PC Tokens selected</label>
      </div>
    </form>`
  buttonLabel = `Got it`
}

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
      let result = html.find('input[name=\'inputField\']');
      let splitFlag = html.find('input[name=\'split\']');

      let lpAward = parseInt(result.val());
      
      if (splitFlag[0].checked) {
        lpAward = Math.floor(lpAward / tokens.length )
      }
      let consoleLogString = "<p><strong>Legend award!</strong> (" + lpAward + " LP)</p><p>Given to:</p><ul>";
      tokens.forEach(async (token) => { 
        consoleLogString = consoleLogString + "<li>" + token.name + "</li>";
        console.log("LP was: " + token.actor.getRollData().legendpointcurrent + "/" + token.actor.getRollData().legendpointtotal);
        await token.actor.update({"system.legendpointtotal": +(token.actor.getRollData().legendpointtotal) + +lpAward});
        await token.actor.update({"system.legendpointcurrent": +(token.actor.getRollData().legendpointcurrent) + +lpAward});
        //token.actor.getRollData().legendpointtotal = parseInt(token.actor.getRollData().legendpointtotal) + lpAward;
        //token.actor.getRollData().legendpointcurrent = parseInt(token.actor.getRollData().legendpointcurrent) + lpAward;
        console.log("LP now: " + token.actor.getRollData().legendpointcurrent + "/" + token.actor.getRollData().legendpointtotal);
      });
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