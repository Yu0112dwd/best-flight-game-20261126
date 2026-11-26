// Skyline Courier — keyboard and mouse input.
// One clear job: turn keys and clicks into pilot actions.

import { startSortie, adjustThrottle } from './world.js';

export function attachInput(canvas, world) {
  const keys = new Set();

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    keys.add(e.key.toLowerCase());
    if (e.key === 'Enter' && world.screen === 'title') startSortie(world);
    if ((e.key === 'r' || e.key === 'R') && world.screen === 'over') startSortie(world);
    if (e.key === 'r' || e.key === 'R') {
      if (world.screen === 'playing') startSortie(world);
    }
    if (e.key === 'p' || e.key === 'P') {
      if (world.screen === 'playing') world.paused = !world.paused;
    }
    if (e.key === 'm' || e.key === 'M') world.muted = !world.muted;
    if (e.key === 'Shift') adjustThrottle(world, 10);
    if (e.key === 'Control') adjustThrottle(world, -10);
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
  });

  canvas.addEventListener('mousedown', () => {
    if (world.screen === 'title') startSortie(world);
    else if (world.screen === 'over') startSortie(world);
  });

  // The loop reads the live key set each frame (see main.js).
  world._keys = keys;
}

export function readFlightControls(world) {
  const keys = world._keys;
  if (!keys || world.screen !== 'playing' || world.paused) return;
  if (keys.has('w') || keys.has('arrowup')) world.pitch = Math.min(1, world.pitch + 0.09);
  if (keys.has('s') || keys.has('arrowdown')) world.pitch = Math.max(-1, world.pitch - 0.09);
  if (keys.has('a') || keys.has('arrowleft')) world.bank = Math.max(-1, world.bank - 0.08);
  if (keys.has('d') || keys.has('arrowright')) world.bank = Math.min(1, world.bank + 0.08);
}
