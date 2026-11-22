// The Kestrel Diamond — thief and guard bodies, movement, sneak state.
// Patrol behaviour lives in patrol.js; this file only moves bodies.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var R = Kestrel.room;
  var U = Kestrel.util;

  function createThief(entry) {
    return {
      x: entry.x, y: entry.y, dir: -Math.PI / 2, // facing up the room
      sneak: false, moving: false,
      takeProgress: 0, hasDiamond: false,
      crawling: 0, // seconds left in the hatch crawl
    };
  }

  function createGuards(def) {
    return def.guards.map(function (g, i) {
      var p = g.path[0];
      return {
        x: p[0], y: p[1], dir: 0,
        path: g.path, wpi: 1, forward: true,
        speed: g.speed || C.guardPatrolSpeed,
        state: 'patrol', // patrol | curious | alert
        curiousTarget: null, curiousT: 0, lookT: 0,
        alertT: 0, lastSeen: null,
        seed: 100 + i * 37,
      };
    });
  }

  function createCameras(def) {
    return def.cameras.map(function (c, i) {
      return {
        x: c.x, y: c.y, base: c.base, sweep: c.sweep,
        angle: c.base, phase: i * 1.7,
        disabledT: 0,
      };
    });
  }

  // One thief step: walk or sneak, slide along cover, face where you go.
  function updateThief(state, dt) {
    var t = state.thief;
    if (t.crawling > 0) {
      t.crawling -= dt;
      if (t.crawling <= 0) {
        t.x = state.room.hatch.nx;
        t.y = state.room.hatch.ny;
      }
      return;
    }
    var mv = Kestrel.input.move();
    t.sneak = Kestrel.input.sneak();
    t.moving = mv.x !== 0 || mv.y !== 0;
    var speed = t.sneak ? C.thiefSneak : C.thiefWalk;
    if (t.moving) {
      t.dir = Math.atan2(mv.y, mv.x);
      var next = R.moveCircle(
        t.x, t.y, mv.x * speed * dt, mv.y * speed * dt,
        C.thiefRadius, state.room.solids(),
      );
      t.x = next.x;
      t.y = next.y;
    }
    // Hold E beside the plinth to lift the Diamond.
    var pl = state.room.plinth;
    if (!t.hasDiamond && U.dist(t.x, t.y, pl.x, pl.y) < C.takeRange && Kestrel.input.takeHeld()) {
      t.takeProgress += dt / C.takeTime;
      if (t.takeProgress >= 1) {
        t.hasDiamond = true;
        t.takeProgress = 0;
        Kestrel.alarm.startGetaway(state);
        Kestrel.audio.sting('take');
      }
    } else {
      t.takeProgress = Math.max(0, t.takeProgress - dt * 2);
    }
  }

  // E near the crate shoves it aside; E at the open hatch crawls through.
  function tryInteract(state) {
    var t = state.thief;
    var crate = state.room.crate;
    var hatch = state.room.hatch;
    if (!crate.shifted && U.dist(t.x, t.y, crate.x + 32, crate.y + 32) < 70) {
      crate.shifted = true;
      crate.x = crate.tx;
      crate.y = crate.ty;
      Kestrel.audio.sting('crate');
      return 'crate';
    }
    if (crate.shifted && U.dist(t.x, t.y, hatch.x, hatch.y) < 55 && t.crawling <= 0) {
      t.crawling = 1.6;
      Kestrel.audio.sting('crawl');
      return 'hatch';
    }
    return null;
  }

  Kestrel.actors = {
    createThief: createThief,
    createGuards: createGuards,
    createCameras: createCameras,
    updateThief: updateThief,
    tryInteract: tryInteract,
  };
})();
