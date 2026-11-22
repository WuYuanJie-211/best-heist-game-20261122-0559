// The Kestrel Diamond — boot, fixed timestep, state machine.
// Modes: title -> briefing -> play -> burned | payout -> briefing (next
// floor) or title (after floor 5). Photo mode (?shot=1..4) poses the game
// and freezes it for the screenshots.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  function createState(floorIndex, carry) {
    var def = Kestrel.levels[floorIndex];
    var room = Kestrel.room.buildRoom(def);
    var state = {
      floorIndex: floorIndex,
      room: room,
      thief: Kestrel.actors.createThief(room.entry),
      guards: Kestrel.actors.createGuards(def),
      cameras: Kestrel.actors.createCameras(def),
      alarm: Kestrel.alarm.createAlarm(),
      nerve: carry ? carry.nerve : C.nerveStart,
      nerveAtFloorStart: carry ? carry.nerve : C.nerveStart,
      score: carry ? carry.score : 0,
      scoreAtFloorStart: carry ? carry.score : 0,
      floorScore: 0,
      floorClean: false,
      time: 0,
      seenTime: 0,
      unseenTime: 0,
      smokeT: 0,
      smokeAt: null,
      decoy: null,
      empFlash: null,
      jammed: false,
      getaway: { active: false, countdown: 0, total: C.getawayTime },
      burnLine: null,
      burnReason: '',
      mode: 'briefing',
      paused: false,
      photo: false,
    };
    return state;
  }

  var state = createState(0, null);
  state.mode = 'title';

  function startFloor(floorIndex, carry) {
    state = createState(floorIndex, carry);
    state.mode = 'briefing';
  }

  function retryFloor() {
    state = createState(state.floorIndex, {
      nerve: state.nerveAtFloorStart,
      score: state.scoreAtFloorStart,
    });
    state.mode = 'play';
  }

  function update(dt) {
    state.time += dt;
    var n;
    if (Kestrel.input.pausePressed()) state.paused = !state.paused;
    if (state.paused) return;
    // Tool hotkeys 1-4.
    n = Kestrel.input.toolPressed();
    if (n) {
      var msg = Kestrel.tools.useTool(state, n);
      if (msg) state.toast = { text: msg, t: 2.5 };
    }
    if (Kestrel.input.interactPressed()) Kestrel.actors.tryInteract(state);
    Kestrel.actors.updateThief(state, dt);
    state.guards.forEach(function (g) { Kestrel.patrol.updateGuard(g, state, dt); });
    state.cameras.forEach(function (c) { Kestrel.patrol.updateCamera(c, state, dt); });
    Kestrel.tools.updateTools(state, dt);
    Kestrel.alarm.updateAlarm(state, dt);
    if (state.mode === 'play') Kestrel.alarm.updateGetaway(state, dt);
    Kestrel.audio.setHum(state.alarm.value);
    if (state.toast) {
      state.toast.t -= dt;
      if (state.toast.t <= 0) state.toast = null;
    }
  }

  function render(now) {
    Kestrel.render.draw(state, ctx, now);
    if (state.mode === 'play' || state.mode === 'burned' || state.mode === 'payout') {
      Kestrel.hud.draw(state, ctx, now);
    }
    if (state.mode === 'title') Kestrel.screens.title(state, ctx);
    if (state.mode === 'briefing') Kestrel.screens.briefing(state, ctx);
    if (state.mode === 'burned') {
      Kestrel.screens.burned(state, ctx);
      // The accusatory line goes over the card, not under it.
      Kestrel.render.drawBurnLine(state, ctx);
    }
    if (state.mode === 'payout') Kestrel.screens.payout(state, ctx);
    if (state.paused && state.mode === 'play') {
      ctx.fillStyle = 'rgba(8,10,16,0.55)';
      ctx.fillRect(0, 0, C.roomW, C.roomH);
      ctx.fillStyle = C.colors.hud;
      ctx.font = 'bold 40px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', C.roomW / 2, C.roomH / 2);
      ctx.font = '16px sans-serif';
      ctx.fillText('Press P to resume', C.roomW / 2, C.roomH / 2 + 36);
      ctx.textAlign = 'left';
    }
    if (state.toast && state.mode === 'play') {
      ctx.fillStyle = 'rgba(10,12,18,0.75)';
      var w = ctx.measureText(state.toast.text).width + 28;
      ctx.fillRect((C.roomW - w) / 2, C.roomH - 118, w, 26);
      ctx.fillStyle = C.colors.diamond;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.toast.text, C.roomW / 2, C.roomH - 100);
      ctx.textAlign = 'left';
    }
  }

  // Photo mode: pose, freeze, raise the ready flag for the screenshot tool.
  var params = new URLSearchParams(window.location.search);
  var shot = params.get('shot');
  var readyRaised = false;
  if (shot) {
    var n = parseInt(shot, 10);
    if (n >= 1 && n <= 4) {
      state = createState(0, null);
      Kestrel.photo.pose(state, n);
    }
  }

  var last = performance.now();
  var acc = 0;
  var STEP = 1 / 60;
  function frame(nowMs) {
    var now = nowMs / 1000;
    var dt = Math.min(0.1, (nowMs - last) / 1000);
    last = nowMs;
    if (state.mode === 'title' && Kestrel.input.confirmPressed()) {
      Kestrel.audio.unlock();
      state.mode = 'briefing';
    } else if (state.mode === 'briefing' && Kestrel.input.confirmPressed()) {
      Kestrel.audio.unlock();
      state.mode = 'play';
    } else if (state.mode === 'burned' && Kestrel.input.retryPressed()) {
      retryFloor();
    } else if (state.mode === 'payout' && Kestrel.input.confirmPressed()) {
      if (state.floorIndex >= Kestrel.levels.length - 1) {
        state = createState(0, null);
        state.mode = 'title';
      } else {
        startFloor(state.floorIndex + 1, { nerve: state.nerve, score: state.score });
      }
    }
    if (!state.photo && state.mode === 'play') {
      acc += dt;
      while (acc >= STEP) {
        update(STEP);
        acc -= STEP;
        if (state.mode !== 'play') break;
      }
    }
    render(now);
    Kestrel.input.endFrame();
    if (state.photo && !readyRaised) {
      readyRaised = true;
      setTimeout(function () { window.__shotReady = true; }, 450);
    }
    if (!state.photo && !readyRaised) {
      readyRaised = true;
      window.__shotReady = true;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Exposed for debugging and for the screenshot tool's probes.
  window.__game = {
    state: function () { return state; },
  };
})();
