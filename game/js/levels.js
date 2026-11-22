// The Kestrel Diamond — the five floor definitions as plain data.
// The room shell never changes: entry bottom-left, vault alcove top-right,
// exit elevator on the right wall. What changes per floor is the patrol,
// the cameras, and where the cover sits. The engine reads only this file.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};

  // One guard: a loop of waypoints and an optional speed override.
  // One camera: wall mount, base angle (radians, 0 = east), sweep in radians.
  // One cover: [x, y, w, h] shelf. The crate is shiftable; the hatch is the
  // crawl shortcut it hides.
  Kestrel.levels = [
    {
      name: 'FLOOR 1 — THE LOBBY',
      sub: 'Three guards, two cameras. Learn the room.',
      alarmRise: 34,
      entry: { x: 80, y: 620 },
      covers: [
        [200, 200, 300, 36],
        [700, 200, 200, 36],
        [200, 400, 300, 36],
        [650, 400, 300, 36],
        [1050, 400, 120, 36],
      ],
      crate: { x: 590, y: 560, tx: 700, ty: 560 },
      hatch: { x: 622, y: 640, nx: 622, ny: 100 },
      guards: [
        { path: [[150, 500], [1100, 500]] },
        { path: [[150, 290], [1100, 290]] },
        { path: [[950, 140], [950, 320]] },
      ],
      cameras: [
        { x: 640, y: 40, base: Math.PI / 2, sweep: 0.55 },
        { x: 1240, y: 240, base: Math.PI, sweep: 0.5 },
      ],
    },
    {
      name: 'FLOOR 2 — THE LEDGER',
      sub: 'A third camera watches the south corridor now.',
      alarmRise: 34,
      entry: { x: 80, y: 620 },
      covers: [
        [160, 180, 260, 36],
        [620, 180, 260, 36],
        [160, 380, 260, 36],
        [620, 380, 260, 36],
        [1000, 300, 120, 36],
      ],
      crate: { x: 500, y: 560, tx: 610, ty: 560 },
      hatch: { x: 532, y: 640, nx: 532, ny: 100 },
      guards: [
        { path: [[120, 480], [1150, 480]] },
        { path: [[1150, 270], [120, 270]] },
        { path: [[950, 140], [950, 340]] },
      ],
      cameras: [
        { x: 400, y: 40, base: Math.PI / 2, sweep: 0.6 },
        { x: 900, y: 40, base: Math.PI / 2, sweep: 0.6 },
        { x: 1240, y: 260, base: Math.PI, sweep: 0.5 },
      ],
    },
    {
      name: 'FLOOR 3 — THE GLASS FLOOR',
      sub: 'Open floor, four guards. Cover is scarce — read the cones.',
      alarmRise: 36,
      entry: { x: 80, y: 620 },
      covers: [
        [300, 220, 220, 36],
        [760, 220, 220, 36],
        [300, 430, 220, 36],
        [760, 430, 220, 36],
      ],
      crate: { x: 590, y: 580, tx: 700, ty: 580 },
      hatch: { x: 622, y: 650, nx: 622, ny: 110 },
      guards: [
        { path: [[150, 520], [1100, 520]] },
        { path: [[1100, 330], [150, 330]] },
        { path: [[150, 140], [1100, 140]] },
        { path: [[950, 140], [950, 330]] },
      ],
      cameras: [
        { x: 640, y: 40, base: Math.PI / 2, sweep: 0.7 },
        { x: 1240, y: 250, base: Math.PI, sweep: 0.55 },
      ],
    },
    {
      name: 'FLOOR 4 — THE QUIET FLOOR',
      sub: 'Four cameras, fast alarm. Smoke is worth its nerve here.',
      alarmRise: 42,
      entry: { x: 80, y: 620 },
      covers: [
        [200, 200, 300, 36],
        [700, 200, 200, 36],
        [200, 400, 300, 36],
        [650, 400, 300, 36],
        [1050, 400, 120, 36],
      ],
      crate: { x: 590, y: 560, tx: 700, ty: 560 },
      hatch: { x: 622, y: 640, nx: 622, ny: 100 },
      guards: [
        { path: [[150, 500], [1100, 500]] },
        { path: [[150, 290], [1100, 290]] },
        { path: [[950, 140], [950, 320]] },
      ],
      cameras: [
        { x: 300, y: 40, base: Math.PI / 2, sweep: 0.6 },
        { x: 640, y: 40, base: Math.PI / 2, sweep: 0.6 },
        { x: 980, y: 40, base: Math.PI / 2, sweep: 0.6 },
        { x: 1240, y: 250, base: Math.PI, sweep: 0.5 },
      ],
    },
    {
      name: 'FLOOR 5 — THE KESTREL FLOOR',
      sub: 'Two guards on the Diamond itself. Bring every tool you have.',
      alarmRise: 40,
      entry: { x: 80, y: 620 },
      covers: [
        [200, 200, 300, 36],
        [700, 200, 200, 36],
        [200, 400, 300, 36],
        [650, 400, 300, 36],
        [1050, 400, 120, 36],
      ],
      crate: { x: 590, y: 560, tx: 700, ty: 560 },
      hatch: { x: 622, y: 640, nx: 622, ny: 100 },
      guards: [
        { path: [[150, 500], [1100, 500]] },
        { path: [[150, 290], [1100, 290]] },
        { path: [[1080, 90], [1080, 190]] },
        { path: [[1180, 190], [1180, 90]] },
      ],
      cameras: [
        { x: 640, y: 40, base: Math.PI / 2, sweep: 0.65 },
        { x: 1000, y: 40, base: Math.PI / 2, sweep: 0.6 },
        { x: 1240, y: 250, base: Math.PI, sweep: 0.55 },
      ],
    },
  ];
})();
