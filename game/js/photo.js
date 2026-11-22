// The Kestrel Diamond — deterministic photo poses for the screenshots.
// ?shot=1..4 in the URL poses the game into one of the four frames the
// plan lists, freezes play, and raises window.__shotReady once drawn.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;

  function pose(state, n) {
    state.photo = true;
    var t = state.thief;
    if (n === 1) {
      // Cover: mid-crossing, thief crouched behind the middle shelf, a guard
      // cone sweeping past his heels, a camera cone crossing the vault,
      // alarm at 62% in amber, Diamond pulsing, exit still sealed.
      t.x = 350; t.y = 462; t.dir = Math.PI / 2; t.sneak = true;
      var g2 = state.guards[1];
      g2.x = 520; g2.y = 290; g2.dir = Math.PI / 2 + 0.35;
      var g1 = state.guards[0];
      g1.x = 820; g1.y = 500; g1.dir = Math.PI;
      state.cameras[1].angle = Math.PI - 0.35;
      state.alarm.value = 62;
      state.alarm.peak = 62;
      state.mode = 'play';
    } else if (n === 2) {
      // The decision: thief at the junction, tool tray open, a decoy
      // mid-toss, one cone peeling away toward it, three routes readable.
      t.x = 620; t.y = 460; t.dir = -Math.PI / 2; t.sneak = false;
      state.decoy = { x: 700, y: 372, t: 3, fromX: 620, fromY: 460 };
      var g = state.guards[0];
      g.state = 'curious';
      g.x = 760; g.y = 480; g.dir = Math.atan2(372 - 480, 700 - 760);
      g.curiousTarget = { x: 700, y: 372 };
      g.curiousT = 3;
      state.alarm.value = 28;
      state.alarm.peak = 28;
      state.mode = 'play';
    } else if (n === 3) {
      // Burned, fairly: red wash, the line from the camera to the thief's
      // feet, alarm at full, BURNED overlay and Retry. The thief stands
      // below the card so he stays visible under it.
      t.x = 640; t.y = 500; t.dir = -Math.PI / 2; t.sneak = false;
      var cam = state.cameras[0];
      cam.angle = Math.PI / 2;
      state.burnLine = { x1: cam.x, y1: cam.y, x2: t.x, y2: t.y };
      state.burnReason = 'The camera held you for a full second.';
      state.alarm.value = 100;
      state.alarm.peak = 100;
      state.mode = 'burned';
    } else if (n === 4) {
      // The getaway that pays: red-lit room, thief at the elevator with the
      // Diamond, countdown running, nerve and score on the bar.
      t.x = 1224; t.y = 370; t.dir = 0; t.sneak = false;
      t.hasDiamond = true;
      state.getaway.active = true;
      state.getaway.countdown = 23;
      state.getaway.total = C.getawayTime;
      state.nerve = 55;
      state.score = 480;
      state.unseenTime = 96;
      var gg = state.guards[0];
      gg.x = 980; gg.y = 500; gg.dir = Math.PI / 2;
      state.alarm.value = 41;
      state.alarm.peak = 41;
      state.mode = 'play';
    }
  }

  Kestrel.photo = { pose: pose };
})();
