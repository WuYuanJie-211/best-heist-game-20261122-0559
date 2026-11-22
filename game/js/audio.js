// The Kestrel Diamond — WebAudio hums, sweep ticks, stingers. No asset
// files: every sound is synthesised, and every call is guarded so the game
// never breaks when audio is unavailable (headless screenshots included).
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var ctx = null;
  var humOsc = null;

  function audioCtx() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, gain, slideTo) {
    var ac = audioCtx();
    if (!ac || ac.state === 'suspended') return;
    try {
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, ac.currentTime);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
      g.gain.setValueAtTime(gain || 0.08, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + dur);
    } catch (e) { /* sound is decoration, never a failure */ }
  }

  // The room's low hum, pitched to the alarm: calm at 0, tense at 100.
  function setHum(alarmValue) {
    var ac = audioCtx();
    if (!ac || ac.state === 'suspended') return;
    try {
      if (!humOsc) {
        humOsc = ac.createOscillator();
        var g = ac.createGain();
        g.gain.value = 0.015;
        humOsc.type = 'triangle';
        humOsc.frequency.value = 55;
        humOsc.connect(g).connect(ac.destination);
        humOsc.start();
        humOsc._gain = g;
      }
      humOsc.frequency.setTargetAtTime(55 + alarmValue * 0.9, ac.currentTime, 0.2);
    } catch (e) { /* ignore */ }
  }

  function sting(name) {
    if (name === 'take') { tone(660, 0.15, 'sine', 0.10); setTimeout(function () { tone(990, 0.25, 'sine', 0.10); }, 120); }
    else if (name === 'burn') { tone(220, 0.5, 'sawtooth', 0.12, 55); }
    else if (name === 'win') { tone(523, 0.2, 'sine', 0.10); setTimeout(function () { tone(659, 0.2, 'sine', 0.10); }, 150); setTimeout(function () { tone(784, 0.35, 'sine', 0.10); }, 300); }
    else if (name === 'emp') { tone(1200, 0.25, 'square', 0.05, 200); }
    else if (name === 'smoke') { tone(300, 0.4, 'sine', 0.06, 90); }
    else if (name === 'coin') { tone(1800, 0.08, 'sine', 0.08); setTimeout(function () { tone(1400, 0.08, 'sine', 0.06); }, 90); }
    else if (name === 'crate') { tone(140, 0.2, 'triangle', 0.12, 70); }
    else if (name === 'crawl') { tone(180, 0.5, 'sine', 0.05, 120); }
    else if (name === 'jam') { tone(440, 0.12, 'square', 0.06); setTimeout(function () { tone(440, 0.12, 'square', 0.06); }, 140); }
  }

  Kestrel.audio = {
    sting: sting,
    setHum: setHum,
    // Call on the first user gesture: browsers only allow audio after one.
    unlock: function () {
      var ac = audioCtx();
      if (ac && ac.state === 'suspended') ac.resume().catch(function () {});
    },
  };
})();
