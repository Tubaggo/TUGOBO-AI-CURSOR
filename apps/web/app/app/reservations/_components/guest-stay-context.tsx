import { Crown, MapPin, Plane, UserRound } from "lucide-react";
import type { GuestStayProfile, Reservation } from "@/app/app/_types";
import { formatMoney, pipelineStageLabel, sourceLabel } from "./reservation-formatters";

type GuestStayContextProps = {
  guest: GuestStayProfile;
  reservation: Reservation;
};

export function GuestStayContext({ guest, reservation: r }: GuestStayContextProps) {
  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/45 p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Guest & stay</h2>
          <p className="mt-1 text-[11px] text-white/38">Mission-critical context for desk and AI</p>
        </div>
        {guest.vipSignal ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100/95">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            VIP signal
          </span>
        ) : null}
      </header>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white ring-1 ring-white/10">
          <UserRound className="h-5 w-5 opacity-90" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{guest.displayName}</p>
          <p className="truncate text-[11px] text-white/40">{guest.emailMasked}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-[12px]">
        <div className="flex justify-between gap-2">
          <dt className="text-white/40">Nationality</dt>
          <dd className="font-medium text-white/75">{guest.nationality}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-white/40">Loyalty</dt>
          <dd className="text-white/70">
            {guest.returningGuest ? `${guest.totalStays} prior stays` : "First stay"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-white/40">Source</dt>
          <dd className="text-white/70">{sourceLabel(r.source)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-white/40">Pipeline</dt>
          <dd className="text-white/70">{pipelineStageLabel(r.status)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="inline-flex items-center gap-1 text-white/40">
            <Plane className="h-3.5 w-3.5" aria-hidden />
            Stay
          </dt>
          <dd className="text-right text-white/75">
            {r.checkIn} → {r.checkOut}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="inline-flex items-center gap-1 text-white/40">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Room
          </dt>
          <dd className="max-w-[60%] text-right text-white/70">{r.roomType}</dd>
        </div>
        <div className="flex justify-between gap-2 border-t border-white/[0.05] pt-2">
          <dt className="text-white/40">Booking value</dt>
          <dd className="text-base font-semibold tabular-nums text-emerald-200/95">
            {formatMoney(r.totalValue, r.currency)}
          </dd>
        </div>
      </dl>
      {guest.tags.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {guest.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/55"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
