// Skyline Courier — entry point.
// One clear job: boot the game, run the loop, apply screenshot shots.

import { createWorld, updateWorld } from './world.js';
import { draw } from './render.js';
import { attachInput, readFlightControls } from './input.js';
import { applyShot, shotFromUrl } from './shots.js';
import { playSound } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const world = createWorld(20261126);
attachInput(canvas, world);

const { shot } = shotFromUrl();
const frozen = shot ? applyShot(world, shot) : false;

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen) {
    readFlightControls(world);
    updateWorld(world, dt, (name) => playSound(name, world.muted));
  }
  draw(ctx, world, now / 1000);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
