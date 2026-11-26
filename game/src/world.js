// Skyline Courier — game state and rules.
// One clear job: what the sky is, and what happens when the pilot acts.
// Rendering lives in render.js, input in input.js, sound in audio.js.

import {
  SORTIE_SECONDS, MAX_ALTITUDE, MIN_SPEED, MAX_SPEED, RING_COUNT,
  RING_SPACING_NM, FIRST_RING_NM, DEST_RUNWAY_NM, START_FUEL,
  FUEL_PER_RING, LANDING_BONUS, COURSE_BONUS, RING_POINTS, PERFECT_BONUS,
  RINGS, STORMS,
} from './config.js';
import { mulberry32 } from './random.js';

export function createWorld(seed) {
  const rng = mulberry32(seed || 20261126);
  return {
    rng,
    screen: 'title', // title | playing | over
    timeLeft: SORTIE_SECONDS,
    elapsed: 0,
    score: 0,
    ringsPassed: 0,
    perfectRings: 0,
    altitude: 600, // ft
    speed: 140, // kt
    heading: 90, // deg, 090 = east along the course
    throttle: 55, // %
    pitch: 0, // -1 (down) .. 1 (up)
    bank: 0, // -1 (left) .. 1 (right)
    distance: 0, // nm flown
    fuel: START_FUEL,
    damage: 0,
    landed: false,
    crashed: false,
    courseDone: false,
    nextRing: 0, // index into RINGS
    ringFlash: 0, // seconds of gold flash after a ring
    stormHitAt: -10, // elapsed time of last storm hit (for shake)
    shake: 0,
    message: '',
    messageUntil: 0,
    muted: false,
    paused: false,
    propAngle: 0,
    planeDx: 0, // screenshot-shot offset for the plane's screen position
    planeDy: 0,
    bestScore: 0,
  };
}

export function startSortie(world) {
  const fresh = createWorld(20261126 + Math.floor(Math.random() * 100000));
  Object.assign(world, fresh);
  world.screen = 'playing';
  setMessage(world, 'Take off! Fly through the gold rings.');
}

export function ringDistance(world, index) {
  return FIRST_RING_NM + index * RING_SPACING_NM;
}

export function nextRingInfo(world) {
  if (world.nextRing >= RING_COUNT) return null;
  const ring = RINGS[world.nextRing];
  return { ...ring, dist: ringDistance(world, world.nextRing) };
}

export function setMessage(world, text) {
  world.message = text;
  world.messageUntil = world.elapsed + 3;
}

function stormAt(world, dist, alt) {
  return STORMS.find((s) => Math.abs(dist - s.dist) < 0.45 && Math.abs(alt - s.alt) < s.radius);
}

export function updateWorld(world, dt, sfx) {
  if (world.screen !== 'playing' || world.paused) return;
  world.elapsed += dt;
  world.timeLeft = Math.max(0, SORTIE_SECONDS - world.elapsed);
  world.propAngle += dt * (8 + world.throttle * 0.35);

  // Throttle drives speed toward its target; below MIN_SPEED the plane sinks.
  const targetSpeed = MIN_SPEED + (world.throttle / 100) * (MAX_SPEED - MIN_SPEED);
  world.speed += (targetSpeed - world.speed) * Math.min(1, dt * 0.5);
  const lift = world.speed < MIN_SPEED ? (MIN_SPEED - world.speed) / MIN_SPEED : 0;
  world.altitude += (world.pitch * 16 * (0.4 + world.speed / 300) - lift * 22) * dt;
  world.altitude = Math.max(0, Math.min(MAX_ALTITUDE, world.altitude));
  world.distance += (world.speed * dt * 0.004);
  world.heading = (world.heading + world.bank * 26 * (0.5 + world.speed / 400) * dt + 360) % 360;
  world.bank *= Math.pow(0.4, dt); // the plane levels itself when you let go
  world.pitch *= Math.pow(0.5, dt);
  world.fuel = Math.max(0, world.fuel - dt * (0.10 + (world.throttle / 100) * 0.22));
  if (world.ringFlash > 0) world.ringFlash -= dt;
  if (world.shake > 0) world.shake -= dt;

  // Rings: crossing one inside its altitude band scores; dead centre pays extra.
  const next = nextRingInfo(world);
  if (next && world.distance >= next.dist) {
    const gap = Math.abs(world.altitude - next.alt);
    if (gap <= 320) {
      const perfect = gap <= 110;
      const earned = RING_POINTS + (perfect ? PERFECT_BONUS : 0);
      world.score += earned;
      world.ringsPassed += 1;
      if (perfect) world.perfectRings += 1;
      world.fuel = Math.min(100, world.fuel + FUEL_PER_RING);
      world.ringFlash = 1.2;
      world.nextRing += 1;
      setMessage(world, (perfect ? 'PERFECT! ' : '') + next.name + ' +' + earned + ' pts · fuel +' + FUEL_PER_RING);
      sfx && sfx('ring');
      if (world.nextRing >= RING_COUNT && !world.courseDone) {
        world.courseDone = true;
        world.score += COURSE_BONUS;
        setMessage(world, 'Course complete! +' + COURSE_BONUS + ' pts — land at Skyport!');
        sfx && sfx('course');
      }
    } else {
      world.nextRing += 1;
      setMessage(world, 'Missed ' + next.name + ' — too ' + (world.altitude < next.alt ? 'low' : 'high') + '!');
      sfx && sfx('miss');
    }
  }

  // Storm cells: flying through one batters the airframe.
  const storm = stormAt(world, world.distance, world.altitude);
  if (storm && world.elapsed - world.stormHitAt > 1.5) {
    world.stormHitAt = world.elapsed;
    world.damage = Math.min(100, world.damage + 18);
    world.shake = 0.7;
    setMessage(world, 'Storm cell! Damage +18% — steer clear of the dark clouds.');
    sfx && sfx('storm');
  }
  if (world.damage >= 100) {
    world.crashed = true;
    world.screen = 'over';
    sfx && sfx('crash');
    return;
  }

  // Fuel out: the engine quits and the plane glides down.
  if (world.fuel <= 0) {
    world.throttle = 0;
    world.altitude = Math.max(0, world.altitude - 30 * dt);
  }

  // Ground contact.
  if (world.altitude <= 0) {
    const onRunway = Math.abs(world.distance - DEST_RUNWAY_NM) < 0.6 || world.distance < 0.5;
    if (onRunway && world.speed < 190) {
      world.landed = true;
      world.score += LANDING_BONUS;
      world.screen = 'over';
      setMessage(world, 'Landed at Skyport! +' + LANDING_BONUS + ' pts');
      sfx && sfx('land');
    } else {
      world.crashed = true;
      world.screen = 'over';
      sfx && sfx('crash');
    }
    return;
  }

  if (world.elapsed >= SORTIE_SECONDS) {
    world.timeLeft = 0;
    world.screen = 'over';
    sfx && sfx('end');
  }
}

export function adjustThrottle(world, delta) {
  if (world.screen !== 'playing' || world.paused) return;
  world.throttle = Math.max(0, Math.min(100, world.throttle + delta));
}

export function outcomeText(world) {
  if (world.landed) return 'LANDED AT SKYPORT';
  if (world.crashed) return world.damage >= 100 ? 'AIRFRAME LOST' : 'CRASHED';
  if (world.courseDone) return 'COURSE COMPLETE';
  return 'SORTIE OVER';
}
