import { Sprite } from "./Sprite";
import { BIRD_A, BIRD_B, BLIMP, CLOUD, MOON, PLANE } from "./sprites";

// Static night sky. Positions come from a seeded PRNG so server and client
// markup match.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = rng(2026);
const STARS = Array.from({ length: 110 }, () => ({
  x: r() * 100,
  y: r() * 72,
  big: r() > 0.9,
  delay: r() * 6,
  dur: 2 + r() * 4,
}));
const CLOUDS = Array.from({ length: 6 }, (_, i) => ({
  y: 6 + r() * 38,
  scale: 3 + Math.round(r() * 2),
  dur: 90 + r() * 90,
  delay: -r() * 180,
  op: 0.55 + r() * 0.4,
  key: i,
}));

export function Sky() {
  return (
    <div className="sky" aria-hidden>
      {STARS.map((s, i) => (
        <i
          key={i}
          className={s.big ? "star big" : "star"}
          style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
      <div className="moon">
        <Sprite sprite={MOON} scale={5} />
      </div>
      <i className="shooting" />
      <i className="shooting late" />
      {CLOUDS.map((c) => (
        <div
          key={c.key}
          className="cloud"
          style={{ top: `${c.y}%`, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`, opacity: c.op }}
        >
          <Sprite sprite={CLOUD} scale={c.scale} />
        </div>
      ))}
      <div className="blimp">
        <Sprite sprite={BLIMP} scale={4} />
        <span>STREAK 365?</span>
      </div>
      <div className="plane-run">
        <span className="banner">NEW HABIT JUST DROPPED</span>
        <i className="rope" />
        <Sprite sprite={PLANE} scale={3} />
      </div>
      <div className="flock">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="bird" style={{ left: i * 18, top: (i % 2) * 8, animationDelay: `${i * 0.13}s` }}>
            <Sprite sprite={BIRD_A} scale={2} className="fa" />
            <Sprite sprite={BIRD_B} scale={2} className="fb" />
          </span>
        ))}
      </div>
    </div>
  );
}
