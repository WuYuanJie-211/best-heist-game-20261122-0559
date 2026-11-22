// The Kestrel Diamond — nerve balance, tool costs, effect lifetimes.
// Tools cost nerve; nerve is earned by finishing a floor clean. Every tool
// buys a gap in the patrol, never a free pass.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var U = Kestrel.util;

  var DEFS = [
    { key: 1, name: 'EMP PEBBLE', cost: C.toolEmpCost, hint: 'kills one camera 6s' },
    { key: 2, name: 'SMOKE', cost: C.toolSmokeCost, hint: 'blanks guard cones 4s' },
    { key: 3, name: 'DECOY COIN', cost: C.toolDecoyCost, hint: 'pulls a guard 3s' },
    { key: 4, name: 'DOOR JAM', cost: C.toolJamCost, hint: 'holds the shutter +12s' },
  ];

  function toolList() { return DEFS; }

  function usable(state, n) {
    if (state.nerve < DEFS[n - 1].cost) return false;
    if (n === 4) return state.getaway.active; // the jam only matters mid-getaway
    if (n === 1) {
      // Needs a live camera in range.
      return state.cameras.some(function (c) {
        return c.disabledT <= 0 && U.dist(state.thief.x, state.thief.y, c.x, c.y) < C.empRange;
      });
    }
    return true;
  }

  function useTool(state, n) {
    var def = DEFS[n - 1];
    if (!def || !usable(state, n)) return null;
    state.nerve -= def.cost;
    if (n === 1) {
      var best = null, bestD = Infinity;
      state.cameras.forEach(function (c) {
        if (c.disabledT > 0) return;
        var d = U.dist(state.thief.x, state.thief.y, c.x, c.y);
        if (d < bestD) { bestD = d; best = c; }
      });
      if (best) {
        best.disabledT = C.empDuration;
        state.empFlash = { x: best.x, y: best.y, t: 0.5 };
        Kestrel.audio.sting('emp');
        return 'EMP killed the camera for 6s';
      }
      return null;
    }
    if (n === 2) {
      state.smokeT = C.smokeDuration;
      state.smokeAt = { x: state.thief.x, y: state.thief.y };
      Kestrel.audio.sting('smoke');
      return 'Smoke blanks the guard cones for 4s';
    }
    if (n === 3) {
      var dx = Math.cos(state.thief.dir), dy = Math.sin(state.thief.dir);
      var cx = state.thief.x + dx * C.decoyThrow;
      var cy = state.thief.y + dy * C.decoyThrow;
      cx = U.clamp(cx, 40, C.roomW - 40);
      cy = U.clamp(cy, 40, C.roomH - 40);
      state.decoy = { x: cx, y: cy, t: C.guardCuriousTime, fromX: state.thief.x, fromY: state.thief.y };
      Kestrel.patrol.sendGuardToDecoy(state, cx, cy);
      Kestrel.audio.sting('coin');
      return 'Coin tossed — the nearest guard goes to look';
    }
    // Door jam: only during the getaway, adds time to the countdown.
    state.getaway.countdown += C.jamBonus;
    state.jammed = true;
    Kestrel.audio.sting('jam');
    return 'Shutter jammed — +12s on the countdown';
  }

  function updateTools(state, dt) {
    if (state.smokeT > 0) state.smokeT -= dt;
    if (state.decoy) {
      state.decoy.t -= dt;
      if (state.decoy.t <= 0) state.decoy = null;
    }
    if (state.empFlash) {
      state.empFlash.t -= dt;
      if (state.empFlash.t <= 0) state.empFlash = null;
    }
  }

  Kestrel.tools = {
    toolList: toolList,
    usable: usable,
    useTool: useTool,
    updateTools: updateTools,
  };
})();
