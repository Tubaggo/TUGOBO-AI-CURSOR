"use client";

import Link from "next/link";
import { ArrowUpRight, Bot, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/app/app/_types";
import { pipelineStageLabel, formatMoney, paymentStatusLabel, sourceLabel } from "./reservation-formatters";

type ReservationTableProps = {
  reservations: Reservation[];
};

function urgencyDot(u: Reservation["urgency"]): string {
  switch (u) {
    case "critical":
      return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.55)]";
    case "high":
      return "bg-amber-400";
    case "normal":
      return "bg-sky-400/90";
    case "low":
      return "bg-zinc-500";
    case "none":
    default:
      return "bg-zinc-600";
  }
}

export function ReservationTable({ reservations }: ReservationTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07] bg-zinc-900/35 shadow-inner shadow-black/20">
      <table className="w-full min-w-[920px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-white/[0.07] bg-zinc-950/60 text-[10px] font-semibold uppercase tracking-wider text-white/38">
            <th className="px-3 py-2.5 font-medium">Code</th>
            <th className="px-3 py-2.5 font-medium">Guest</th>
            <th className="px-3 py-2.5 font-medium">Room</th>
            <th className="px-3 py-2.5 font-medium">Stay</th>
            <th className="px-3 py-2.5 font-medium">Value</th>
            <th className="px-3 py-2.5 font-medium">Pipeline</th>
            <th className="px-3 py-2.5 font-medium">Payment</th>
            <th className="px-3 py-2.5 font-medium">Source</th>
            <th className="px-3 py-2.5 font-medium">AI</th>
            <th className="px-3 py-2.5 font-medium">Staff</th>
            <th className="px-3 py-2.5 font-medium"> </th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id}
              className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
            >
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", urgencyDot(r.urgency))} />
                  {r.code}
                </span>
              </td>
              <td className="px-3 py-2 font-medium text-white/88">{r.guestName}</td>
              <td className="max-w-[200px] truncate px-3 py-2 text-white/50">{r.roomType}</td>
              <td className="whitespace-nowrap px-3 py-2 tabular-nums text-white/48">
                {r.checkIn} → {r.checkOut}
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold tabular-nums text-emerald-200/90">
                {formatMoney(r.totalValue, r.currency)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-white/55">{pipelineStageLabel(r.status)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-amber-100/80">{paymentStatusLabel(r.paymentStatus)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-white/45">{sourceLabel(r.source)}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <span className="inline-flex items-center gap-1 rounded border border-blue-500/20 bg-blue-500/8 px-1.5 py-0.5 text-[10px] text-blue-200/90">
                  <Bot className="h-3 w-3" aria-hidden />
                  {r.aiState.replace(/_/g, " ")}
                </span>
              </td>
              <td className="max-w-[120px] truncate px-3 py-2 text-white/45">{r.assignedTo ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  {r.conversationId ? (
                    <Link
                      href={`/app/conversations/${r.conversationId}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-white/45 hover:border-blue-500/30 hover:text-blue-200/90"
                      title="Open conversation"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                  <Link
                    href={`/app/reservations/${r.id}`}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] font-semibold text-white/55 hover:border-white/[0.14] hover:text-white/85"
                  >
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
