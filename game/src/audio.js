// Skyline Courier — sound effects.
// One clear job: short WebAudio bleeps, no audio files, nothing over the network.

let ctx = null;

function audioCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function beep(freq, dur, type, vol, when) {
  const ac = audioCtx();
  if (!ac) return;
  const t = ac.currentTime + (when || 0);
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol || 0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSound(name, muted) {
  if (muted) return;
  if (name === 'ring') {
    beep(880, 0.12, 'sine', 0.14);
    beep(1318, 0.2, 'sine', 0.14, 0.09);
  } else if (name === 'course') {
    beep(523, 0.12, 'triangle', 0.14);
    beep(659, 0.12, 'triangle', 0.14, 0.1);
    beep(784, 0.22, 'triangle', 0.14, 0.2);
  } else if (name === 'miss') {
    beep(220, 0.18, 'sawtooth', 0.07);
  } else if (name === 'storm') {
    beep(90, 0.35, 'sawtooth', 0.16);
    beep(70, 0.3, 'square', 0.08, 0.05);
  } else if (name === 'crash') {
    beep(160, 0.5, 'sawtooth', 0.2);
    beep(60, 0.7, 'square', 0.16, 0.1);
  } else if (name === 'land') {
    beep(392, 0.15, 'sine', 0.14);
    beep(523, 0.15, 'sine', 0.14, 0.12);
    beep(659, 0.3, 'sine', 0.14, 0.24);
  } else if (name === 'end') {
    beep(330, 0.2, 'triangle', 0.12);
    beep(262, 0.3, 'triangle', 0.12, 0.15);
  }
}
