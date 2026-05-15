import Link from "next/link";
import { Calendar, MessageSquare } from "lucide-react";
import type { LinkedConversation, LinkedReservation } from "@/lib/types/guests";
import { formatMoney } from "./guest-formatters";

type GuestLinkedSectionProps = {
  reservations: LinkedReservation[];
  conversations: LinkedConversation[];
};

export function GuestLinkedSection({ reservations, conversations }: GuestLinkedSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
        <header className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/45" aria-hidden />
          <h3 className="text-sm font-semibold text-white">Reservations</h3>
        </header>
        {reservations.length === 0 ? (
          <p className="text-xs text-white/35">No linked reservations in scope.</p>
        ) : (
          <ul className="space-y-2">
            {reservations.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/app/reservations/${r.id}`}
                  className="block rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 transition-colors hover:border-blue-500/25 hover:bg-blue-500/[0.06]"
                >
                  <p className="text-[12px] font-semibold text-white/85">{r.code}</p>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {r.checkIn} → {r.checkOut} · {r.statusLabel}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-200/80">
                    {formatMoney(r.totalValue, r.currency)} · {r.sourceLabel}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
      <article className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
        <header className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-white/45" aria-hidden />
          <h3 className="text-sm font-semibold text-white">Conversations</h3>
        </header>
        {conversations.length === 0 ? (
          <p className="text-xs text-white/35">No active conversation threads.</p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/app/conversations/${c.id}`}
                  className="block rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 transition-colors hover:border-violet-500/25 hover:bg-violet-500/[0.06]"
                >
                  <p className="text-[12px] font-semibold capitalize text-white/85">{c.channel}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-white/45">{c.preview}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-white/30">{c.status}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
