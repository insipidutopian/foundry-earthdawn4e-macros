// Update selected NPC/Enemy tokens - the name shows on hover to owner and the bars always to owner.
// from https://github.com/foundry-vtt-community/
// Display Modes: ALWAYS, CONTROL, HOVER, NONE, OWNER, OWNER_HOVER

const tokens = canvas.tokens.controlled.map(token => {
  return {
    _id: token.id,
    "bar1.attribute": "unconsciousleft",
    "bar2.attribute": "karma",
    "displayName": CONST.TOKEN_DISPLAY_MODES.OWNER,
    "displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
  };
});

canvas.scene.updateEmbeddedDocuments('Token', tokens)