// Skyline Courier — canvas drawing.
// One clear job: everything the pilot sees, from the sky to the HUD.
// The game state lives in world.js; this file only draws it.

import { MAX_ALTITUDE, RING_COUNT, DEST_RUNWAY_NM, STORMS } from './config.js';
import { nextRingInfo } from './world.js';
import { hash01 } from './random.js';

const W = 1280;
const H = 800;
const PLANE_X = 380;
const PLANE_Y = 330;

function skyGradient(ctx, horizonY) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2f6db3');
  g.addColorStop(0.45, '#7fb2dd');
  g.addColorStop(0.62, '#f6c98a');
  g.addColorStop(0.72, '#cfe3c0');
  g.addColorStop(1, '#5d8a4a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  void horizonY;
}

function drawSun(ctx) {
  const x = 1080;
  const y = 130;
  const glow = ctx.createRadialGradient(x, y, 10, x, y, 130);
  glow.addColorStop(0, 'rgba(255, 236, 170, 0.95)');
  glow.addColorStop(0.35, 'rgba(255, 214, 120, 0.55)');
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 140, y - 140, 280, 280);
  ctx.fillStyle = '#ffdf8a';
  ctx.beginPath();
  ctx.arc(x, y, 42, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx, world, t) {
  // Soft clouds, placed by distance so the same flight always shows the same sky.
  for (let i = -2; i < 10; i += 1) {
    const seg = Math.floor(world.distance * 2) + i;
    const r1 = hash01(seg, 11);
    const r2 = hash01(seg, 23);
    const r3 = hash01(seg, 37);
    const x = ((seg * 640 - world.distance * 1280) % 1600 + 1600) % 1600 - 160;
    const y = 60 + r2 * 260 - (world.altitude / MAX_ALTITUDE) * 120;
    const s = 0.7 + r3 * 0.9;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(x, y, 90 * s, 26 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 55 * s, y + 10 * s, 55 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 60 * s, y + 8 * s, 60 * s, 20 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    void r1; void t;
  }
}

function drawMountains(ctx, world, horizonY) {
  ctx.fillStyle = '#6d7fa8';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let x = 0; x <= W; x += 16) {
    const d = world.distance * 0.12 + x / 900;
    const y = horizonY - 40 - 90 * (0.5 + 0.5 * Math.sin(d * 2.1) * Math.sin(d * 0.7 + 1.3));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, horizonY);
  ctx.closePath();
  ctx.fill();
  // Snow caps on the tallest peaks.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let x = 40; x < W; x += 220) {
    const d = world.distance * 0.12 + x / 900;
    const peak = horizonY - 40 - 90 * (0.5 + 0.5 * Math.sin(d * 2.1) * Math.sin(d * 0.7 + 1.3));
    if (peak < horizonY - 95) {
      ctx.beginPath();
      ctx.moveTo(x - 26, peak + 26);
      ctx.lineTo(x, peak);
      ctx.lineTo(x + 26, peak + 26);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawHills(ctx, world, horizonY) {
  ctx.fillStyle = '#4f7a45';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let x = 0; x <= W; x += 16) {
    const d = world.distance * 0.35 + x / 700;
    const y = horizonY - 12 - 42 * (0.5 + 0.5 * Math.sin(d * 1.7 + 0.6));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, horizonY);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, world, horizonY) {
  // Near ground: patchwork fields, a winding river, a road and little towns.
  ctx.fillStyle = '#6f9a4e';
  ctx.fillRect(0, horizonY, W, H - horizonY);
  const segW = 160;
  const base = Math.floor((world.distance * 320) / segW);
  const fieldColors = ['#7fae56', '#8fae4e', '#a8a05a', '#6f9a4e', '#b59a5e', '#7ba05a'];
  for (let i = -1; i < 10; i += 1) {
    const seg = base + i;
    const x = i * segW - ((world.distance * 320) % segW);
    const c = fieldColors[Math.floor(hash01(seg, 5) * fieldColors.length)];
    ctx.fillStyle = c;
    ctx.fillRect(x, horizonY + 6, segW - 4, H - horizonY - 6);
    // A river winds through some fields.
    if (hash01(seg, 7) > 0.55) {
      ctx.fillStyle = '#4a90c2';
      const rx = x + 40 + hash01(seg, 9) * 60;
      ctx.beginPath();
      ctx.moveTo(rx, horizonY + 6);
      ctx.lineTo(rx + 46, horizonY + 6);
      ctx.lineTo(rx + 20, H);
      ctx.lineTo(rx - 26, H);
      ctx.closePath();
      ctx.fill();
    }
    // A town: a cluster of small houses with red roofs.
    if (hash01(seg, 13) > 0.72) {
      for (let h = 0; h < 5; h += 1) {
        const hx = x + 12 + h * 28 + hash01(seg, 20 + h) * 10;
        const hy = horizonY + 26 + hash01(seg, 30 + h) * 90;
        ctx.fillStyle = '#e8e0cc';
        ctx.fillRect(hx, hy, 20, 14);
        ctx.fillStyle = '#b0492f';
        ctx.beginPath();
        ctx.moveTo(hx - 2, hy);
        ctx.lineTo(hx + 10, hy - 10);
        ctx.lineTo(hx + 22, hy);
        ctx.closePath();
        ctx.fill();
      }
    }
    // Trees along the field edge.
    for (let tr = 0; tr < 3; tr += 1) {
      const tx = x + 20 + hash01(seg, 40 + tr) * 120;
      const ty = horizonY + 14 + hash01(seg, 50 + tr) * 40;
      ctx.fillStyle = '#2f6b2a';
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a4028';
      ctx.fillRect(tx - 1, ty + 5, 2, 6);
    }
  }
  // The road runs along the ground.
  ctx.strokeStyle = '#5a5a5a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, horizonY + 66);
  for (let x = 0; x <= W; x += 40) {
    const y = horizonY + 66 + 10 * Math.sin((x + world.distance * 320) / 260);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = '#f2e9c9';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(0, horizonY + 66);
  for (let x = 0; x <= W; x += 40) {
    const y = horizonY + 66 + 10 * Math.sin((x + world.distance * 320) / 260);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRunway(ctx, world, horizonY) {
  // Skyport runway: a strip ahead when the destination (or the start) is near.
  const ahead = DEST_RUNWAY_NM - world.distance;
  const startAhead = -world.distance; // the departure runway behind the start
  let x = null;
  let scale = 1;
  if (ahead > -0.4 && ahead < 3) {
    x = PLANE_X + 260 + ahead * 260;
    scale = Math.max(0.35, 1 - ahead * 0.18);
  } else if (world.distance < 0.6) {
    x = PLANE_X - 60 - world.distance * 300;
    scale = 1;
  }
  if (x === null || x < -260 || x > W + 40) return;
  void startAhead;
  const rw = 300 * scale;
  const rh = 26 * scale;
  const ry = horizonY + 84;
  ctx.fillStyle = '#3c3f45';
  ctx.beginPath();
  ctx.moveTo(x, ry);
  ctx.lineTo(x + rw, ry - 6);
  ctx.lineTo(x + rw, ry - 6 + rh);
  ctx.lineTo(x, ry + rh);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2f2f2';
  const dashes = 6;
  for (let d = 0; d < dashes; d += 1) {
    const dx = x + 18 + (d * (rw - 36)) / dashes;
    ctx.fillRect(dx, ry + rh / 2 - 2, 18 * scale, 4);
  }
  ctx.fillStyle = '#ffd34d';
  for (let d = 0; d <= 8; d += 1) {
    ctx.beginPath();
    ctx.arc(x + (d * rw) / 8, ry - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SKYPORT 27', x + 8, ry - 14);
}

function drawRings(ctx, world) {
  const next = nextRingInfo(world);
  if (!next) return;
  for (let k = 0; k < 3; k += 1) {
    const idx = world.nextRing + k;
    if (idx >= RING_COUNT) break;
    const ringDist = 2.0 + idx * 2.5;
    const ahead = ringDist - world.distance;
    if (ahead < -0.2 || ahead > 7) continue;
    const ringAlt = [900, 1400, 1900, 1100, 700, 2400, 1300, 800][idx];
    const x = PLANE_X + 170 + ahead * 150;
    const y = PLANE_Y - (ringAlt - world.altitude) * 0.085;
    const r = 30 + Math.max(0, 1 - ahead / 7) * 78;
    const near = k === 0;
    ctx.save();
    ctx.globalAlpha = near ? 1 : 0.45;
    ctx.strokeStyle = near ? '#ffc93a' : '#d8b45a';
    ctx.lineWidth = near ? 10 : 6;
    ctx.shadowColor = '#ffb700';
    ctx.shadowBlur = near ? 22 : 6;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.25, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = near ? '#7a5200' : '#6b5a2a';
    ctx.font = 'bold ' + Math.max(13, Math.round(r * 0.32)) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GATE ' + (idx + 1), x, y - r - 10);
    ctx.restore();
  }
}

function drawStorms(ctx, world) {
  for (const s of STORMS) {
    const ahead = s.dist - world.distance;
    if (ahead < -0.5 || ahead > 7) continue;
    const x = PLANE_X + 170 + ahead * 150;
    const y = PLANE_Y - (s.alt - world.altitude) * 0.085;
    ctx.fillStyle = 'rgba(52, 52, 66, 0.92)';
    ctx.beginPath();
    ctx.ellipse(x, y, 110, 52, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 70, y + 16, 70, 36, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 72, y + 14, 74, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    if (x < W - 110) {
      ctx.fillStyle = '#ffd94d';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ STORM', x, y - 58);
    }
  }
}

function drawPlane(ctx, world) {
  const bankDeg = world.bank * 22;
  const pitchDeg = -world.pitch * 10;
  ctx.save();
  ctx.translate(PLANE_X + (world.planeDx || 0), PLANE_Y + (world.planeDy || 0));
  ctx.rotate((bankDeg + pitchDeg) * Math.PI / 180);
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
  }
  // Tail.
  ctx.fillStyle = '#e8542f';
  ctx.beginPath();
  ctx.moveTo(-72, -6);
  ctx.lineTo(-96, -34);
  ctx.lineTo(-84, -34);
  ctx.lineTo(-58, -10);
  ctx.closePath();
  ctx.fill();
  // Fuselage.
  const body = ctx.createLinearGradient(0, -22, 0, 18);
  body.addColorStop(0, '#ffb347');
  body.addColorStop(0.5, '#f47b20');
  body.addColorStop(1, '#d95d0e');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-78, -4);
  ctx.quadraticCurveTo(-40, -24, 30, -18);
  ctx.quadraticCurveTo(78, -12, 88, 0);
  ctx.quadraticCurveTo(78, 12, 30, 16);
  ctx.quadraticCurveTo(-40, 18, -78, 8);
  ctx.closePath();
  ctx.fill();
  // Cockpit window.
  ctx.fillStyle = '#bfe6f5';
  ctx.beginPath();
  ctx.ellipse(42, -12, 20, 9, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b3a4a';
  ctx.beginPath();
  ctx.arc(46, -12, 4, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.moveTo(-18, 2);
  ctx.lineTo(6, 2);
  ctx.lineTo(26, 34);
  ctx.lineTo(-2, 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8542f';
  ctx.fillRect(-18, 0, 24, 4);
  // Propeller: a spinning blur disc and blades.
  ctx.save();
  ctx.translate(92, -2);
  ctx.rotate(world.propAngle);
  ctx.fillStyle = 'rgba(60, 60, 70, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(-3, -48, 6, 96);
  ctx.restore();
  ctx.fillStyle = '#2b2b33';
  ctx.beginPath();
  ctx.arc(92, -2, 7, 0, Math.PI * 2);
  ctx.fill();
  // Registration.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SKY-26', -30, 6);
  ctx.restore();
}

function bar(ctx, x, y, w, h, frac, color, label) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, Math.max(0, (w - 4) * Math.max(0, Math.min(1, frac))), h - 4);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 5);
}

function drawHud(ctx, world) {
  // Top instrument bar.
  ctx.fillStyle = 'rgba(10, 24, 44, 0.88)';
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  const items = [
    ['ALT', Math.round(world.altitude) + ' ft'],
    ['SPD', Math.round(world.speed) + ' kt'],
    ['HDG', String(Math.round(world.heading)).padStart(3, '0') + '°'],
    ['SCORE', String(world.score)],
    ['TIME', Math.ceil(world.timeLeft) + 's'],
    ['RINGS', world.ringsPassed + '/' + RING_COUNT],
  ];
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#9fc6ee';
  items.forEach((it, i) => {
    ctx.fillText(it[0], 24 + i * 150, 22);
  });
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#fff';
  items.forEach((it, i) => {
    ctx.fillText(it[1], 24 + i * 150, 50);
  });
  // Fuel and damage bars, right side.
  bar(ctx, 980, 16, 120, 14, world.fuel / 100, world.fuel > 25 ? '#57c84d' : '#e5484d', 'FUEL ' + Math.round(world.fuel) + '%');
  bar(ctx, 980, 42, 120, 14, 1 - world.damage / 100, world.damage < 50 ? '#57c84d' : '#e5484d', 'HULL ' + Math.round(100 - world.damage) + '%');
  // Throttle gauge.
  ctx.fillStyle = 'rgba(10, 24, 44, 0.88)';
  ctx.fillRect(1150, 150, 100, 220);
  ctx.fillStyle = '#9fc6ee';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THROTTLE', 1200, 172);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(1186, 184, 28, 150);
  ctx.fillStyle = '#ffb347';
  const th = (world.throttle / 100) * 150;
  ctx.fillRect(1186, 184 + 150 - th, 28, th);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(Math.round(world.throttle) + '%', 1200, 356);
  // Compass strip.
  ctx.fillStyle = 'rgba(10, 24, 44, 0.7)';
  ctx.fillRect(440, 72, 400, 26);
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  const dirs = ['N 000', 'E 090', 'S 180', 'W 270'];
  dirs.forEach((d, i) => {
    ctx.fillText(d, 480 + i * 100, 90);
  });
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(640, 72);
  ctx.lineTo(634, 62);
  ctx.lineTo(646, 62);
  ctx.closePath();
  ctx.fill();
  // Mission panel, bottom left.
  const next = nextRingInfo(world);
  ctx.fillStyle = 'rgba(10, 24, 44, 0.82)';
  ctx.fillRect(20, 640, 330, 132);
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MISSION — SKYLINE COURIER', 36, 664);
  ctx.fillStyle = '#fff';
  ctx.font = '15px sans-serif';
  ctx.fillText(next ? 'Next: ' + next.name + ' · ' + next.alt + ' ft' : 'All gates cleared — land at Skyport!', 36, 690);
  ctx.fillText(next ? 'Distance: ' + Math.max(0, next.dist - world.distance).toFixed(1) + ' nm ahead' : 'Runway 27 · ' + Math.max(0, DEST_RUNWAY_NM - world.distance).toFixed(1) + ' nm', 36, 714);
  ctx.fillText('Land at Skyport for +' + 500 + ' pts', 36, 738);
  ctx.fillStyle = world.fuel > 25 ? '#9fe870' : '#ff8a7a';
  ctx.fillText(world.fuel > 25 ? 'Fuel OK — rings top it up (+8%)' : 'LOW FUEL — find a gold ring!', 36, 762);
  // Centre message.
  if (world.message && world.elapsed < world.messageUntil) {
    ctx.fillStyle = 'rgba(10, 24, 44, 0.85)';
    const mw = ctx.measureText(world.message).width + 36;
    ctx.fillRect((W - mw) / 2, 108, mw, 40);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 19px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.message, W / 2, 135);
  }
  // Ring flash.
  if (world.ringFlash > 0) {
    ctx.fillStyle = 'rgba(255, 201, 58, ' + (world.ringFlash * 0.25) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(8, 18, 36, 0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 84px sans-serif';
  ctx.fillText('SKYLINE COURIER', W / 2, 250);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Fly the mail run. Thread the gold rings. Land at Skyport.', W / 2, 300);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#d9ecff';
  ctx.fillText('120 seconds · 8 gates · fuel in the rings · storms bite', W / 2, 340);
  ctx.fillStyle = 'rgba(10, 24, 44, 0.85)';
  ctx.fillRect(W / 2 - 260, 380, 520, 190);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('W / ↑ climb    S / ↓ descend    A D turn    Shift / Ctrl throttle', W / 2, 414);
  ctx.fillText('Click the runway lights to start, or press ENTER', W / 2, 448);
  ctx.fillText('Land slow on the runway for +500 · perfect gates +150', W / 2, 482);
  ctx.fillStyle = '#9fe870';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('▶  PRESS ENTER OR CLICK TO FLY', W / 2, 530);
  ctx.fillStyle = '#9fc6ee';
  ctx.font = '15px sans-serif';
  ctx.fillText('An original 2D flight game · make.fun bounty best-flight-game-20261126-0057', W / 2, 610);
  void world;
}

function drawOver(ctx, world) {
  ctx.fillStyle = 'rgba(8, 18, 36, 0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = world.landed ? '#9fe870' : '#ff8a7a';
  ctx.font = 'bold 64px sans-serif';
  const title = world.landed ? 'LANDED AT SKYPORT' : world.crashed ? (world.damage >= 100 ? 'AIRFRAME LOST' : 'CRASHED') : world.courseDone ? 'COURSE COMPLETE' : 'SORTIE OVER';
  ctx.fillText(title, W / 2, 250);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('SCORE  ' + world.score, W / 2, 320);
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#d9ecff';
  ctx.fillText('Gates flown: ' + world.ringsPassed + ' / ' + RING_COUNT + '   ·   Perfect gates: ' + world.perfectRings, W / 2, 366);
  ctx.fillText('Distance: ' + world.distance.toFixed(1) + ' nm   ·   Time: ' + Math.round(world.elapsed) + 's', W / 2, 402);
  ctx.fillText(world.landed ? 'Landing bonus +500 included. Nice flying.' : world.crashed ? 'The courier always gets up again. Press R.' : 'Press R to fly another sortie.', W / 2, 448);
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('▶  PRESS R TO FLY AGAIN', W / 2, 520);
}

export function draw(ctx, world, t) {
  const horizonY = 330 + (world.altitude / MAX_ALTITUDE) * 190;
  skyGradient(ctx, horizonY);
  drawSun(ctx);
  drawClouds(ctx, world, t);
  drawMountains(ctx, world, horizonY);
  drawHills(ctx, world, horizonY);
  drawGround(ctx, world, horizonY);
  drawRunway(ctx, world, horizonY);
  drawStorms(ctx, world);
  drawRings(ctx, world);
  drawPlane(ctx, world);
  drawHud(ctx, world);
  if (world.screen === 'title') drawTitle(ctx, world);
  if (world.screen === 'over') drawOver(ctx, world);
  if (world.paused && world.screen === 'playing') {
    ctx.fillStyle = 'rgba(8, 18, 36, 0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED — press P to continue', W / 2, H / 2);
  }
}
