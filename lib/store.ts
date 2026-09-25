import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Habit, Log } from "./types";

// Server-only data access. Uses Supabase when configured, otherwise a JSON
// file in /.data so the app runs locally with zero setup.

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
export const storageKind: "supabase" | "local" = url && key ? "supabase" : "local";

let client: SupabaseClient | undefined;
function sb() {
  client ??= createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

function check<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// ---- local JSON fallback ---------------------------------------------------

type LocalDb = { habits: Habit[]; logs: Log[] };
const FILE = path.join(process.cwd(), ".data", "db.json");
let queue: Promise<unknown> = Promise.resolve();

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    return { habits: [], logs: [] };
  }
}

function mutateLocal<T>(fn: (db: LocalDb) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readLocal();
    const out = fn(db);
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(db, null, 2));
    return out;
  });
  queue = run.catch(() => {});
  return run;
}

// ---- public API -------------------------------------------------------------

export async function getHabits(): Promise<Habit[]> {
  if (storageKind === "local") {
    return (await readLocal()).habits.sort((a, b) => a.position - b.position);
  }
  return check(
    await sb().from("habits").select("id,name,color,position,created_at").order("position"),
  );
}

export async function getLogs(sinceDay: string, untilDay = "9999-12-31"): Promise<Log[]> {
  if (storageKind === "local") {
    return (await readLocal()).logs.filter((l) => l.day >= sinceDay && l.day <= untilDay);
  }
  const out: Log[] = [];
  const PAGE = 1000; // PostgREST caps rows per request
  for (let from = 0; ; from += PAGE) {
    const rows = check(
      await sb()
        .from("habit_logs")
        .select("habit_id,day")
        .gte("day", sinceDay)
        .lte("day", untilDay)
        .order("day")
        .range(from, from + PAGE - 1),
    );
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}

export async function createHabit(name: string, color: string): Promise<Habit> {
  if (storageKind === "local") {
    return mutateLocal((db) => {
      const habit: Habit = {
        id: randomUUID(),
        name,
        color,
        position: Math.max(0, ...db.habits.map((h) => h.position)) + 1,
        created_at: new Date().toISOString(),
      };
      db.habits.push(habit);
      return habit;
    });
  }
  const top = check(
    await sb().from("habits").select("position").order("position", { ascending: false }).limit(1),
  );
  return check(
    await sb()
      .from("habits")
      .insert({ name, color, position: (top[0]?.position ?? 0) + 1 })
      .select("id,name,color,position,created_at")
      .single(),
  );
}

export async function deleteHabit(id: string): Promise<void> {
  if (storageKind === "local") {
    await mutateLocal((db) => {
      db.habits = db.habits.filter((h) => h.id !== id);
      db.logs = db.logs.filter((l) => l.habit_id !== id);
    });
    return;
  }
  check(await sb().from("habits").delete().eq("id", id));
}

export async function updateHabitName(id: string, name: string): Promise<void> {
  if (storageKind === "local") {
    await mutateLocal((db) => {
      const h = db.habits.find((x) => x.id === id);
      if (h) h.name = name;
    });
    return;
  }
  check(await sb().from("habits").update({ name }).eq("id", id));
}

export async function setLog(habitId: string, day: string, done: boolean): Promise<void> {
  if (storageKind === "local") {
    await mutateLocal((db) => {
      db.logs = db.logs.filter((l) => !(l.habit_id === habitId && l.day === day));
      if (done) db.logs.push({ habit_id: habitId, day });
    });
    return;
  }
  if (done) {
    check(
      await sb()
        .from("habit_logs")
        .upsert({ habit_id: habitId, day }, { onConflict: "habit_id,day", ignoreDuplicates: true }),
    );
  } else {
    check(await sb().from("habit_logs").delete().eq("habit_id", habitId).eq("day", day));
  }
}
