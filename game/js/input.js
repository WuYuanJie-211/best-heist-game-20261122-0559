// The Kestrel Diamond — key map, tool hotkeys 1-4, pause, and the
// "pressed once" edge detection the game uses for tools and actions.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var keys = {};
  var pressed = {}; // keys that went down since the last consume
  var anyKey = false;

  function codeOf(e) { return e.code || e.key || ''; }

  window.addEventListener('keydown', function (e) {
    var c = codeOf(e);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(c) >= 0) {
      e.preventDefault();
    }
    if (!keys[c]) pressed[c] = true;
    keys[c] = true;
    anyKey = true;
  });
  window.addEventListener('keyup', function (e) { keys[e.code || e.key || ''] = false; });
  window.addEventListener('blur', function () { keys = {}; pressed = {}; });

  function down() {
    var list = [];
    for (var i = 0; i < arguments.length; i++) if (keys[arguments[i]]) list.push(arguments[i]);
    return list;
  }

  Kestrel.input = {
    // Held movement: WASD or arrows. Returns {x, y} in [-1, 1].
    move: function () {
      var x = 0, y = 0;
      if (keys.KeyA || keys.ArrowLeft) x -= 1;
      if (keys.KeyD || keys.ArrowRight) x += 1;
      if (keys.KeyW || keys.ArrowUp) y -= 1;
      if (keys.KeyS || keys.ArrowDown) y += 1;
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x: x, y: y };
    },
    sneak: function () { return !!(keys.ShiftLeft || keys.ShiftRight); },
    takeHeld: function () { return !!keys.KeyE; },
    // Edge-triggered keys: true once per physical press.
    pressed: function (code) {
      if (pressed[code]) { pressed[code] = false; return true; }
      return false;
    },
    toolPressed: function () {
      if (pressed.Digit1 || pressed.Numpad1) { pressed.Digit1 = pressed.Numpad1 = false; return 1; }
      if (pressed.Digit2 || pressed.Numpad2) { pressed.Digit2 = pressed.Numpad2 = false; return 2; }
      if (pressed.Digit3 || pressed.Numpad3) { pressed.Digit3 = pressed.Numpad3 = false; return 3; }
      if (pressed.Digit4 || pressed.Numpad4) { pressed.Digit4 = pressed.Numpad4 = false; return 4; }
      return 0;
    },
    pausePressed: function () { return this.pressed('KeyP'); },
    retryPressed: function () { return this.pressed('KeyR'); },
    confirmPressed: function () {
      if (pressed.Enter || pressed.Space) { pressed.Enter = pressed.Space = false; return true; }
      return false;
    },
    interactPressed: function () { return this.pressed('KeyE'); },
    anyKey: function () { var v = anyKey; anyKey = false; return v; },
    // Called once a frame so a press is never read twice.
    endFrame: function () { pressed = {}; },
  };
})();
