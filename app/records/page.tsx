import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Records } from "@/components/Records";
import { authStatus } from "@/lib/auth";
import { addDays, todayKey } from "@/lib/dates";
import { getHabits, getLogs } from "@/lib/store";

export const metadata: Metadata = { title: "Records · Habit Tower" };

export default async function RecordsPage() {
  await connection();
  const status = await authStatus();
  if (status === "locked" || status === "unconfigured") redirect("/");

  const today = todayKey();
  const since = addDays(today, -400);
  const [habits, logs] = await Promise.all([getHabits(), getLogs(since)]);
  return <Records habits={habits} initialLogs={logs} serverToday={today} loadedSince={since} />;
}
