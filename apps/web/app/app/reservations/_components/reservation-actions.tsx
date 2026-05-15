"use client";

import { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Link2,
  Percent,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/app/app/_types";
import { sendPaymentLink } from "@/lib/data/reservations";

type ReservationActionsProps = {
  reservation: Reservation;
  onReservationChange: (next: Reservation) => void;
};

type ActionKind =
  | "resend_payment"
  | "waive_tax"
  | "approve_transfer"
  | "request_deposit"
  | "assign"
  | "confirm";

export function ReservationActions({
  reservation,
  onReservationChange,
}: ReservationActionsProps) {
  const [busy, setBusy] = useState<ActionKind | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function run(kind: ActionKind, label: string, fn: () => void) {
    setBusy(kind);
    window.setTimeout(() => {
      fn();
      setNotice(`${label} — queued (mock).`);
      setBusy(null);
      window.setTimeout(() => setNotice(null), 2800);
    }, 420);
  }

  const btnClass =
    "flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left text-[12px] font-semibold text-white/80 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-60";

  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-950/50 p-4">
      <h2 className="text-sm font-semibold text-white">Operational actions</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-white/38">
        Structured for future Inngest / tools wiring — today they simulate hotel desk workflows.
      </p>
      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() =>
            run("resend_payment", "Resend payment link", () => {
              onReservationChange(sendPaymentLink(reservation));
            })
          }
        >
          <Link2 className="h-4 w-4 text-sky-300/90" aria-hidden />
          Resend payment link
        </button>
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => run("waive_tax", "Waive city tax gesture", () => {})}
        >
          <Percent className="h-4 w-4 text-emerald-300/85" aria-hidden />
          Waive city tax (gesture)
        </button>
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => run("approve_transfer", "Approve manual transfer", () => {})}
        >
          <ShieldCheck className="h-4 w-4 text-violet-300/90" aria-hidden />
          Approve manual transfer
        </button>
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => run("request_deposit", "Request deposit", () => {})}
        >
          <Banknote className="h-4 w-4 text-amber-300/90" aria-hidden />
          Request deposit
        </button>
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => run("assign", "Assign staff", () => {})}
        >
          <UserPlus className="h-4 w-4 text-blue-300/90" aria-hidden />
          Assign / reassign staff
        </button>
        <button
          type="button"
          disabled={busy !== null}
          className={btnClass}
          onClick={() => run("confirm", "Confirm reservation", () => {})}
        >
          <CheckCircle2 className="h-4 w-4 text-teal-300/90" aria-hidden />
          Confirm reservation
        </button>
      </div>
      {notice ? (
        <p
          role="status"
          className={cn(
            "mt-3 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1.5 text-[11px] text-emerald-100/90"
          )}
        >
          {notice}
        </p>
      ) : null}
    </section>
  );
}
