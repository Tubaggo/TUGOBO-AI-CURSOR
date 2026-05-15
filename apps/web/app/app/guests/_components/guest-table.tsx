"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guest } from "@/lib/types/guests";
import { GuestAvatar } from "./guest-avatar";
import {
  directOtaRatioLabel,
  formatMoney,
  loyaltyTierLabel,
  reservationStateLabel,
} from "./guest-formatters";
import { sentimentLabel } from "./guest-formatters";

type GuestTableProps = {
  guests: Guest[];
};

function sentimentClass(s: Guest["sentiment"]): string {
  switch (s) {
    case "positive":
      return "text-emerald-300/90 bg-emerald-500/10 border-emerald-500/25";
    case "negative":
      return "text-rose-300/90 bg-rose-500/10 border-rose-500/25";
    case "mixed":
      return "text-amber-300/90 bg-amber-500/10 border-amber-500/25";
    default:
      return "text-white/55 bg-white/[0.04] border-white/[0.08]";
  }
}

function stateClass(state: Guest["currentReservationState"]): string {
  if (state === "at_risk") return "text-rose-200/90 bg-rose-500/10 border-rose-500/25";
  if (state === "in_house") return "text-emerald-200/90 bg-emerald-500/10 border-emerald-500/25";
  if (state === "confirmed_upcoming") return "text-blue-200/90 bg-blue-500/10 border-blue-500/25";
  return "text-white/50 bg-white/[0.03] border-white/[0.07]";
}

export function GuestTable({ guests }: GuestTableProps) {
  if (guests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.1] bg-zinc-900/40 px-6 py-16 text-center">
        <p className="text-sm font-medium text-white/55">No guests match this intelligence segment</p>
        <p className="mt-1 text-xs text-white/35">Try another filter or clear segment selection</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900/35 ring-1 ring-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-950/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38">
              <th className="px-4 py-3.5">Guest</th>
              <th className="px-3 py-3.5">Loyalty</th>
              <th className="px-3 py-3.5">Stays</th>
              <th className="px-3 py-3.5">LTV</th>
              <th className="px-3 py-3.5">Stay state</th>
              <th className="px-3 py-3.5">AI score</th>
              <th className="px-3 py-3.5">Sentiment</th>
              <th className="px-3 py-3.5">Channel mix</th>
              <th className="px-4 py-3.5">Signals</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr
                key={g.id}
                className="group border-b border-white/[0.04] transition-colors hover:bg-violet-500/[0.04]"
              >
                <td className="px-4 py-3.5">
                  <Link
                    href={`/app/guests/${g.id}`}
                    className="flex items-center gap-3"
                  >
                    <GuestAvatar name={g.name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white group-hover:text-violet-100">
                        {g.name}
                      </p>
                      <p className="text-[11px] text-white/40">
                        {g.nationality} · {g.preferredLanguage}
                      </p>
                    </div>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/0 transition-colors group-hover:text-violet-300/80" />
                  </Link>
                </td>
                <td className="px-3 py-3.5">
                  <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-100/90">
                    {loyaltyTierLabel(g.loyaltyTier)}
                  </span>
                </td>
                <td className="px-3 py-3.5 tabular-nums text-white/70">{g.totalStays}</td>
                <td className="px-3 py-3.5 tabular-nums font-medium text-emerald-200/90">
                  {formatMoney(g.lifetimeValue)}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={cn(
                      "inline-block max-w-[140px] truncate rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                      stateClass(g.currentReservationState)
                    )}
                    title={g.currentReservationLabel}
                  >
                    {reservationStateLabel(g.currentReservationState)}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300/70" aria-hidden />
                    <span className="tabular-nums font-semibold text-violet-100">{g.aiScore}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                      sentimentClass(g.sentiment)
                    )}
                  >
                    {sentimentLabel(g.sentiment)}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-[11px] text-white/45">
                  {directOtaRatioLabel(g.directBookingRatio)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {g.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/50"
                      >
                        {tag}
                      </span>
                    ))}
                    {g.riskFlags.filter((r) => r !== "none").length > 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-100">
                        <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
                        Risk
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
