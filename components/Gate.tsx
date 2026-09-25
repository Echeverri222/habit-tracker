"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export function Gate({ unconfigured }: { unconfigured: boolean }) {
  const [state, action, pending] = useActionState(login, { error: false });
  return (
    <main className="gate">
      <form action={action} className={`dialog gate-box ${state.error ? "shake" : ""}`}>
        <h2>HABIT TOWER</h2>
        <p className="gate-sub">SECURITY DESK · AFTER HOURS</p>
        {unconfigured ? (
          <p className="err">SET APP_PASSCODE TO OPEN THE TOWER</p>
        ) : (
          <>
            <label htmlFor="passcode">ENTER PASSCODE</label>
            <input id="passcode" name="passcode" type="password" autoFocus autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            {state.error && <p className="err">ACCESS DENIED</p>}
            <div className="dialog-actions">
              <button type="submit" className="px-btn go" disabled={pending}>
                {pending ? "CHECKING..." : "ENTER ▶"}
              </button>
            </div>
          </>
        )}
      </form>
    </main>
  );
}
