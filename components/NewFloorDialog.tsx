"use client";

import { useState } from "react";
import { HABIT_COLORS } from "@/lib/types";

export function NewFloorDialog({
  onBuild,
  onClose,
}: {
  onBuild: (name: string, color: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(HABIT_COLORS[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState("#ff5ad1");
  const isCustom = !(HABIT_COLORS as readonly string[]).includes(color);

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="dialog"
        role="dialog"
        aria-label="Build a new floor"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return setError("NAME YOUR FLOOR FIRST");
          setBusy(true);
          try {
            await onBuild(name, color);
          } catch {
            setError("PERMIT DENIED · TRY AGAIN");
            setBusy(false);
          }
        }}
      >
        <h2>BUILDING PERMIT</h2>
        <label htmlFor="habit-name">WHAT HABIT GETS A FLOOR?</label>
        <input
          id="habit-name"
          autoFocus
          maxLength={40}
          placeholder="READ 20 PAGES"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
        <span className="field-label">WINDOW LIGHT</span>
        <div className="swatches" role="radiogroup" aria-label="Window color">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === color}
              aria-label={c}
              className={c === color ? "swatch on" : "swatch"}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <label
            className={isCustom ? "swatch custom on" : "swatch custom"}
            style={isCustom ? ({ "--pick": color } as React.CSSProperties) : undefined}
            title="Pick any color"
          >
            <input
              type="color"
              value={custom}
              aria-label="Custom color"
              onChange={(e) => {
                setCustom(e.target.value);
                setColor(e.target.value);
              }}
              onClick={() => setColor(custom)}
            />
          </label>
        </div>
        {error && <p className="err">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="px-btn ghost" onClick={onClose}>
            CANCEL
          </button>
          <button type="submit" className="px-btn go" disabled={busy}>
            {busy ? "BUILDING..." : "BUILD ▲"}
          </button>
        </div>
      </form>
    </div>
  );
}
