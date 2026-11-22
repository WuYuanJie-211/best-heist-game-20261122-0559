// The Kestrel Diamond — patrol, curious and alert state machines, plus
// the decoy response. A guard walks his loop; a coin pulls the nearest one
// off it for three seconds; a guard who sees the thief gives chase.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var R = Kestrel.room;
  var U = Kestrel.util;

  function nextWaypoint(g) {
    if (g.forward) {
      g.wpi++;
      if (g.wpi >= g.path.length) { g.wpi = g.path.length - 2; g.forward = false; }
    } else {
      g.wpi--;
      if (g.wpi < 0) { g.wpi = 1; g.forward = true; }
    }
    if (g.wpi < 0) g.wpi = 0;
    if (g.wpi >= g.path.length) g.wpi = g.path.length - 1;
  }

  function walkToward(g, tx, ty, speed, dt, state) {
    var dx = tx - g.x, dy = ty - g.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 2) return true;
    var step = Math.min(d, speed * dt);
    var nx = g.x + (dx / d) * step;
    var ny = g.y + (dy / d) * step;
    var next = R.moveCircle(g.x, g.y, nx - g.x, ny - g.y, C.guardRadius, state.room.solids());
    g.x = next.x;
    g.y = next.y;
    g.dir = Math.atan2(dy, dx);
    return d <= step + 1;
  }

  function updateGuard(g, state, dt) {
    if (g.state === 'patrol') {
      var wp = g.path[g.wpi];
      if (walkToward(g, wp[0], wp[1], g.speed, dt, state)) nextWaypoint(g);
      return;
    }
    if (g.state === 'curious') {
      g.curiousT -= dt;
      if (g.curiousTarget) {
        var arrived = walkToward(g, g.curiousTarget.x, g.curiousTarget.y, g.speed * 1.15, dt, state);
        if (arrived) {
          g.curiousTarget = null;
          g.lookT = 1.2; // stands and looks around where the coin landed
        }
      } else {
        g.lookT -= dt;
        g.dir += dt * 1.8; // slow scan while puzzled
        if (g.lookT <= 0) {
          g.state = 'patrol';
          g.curiousT = 0;
        }
      }
      if (g.curiousT <= 0 && !g.curiousTarget) {
        g.state = 'patrol';
        g.curiousT = 0;
      }
      return;
    }
    // alert: chase the last place the thief was seen.
    if (g.state === 'alert') {
      g.alertT -= dt;
      if (g.lastSeen) {
        var caught = walkToward(g, g.lastSeen.x, g.lastSeen.y, C.guardAlertSpeed, dt, state);
        if (caught || g.alertT <= 0) {
          g.state = 'patrol';
          g.alertT = 0;
          g.lastSeen = null;
        }
      } else {
        g.state = 'patrol';
      }
    }
  }

  // The nearest patrolling guard breaks off toward the coin.
  function sendGuardToDecoy(state, x, y) {
    var best = null, bestD = Infinity;
    state.guards.forEach(function (g) {
      if (g.state !== 'patrol') return;
      var d = U.dist(g.x, g.y, x, y);
      if (d < bestD) { bestD = d; best = g; }
    });
    if (!best) return false;
    best.state = 'curious';
    best.curiousTarget = { x: x, y: y };
    best.curiousT = C.guardCuriousTime + 1.2;
    return true;
  }

  function updateCamera(c, state, dt) {
    if (c.disabledT > 0) { c.disabledT -= dt; return; }
    c.angle = c.base + Math.sin(state.time * C.cameraSweepSpeed + c.phase) * c.sweep;
  }

  Kestrel.patrol = {
    updateGuard: updateGuard,
    updateCamera: updateCamera,
    sendGuardToDecoy: sendGuardToDecoy,
  };
})();
