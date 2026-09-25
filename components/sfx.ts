// Tiny square-wave chiptune blips via WebAudio. No assets.

let ctx: AudioContext | null = null;

const SONGS = {
  on: [[660, 0.06], [990, 0.08]],
  off: [[330, 0.07], [220, 0.08]],
  build: [[262, 0.07], [330, 0.07], [392, 0.07], [523, 0.14]],
  boom: [[110, 0.08], [82, 0.12], [55, 0.2]],
  win: [[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.12], [784, 0.08], [1047, 0.25]],
} as const;

export type Sound = keyof typeof SONGS;

export function play(sound: Sound) {
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const [freq, dur] of SONGS[sound]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    // audio unavailable — stay silent
  }
}
