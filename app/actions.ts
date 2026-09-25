"use server";

import { redirect } from "next/navigation";
import { assertAuthed, clearSession, tryLogin } from "@/lib/auth";
import { DAY_RE } from "@/lib/dates";
import * as store from "@/lib/store";
import { HABIT_COLORS, type Habit, type Log } from "@/lib/types";

const ID_RE = /^[0-9a-f-]{36}$/i;

function cleanName(raw: unknown): string {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (!name) throw new Error("Name your floor first");
  return name;
}

function cleanId(raw: unknown): string {
  const id = String(raw ?? "");
  if (!ID_RE.test(id)) throw new Error("Bad id");
  return id;
}

export async function addHabit(name: string, color: string): Promise<Habit> {
  await assertAuthed();
  const c = /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : HABIT_COLORS[0];
  return store.createHabit(cleanName(name), c);
}

export async function renameHabit(id: string, name: string): Promise<void> {
  await assertAuthed();
  await store.updateHabitName(cleanId(id), cleanName(name));
}

export async function removeHabit(id: string): Promise<void> {
  await assertAuthed();
  await store.deleteHabit(cleanId(id));
}

export async function setDone(habitId: string, day: string, done: boolean): Promise<void> {
  await assertAuthed();
  if (!DAY_RE.test(day)) throw new Error("Bad day");
  await store.setLog(cleanId(habitId), day, Boolean(done));
}

export async function fetchLogs(since: string, until: string): Promise<Log[]> {
  await assertAuthed();
  if (!DAY_RE.test(since) || !DAY_RE.test(until)) throw new Error("Bad range");
  return store.getLogs(since, until);
}

export async function login(_prev: { error: boolean }, form: FormData) {
  const ok = await tryLogin(String(form.get("passcode") ?? "").trim());
  if (!ok) return { error: true };
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
