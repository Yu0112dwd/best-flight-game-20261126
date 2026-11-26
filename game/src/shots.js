// Skyline Courier — deterministic screenshot shots.
// One clear job: put the game into a fixed, readable state for each screenshot.
// The game reads ?shot=start|play|end (&seed=) and freezes there; real play is
// untouched when no shot is given.

import { createWorld } from './world.js';

export function applyShot(world, shot) {
  if (shot === 'start') {
    // Title screen over the departure runway, plane on the ground, gates ahead.
    Object.assign(world, createWorld(7));
    world.screen = 'title';
    world.altitude = 0;
    world.speed = 0;
    world.throttle = 0;
    world.distance = 0.1;
    world.planeDx = -170;
    world.planeDy = 80;
    world.timeLeft = 120;
    world.fuel = 100;
    world.damage = 0;
    return true;
  }
  if (shot === 'play') {
    // Mid-sortie: climbing through Gate 3's band, two gates already flown,
    // a storm cell ahead, HUD lit, fuel and score mid-flight.
    Object.assign(world, createWorld(11));
    world.screen = 'playing';
    world.elapsed = 42;
    world.timeLeft = 78;
    world.score = 350;
    world.ringsPassed = 2;
    world.perfectRings = 1;
    world.nextRing = 2;
    world.altitude = 1820;
    world.speed = 212;
    world.heading = 94;
    world.throttle = 68;
    world.pitch = 0.25;
    world.bank = 0.15;
    world.distance = 6.9;
    world.fuel = 71;
    world.damage = 0;
    world.message = 'PERFECT! Gate 2 · River +150 pts · fuel +8';
    world.messageUntil = 999;
    return true;
  }
  if (shot === 'end') {
    // Sortie over: landed at Skyport, final scoreboard.
    Object.assign(world, createWorld(13));
    world.screen = 'over';
    world.elapsed = 118;
    world.timeLeft = 0;
    world.score = 1480;
    world.ringsPassed = 7;
    world.perfectRings = 3;
    world.nextRing = 8;
    world.courseDone = false;
    world.landed = true;
    world.altitude = 0;
    world.speed = 96;
    world.heading = 90;
    world.throttle = 0;
    world.distance = 22.4;
    world.fuel = 34;
    world.damage = 12;
    return true;
  }
  return false;
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1');
  return { shot, seed };
}
