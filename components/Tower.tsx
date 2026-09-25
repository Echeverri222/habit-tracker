"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { addHabit, logout, removeHabit, renameHabit, setDone } from "@/app/actions";
import { addDays, bestStreak, currentStreak, lastNDays, weekdayLetter } from "@/lib/dates";
import type { Habit, Log } from "@/lib/types";
import { Basement } from "./Basement";
import { Skyline, Street } from "./City";
import { Floor } from "./Floor";
import { useSfxOn, useToday, writeSfx } from "./hooks";
import { Sprite } from "./Sprite";
import { CABINET } from "./sprites";
import { NewFloorDialog } from "./NewFloorDialog";
import { play, type Sound } from "./sfx";

const k = (habitId: string, day: string) => `${habitId}|${day}`;

type Burst = { id: number; x: number; y: number; color: string };
type Rocket = { id: number; x: number; y: number; color: string; delay: number };

export function Tower({
  initialHabits,
  initialLogs,
  serverToday,
  canLock,
  storage,
}: {
  initialHabits: Habit[];
  initialLogs: Log[];
  serverToday: string;
  canLock: boolean;
  storage: "supabase" | "local";
}) {
  const today = useToday(serverToday);
  const sfxOn = useSfxOn();

  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(() => new Set(initialLogs.map((l) => k(l.habit_id, l.day))));
  const [dialog, setDialog] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [doomed, setDoomed] = useState<string | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [toast, setToast] = useState("");
  const seq = useRef(0);

  const sound = (s: Sound) => sfxOn && play(s);
  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  // ---- derived stats -------------------------------------------------------
  const week = useMemo(() => lastNDays(today, 7), [today]);
  const month = useMemo(() => lastNDays(today, 30), [today]);

  const daysByHabit = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const h of habits) m.set(h.id, new Set());
    for (const key of logs) {
      const [id, day] = key.split("|");
      m.get(id)?.add(day);
    }
    return m;
  }, [habits, logs]);

  const stats = useMemo(() => {
    const per = habits.map((h) => {
      const set = daysByHabit.get(h.id) ?? new Set<string>();
      return { id: h.id, streak: currentStreak(set, today), best: bestStreak(set), done: set.has(today) };
    });
    const perDay = new Map<string, number>();
    for (const set of daysByHabit.values()) for (const d of set) perDay.set(d, (perDay.get(d) ?? 0) + 1);
    const n = habits.length;
    return {
      per: new Map(per.map((p) => [p.id, p])),
      doneToday: per.filter((p) => p.done).length,
      best: Math.max(0, ...per.map((p) => p.best)),
      total: [...daysByHabit.values()].reduce((a, s) => a + s.size, 0),
      perfect: n ? [...perDay.values()].filter((c) => c === n).length : 0,
      monthCounts: month.map((d) => perDay.get(d) ?? 0),
    };
  }, [habits, daysByHabit, today, month]);

  const allDone = habits.length > 0 && stats.doneToday === habits.length;

  // ---- effects -------------------------------------------------------------
  const burstAt = (el: HTMLElement, color: string) => {
    const r = el.getBoundingClientRect();
    const id = ++seq.current;
    setBursts((b) => [...b, { id, x: r.left + r.width / 2, y: r.top + r.height / 2, color }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
  };

  const celebrate = () => {
    const colors = habits.map((h) => h.color);
    const batch = Array.from({ length: 7 }, (_, i) => ({
      id: ++seq.current,
      x: 10 + Math.random() * 80,
      y: 8 + Math.random() * 30,
      color: colors[i % colors.length],
      delay: i * 0.28,
    }));
    setRockets(batch);
    setTimeout(() => setRockets([]), 4200);
    setTimeout(() => sound("win"), 250);
  };

  // ---- mutations (optimistic) ---------------------------------------------
  const toggle = (h: Habit, day: string, el: HTMLElement) => {
    const key = k(h.id, day);
    const next = !logs.has(key);
    const apply = (on: boolean) =>
      setLogs((prev) => {
        const s = new Set(prev);
        if (on) s.add(key);
        else s.delete(key);
        return s;
      });
    apply(next);
    if (next) {
      burstAt(el, h.color);
      sound("on");
      const completesToday =
        day === today && habits.every((x) => x.id === h.id || logs.has(k(x.id, today)));
      if (completesToday) celebrate();
    } else {
      sound("off");
    }
    setDone(h.id, day, next).catch(() => {
      apply(!next);
      flash("SIGNAL LOST · NOT SAVED");
    });
  };

  const build = async (name: string, color: string) => {
    const h = await addHabit(name, color);
    setHabits((hs) => [...hs, h]);
    setDialog(false);
    setFresh(h.id);
    sound("build");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setFresh(null), 1600);
  };

  const demolish = (h: Habit) => {
    setDoomed(h.id);
    sound("boom");
    setTimeout(() => {
      setHabits((hs) => hs.filter((x) => x.id !== h.id));
      setDoomed(null);
    }, 750);
    removeHabit(h.id).catch(() => {
      setHabits((hs) => (hs.some((x) => x.id === h.id) ? hs : [...hs, h].sort((a, b) => a.position - b.position)));
      flash("DEMOLITION FAILED");
    });
  };

  const rename = (h: Habit, name: string) => {
    setHabits((hs) => hs.map((x) => (x.id === h.id ? { ...x, name } : x)));
    renameHabit(h.id, name).catch(() => {
      setHabits((hs) => hs.map((x) => (x.id === h.id ? { ...x, name: h.name } : x)));
      flash("RENAME FAILED");
    });
  };

  // ---- render --------------------------------------------------------------
  const floors = [...habits].sort((a, b) => b.position - a.position); // newest on top
  const left = habits.length - stats.doneToday;
  const billboard = !habits.length ? ["BREAK", "GROUND"] : allDone ? ["HABITS", "SATURATED"] : [`${left} LEFT`, "TODAY"];
  const ticker = [
    ...habits.map((h) => {
      const p = stats.per.get(h.id)!;
      return `${h.name.toUpperCase()} · ${p.streak}D STREAK · BEST ${p.best}`;
    }),
    `TODAY ${stats.doneToday}/${habits.length}`,
    `YESTERDAY ${habits.filter((h) => logs.has(k(h.id, addDays(today, -1)))).length}/${habits.length}`,
    "BUILD ONE FLOOR AT A TIME",
    storage === "local" ? "LOCAL DEV STORAGE" : "SYNCED VIA SUPABASE",
  ];

  return (
    <>
      <div className="fireworks" aria-hidden>
        {rockets.map((r) => (
          <span
            key={r.id}
            className="rocket"
            style={{ left: `${r.x}%`, top: `${r.y}%`, "--c": r.color, animationDelay: `${r.delay}s` } as React.CSSProperties}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ "--a": `${i * 30}deg`, animationDelay: `${r.delay}s` } as React.CSSProperties} />
            ))}
          </span>
        ))}
      </div>

      <main className="world">
        <div className="cityblock">
          <Skyline />
          <div className="billboard" aria-live="polite">
            <div className="bb-sign">
              <span>{billboard[0]}</span>
              <span>{billboard[1]}</span>
            </div>
            <i className="bb-pole" />
          </div>

          <div className="tower">
            <div className="roof">
              <div className="roof-sign">
                <strong>HABIT TOWER</strong>
                <small>FLOORS: {habits.length + 1}</small>
                <i className="leg l" />
                <i className="leg r" />
              </div>
              <div className="antenna">
                <i className="beacon" />
              </div>
              <div className="tank" />
              <div className="roof-units">
                <i />
                <i />
                <i />
              </div>
            </div>

            {habits.length > 0 && (
              <div className="day-rail" aria-hidden>
                <span className="rail-title">THIS WEEK</span>
                <div className="rail-days">
                  {week.map((d) => (
                    <span key={d} className={d === today ? "today" : ""}>
                      {weekdayLetter(d)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {floors.map((h) => {
              const index = habits.findIndex((x) => x.id === h.id);
              const p = stats.per.get(h.id)!;
              return (
                <Floor
                  key={h.id}
                  habit={h}
                  floorNo={index + 2}
                  days={week}
                  today={today}
                  done={daysByHabit.get(h.id) ?? new Set()}
                  streak={p.streak}
                  best={p.best}
                  state={doomed === h.id ? "doomed" : fresh === h.id ? "fresh" : "normal"}
                  onToggle={(d, el) => toggle(h, d, el)}
                  onRename={(name) => rename(h, name)}
                  onDemolish={() => demolish(h)}
                />
              );
            })}

            {habits.length === 0 && (
              <button className="empty-lot" onClick={() => setDialog(true)}>
                <span>EMPTY LOT</span>
                <small>TAP TO BUILD YOUR FIRST HABIT FLOOR</small>
              </button>
            )}

            <section className="floor lobby" aria-label="Lobby">
              <div className="floor-id">
                <span className="floor-label static">
                  <span className="floor-no">1F</span> LOBBY
                </span>
                <div className="lobby-ctrls">
                  <button onClick={() => writeSfx(!sfxOn)} aria-pressed={sfxOn}>
                    SFX {sfxOn ? "ON" : "OFF"}
                  </button>
                  {canLock && (
                    <form action={logout}>
                      <button type="submit">LOCK</button>
                    </form>
                  )}
                </div>
              </div>
              <span className="door" aria-hidden>
                <i />
                <i />
              </span>
              <div className={`board big ${allDone ? "on" : ""}`}>
                <small>{allDone ? "ALL DONE TODAY" : "DONE TODAY"}</small>
                <strong>
                  {stats.doneToday}/{habits.length}
                </strong>
                <span className="meter" aria-hidden>
                  {habits.map((h) => (
                    <i key={h.id} className={stats.per.get(h.id)!.done ? "on" : ""} style={{ "--c": h.color } as React.CSSProperties} />
                  ))}
                </span>
              </div>
              <Link href="/records" className="cabinet" aria-label="Open records room">
                <span className="cab-top">RECORDS</span>
                <Sprite sprite={CABINET} scale={3} />
              </Link>
              <button className="elevator" onClick={() => setDialog(true)}>
                <span className="elev-top">▲ NEW FLOOR</span>
                <span className="elev-doors">
                  <i />
                  <i />
                  <b>+</b>
                </span>
              </button>
            </section>
          </div>
        </div>

        <Street />
        <Basement
          days={month}
          counts={stats.monthCounts}
          habitCount={habits.length}
          todayRatio={habits.length ? stats.doneToday / habits.length : 0}
          best={stats.best}
          total={stats.total}
          perfect={stats.perfect}
        />
        <div className="ticker" aria-hidden>
          <div className="ticker-track">
            {[0, 1].map((dup) => (
              <span key={dup}>
                {ticker.map((t, i) => (
                  <span key={i}>
                    <b>◆</b> {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </main>

      {dialog && <NewFloorDialog onBuild={build} onClose={() => setDialog(false)} />}

      {bursts.map((b) => (
        <span key={b.id} className="burst" style={{ left: b.x, top: b.y, "--c": b.color } as React.CSSProperties} aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ "--a": `${i * 45}deg` } as React.CSSProperties} />
          ))}
          <em>+1</em>
        </span>
      ))}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
