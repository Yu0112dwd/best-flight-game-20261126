// Skyline Courier — flight tuning and mission data.
// One clear job: the numbers the sky runs on. No logic lives here.

export const SORTIE_SECONDS = 120;
export const MAX_ALTITUDE = 3000; // ft
export const MIN_SPEED = 80; // kt — below this the plane stalls and sinks
export const MAX_SPEED = 320; // kt
export const RING_COUNT = 8; // rings in one course
export const RING_SPACING_NM = 2.5;
export const FIRST_RING_NM = 2.0;
export const DEST_RUNWAY_NM = 22.5; // Skyport runway: land here to finish in style
export const START_FUEL = 100;
export const FUEL_PER_RING = 8;
export const LANDING_BONUS = 500;
export const COURSE_BONUS = 300;
export const RING_POINTS = 100;
export const PERFECT_BONUS = 50;

// The course: each ring has a target altitude band (ft) and a name.
export const RINGS = [
  { name: 'Gate 1 · Meadow', alt: 900 },
  { name: 'Gate 2 · River', alt: 1400 },
  { name: 'Gate 3 · Hilltop', alt: 1900 },
  { name: 'Gate 4 · Ridge', alt: 1100 },
  { name: 'Gate 5 · Valley', alt: 700 },
  { name: 'Gate 6 · Clouds', alt: 2400 },
  { name: 'Gate 7 · Town', alt: 1300 },
  { name: 'Gate 8 · Skyport', alt: 800 },
];

export const STORMS = [
  // Storm cells on the course: { distance (nm), altitude (ft), radius (ft) }
  { dist: 6.2, alt: 1500, radius: 260 },
  { dist: 11.4, alt: 900, radius: 300 },
  { dist: 16.8, alt: 2100, radius: 280 },
];

export const CONTROLS = [
  { key: 'W / ↑', action: 'Climb' },
  { key: 'S / ↓', action: 'Descend' },
  { key: 'A / ←', action: 'Turn left' },
  { key: 'D / →', action: 'Turn right' },
  { key: 'Shift', action: 'Throttle up' },
  { key: 'Ctrl', action: 'Throttle down' },
  { key: 'P', action: 'Pause' },
  { key: 'M', action: 'Mute' },
  { key: 'R', action: 'Restart' },
];
