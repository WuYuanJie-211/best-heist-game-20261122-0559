// The Kestrel Diamond — the alarm meter, the grace window, lockdown
// shutters, escalation, and the getaway countdown.
// Fairness rule: the first 0.35 s you are seen, the meter does NOT rise —
// that is your grace to break the line. After that it rises while any eye
// holds you, and drains while none does. At 100, the room burns.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;
  var U = Kestrel.util;

  function createAlarm() {
    return { value: 0, peak: 0, graceT: 0, seen: false, seenBy: null };
  }

  function updateAlarm(state, dt) {
    var a = state.alarm;
    var seeing = Kestrel.visibility.firstSeeingEye(state);
    a.seen = !!seeing;
    a.seenBy = seeing;
    if (seeing) {
      state.seenTime += dt;
      // A guard who sees the thief gives chase to the last place he saw him.
      if (seeing.kind === 'guard' && seeing.guard) {
        seeing.guard.state = 'alert';
        seeing.guard.alertT = 4;
        seeing.guard.lastSeen = { x: state.thief.x, y: state.thief.y };
      }
      if (a.graceT <= 0 && a.value < C.alarmMax) {
        // First sighting of this stretch: open the grace window.
        a.graceT = C.graceTime;
      }
      if (a.graceT > 0) {
        a.graceT -= dt;
      } else {
        a.value += state.room.def.alarmRise * dt;
      }
      // A guard who physically bumps the thief burns him at once.
      var bumped = null;
      state.guards.forEach(function (g) {
        if (U.dist(g.x, g.y, state.thief.x, state.thief.y) < C.guardBumpRange) bumped = g;
      });
      if (bumped) {
        burn(state, { kind: 'guard', guard: bumped });
        return;
      }
      if (a.value >= C.alarmMax) {
        a.value = C.alarmMax;
        burn(state, seeing);
        return;
      }
    } else {
      state.unseenTime += dt;
      a.graceT = 0;
      if (a.value > 0) a.value = Math.max(0, a.value - C.alarmDrain * dt);
    }
    if (a.value > a.peak) a.peak = a.value;
  }

  // The burn: freeze the frame, draw the line from the eye that saw you to
  // your feet, then show the BURNED card with the tools refunded.
  function burn(state, seeing) {
    if (state.mode !== 'play') return;
    var eye = null;
    if (seeing) {
      if (seeing.kind === 'guard' && seeing.guard) eye = { x: seeing.guard.x, y: seeing.guard.y };
      if (seeing.kind === 'camera' && seeing.camera) eye = { x: seeing.camera.x, y: seeing.camera.y };
      if (seeing.eye) eye = { x: seeing.eye.x, y: seeing.eye.y };
    }
    state.burnLine = eye
      ? { x1: eye.x, y1: eye.y, x2: state.thief.x, y2: state.thief.y }
      : null;
    state.burnReason = seeing && seeing.kind === 'camera'
      ? 'The camera held you for a full second.'
      : 'The guard had you in his cone.';
    state.mode = 'burned';
    Kestrel.audio.sting('burn');
  }

  // Lifting the Diamond flips the room: the exit turns green, the
  // countdown starts, the guards speed up.
  function startGetaway(state) {
    state.getaway.active = true;
    state.getaway.countdown = C.getawayTime;
    state.getaway.total = C.getawayTime;
    state.guards.forEach(function (g) { g.speed *= 1.35; });
  }

  function updateGetaway(state, dt) {
    var g = state.getaway;
    if (!g.active || state.mode !== 'play') return;
    g.countdown -= dt;
    if (g.countdown <= 0) {
      g.countdown = 0;
      state.burnReason = 'Too slow — the shutters came down on the exit.';
      state.burnLine = null;
      state.mode = 'burned';
      Kestrel.audio.sting('burn');
      return;
    }
    // Standing in the elevator slot with the Diamond ends the floor.
    var ex = state.room.exit;
    var t = state.thief;
    if (t.hasDiamond && t.x > ex.x - 10 && t.y > ex.y && t.y < ex.y + ex.h) {
      finishFloor(state);
    }
  }

  function finishFloor(state) {
    var clean = state.alarm.peak <= C.cleanAlarmLine;
    state.nerve += clean ? C.floorCleanBonus : C.floorBonus;
    state.score = state.score || 0;
    var floorScore = Math.round(state.nerve * C.nervePointValue + state.unseenTime * C.unseenPointValue);
    state.floorScore = floorScore;
    state.score += floorScore;
    state.floorClean = clean;
    state.mode = 'payout';
    Kestrel.audio.sting('win');
  }

  Kestrel.alarm = {
    createAlarm: createAlarm,
    updateAlarm: updateAlarm,
    burn: burn,
    startGetaway: startGetaway,
    updateGetaway: updateGetaway,
    finishFloor: finishFloor,
  };
})();
