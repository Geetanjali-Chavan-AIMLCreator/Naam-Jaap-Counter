/**
 * Web Audio API based spiritual sounds for zero-latency, 100% offline chanting.
 * Produces authentic wooden bead clicks and deep resonant temple bell chimes.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a warm, subtle wooden Japa bead tap click
 */
export function playBeadSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Warm wooden bead tone
    osc.type = 'triangle';
    const now = ctx.currentTime;
    
    // Slight pitch variation for natural feel
    const baseFreq = 880 + (Math.random() * 60 - 30);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Graceful fallback if audio context blocked
  }
}

/**
 * Plays a resonant temple bell / singing bowl chime upon completing a 108 Mala
 */
export function playMalaBellSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fundamental = 528; // Solfeggio 528 Hz transformation & peace tone

    // Harmonics for a rich brass/bronze temple bell
    const harmonics = [1, 2.76, 5.4, 8.9];
    const gains = [0.35, 0.18, 0.09, 0.04];

    harmonics.forEach((ratio, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);

      const amp = gains[index];
      gain.gain.setValueAtTime(amp, now);
      // Gentle exponential decay over 3.2 seconds
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Trigger mobile haptic vibration
 */
export function triggerHaptic(type: 'tap' | 'mala' | 'light' = 'tap') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    if (type === 'tap') {
      navigator.vibrate(18);
    } else if (type === 'light') {
      navigator.vibrate(10);
    } else if (type === 'mala') {
      // Distinct rhythmic sacred vibration sequence for completing 108 counts
      navigator.vibrate([40, 60, 50, 70, 100]);
    }
  } catch {
    // Ignore unsupported vibration errors
  }
}
