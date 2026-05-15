import Link from "next/link";
import { ExternalLink, Timer } from "lucide-react";
import type { PaymentState } from "@/app/app/_types";
import { formatMoney, paymentStatusLabel } from "./reservation-formatters";

type PaymentStatusCardProps = {
  payment: PaymentState;
  currency: string;
};

export function PaymentStatusCard({ payment, currency }: PaymentStatusCardProps) {
  return (
    <section className="rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.07] to-zinc-950/60 p-4 ring-1 ring-amber-500/10">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-amber-100/95">Payment orchestration</h2>
        <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100/90">
          {paymentStatusLabel(payment.status)}
        </span>
      </header>
      <dl className="mt-4 space-y-2 text-[12px]">
        <div className="flex justify-between gap-2">
          <dt className="text-white/40">Captured</dt>
          <dd className="font-semibold tabular-nums text-emerald-200/95">
            {formatMoney(payment.amountPaid, currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-white/40">Remaining</dt>
          <dd className="font-semibold tabular-nums text-amber-100/90">
            {formatMoney(payment.remainingBalance, currency)}
          </dd>
        </div>
        {payment.expiresAt ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-black/30 px-2 py-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-white/45">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              Link window
            </span>
            <time className="text-[11px] tabular-nums text-white/65" dateTime={payment.expiresAt}>
              {new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(
                new Date(payment.expiresAt)
              )}
            </time>
          </div>
        ) : null}
      </dl>
      {payment.paymentLink ? (
        <Link
          href={payment.paymentLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] py-2.5 text-[12px] font-semibold text-white/80 transition-colors hover:border-amber-500/35 hover:bg-amber-500/10 hover:text-amber-50"
        >
          Open mock payment link
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </Link>
      ) : (
        <p className="mt-4 text-center text-[11px] text-white/35">No active payment link for this state.</p>
      )}
    </section>
  );
}
