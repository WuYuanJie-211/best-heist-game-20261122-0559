// The Kestrel Diamond — alarm bar, nerve count, tool tray, objective
// ticker. Everything the player needs to decide is on the canvas.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var COL = C.colors;

  function alarmColor(v) {
    if (v < 40) return COL.alarmGreen;
    if (v < 75) return COL.alarmAmber;
    return COL.alarmRed;
  }

  function draw(state, ctx, now) {
    var a = state.alarm;
    // Top bar: a translucent strip so the HUD never fights the room.
    ctx.fillStyle = 'rgba(10,12,18,0.55)';
    ctx.fillRect(0, 0, C.roomW, 46);
    // Floor name, top-left.
    ctx.fillStyle = COL.hud;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(state.room.def.name, 24, 20);
    ctx.fillStyle = COL.hudDim;
    ctx.font = '11px sans-serif';
    ctx.fillText(state.room.def.sub, 24, 36);
    // Objective ticker under the floor name is the room's own text.
    // Alarm meter, top-centre: four segments plus a number.
    var bw = 260, bh = 16, bx = (C.roomW - bw) / 2, by = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    for (var s = 0; s < 4; s++) {
      var sx = bx + s * (bw / 4) + 1;
      var sw = bw / 4 - 2;
      var filled = a.value > s * 25;
      ctx.fillStyle = filled ? alarmColor(a.value) : 'rgba(255,255,255,0.08)';
      ctx.fillRect(sx, by, sw, bh);
    }
    ctx.fillStyle = COL.hud;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALARM ' + Math.round(a.value) + '%', C.roomW / 2, by + bh + 16);
    ctx.textAlign = 'left';
    // Nerve + score, top-right.
    ctx.fillStyle = COL.hud;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('NERVE ' + state.nerve, C.roomW - 24, 20);
    ctx.fillStyle = COL.hudDim;
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE ' + (state.score || 0), C.roomW - 24, 36);
    ctx.textAlign = 'left';
    // Getaway countdown, big and red under the alarm bar.
    if (state.getaway.active && state.mode === 'play') {
      var cd = Math.ceil(state.getaway.countdown);
      ctx.fillStyle = cd <= 15 ? COL.alarmRed : COL.hud;
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GETAWAY  ' + cd + 's', C.roomW / 2, 78);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = COL.hudDim;
      ctx.fillText('reach the green EXIT', C.roomW / 2, 96);
      ctx.textAlign = 'left';
    }
    // SEEN flash text while an eye holds the thief.
    if (a.seen && state.mode === 'play') {
      var blink = 0.6 + 0.4 * Math.sin(now * 10);
      ctx.fillStyle = 'rgba(255,77,77,' + blink + ')';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.graceT > 0 ? 'SEEN — BREAK LINE OF SIGHT!' : 'SEEN!', C.roomW / 2, 120);
      ctx.textAlign = 'left';
    }
    // Objective line, bottom-left above the tool tray.
    var obj = state.thief.hasDiamond
      ? 'Diamond lifted — get to the green EXIT'
      : 'Lift the Kestrel Diamond in the vault (hold E at the plinth)';
    ctx.fillStyle = COL.hudDim;
    ctx.font = '12px sans-serif';
    ctx.fillText('◆ ' + obj, 24, C.roomH - 66);
    // Tool tray, bottom-centre: four slots, key, name, cost, greyed out
    // when the nerve is short or the tool cannot fire.
    var tools = Kestrel.tools.toolList();
    var tw = 150, th = 44, gap = 10;
    var total = tools.length * tw + (tools.length - 1) * gap;
    var tx = (C.roomW - total) / 2, ty = C.roomH - 56;
    tools.forEach(function (t, i) {
      var x = tx + i * (tw + gap);
      var ok = Kestrel.tools.usable(state, t.key);
      ctx.fillStyle = ok ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, ty, tw, th);
      ctx.strokeStyle = ok ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, ty + 0.5, tw, th);
      ctx.fillStyle = ok ? COL.hud : COL.hudDim;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(t.key + '  ' + t.name, x + 10, ty + 18);
      ctx.fillStyle = ok ? COL.diamond : COL.hudDim;
      ctx.font = '11px sans-serif';
      ctx.fillText('−' + t.cost + ' nerve · ' + t.hint, x + 10, ty + 34);
    });
    // Controls hint, bottom-right.
    ctx.fillStyle = COL.hudDim;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('WASD move · Shift sneak · E use/take · P pause', C.roomW - 24, C.roomH - 66);
    ctx.textAlign = 'left';
  }

  Kestrel.hud = { draw: draw };
})();
