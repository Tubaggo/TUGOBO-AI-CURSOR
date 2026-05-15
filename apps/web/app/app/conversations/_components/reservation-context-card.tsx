import { CalendarRange, CreditCard, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReservationContext } from "@/lib/types/conversations";
import { ChannelBadge } from "./channel-badge";

type ReservationContextCardProps = {
  reservation: ReservationContext;
};

function paymentLabel(status: ReservationContext["paymentStatus"]): { text: string; tone: string } {
  switch (status) {
    case "paid":
      return { text: "Paid", tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/90" };
    case "deposit":
      return { text: "Deposit", tone: "border-amber-500/25 bg-amber-500/10 text-amber-200/90" };
    case "overdue":
      return { text: "Overdue", tone: "border-rose-500/30 bg-rose-500/10 text-rose-200/90" };
    default:
      return { text: "Unpaid", tone: "border-white/[0.08] bg-white/[0.04] text-white/55" };
  }
}

export function ReservationContextCard({ reservation }: ReservationContextCardProps) {
  const pay = paymentLabel(reservation.paymentStatus);
  const nights = (() => {
    const a = new Date(reservation.checkIn).getTime();
    const b = new Date(reservation.checkOut).getTime();
    const n = Math.round((b - a) / (86400 * 1000));
    return Number.isFinite(n) && n > 0 ? `${n} nights` : "—";
  })();

  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-3.5 shadow-inner shadow-black/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70">
            <CalendarRange className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              Reservation context
            </p>
            <p className="text-xs font-medium text-white/78">{nights}</p>
          </div>
        </div>
        <ChannelBadge channel={reservation.sourceChannel} compact />
      </div>

      <dl className="space-y-2 text-[12px]">
        <div className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
          <dt className="text-white/38">Stay</dt>
          <dd className="text-right font-medium tabular-nums text-white/78">
            {reservation.checkIn} → {reservation.checkOut}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
          <dt className="text-white/38">Room</dt>
          <dd className="max-w-[58%] text-right text-white/75">{reservation.roomType}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-2">
          <dt className="flex items-center gap-1.5 text-white/38">
            <CreditCard className="h-3 w-3 opacity-60" aria-hidden />
            Payment
          </dt>
          <dd>
            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase", pay.tone)}>
              {pay.text}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-white/38">
            <Link2 className="h-3 w-3 opacity-60" aria-hidden />
            Value
          </dt>
          <dd className="font-semibold tabular-nums text-white/85">
            {reservation.bookingValueEur > 0
              ? new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(reservation.bookingValueEur)
              : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
