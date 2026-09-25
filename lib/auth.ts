import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

// Single-user passcode gate. The cookie holds a hash of the passcode, so
// changing APP_PASSCODE logs every device out.

const COOKIE = "ht_session";

function token(pass: string) {
  return createHash("sha256").update(`habit-tower:${pass}`).digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export type AuthStatus = "open" | "authed" | "locked" | "unconfigured";

export async function authStatus(): Promise<AuthStatus> {
  const pass = process.env.APP_PASSCODE;
  if (!pass) return process.env.NODE_ENV === "production" ? "unconfigured" : "open";
  const c = (await cookies()).get(COOKIE)?.value;
  return c && same(c, token(pass)) ? "authed" : "locked";
}

export async function assertAuthed() {
  const s = await authStatus();
  if (s !== "authed" && s !== "open") throw new Error("LOCKED");
}

export async function tryLogin(attempt: string): Promise<boolean> {
  const pass = process.env.APP_PASSCODE;
  if (!pass || !same(token(attempt), token(pass))) return false;
  (await cookies()).set(COOKIE, token(pass), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return true;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
