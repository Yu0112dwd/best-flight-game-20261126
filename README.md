# Skyline Courier — make.fun bounty best-flight-game-20261126-0057

[![make.fun](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/Yu0112dwd/best-flight-game-20261126/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/Yu0112dwd/best-flight-game-20261126/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)

**Bounty:** "Make the best flight game" (`best-flight-game-20261126-0057`) — $500 total
(1st $100, 2nd $55, 3rd $30, 4th $29, 5th $20, 6th $19, 7th $15, 8th $14,
9th $12, 10th $11, 11th–12th $10, 13th–16th $8, 17th–22nd $6, 23rd–28th $5,
29th–39th $4, 40th–50th $3 each).
**Deadline:** 2026-11-28 09:57 JST (first blind round 2026-11-26 21:57 JST).
**Entrant:** GitHub [Yu0112dwd](https://github.com/Yu0112dwd),
make.fun [@golden-puffin-42-1121](https://make.fun/u/golden-puffin-42-1121).

## What it is

A complete, original 2D flight game that plays offline in a desktop browser.
You are the Skyline Courier: take off from the meadow strip, thread eight
gold target rings over rivers, hills and towns, dodge the storm cells, and
land slow on Skyport's runway before your fuel runs out. 120-second sorties,
fuel in the rings, and a landing bonus for a gentle touchdown.

- **Flying that rewards discipline:** throttle sets your speed, pitch sets
  your climb, and banking turns you — hold a steady climb through a ring's
  altitude band to score, and a dead-centre pass pays +150 instead of +100.
- **Missions with different goals:** 8 named gates at different altitudes,
  a course-completion bonus, and a final landing at Skyport worth +500.
- **Fuel and damage turn a sortie into decisions:** fuel drains with
  throttle and only rings top it up (+8%); storm cells cost 18% hull, and
  touching down anywhere but a runway ends the flight.
- **Controls:** W/S or ↑/↓ climb and descend, A/D or ←/→ turn, Shift/Ctrl
  throttle up/down, P pause, M mute, R restart, Enter to fly. Mouse click
  also starts and restarts.
- **Feel:** the propeller spins up with throttle, the plane banks into
  turns, the screen shakes in a storm, and landings and crashes read as
  what happened.

## Files

| File | What it is |
|---|---|
| `main.ts` | Node 22 program (stdlib only). Copies `game/` + `screenshots/` to `/output` and writes `dossier.json` via `vendor/makefun-game.ts` |
| `game/index.html` | The game page (canvas 1280×800, no network) |
| `game/src/config.js` | Sortie length, speeds, rings, storms, controls |
| `game/src/world.js` | Game state and rules (flight, rings, fuel, damage, landing) |
| `game/src/render.js` | Canvas drawing (sky, terrain, runway, plane, rings, HUD) |
| `game/src/input.js` | Keyboard + mouse input |
| `game/src/audio.js` | WebAudio sound effects, no files |
| `game/src/shots.js` | Deterministic `?shot=start|play|end` states for screenshots |
| `game/src/random.js` | Seeded random numbers |
| `game/src/main.js` | Game loop and boot |
| `screenshots/` | 3 real renders of the game's own code in a browser |
| `LICENSE` | MIT (OSI-approved, as the bounty requires) |

## How to run / verify

```sh
python3 -m http.server 8080 --directory game   # then open http://127.0.0.1:8080/
# screenshots: open index.html?shot=start / ?shot=play / ?shot=end
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

## Screenshots

The three screenshots are real renders of this game's own code, taken in a
desktop browser at 1280×800:

1. `1-start.jpg` — title screen over the departure runway, plane on the ground.
2. `2-play.jpg` — mid-sortie: climbing through Gate 3's band, storm cell ahead, HUD lit.
3. `3-end.jpg` — landed at Skyport: final scoreboard.
