// The Kestrel Diamond — every tunable number in one place.
// One room, one frame: 1280x720, fixed camera, never scrolls.
(function () {
  'use strict';
  window.Kestrel = window.Kestrel || {};
  Kestrel.config = {
    // Room
    roomW: 1280,
    roomH: 720,
    wallT: 20, // wall thickness
    // Thief
    thiefRadius: 13,
    thiefWalk: 155, // px per second
    thiefSneak: 88,
    sneakSightFactor: 0.62, // sneaking shrinks every eye's range by this much
    takeTime: 1.2, // seconds holding E beside the plinth
    takeRange: 46,
    // Guards
    guardRadius: 14,
    guardPatrolSpeed: 58,
    guardAlertSpeed: 118,
    guardSightRange: 265,
    guardHalfAngle: 0.52, // radians, ~30 degrees
    guardBumpRange: 28, // touching a guard is an instant burn
    guardCuriousTime: 3.0, // seconds a decoy holds a guard
    // Cameras
    cameraRange: 305,
    cameraHalfAngle: 0.38, // ~22 degrees
    cameraSweep: 0.55, // radians of swing around the base angle
    cameraSweepSpeed: 0.45, // radians per second
    // Alarm
    alarmRise: 34, // per second while any eye sees the thief
    alarmDrain: 9, // per second while no eye sees the thief
    alarmMax: 100,
    graceTime: 0.35, // fair grace flash before a burn can land
    // Tools (nerve costs)
    nerveStart: 100,
    toolEmpCost: 25,
    toolSmokeCost: 20,
    toolDecoyCost: 15,
    toolJamCost: 10,
    empDuration: 6, // seconds one camera stays dead
    empRange: 420, // nearest camera inside this range is the target
    smokeDuration: 4, // seconds every guard cone is blank
    decoyThrow: 150, // px ahead of the thief where the coin lands
    jamBonus: 12, // seconds added to the getaway countdown
    // Getaway
    getawayTime: 45, // seconds on the elevator countdown
    shutterAt: 15, // countdown seconds left when the shutter starts closing
    // Floors
    floorCleanBonus: 25, // nerve for finishing a floor with the alarm never over 50
    floorBonus: 10, // nerve otherwise
    cleanAlarmLine: 50,
    // Payout
    nervePointValue: 10, // score per nerve left
    unseenPointValue: 5, // score per undetected second
    // Look
    colors: {
      floor: '#232936',
      floorLine: '#2e3547',
      wall: '#171b26',
      wallTop: '#2b3245',
      cover: '#39415a',
      coverLip: '#4d5878',
      crate: '#5a4632',
      crateLip: '#7a6248',
      vaultWall: '#1d2230',
      laser: '#ff4d6d',
      thief: '#f2ead8', // ivory
      thiefRim: '#ffe9a8',
      guard: '#c8ccd8',
      guardCone: '255,176,32', // amber, as rgb triplet for alpha fills
      cameraCone: '150,225,255', // cyan-white
      diamond: '#ffd94d', // gold
      exitDead: '#8a2f3c',
      exitLive: '#2fae6e',
      alarmGreen: '#3ecf6e',
      alarmAmber: '#ffb020',
      alarmRed: '#ff4d4d',
      hud: '#e8eaf2',
      hudDim: '#9aa3b8',
    },
  };
})();
