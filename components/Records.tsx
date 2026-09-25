"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fetchLogs, setDone } from "@/app/actions";
import {
  addDays,
  addMonths,
  bestStreak,
  currentStreak,
  daysInMonth,
  monthLabel,
  monthOf,
  prettyDay,
  weekday,
} from "@/lib/dates";
import type { Habit, Log } from "@/lib/types";
import { useSfxOn, useToday } from "./hooks";
import { play } from "./sfx";
import { Sprite } from "./Sprite";
import { CHECK } from "./sprites";

const k = (habitId: string, day: string) => `${habitId}|${day}`;
const ALL = "all";

type Props = {
  habits: Habit[];
  initialLogs: Log[];
  serverToday: string;
  loadedSince: string;
};

export function Records({ habits, initialLogs, serverToday, loadedSince }: Props) {
  const today = useToday(serverToday);
  const sfxOn = useSfxOn();
  const [logs, setLogs] = useState(() => new Set(initialLogs.map((l) => k(l.habit_id, l.day))));
  const [since, setSince] = useState(loadedSince);
  const [folder, setFolder] = useState<string>(habits.length === 1 ? habits[0].id : ALL);
  const [month, setMonth] = useState(() => monthOf(serverToday));
  const [dir, setDir] = useState<"l" | "r" | "">("");
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const habit = habits.find((h) => h.id === folder) ?? null;
  const color = habit?.color ?? "#6fe39a";

  // ---- data -----------------------------------------------------------------
  const daysByHabit = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const h of habits) m.set(h.id, new Set());
    for (const key of logs) {
      const [id, day] = key.split("|");
      m.get(id)?.add(day);
    }
    return m;
  }, [habits, logs]);

  /** First day a habit "counts": its creation day or its earliest check-in. */
  const startOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of habits) {
      const first = [...(daysByHabit.get(h.id) ?? [])].sort()[0];
      const created = h.created_at.slice(0, 10);
      m.set(h.id, first && first < created ? first : created);
    }
    return m;
  }, [habits, daysByHabit]);

  const activeOn = (day: string) => habits.filter((h) => (startOf.get(h.id) ?? day) <= day);

  const doneCount = (day: string) => habits.filter((h) => logs.has(k(h.id, day))).length;

  /** Share of eligible habit-days completed in a month, or null if nothing was eligible. */
  const monthRate = (m: string, h: Habit | null) => {
    let done = 0;
    let total = 0;
    for (const d of daysInMonth(m)) {
      if (d > today) break;
      const pool = h ? ((startOf.get(h.id) ?? d) <= d ? [h] : []) : activeOn(d);
      total += pool.length;
      done += pool.filter((x) => logs.has(k(x.id, d))).length;
    }
    return total ? { done, total, rate: done / total } : null;
  };

  const ensureLoaded = async (m: string) => {
    const need = `${m.slice(0, 4)}-01-01`; // whole year, so the annual report is complete
    if (need >= since) return;
    setLoading(true);
    try {
      const older = await fetchLogs(need, addDays(since, -1));
      setLogs((prev) => {
        const s = new Set(prev);
        for (const l of older) s.add(k(l.habit_id, l.day));
        return s;
      });
      setSince(need);
    } catch {
      flash("ARCHIVE OFFLINE");
    } finally {
      setLoading(false);
    }
  };

  const goMonth = (m: string) => {
    if (m > monthOf(today) || m === month) return;
    setDir(m < month ? "l" : "r");
    setMonth(m);
    setPicked(null);
    void ensureLoaded(m);
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const toggle = (h: Habit, day: string) => {
    if (day > today) return;
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
    if (sfxOn) play(next ? "on" : "off");
    setDone(h.id, day, next).catch(() => {
      apply(!next);
      flash("SIGNAL LOST · NOT SAVED");
    });
  };

  // ---- derived view ---------------------------------------------------------
  const days = daysInMonth(month);
  const lead = weekday(days[0]);
  const stats = monthRate(month, habit);
  const year = month.slice(0, 4);
  const yearMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);

  let monthBest = 0;
  let perfect = 0;
  {
    let run = 0;
    for (const d of days) {
      if (d > today) break;
      const hit = habit ? logs.has(k(habit.id, d)) : activeOn(d).length > 0 && doneCount(d) >= activeOn(d).length;
      if (!habit && hit) perfect++;
      run = hit ? run + 1 : 0;
      monthBest = Math.max(monthBest, run);
    }
  }

  const life = habit
    ? {
        streak: currentStreak(daysByHabit.get(habit.id)!, today),
        best: bestStreak(daysByHabit.get(habit.id)!),
        total: daysByHabit.get(habit.id)!.size,
        since: startOf.get(habit.id)!,
      }
    : null;

  // ---- render ---------------------------------------------------------------
  return (
    <main className="records">
      <div className="rec-room">
        <header className="rec-top">
          <Link href="/" className="px-btn back">
            ◀ LOBBY
          </Link>
          <h1>RECORDS ROOM</h1>
          <span className="rec-plate">B2</span>
        </header>

        {habits.length === 0 ? (
          <p className="rec-empty">NO FLOORS YET · BUILD ONE IN THE LOBBY</p>
        ) : (
          <>
            <nav className="tabs" aria-label="Folders">
              {[null, ...habits].map((h) => {
                const id = h?.id ?? ALL;
                return (
                  <button
                    key={id}
                    className={id === folder ? "tab on" : "tab"}
                    style={{ "--c": h?.color ?? "#6fe39a" } as React.CSSProperties}
                    onClick={() => {
                      setFolder(id);
                      setPicked(null);
                      setDir("");
                    }}
                    aria-pressed={id === folder}
                  >
                    <i />
                    {h ? h.name.toUpperCase() : "ALL FLOORS"}
                  </button>
                );
              })}
            </nav>

            <section className="folder" style={{ "--c": color } as React.CSSProperties}>
              <div className={`paper from-${dir || "n"}`} key={`${folder}-${month}`}>
                <div className="month-nav">
                  <button onClick={() => goMonth(addMonths(month, -1))} aria-label="Previous month">
                    ◀
                  </button>
                  <strong>
                    {monthLabel(month)}
                    {loading && <em className="loading"> ...</em>}
                  </strong>
                  <button
                    onClick={() => goMonth(addMonths(month, 1))}
                    disabled={month >= monthOf(today)}
                    aria-label="Next month"
                  >
                    ▶
                  </button>
                </div>

                <div className="cal-head" aria-hidden>
                  {"SMTWTFS".split("").map((c, i) => (
                    <span key={i}>{c}</span>
                  ))}
                </div>
                <div className="cal">
                  {Array.from({ length: lead }, (_, i) => (
                    <span key={`b${i}`} className="cell blank" />
                  ))}
                  {days.map((d) => {
                    const future = d > today;
                    const num = Number(d.slice(8));
                    if (habit) {
                      const lit = logs.has(k(habit.id, d));
                      const before = d < (startOf.get(habit.id) ?? d);
                      return (
                        <button
                          key={d}
                          className={`cell ${lit ? "lit" : ""} ${future ? "future" : ""} ${before && !lit ? "before" : ""} ${d === today ? "today" : ""}`}
                          disabled={future}
                          onClick={() => toggle(habit, d)}
                          aria-pressed={lit}
                          aria-label={`${habit.name} — ${prettyDay(d)}${lit ? " (done)" : ""}`}
                        >
                          <span className="num">{num}</span>
                          {lit && <Sprite sprite={CHECK} scale={2} className="stamp" />}
                        </button>
                      );
                    }
                    const pool = activeOn(d);
                    const n = doneCount(d);
                    const full = pool.length > 0 && n >= pool.length;
                    return (
                      <button
                        key={d}
                        className={`cell all ${full && !future ? "full" : ""} ${future ? "future" : ""} ${d === today ? "today" : ""} ${picked === d ? "picked" : ""}`}
                        disabled={future}
                        onClick={() => setPicked(picked === d ? null : d)}
                        aria-label={`${prettyDay(d)} — ${n} of ${pool.length} done`}
                        style={{ "--fill": pool.length ? n / pool.length : 0 } as React.CSSProperties}
                      >
                        <span className="num">{num}</span>
                        <span className="dots">
                          {habits.map((h) =>
                            logs.has(k(h.id, d)) ? (
                              <i key={h.id} style={{ background: h.color }} />
                            ) : null,
                          )}
                        </span>
                        {full && !future && <b className="star">★</b>}
                      </button>
                    );
                  })}
                </div>

                <div className="month-stats">
                  <span className="stamp-box">
                    <small>{habit ? "DONE" : "HABIT-DAYS"}</small>
                    <b>
                      {stats?.done ?? 0}/{stats?.total ?? 0}
                    </b>
                  </span>
                  <span className="stamp-box">
                    <small>RATE</small>
                    <b>{stats ? Math.round(stats.rate * 100) : 0}%</b>
                  </span>
                  <span className="stamp-box">
                    <small>{habit ? "BEST RUN" : "PERFECT"}</small>
                    <b>{habit ? monthBest : perfect}</b>
                  </span>
                </div>
              </div>

              {!habit && picked && (
                <div className="day-card">
                  <strong>{prettyDay(picked).toUpperCase()}</strong>
                  <ul>
                    {habits.map((h) => {
                      const on = logs.has(k(h.id, picked));
                      return (
                        <li key={h.id}>
                          <button
                            className={on ? "chk on" : "chk"}
                            style={{ "--c": h.color } as React.CSSProperties}
                            onClick={() => toggle(h, picked)}
                            aria-pressed={on}
                          >
                            <span className="box">{on && <Sprite sprite={CHECK} scale={2} />}</span>
                            {h.name.toUpperCase()}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="paper report">
                <span className="report-title">ANNUAL REPORT · {year}</span>
                <div className="bars">
                  {yearMonths.map((m) => {
                    const r = m > monthOf(today) ? null : monthRate(m, habit);
                    return (
                      <button
                        key={m}
                        className={`bar ${m === month ? "on" : ""} ${r ? "" : "none"}`}
                        disabled={m > monthOf(today)}
                        onClick={() => goMonth(m)}
                        title={r ? `${monthLabel(m)} · ${Math.round(r.rate * 100)}%` : monthLabel(m)}
                      >
                        <span className="bar-track">
                          <i style={{ height: `${Math.round((r?.rate ?? 0) * 100)}%` }} />
                        </span>
                        <small>{monthLabel(m, "short").slice(0, 1)}</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              {life && (
                <div className="life">
                  <span>
                    STREAK <b>{life.streak}</b>
                  </span>
                  <span>
                    BEST <b>{life.best}</b>
                  </span>
                  <span>
                    TOTAL <b>{life.total}</b>
                  </span>
                  <span>
                    SINCE <b className="since">{prettyDay(life.since).toUpperCase()}</b>
                  </span>
                </div>
              )}
            </section>
          </>
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
