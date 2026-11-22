// The Kestrel Diamond — math, seeded RNG, easing, colour helpers.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var U = {};

  U.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.dist = function (x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };
  // Shortest signed difference between two angles, in (-PI, PI].
  U.angleDiff = function (a, b) {
    var d = (a - b) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d <= -Math.PI) d += Math.PI * 2;
    return d;
  };
  // Turn `from` toward `to` by at most `step` radians.
  U.turnToward = function (from, to, step) {
    var d = U.angleDiff(to, from);
    if (Math.abs(d) <= step) return to;
    return from + (d > 0 ? step : -step);
  };
  U.easeInOut = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  U.easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  // Mulberry32: a small seeded RNG so photo poses and patrols are deterministic.
  U.rng = function (seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // 'r,g,b' triplet + alpha -> rgba() string.
  U.rgba = function (triplet, a) { return 'rgba(' + triplet + ',' + a + ')'; };
  // Pulse in [0,1] that never stops: the Diamond's double heartbeat.
  U.doublePulse = function (t) {
    var p = (t % 1.6) / 1.6;
    var first = Math.exp(-Math.pow((p - 0.18) * 9, 2));
    var second = Math.exp(-Math.pow((p - 0.38) * 9, 2));
    return Math.max(first, second);
  };

  Kestrel.util = U;
})();
