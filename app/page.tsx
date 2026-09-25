import { connection } from "next/server";
import { Gate } from "@/components/Gate";
import { Tower } from "@/components/Tower";
import { authStatus } from "@/lib/auth";
import { addDays, todayKey } from "@/lib/dates";
import { getHabits, getLogs, storageKind } from "@/lib/store";

export default async function Page() {
  await connection();
  const status = await authStatus();
  if (status === "locked" || status === "unconfigured") {
    return <Gate unconfigured={status === "unconfigured"} />;
  }

  const today = todayKey();
  const [habits, logs] = await Promise.all([getHabits(), getLogs(addDays(today, -400))]);
  return (
    <Tower
      initialHabits={habits}
      initialLogs={logs}
      serverToday={today}
      canLock={status === "authed"}
      storage={storageKind}
    />
  );
}
