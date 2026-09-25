import { prettyDay } from "@/lib/dates";
import { Sprite } from "./Sprite";
import { REACTOR } from "./sprites";

const CELLS = 6;

export function Basement({
  days,
  counts,
  habitCount,
  todayRatio,
  best,
  total,
  perfect,
}: {
  days: string[];
  counts: number[];
  habitCount: number;
  todayRatio: number;
  best: number;
  total: number;
  perfect: number;
}) {
  const pct = Math.round(todayRatio * 100);
  return (
    <div className="ground">
      <div className="b1">
        <div className="b1-head">
          <span className="room-label">B1 ARCHIVE · LAST 30 DAYS</span>
          <div className="b1-stats">
            <span>
              BEST STREAK <b>{best}</b>
            </span>
            <span>
              CHECK-INS <b>{total}</b>
            </span>
            <span>
              PERFECT DAYS <b>{perfect}</b>
            </span>
          </div>
        </div>
        <div className="b1-row">
          <div className="racks">
            {days.map((d, i) => {
              const lit = habitCount ? Math.round((counts[i] / habitCount) * CELLS) : 0;
              const full = habitCount > 0 && counts[i] === habitCount;
              return (
                <div
                  key={d}
                  className={`rack ${i === days.length - 1 ? "now" : ""} ${full ? "full" : ""}`}
                  title={`${prettyDay(d)} · ${counts[i]}/${habitCount}`}
                >
                  {Array.from({ length: CELLS }, (_, c) => (
                    <i key={c} className={CELLS - c <= lit ? "on" : ""} />
                  ))}
                </div>
              );
            })}
          </div>
          <div className="reactor" style={{ "--power": todayRatio } as React.CSSProperties}>
            <span className="reactor-glow" />
            <Sprite
              sprite={REACTOR}
              scale={4}
              style={{ "--core": todayRatio >= 1 ? "#6fe39a" : todayRatio > 0 ? "#3fa45b" : "#1f3a2a" } as React.CSSProperties}
            />
            <span className="reactor-label">CORE {pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
