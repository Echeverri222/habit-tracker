// Days are plain "YYYY-MM-DD" keys in the viewer's local calendar.
// Arithmetic runs in UTC so DST shifts never skip or repeat a day.

const pad = (n: number) => String(n).padStart(2, "0");

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function lastNDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

export function weekdayLetter(key: string): string {
  return "SMTWTFS"[new Date(`${key}T00:00:00Z`).getUTCDay()];
}

export function prettyDay(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Consecutive days ending today — or yesterday, so an unchecked today doesn't break it yet. */
export function currentStreak(days: Set<string>, today: string): number {
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function bestStreak(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev = "";
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---- months ("YYYY-MM") ----------------------------------------------------

export const monthOf = (day: string) => day.slice(0, 7);

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export function daysInMonth(month: string): string[] {
  const out: string[] = [];
  for (let d = `${month}-01`; monthOf(d) === month; d = addDays(d, 1)) out.push(d);
  return out;
}

/** 0 = Sunday */
export const weekday = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay();

export function monthLabel(month: string, style: "long" | "short" = "long"): string {
  return new Date(`${month}-01T00:00:00Z`)
    .toLocaleDateString("en-US", { month: style, year: style === "long" ? "numeric" : undefined, timeZone: "UTC" })
    .toUpperCase();
}
