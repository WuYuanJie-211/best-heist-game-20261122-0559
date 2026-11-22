// The Kestrel Diamond — builds a room from a floor definition and answers
// every collision and line-of-sight query the game asks.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  var C = Kestrel.config;

  // The fixed shell: border walls, the vault box top-right with its door gap,
  // the exit elevator slot on the right wall, the plinth inside the vault.
  function buildRoom(def) {
    var t = C.wallT;
    var walls = [
      { x: 0, y: 0, w: C.roomW, h: t }, // north
      { x: 0, y: C.roomH - t, w: C.roomW, h: t }, // south
      { x: 0, y: 0, w: t, h: C.roomH }, // west
      { x: C.roomW - t, y: 0, w: t, h: C.roomH }, // east
      // Vault west wall, split by the door gap (y 120..170).
      { x: 1000, y: t, w: t, h: 100 },
      { x: 1000, y: 170, w: t, h: 50 },
      // Vault south wall.
      { x: 1000, y: 200, w: 260, h: t },
    ];
    var covers = def.covers.map(function (c) {
      return { x: c[0], y: c[1], w: c[2], h: c[3] };
    });
    var crate = {
      x: def.crate.x, y: def.crate.y, w: 64, h: 64,
      tx: def.crate.tx, ty: def.crate.ty, shifted: false,
    };
    return {
      def: def,
      walls: walls,
      covers: covers,
      crate: crate,
      hatch: { x: def.hatch.x, y: def.hatch.y, nx: def.hatch.nx, ny: def.hatch.ny },
      plinth: { x: 1150, y: 120 },
      vault: { x: 1000, y: 20, w: 260, h: 200, doorY0: 120, doorY1: 170 },
      // The exit slot is a recess in the right wall: its left edge is at
      // 1240, so a thief (radius 13, wall at 1260) can stand in it.
      exit: { x: C.roomW - t - t, y: 320, w: t, h: 100 },
      entry: { x: def.entry.x, y: def.entry.y },
      // Everything a sight-line can die on: walls, shelves, the crate.
      occluders: function () {
        var list = walls.concat(covers);
        list.push({ x: crate.x, y: crate.y, w: crate.w, h: crate.h });
        return list;
      },
      // Everything solid a body can bump into.
      solids: function () {
        var list = walls.concat(covers);
        list.push({ x: crate.x, y: crate.y, w: crate.w, h: crate.h });
        return list;
      },
    };
  }

  // Circle (x, y, r) against one rect: true when they overlap.
  function circleHitsRect(x, y, r, rc) {
    var cx = Math.max(rc.x, Math.min(x, rc.x + rc.w));
    var cy = Math.max(rc.y, Math.min(y, rc.y + rc.h));
    var dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy < r * r;
  }

  // Move a circle axis by axis, sliding along what it hits.
  function moveCircle(x, y, dx, dy, r, solids) {
    var nx = x + dx, ny = y;
    var i, hit = false;
    for (i = 0; i < solids.length; i++) {
      if (circleHitsRect(nx, ny, r, solids[i])) { hit = true; break; }
    }
    if (hit) nx = x;
    ny = y + dy;
    hit = false;
    for (i = 0; i < solids.length; i++) {
      if (circleHitsRect(nx, ny, r, solids[i])) { hit = true; break; }
    }
    if (hit) ny = y;
    return { x: nx, y: ny };
  }

  // Segment (x1,y1)-(x2,y2) against one rect: true when the segment is blocked.
  function segmentHitsRect(x1, y1, x2, y2, rc) {
    // Either end inside the rect blocks the line.
    if (x1 > rc.x && x1 < rc.x + rc.w && y1 > rc.y && y1 < rc.y + rc.h) return true;
    if (x2 > rc.x && x2 < rc.x + rc.w && y2 > rc.y && y2 < rc.y + rc.h) return true;
    return (
      segmentsCross(x1, y1, x2, y2, rc.x, rc.y, rc.x + rc.w, rc.y) ||
      segmentsCross(x1, y1, x2, y2, rc.x + rc.w, rc.y, rc.x + rc.w, rc.y + rc.h) ||
      segmentsCross(x1, y1, x2, y2, rc.x + rc.w, rc.y + rc.h, rc.x, rc.y + rc.h) ||
      segmentsCross(x1, y1, x2, y2, rc.x, rc.y + rc.h, rc.x, rc.y)
    );
  }

  function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
    var d1 = cross(dx - cx, dy - cy, ax - cx, ay - cy);
    var d2 = cross(dx - cx, dy - cy, bx - cx, by - cy);
    var d3 = cross(bx - ax, by - ay, cx - ax, cy - ay);
    var d4 = cross(bx - ax, by - ay, dx - ax, dy - ay);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }
  function cross(ax, ay, bx, by) { return ax * by - ay * bx; }

  function losClear(x1, y1, x2, y2, occluders) {
    for (var i = 0; i < occluders.length; i++) {
      if (segmentHitsRect(x1, y1, x2, y2, occluders[i])) return false;
    }
    return true;
  }

  Kestrel.room = {
    buildRoom: buildRoom,
    moveCircle: moveCircle,
    circleHitsRect: circleHitsRect,
    losClear: losClear,
  };
})();
