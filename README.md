# The Kestrel Diamond

[![best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/WuYuanJie-211/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/WuYuanJie-211/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A fixed-camera heist game for the make.fun [best-heist-game-20261122-0559](https://make.fun/bounty/best-heist-game-20261122-0559) bounty. One room, one frame, every signal readable at a glance: the thief in ivory, guard cones in amber, camera cones in cyan-white, the Kestrel Diamond pulsing gold on its plinth, and the alarm meter top-centre. Cross the room, lift the Diamond, reach the elevator before the countdown ends.

## How to play

Open `game/index.html` in a desktop browser (or `node serve.ts` and open http://localhost:8080). No build step, no network.

- **Move** — WASD / arrow keys. Hold **Shift** to sneak (slower, harder to see).
- **Tools (cost nerve)** — **1** EMP pebble (kills one camera 6 s), **2** smoke (blanks a guard's cone), **3** decoy coin (pulls the nearest guard 3 s), **4** door jam (holds a shutter open for the getaway).
- **Take the Diamond** — hold **E** beside the plinth.
- **Pause** — P. **Retry** — R on the BURNED card.

Three routes cross every floor: the front corridor past the patrol, the north crawlspace behind the crate, and the vault service gap. Getting seen fills the alarm; 0.35 s of grace, then the eye that saw you draws its line and the room burns. Lift the Diamond and the elevator turns green with a countdown — get out and the payout tallies your nerve left and your undetected seconds.

## Layout

- `game/index.html` — the page, loads the CSS and the scripts in order.
- `game/game.css` — letterbox, HUD, overlays.
- `game/js/config.js` — every tunable number in one place.
- `game/js/util.js` — math, seeded RNG, easing, colour helpers.
- `game/js/input.js` — key map, tool hotkeys, pause.
- `game/js/levels.js` — the five floor definitions as plain data.
- `game/js/room.js` — builds a room from a floor definition, answers collisions.
- `game/js/visibility.js` — cone geometry and occlusion; the only "can this eye see the thief" test.
- `game/js/actors.js` — thief and guard bodies, movement, sneak state.
- `game/js/patrol.js` — patrol, curious and alert state machines, decoy response.
- `game/js/tools.js` — nerve balance, tool costs, effect lifetimes.
- `game/js/alarm.js` — meter, grace window, lockdown shutters, escalation.
- `game/js/render.js` — floor, cover, cones, actors, loot.
- `game/js/hud.js` — alarm bar, nerve count, tool tray, objective ticker.
- `game/js/audio.js` — WebAudio hums, sweep ticks, stingers; no asset files.
- `game/js/screens.js` — title, briefing, burned, payout.
- `game/js/photo.js` — deterministic photo poses for the screenshots.
- `game/js/main.js` — boot, fixed timestep, state machine.
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
