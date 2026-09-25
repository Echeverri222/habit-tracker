import { Sprite } from "./Sprite";
import { CAR, PERSON_A, PERSON_B } from "./sprites";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const r = rng(42);
const BUILDINGS = Array.from({ length: 16 }, (_, i) => {
  const w = 50 + Math.round(r() * 70);
  const h = 90 + Math.round(r() * 220);
  const lit = Array.from({ length: 5 + Math.round(r() * 6) }, () => ({
    x: Math.floor(r() * Math.floor(w / 12)) * 12 + 6,
    y: Math.floor(r() * Math.floor((h - 20) / 12)) * 12 + 12,
    flick: r() > 0.7,
  }));
  return { left: (i / 16) * 100 + r() * 3, w, h, lit, tone: r() > 0.5 ? "#141b42" : "#10163a" };
});

/** Background skyline: silhouettes, pyramid, red bridge. */
export function Skyline() {
  return (
    <div className="skyline" aria-hidden>
      <svg className="bridge" viewBox="0 0 240 90" shapeRendering="crispEdges">
        <g fill="#b8322c">
          <rect x="52" y="4" width="6" height="80" />
          <rect x="182" y="4" width="6" height="80" />
          <rect x="48" y="14" width="14" height="3" />
          <rect x="178" y="14" width="14" height="3" />
          <rect x="48" y="34" width="14" height="3" />
          <rect x="178" y="34" width="14" height="3" />
          <rect x="0" y="62" width="240" height="4" />
        </g>
        <polyline
          fill="none"
          stroke="#b8322c"
          strokeWidth="1.5"
          points="0,40 20,48 40,30 55,6 80,26 100,40 120,46 140,40 160,26 185,6 200,30 220,48 240,40"
        />
        {Array.from({ length: 23 }, (_, i) => {
          const x = i * 10 + 5;
          return <rect key={i} x={x} y={cableY(x)} width="1" height={62 - cableY(x)} fill="#b8322c" opacity="0.7" />;
        })}
      </svg>
      <div className="pyramid" />
      {BUILDINGS.map((b, i) => (
        <div key={i} className="bg-building" style={{ left: `${b.left}%`, width: b.w, height: b.h, "--tone": b.tone } as React.CSSProperties}>
          {b.lit.map((l, j) => (
            <i key={j} className={l.flick ? "bg-win flick" : "bg-win"} style={{ left: l.x, top: l.y }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function cableY(x: number) {
  // Parabolic sag between towers (55→185), shallow outside.
  if (x < 55) return 40 - (x / 55) * 34 + 8 * Math.sin((x / 55) * Math.PI);
  if (x > 185) return cableY(240 - x);
  const t = (x - 120) / 65;
  return 46 - 40 * t * t;
}

const WALKERS = [
  { shirt: "#d94848", hair: "#2b1d12", pants: "#2e3a5c", dur: 38, delay: -4, dir: 1 },
  { shirt: "#3d7bd9", hair: "#f0c060", pants: "#3a3a3a", dur: 52, delay: -30, dir: -1 },
  { shirt: "#6fe39a", hair: "#1a1a1a", pants: "#5b3a20", dur: 44, delay: -18, dir: 1 },
  { shirt: "#ffa94d", hair: "#6b3a1c", pants: "#2e3a5c", dur: 60, delay: -45, dir: -1 },
  { shirt: "#c79bff", hair: "#d8d8d8", pants: "#222", dur: 48, delay: -10, dir: -1 },
];

// Two lamps at the screen edges, two hugging the tower's sides.
const LAMPS = ["4%", "calc(50% - var(--tower-w) / 2 - 44px)", "calc(50% + var(--tower-w) / 2 + 40px)", "96%"];

export function Street() {
  return (
    <div className="street" aria-hidden>
      <div className="sidewalk">
        {LAMPS.map((x, i) => (
          <span key={i} className={i === 1 || i === 2 ? "lamp near" : "lamp"} style={{ left: x }}>
            <i className="lamp-glow" />
          </span>
        ))}
        {WALKERS.map((w, i) => (
          <span
            key={i}
            className={w.dir > 0 ? "walker" : "walker rev"}
            style={
              {
                "--shirt": w.shirt,
                "--hair": w.hair,
                "--pants": w.pants,
                "--skin": i % 2 ? "#f1c9a0" : "#c68a5a",
                animationDuration: `${w.dur}s`,
                animationDelay: `${w.delay}s`,
              } as React.CSSProperties
            }
          >
            <Sprite sprite={PERSON_A} scale={3} className="fa" />
            <Sprite sprite={PERSON_B} scale={3} className="fb" />
          </span>
        ))}
      </div>
      <div className="road">
        <i className="lane" />
        <span className="car" style={{ "--car": "#d94848" } as React.CSSProperties}>
          <Sprite sprite={CAR} scale={3} />
        </span>
        <span className="car other" style={{ "--car": "#e6e1d1" } as React.CSSProperties}>
          <Sprite sprite={CAR} scale={3} />
        </span>
      </div>
    </div>
  );
}
