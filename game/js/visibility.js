// The Kestrel Diamond — cone geometry and occlusion. This file holds the
// only "can this eye see the thief" test in the game: a thief is seen when
// he is inside the cone's range and angle AND the line from the eye to him
// is not cut by a wall, a shelf, or the crate.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var U = Kestrel.util;
  var R = Kestrel.room;

  // eye: {x, y, dir, range, halfAngle}. Returns true when the eye sees the
  // point (tx, ty). `sneak` shrinks the eye's range (sneaking thief).
  function eyeSees(eye, tx, ty, occluders, sneak) {
    var range = eye.range * (sneak ? Kestrel.config.sneakSightFactor : 1);
    var dx = tx - eye.x, dy = ty - eye.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d > range) return false;
    if (d < 4) return true; // standing on the eye is seen, no angle needed
    var ang = Math.atan2(dy, dx);
    if (Math.abs(U.angleDiff(ang, eye.dir)) > eye.halfAngle) return false;
    return R.losClear(eye.x, eye.y, tx, ty, occluders);
  }

  // The cone as a polygon (origin + arc points) for the renderer.
  function conePolygon(eye, steps) {
    steps = steps || 14;
    var pts = [{ x: eye.x, y: eye.y }];
    for (var i = 0; i <= steps; i++) {
      var a = eye.dir - eye.halfAngle + (2 * eye.halfAngle * i) / steps;
      pts.push({
        x: eye.x + Math.cos(a) * eye.range,
        y: eye.y + Math.sin(a) * eye.range,
      });
    }
    return pts;
  }

  // Which eye (guard or camera) sees the thief right now, if any.
  // Returns {kind: 'guard'|'camera', eye: <the eye>} or null.
  function firstSeeingEye(state) {
    var room = state.room;
    var occ = room.occluders();
    var thief = state.thief;
    var i, eye, g, c;
    if (state.smokeT > 0) return null; // smoke blanks every guard cone
    for (i = 0; i < state.guards.length; i++) {
      g = state.guards[i];
      eye = {
        x: g.x, y: g.y, dir: g.dir,
        range: Kestrel.config.guardSightRange,
        halfAngle: Kestrel.config.guardHalfAngle,
      };
      if (eyeSees(eye, thief.x, thief.y, occ, thief.sneak)) {
        return { kind: 'guard', eye: eye, guard: g };
      }
    }
    for (i = 0; i < state.cameras.length; i++) {
      c = state.cameras[i];
      if (c.disabledT > 0) continue; // EMP-killed camera sees nothing
      eye = {
        x: c.x, y: c.y, dir: c.angle,
        range: Kestrel.config.cameraRange,
        halfAngle: Kestrel.config.cameraHalfAngle,
      };
      if (eyeSees(eye, thief.x, thief.y, occ, thief.sneak)) {
        return { kind: 'camera', eye: eye, camera: c };
      }
    }
    return null;
  }

  Kestrel.visibility = {
    eyeSees: eyeSees,
    conePolygon: conePolygon,
    firstSeeingEye: firstSeeingEye,
  };
})();
