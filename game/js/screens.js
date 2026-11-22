// The Kestrel Diamond — title, briefing, burned, payout. All four are
// drawn on the canvas so the screenshots capture exactly what the player
// sees, including the loss state.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var COL = C.colors;

  function dim(ctx, alpha) {
    ctx.fillStyle = 'rgba(8,10,16,' + alpha + ')';
    ctx.fillRect(0, 0, C.roomW, C.roomH);
  }

  function centre(ctx, text, y, font, color) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.fillText(text, C.roomW / 2, y);
    ctx.textAlign = 'left';
  }

  function title(state, ctx) {
    dim(ctx, 0.72);
    centre(ctx, 'THE KESTREL DIAMOND', 250, 'bold 64px Georgia, serif', COL.diamond);
    centre(ctx, 'one room · three routes · one diamond', 292, 'italic 20px Georgia, serif', COL.hud);
    centre(ctx, 'WASD / arrows — move      Shift — sneak      E — use / take', 380, '16px sans-serif', COL.hud);
    centre(ctx, '1 EMP pebble   2 smoke   3 decoy coin   4 door jam — every tool costs nerve', 410, '16px sans-serif', COL.hud);
    centre(ctx, 'Get seen and the alarm climbs. Break the line in 0.35 s or it keeps climbing.', 440, '16px sans-serif', COL.hudDim);
    centre(ctx, 'Lift the Diamond, reach the green EXIT before the countdown ends.', 470, '16px sans-serif', COL.hudDim);
    centre(ctx, 'PRESS ENTER', 560, 'bold 22px sans-serif', COL.hud);
  }

  function briefing(state, ctx) {
    dim(ctx, 0.55);
    var def = state.room.def;
    centre(ctx, def.name, 280, 'bold 44px Georgia, serif', COL.hud);
    centre(ctx, def.sub, 322, 'italic 19px Georgia, serif', COL.hudDim);
    centre(ctx, 'Nerve ' + state.nerve + '  ·  tools cost nerve  ·  finishing clean earns +' + C.floorCleanBonus, 380, '15px sans-serif', COL.hud);
    centre(ctx, 'PRESS ENTER TO START THE FLOOR', 470, 'bold 20px sans-serif', COL.diamond);
  }

  function burned(state, ctx) {
    dim(ctx, 0.62);
    centre(ctx, 'BURNED', 280, 'bold 72px Georgia, serif', COL.alarmRed);
    centre(ctx, state.burnReason || 'They had you.', 330, 'italic 19px Georgia, serif', COL.hud);
    centre(ctx, 'The eye that saw you drew its line — that is the fair part.', 362, '15px sans-serif', COL.hudDim);
    centre(ctx, 'Tools refunded. The floor resets as it was.', 392, '15px sans-serif', COL.hudDim);
    centre(ctx, 'PRESS R TO RETRY', 480, 'bold 22px sans-serif', COL.hud);
  }

  function payout(state, ctx) {
    dim(ctx, 0.6);
    var last = state.floorIndex >= Kestrel.levels.length - 1;
    centre(ctx, last ? 'THE KESTREL IS YOURS' : 'CLEAN GETAWAY', 240, 'bold 52px Georgia, serif', COL.diamond);
    centre(ctx, state.floorClean ? 'Undetected enough to call it clean.' : 'Out — but the room saw too much of you.', 286, 'italic 18px Georgia, serif', COL.hud);
    var y = 360;
    centre(ctx, 'Nerve left ' + state.nerve + '  × ' + C.nervePointValue + '  =  ' + state.nerve * C.nervePointValue, y, '17px sans-serif', COL.hud);
    centre(ctx, 'Undetected ' + Math.round(state.unseenTime) + 's  × ' + C.unseenPointValue + '  =  ' + Math.round(state.unseenTime) * C.unseenPointValue, y + 34, '17px sans-serif', COL.hud);
    centre(ctx, 'Floor score  ' + state.floorScore, y + 68, 'bold 20px sans-serif', COL.diamond);
    centre(ctx, 'Total score  ' + (state.score || 0), y + 100, 'bold 20px sans-serif', COL.hud);
    if (last) {
      centre(ctx, 'Five floors. One diamond. Nobody saw you leave.', 560, '16px sans-serif', COL.hudDim);
      centre(ctx, 'PRESS ENTER TO PLAY AGAIN', 610, 'bold 20px sans-serif', COL.hud);
    } else {
      centre(ctx, 'PRESS ENTER FOR THE NEXT FLOOR', 560, 'bold 20px sans-serif', COL.hud);
    }
  }

  Kestrel.screens = {
    title: title,
    briefing: briefing,
    burned: burned,
    payout: payout,
  };
})();
