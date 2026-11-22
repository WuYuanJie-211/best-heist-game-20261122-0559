// The Kestrel Diamond — floor, cover, cones, actors, loot.
// Painter's order is the readability: floor, cones, then cover over them,
// so a cone visibly dies at a shelf's edge. Warm is danger, cool is wall,
// gold is the objective.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var U = Kestrel.util;
  var V = Kestrel.visibility;
  var COL = C.colors;

  function draw(state, ctx, now) {
    var room = state.room;
    drawFloor(ctx, room, state, now);
    drawCones(state, ctx);
    drawCover(state, ctx, now);
    drawVault(state, ctx, now);
    drawExit(state, ctx, now);
    drawPlinth(state, ctx, now);
    drawDecoySmoke(state, ctx, now);
    drawActors(state, ctx, now);
    drawBurnLine(state, ctx);
    drawWash(state, ctx, now);
  }

  function drawFloor(ctx, room, state, now) {
    ctx.fillStyle = COL.floor;
    ctx.fillRect(0, 0, C.roomW, C.roomH);
    // Subtle grid so the room reads as a floor, not a void.
    ctx.strokeStyle = COL.floorLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 64; x < C.roomW; x += 64) { ctx.moveTo(x, 20); ctx.lineTo(x, C.roomH - 20); }
    for (var y = 64; y < C.roomH; y += 64) { ctx.moveTo(20, y); ctx.lineTo(C.roomW - 20, y); }
    ctx.stroke();
    // Vault alcove floor: a cooler slab so the target corner stands apart.
    ctx.fillStyle = 'rgba(120,150,220,0.07)';
    ctx.fillRect(room.vault.x, room.vault.y, room.vault.w, room.vault.h);
    // Entry door: a worn mat where the thief came in.
    ctx.fillStyle = 'rgba(242,234,216,0.10)';
    ctx.fillRect(28, 600, 90, 52);
    ctx.fillStyle = COL.hudDim;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ENTRY', 36, 628);
    // Hatch: a dark grate behind the crate.
    var h = room.hatch;
    ctx.fillStyle = '#141824';
    ctx.fillRect(h.x - 26, h.y - 18, 52, 36);
    ctx.strokeStyle = '#3a4157';
    ctx.beginPath();
    for (var i = -2; i <= 2; i++) {
      ctx.moveTo(h.x - 26, h.y + i * 7);
      ctx.lineTo(h.x + 26, h.y + i * 7);
    }
    ctx.stroke();
  }

  function coneFill(ctx, eye, triplet, alpha) {
    var pts = V.conePolygon(eye, 16);
    var grad = ctx.createRadialGradient(eye.x, eye.y, 8, eye.x, eye.y, eye.range);
    grad.addColorStop(0, U.rgba(triplet, alpha));
    grad.addColorStop(0.7, U.rgba(triplet, alpha * 0.55));
    grad.addColorStop(1, U.rgba(triplet, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    // Hard edges so the wedge reads as a cone, not a blob.
    ctx.strokeStyle = U.rgba(triplet, alpha * 0.8);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(eye.x, eye.y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.moveTo(eye.x, eye.y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }

  function drawCones(state, ctx) {
    var i, g, c, eye;
    // Camera cones first (cool), then guard cones (warm) on top.
    for (i = 0; i < state.cameras.length; i++) {
      c = state.cameras[i];
      if (c.disabledT > 0) continue;
      eye = { x: c.x, y: c.y, dir: c.angle, range: C.cameraRange, halfAngle: C.cameraHalfAngle };
      coneFill(ctx, eye, COL.cameraCone, 0.34);
    }
    for (i = 0; i < state.guards.length; i++) {
      g = state.guards[i];
      eye = { x: g.x, y: g.y, dir: g.dir, range: C.guardSightRange, halfAngle: C.guardHalfAngle };
      if (state.smokeT > 0) {
        coneFill(ctx, eye, '150,150,160', 0.10); // smoke blanks the cone
      } else if (g.state === 'alert') {
        coneFill(ctx, eye, COL.guardCone, 0.55); // alert cone burns brighter
      } else {
        coneFill(ctx, eye, COL.guardCone, 0.36);
      }
    }
  }

  function drawCover(state, ctx, now) {
    var room = state.room;
    room.covers.forEach(function (s) {
      ctx.fillStyle = COL.cover;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      // Hatched lip on the top edge: the shelf's readable rim.
      ctx.fillStyle = COL.coverLip;
      ctx.fillRect(s.x, s.y, s.w, 5);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      for (var x = s.x + 8; x < s.x + s.w; x += 16) {
        ctx.moveTo(x, s.y);
        ctx.lineTo(x + 8, s.y + 5);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.fillRect(s.x, s.y + s.h - 4, s.w, 4);
    });
    // The crate: the only cover that moves.
    var cr = room.crate;
    ctx.fillStyle = COL.crate;
    ctx.fillRect(cr.x, cr.y, cr.w, cr.h);
    ctx.strokeStyle = COL.crateLip;
    ctx.lineWidth = 3;
    ctx.strokeRect(cr.x + 4, cr.y + 4, cr.w - 8, cr.h - 8);
    ctx.beginPath();
    ctx.moveTo(cr.x + 4, cr.y + 4);
    ctx.lineTo(cr.x + cr.w - 4, cr.y + cr.h - 4);
    ctx.moveTo(cr.x + cr.w - 4, cr.y + 4);
    ctx.lineTo(cr.x + 4, cr.y + cr.h - 4);
    ctx.stroke();
    if (!cr.shifted) {
      ctx.fillStyle = COL.hudDim;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('E — SHIFT', cr.x + 32, cr.y + cr.h + 14);
      ctx.textAlign = 'left';
    }
    // Walls on top of everything flat: border + vault walls.
    room.walls.forEach(function (w) {
      ctx.fillStyle = COL.wall;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = COL.wallTop;
      if (w.h <= 20 && w.w > 20) ctx.fillRect(w.x, w.y + w.h - 3, w.w, 3);
      if (w.w <= 20 && w.h > 20) ctx.fillRect(w.x, w.y, 3, w.h);
    });
  }

  function drawVault(state, ctx, now) {
    var v = state.room.vault;
    // Laser grid across the door gap: three red lines, always on.
    var pulse = 0.55 + 0.35 * Math.sin(now * 3);
    ctx.strokeStyle = U.rgba('255,77,109', pulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    [132, 145, 158].forEach(function (y) {
      ctx.moveTo(v.x, y);
      ctx.lineTo(v.x + 20, y);
    });
    ctx.stroke();
    ctx.fillStyle = COL.laser;
    ctx.fillRect(v.x - 2, 126, 4, 40);
    ctx.fillRect(v.x + 18, 126, 4, 40);
    ctx.fillStyle = COL.hudDim;
    ctx.font = '11px sans-serif';
    ctx.fillText('VAULT', v.x + 34, v.y + 18);
  }

  function drawExit(state, ctx, now) {
    var ex = state.room.exit;
    var live = state.getaway.active;
    ctx.fillStyle = live ? COL.exitLive : COL.exitDead;
    ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
    // The slot is 20 px wide, so its label runs vertically inside it.
    ctx.save();
    ctx.translate(ex.x + 10, ex.y + ex.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    if (live) {
      var glow = 0.5 + 0.4 * Math.sin(now * 5);
      ctx.fillStyle = U.rgba('47,174,110', glow * 0.5);
      ctx.fillRect(-ex.h / 2, -14, ex.h, 8);
      ctx.fillStyle = '#0e2a1c';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('EXIT', 0, 5);
    } else {
      ctx.fillStyle = '#e8b7bd';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('SEALED', 0, 4);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    // Getaway shutter: descends over the slot as the countdown runs out.
    if (live && state.getaway.countdown <= C.shutterAt) {
      var frac = 1 - state.getaway.countdown / C.shutterAt;
      var sh = frac * ex.h;
      ctx.fillStyle = '#3a3f52';
      ctx.fillRect(ex.x - 4, ex.y, ex.w + 4, sh);
      ctx.fillStyle = COL.hudDim;
      ctx.font = '10px sans-serif';
      ctx.fillText(state.jammed ? 'JAMMED' : 'SHUTTER', ex.x - 52, ex.y + 12);
    }
  }

  function drawPlinth(state, ctx, now) {
    var p = state.room.plinth;
    // Pedestal.
    ctx.fillStyle = '#31364a';
    ctx.fillRect(p.x - 22, p.y - 10, 44, 34);
    ctx.fillStyle = '#454c68';
    ctx.fillRect(p.x - 22, p.y - 10, 44, 6);
    if (!state.thief.hasDiamond) {
      // The Kestrel Diamond: the only thing that glows twice.
      var pulse = U.doublePulse(now);
      var glow = 10 + pulse * 26;
      ctx.save();
      ctx.shadowColor = COL.diamond;
      ctx.shadowBlur = glow;
      ctx.fillStyle = COL.diamond;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 22);
      ctx.lineTo(p.x + 12, p.y - 8);
      ctx.lineTo(p.x, p.y + 4);
      ctx.lineTo(p.x - 12, p.y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 22);
      ctx.lineTo(p.x + 5, p.y - 10);
      ctx.lineTo(p.x, p.y - 6);
      ctx.lineTo(p.x - 5, p.y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KESTREL DIAMOND', p.x, p.y - 34);
      ctx.textAlign = 'left';
      // Hold-E progress ring.
      if (state.thief.takeProgress > 0) {
        ctx.strokeStyle = COL.diamond;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 10, 26, -Math.PI / 2, -Math.PI / 2 + state.thief.takeProgress * Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawDecoySmoke(state, ctx, now) {
    if (state.decoy) {
      var d = state.decoy;
      ctx.strokeStyle = U.rgba('255,217,77', 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 8 + 2 * Math.sin(now * 6), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = COL.diamond;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
      ctx.fill();
      // Toss arc from the thief to the coin.
      ctx.strokeStyle = U.rgba('255,217,77', 0.35);
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(d.fromX, d.fromY);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (state.smokeT > 0) {
      ctx.fillStyle = U.rgba('180,180,190', 0.16);
      ctx.beginPath();
      ctx.arc(state.smokeAt.x, state.smokeAt.y, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    if (state.empFlash) {
      ctx.strokeStyle = U.rgba('150,225,255', state.empFlash.t);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(state.empFlash.x, state.empFlash.y, 30 + (0.5 - state.empFlash.t) * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawActors(state, ctx, now) {
    var i, g, c;
    // Cameras: wall brackets with a lens dot.
    state.cameras.forEach(function (cam) {
      ctx.fillStyle = cam.disabledT > 0 ? '#555b6e' : '#c8ccd8';
      ctx.fillRect(cam.x - 9, cam.y - 6, 18, 12);
      ctx.fillStyle = cam.disabledT > 0 ? '#333' : '#9df2ff';
      ctx.beginPath();
      ctx.arc(cam.x + Math.cos(cam.angle) * 10, cam.y + Math.sin(cam.angle) * 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    // Guards: slate bodies, amber chest glow, facing tick.
    state.guards.forEach(function (gd) {
      ctx.fillStyle = gd.state === 'alert' ? '#e8b7bd' : COL.guard;
      ctx.beginPath();
      ctx.arc(gd.x, gd.y, C.guardRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Visor: the direction he is looking.
      ctx.strokeStyle = '#232936';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gd.x, gd.y);
      ctx.lineTo(gd.x + Math.cos(gd.dir) * 12, gd.y + Math.sin(gd.dir) * 12);
      ctx.stroke();
      // Chest glow: the cone's origin.
      ctx.fillStyle = U.rgba(COL.guardCone, gd.state === 'alert' ? 1 : 0.75);
      ctx.beginPath();
      ctx.arc(gd.x + Math.cos(gd.dir) * 6, gd.y + Math.sin(gd.dir) * 6, 3.5, 0, Math.PI * 2);
      ctx.fill();
      if (gd.state === 'curious') {
        ctx.fillStyle = COL.diamond;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', gd.x, gd.y - 20);
        ctx.textAlign = 'left';
      }
    });
    // The thief: the smallest bright figure in the room.
    var t = state.thief;
    var r = C.thiefRadius;
    if (t.crawling > 0) r = 8;
    else if (t.sneak) r = 11; // visibly dips when sneaking
    ctx.save();
    ctx.shadowColor = COL.thiefRim;
    ctx.shadowBlur = 12;
    ctx.fillStyle = COL.thief;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    ctx.stroke();
    // Facing tick + a soft rim light.
    ctx.strokeStyle = '#7a6a4a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(t.x + Math.cos(t.dir) * (r - 1), t.y + Math.sin(t.dir) * (r - 1));
    ctx.stroke();
    ctx.strokeStyle = U.rgba('255,233,168', 0.7);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, r - 1, t.dir - 1.1, t.dir + 1.1);
    ctx.stroke();
    if (t.hasDiamond) {
      ctx.fillStyle = COL.diamond;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - r - 10);
      ctx.lineTo(t.x + 5, t.y - r - 3);
      ctx.lineTo(t.x, t.y - r + 2);
      ctx.lineTo(t.x - 5, t.y - r - 3);
      ctx.closePath();
      ctx.fill();
    }
    // Crawl progress: a small bar while the thief is in the hatch.
    if (t.crawling > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(t.x - 20, t.y - 26, 40, 6);
      ctx.fillStyle = COL.diamond;
      ctx.fillRect(t.x - 20, t.y - 26, 40 * (1 - t.crawling / 1.6), 6);
    }
  }

  function drawBurnLine(state, ctx) {
    if (state.mode !== 'burned' || !state.burnLine) return;
    var b = state.burnLine;
    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(b.x2, b.y2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWash(state, ctx, now) {
    // Getaway: the whole room goes red.
    if (state.getaway.active && state.mode === 'play') {
      var red = 0.10 + 0.04 * Math.sin(now * 4);
      ctx.fillStyle = U.rgba('255,40,40', red);
      ctx.fillRect(0, 0, C.roomW, C.roomH);
    }
    // Burned: a heavier red wash under the card.
    if (state.mode === 'burned') {
      ctx.fillStyle = 'rgba(120,10,10,0.35)';
      ctx.fillRect(0, 0, C.roomW, C.roomH);
    }
    // Grace flash: the moment you are first seen.
    if (state.alarm.graceT > 0 && state.mode === 'play') {
      ctx.fillStyle = U.rgba('255,80,80', 0.18 * (state.alarm.graceT / C.graceTime));
      ctx.fillRect(0, 0, C.roomW, C.roomH);
    }
    // Vignette: dark corners keep the eye in the middle of the room.
    var vg = ctx.createRadialGradient(640, 360, 320, 640, 360, 780);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, C.roomW, C.roomH);
  }

  Kestrel.render = { draw: draw, drawBurnLine: drawBurnLine };
})();
