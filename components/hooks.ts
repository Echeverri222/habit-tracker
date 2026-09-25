"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "@/lib/dates";

// "today" follows the viewer's clock and rolls over at local midnight.
function subscribeClock(cb: () => void) {
  const t = setInterval(cb, 30_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    clearInterval(t);
    document.removeEventListener("visibilitychange", cb);
  };
}

export function useToday(serverToday: string) {
  return useSyncExternalStore(subscribeClock, () => todayKey(), () => serverToday);
}

// Sound preference lives in localStorage.
const sfxListeners = new Set<() => void>();

function readSfx() {
  try {
    return localStorage.getItem("ht_sfx") !== "off";
  } catch {
    return true;
  }
}

export function writeSfx(on: boolean) {
  try {
    localStorage.setItem("ht_sfx", on ? "on" : "off");
  } catch {}
  sfxListeners.forEach((l) => l());
}

export function useSfxOn() {
  return useSyncExternalStore(
    (cb) => (sfxListeners.add(cb), () => sfxListeners.delete(cb)),
    readSfx,
    () => true,
  );
}
