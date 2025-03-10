// Allows the GM to change other user's hotbar from the GM client, in case of a player screwing up / prepping an adventure with ready made actors 
// and macros for the players.
// v11 and v12.
// source: https://gitlab.com/Freeze020/foundry-vtt-scripts/-/blob/master/miscellaneous/Hotbar%20management%20tool.js?ref_type=heads

class FreezeHotbarDialog extends Dialog {
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelector("select[name=user-id]").addEventListener("change", this.userSelect.bind(this));
    this.userSelect();
  }
  userSelect() {
    const select = this.element[0].querySelector("select[name=user-id]");
    const userId = select.value;
    const user = game.users.get(userId);
    // minimum macro ownership required is OBSERVER to be able to apply the macro to their hotbar
    const macroList = game.macros.filter(e => e.testUserPermission(user, "OBSERVER"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .reduce((acc, e) => acc += `<option value="${e.id}">${e.name}</option>`, ``);
    this.element[0].querySelector("select[name=macro-id]").innerHTML = macroList;
    const rows = [1, 2, 3, 4, 5].reduce((rows, tab, i) => {
      const row = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce((row, pos) => {
        pos = pos + (i * 10);
        const img = !game.macros.get(user.hotbar[pos]) ? "" : game.macros.get(user.hotbar[pos]).img;
        const hoverText = !game.macros.get(user.hotbar[pos]) ? "Empty" : game.macros.get(user.hotbar[pos]).name;
        return row += `<a class="macro-slot slot-${pos}" data-slot="${pos}"><img src="${img}"><span class="hover-text">${hoverText}</span></a>`;
      }, `<div class="tab-label">Bar ${tab}:</div>`);
      rows.push(row);
      return rows;
    }, []);
    for (let i = 0; i < 5; i++) {
      let element = this.element[0].querySelector(`.row${i + 1}`);
      element.innerHTML = rows[i];
    }
    this.element[0].querySelectorAll("a.macro-slot").forEach(e => e.addEventListener("click", this.macroLeftClick.bind(this)));
    this.element[0].querySelectorAll("a.macro-slot").forEach(e => e.addEventListener("contextmenu", this.macroRightClick.bind(this)));
  }

  async macroLeftClick() {
    const macroId = this.element[0].querySelector("select[name=macro-id]").value;
    const userId = this.element[0].querySelector("select[name=user-id]").value;
    const slotNumber = Number(event.currentTarget.dataset.slot);
    const user = game.users.get(userId);
    await user.assignHotbarMacro(game.macros.get(macroId), slotNumber);
    this.userSelect();
  }

  async macroRightClick() {
    event.preventDefault();
    const userId = this.element[0].querySelector("select[name=user-id]").value;
    const slotNumber = Number(event.currentTarget.dataset.slot);
    const user = game.users.get(userId);
    await user.assignHotbarMacro(null, slotNumber);
    this.userSelect();
  }
}
const optionsUser = game.users.reduce((acc, e) => acc += `<option value="${e.id}">${e.name}</option>`, ``);
const style = `<style>
    #macro-placement-dialog .window-content {
        background: none;
        color: white;
    }
    #macro-placement-dialog img {
        border: none;
    }
    #macro-placement-dialog select {
        background-color: #CCC;
    }
    #macro-placement-dialog .macro-box-row {
        display: flex;
        justify-content: space-between;
        padding: 10px;
    }
    #macro-placement-dialog .macro-slot {
        width: 75px;
        height: 75px;
        border: 2px solid #CCC;
    }
    #macro-placement-dialog .tab-label {
        line-height: 75px; 
    }
    #macro-placement-dialog a.macro-slot:hover{
        border: 2px solid red;
    }
    #macro-placement-dialog .hover-text{
        visibility: hidden;
        width: max-content;
        background-color: white;
        color: #000;
        text-align: center;
        border-radius: 6px;
        padding: 5px 5px;
        position: absolute;
        z-index: 1;
    }
    #macro-placement-dialog .macro-slot:hover .hover-text {
        visibility: visible;
    }
</style>`;
const content = style + `<form>
    <div class="form-group">
        <label>User:</label>
        <div class="form-fields">
            <select name="user-id">${optionsUser}</select>
        </div>
    </div>
    <div class="form-group">
        <label>Macro:</label>
        <div class="form-fields">
            <select name="macro-id"></select>
        </div>
    </div>
    <hr>
    <div class="macro-box-row row1"></div>
    <div class="macro-box-row row2"></div>
    <div class="macro-box-row row3"></div>
    <div class="macro-box-row row4"></div>
    <div class="macro-box-row row5"></div>
</form>`;

new FreezeHotbarDialog({
  title: "Hotbar Management Tool",
  content,
  buttons: {}
}, {
  id: "macro-placement-dialog",
  width: 900,
  height: "auto !important"
}).render(true);