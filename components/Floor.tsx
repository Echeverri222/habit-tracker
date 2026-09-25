"use client";

import { useState } from "react";
import { prettyDay, weekdayLetter } from "@/lib/dates";
import type { Habit } from "@/lib/types";
import { Sprite } from "./Sprite";
import { CHECK, COOLER, DESK, PLANT, SHELF, WORKER } from "./sprites";

const SHIRTS = ["#d94848", "#3d7bd9", "#3fa45b", "#e0b53c", "#9b59b6"];

type Props = {
  habit: Habit;
  floorNo: number;
  days: string[];
  today: string;
  done: Set<string>;
  streak: number;
  best: number;
  state: "normal" | "fresh" | "doomed";
  onToggle: (day: string, el: HTMLElement) => void;
  onRename: (name: string) => void;
  onDemolish: () => void;
};

export function Floor({ habit, floorNo, days, today, done, streak, best, state, onToggle, onRename, onDemolish }: Props) {
  const [mode, setMode] = useState<"idle" | "menu" | "rename" | "confirm">("idle");
  const [draft, setDraft] = useState(habit.name);
  const doneToday = done.has(today);
  const variant = floorNo % 4;

  const submitRename = () => {
    const name = draft.trim();
    if (name && name !== habit.name) onRename(name);
    setMode("idle");
  };

  return (
    <section
      className={`floor ${state} ${doneToday ? "is-done" : ""}`}
      style={{ "--c": habit.color } as React.CSSProperties}
      aria-label={`${habit.name}, ${streak} day streak`}
    >
      <div className="floor-id">
        {mode === "rename" ? (
          <form
            className="rename"
            onSubmit={(e) => {
              e.preventDefault();
              submitRename();
            }}
          >
            <span className="floor-no">{floorNo}F</span>
            <input
              autoFocus
              value={draft}
              maxLength={40}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => e.key === "Escape" && setMode("idle")}
              aria-label="Habit name"
            />
          </form>
        ) : (
          <button className="floor-label" onClick={() => setMode(mode === "idle" ? "menu" : "idle")}>
            <span className="floor-no">{floorNo}F</span>
            <i className="chip" />
            <span className="floor-name">{habit.name.toUpperCase()}</span>
          </button>
        )}
        <small className="floor-best">BEST {best}</small>
      </div>

      <div className="windows">
        {days.map((d) => {
          const lit = done.has(d);
          const isToday = d === today;
          return (
            <button
              key={d}
              className={`win ${lit ? "lit" : ""} ${isToday ? "today" : ""}`}
              onClick={(e) => onToggle(d, e.currentTarget)}
              aria-pressed={lit}
              aria-label={`${habit.name} — ${prettyDay(d)}${lit ? " (done)" : ""}`}
              title={prettyDay(d)}
            >
              <span className="glass">{lit && <Sprite sprite={CHECK} scale={2} />}</span>
              <span className="win-day">{weekdayLetter(d)}</span>
            </button>
          );
        })}
      </div>

      <div className="decor" aria-hidden>
        {variant === 0 && <Sprite sprite={PLANT} scale={3} />}
        <span className="desk" style={{ "--screen-c": doneToday ? habit.color : "#2c3656" } as React.CSSProperties}>
          <Sprite sprite={DESK} scale={3} />
          <span
            className="worker"
            style={
              {
                "--shirt": SHIRTS[floorNo % SHIRTS.length],
                "--hair": floorNo % 2 ? "#2b1d12" : "#e0b060",
                "--skin": floorNo % 3 ? "#f1c9a0" : "#b97a4f",
                "--pants": "#2e3a5c",
              } as React.CSSProperties
            }
          >
            <Sprite sprite={WORKER} scale={3} />
          </span>
          {!doneToday && <span className="zz">z Z</span>}
        </span>
        {variant === 1 && <Sprite sprite={SHELF} scale={3} />}
        {variant === 2 && <Sprite sprite={COOLER} scale={3} />}
        {variant === 3 && <Sprite sprite={PLANT} scale={3} />}
      </div>

      <div className={`board ${doneToday ? "on" : ""}`} title={`Best streak: ${best}`}>
        <small>STREAK</small>
        <strong>{streak}</strong>
      </div>

      {mode === "menu" && (
        <div className="floor-tools">
          <button
            onClick={() => {
              setDraft(habit.name);
              setMode("rename");
            }}
          >
            RENAME
          </button>
          <button className="danger" onClick={() => setMode("confirm")}>
            DEMOLISH
          </button>
          <button onClick={() => setMode("idle")} aria-label="Close menu">
            ×
          </button>
        </div>
      )}
      {mode === "confirm" && (
        <div className="floor-tools">
          <span className="warn">DEMOLISH?</span>
          <button className="danger" onClick={onDemolish}>
            YES
          </button>
          <button onClick={() => setMode("idle")}>NO</button>
        </div>
      )}
      {state === "fresh" && <i className="hazard" aria-hidden />}
    </section>
  );
}
