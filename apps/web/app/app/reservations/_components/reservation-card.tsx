"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CreditCard,
  GripVertical,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/app/app/_types";
import { formatMoney, paymentStatusLabel, sourceLabel } from "./reservation-formatters";

const DRAG_MIME = "application/x-tugobo-reservation-id";

export function dragReservationMime(): string {
  return DRAG_MIME;
}

type ReservationCardProps = {
  reservation: Reservation;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  compact?: boolean;
};

function urgencyRing(u: Reservation["urgency"]): string {
  switch (u) {
    case "critical":
      return "ring-1 ring-rose-500/55 shadow-[0_0_20px_rgba(244,63,94,0.12)]";
    case "high":
      return "ring-1 ring-amber-500/40";
    case "normal":
      return "ring-1 ring-white/[0.06]";
    case "low":
      return "ring-1 ring-white/[0.05]";
    case "none":
      return "ring-1 ring-white/[0.04]";
  }
}

function aiStateBadge(ai: Reservation["aiState"]): { label: string; className: string } {
  switch (ai) {
    case "ai_qualifying":
      return { label: "AI qualifying", className: "border-violet-500/30 bg-violet-500/10 text-violet-200/95" };
    case "ai_quoting":
      return { label: "AI quote", className: "border-sky-500/30 bg-sky-500/10 text-sky-200/95" };
    case "ai_active":
      return { label: "AI active", className: "border-blue-500/30 bg-blue-500/10 text-blue-200/95" };
    case "human_active":
      return { label: "Human", className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/90" };
    case "paused":
      return { label: "Paused", className: "border-zinc-500/35 bg-zinc-800/80 text-zinc-300/90" };
    case "ai_complete":
      return { label: "AI done", className: "border-teal-500/25 bg-teal-500/10 text-teal-200/90" };
  }
}

export function ReservationCard({ reservation: r, onDragStart, compact }: ReservationCardProps) {
  const ai = aiStateBadge(r.aiState);
  const showUrgent = r.urgency === "critical" || r.urgency === "high";

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_MIME, r.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(e, r.id);
      }}
      className={cn(
        "group relative cursor-grab overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 p-3 shadow-md shadow-black/30 active:cursor-grabbing",
        urgencyRing(r.urgency)
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-white/35" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/38">
                {r.code}
              </p>
              <p className="truncate text-sm font-semibold text-white/92">{r.guestName}</p>
            </div>
            {showUrgent ? (
              <span title="Urgency">
                <AlertTriangle
                  className={cn(
                    "h-4 w-4 shrink-0",
                    r.urgency === "critical" ? "text-rose-400/95" : "text-amber-300/90"
                  )}
                />
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-[11px] leading-snug text-white/45">{r.roomType}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-white/55">
              {r.checkIn.slice(5)} → {r.checkOut.slice(5)}
            </span>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/8 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-200/95">
              {formatMoney(r.totalValue, r.currency)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded border border-white/[0.07] bg-black/25 px-1.5 py-0.5 text-[10px] text-white/50">
              {sourceLabel(r.source)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium",
                ai.className
              )}
            >
              <Bot className="h-3 w-3 opacity-80" aria-hidden />
              {ai.label}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded border border-amber-500/20 bg-amber-500/8 px-1.5 py-0.5 text-[10px] text-amber-100/85">
              <CreditCard className="h-3 w-3" aria-hidden />
              {paymentStatusLabel(r.paymentStatus)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
            <span className="inline-flex min-w-0 items-center gap-1 text-[10px] text-white/40">
              <User className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{r.assignedTo ?? "Unassigned"}</span>
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {r.conversationId ? (
                <Link
                  href={`/app/conversations/${r.conversationId}`}
                  className="inline-flex items-center gap-1 rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-200/95 transition-colors hover:border-blue-400/40 hover:bg-blue-500/15"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-3 w-3" aria-hidden />
                  Thread
                </Link>
              ) : (
                <span className="text-[10px] text-white/28">No thread</span>
              )}
              <Link
                href={`/app/reservations/${r.id}`}
                className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-white/50 transition-colors hover:border-white/[0.14] hover:text-white/85"
                onClick={(e) => e.stopPropagation()}
              >
                Detail
              </Link>
            </div>
          </div>
          {!compact ? (
            <p className="line-clamp-2 border-t border-white/[0.05] pt-2 text-[10px] leading-relaxed text-white/38">
              {r.conversationSummary}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
