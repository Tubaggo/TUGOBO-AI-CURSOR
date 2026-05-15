import Link from "next/link";
import { Bell, ChevronRight, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationPriority, ConversationSummary } from "@/lib/types/conversations";
import { ChannelBadge } from "./channel-badge";

const PRIORITY_META: Record<
  ConversationPriority,
  { label: string; className: string }
> = {
  low: { label: "P4", className: "border-white/[0.08] bg-white/[0.02] text-white/35" },
  normal: { label: "P3", className: "border-white/[0.1] bg-white/[0.02] text-white/45" },
  high: { label: "P2", className: "border-amber-500/30 bg-amber-500/[0.06] text-amber-200/85" },
  urgent: { label: "P1", className: "border-rose-500/40 bg-rose-500/[0.08] text-rose-200/95" },
};

const STATUS_COPY: Record<ConversationSummary["status"], string> = {
  ai_handling: "AI handling",
  human_takeover: "Human takeover",
  awaiting_payment: "Awaiting payment",
  reservation_pending: "Reservation pending",
  escalated: "Escalated",
};

type ConversationListItemProps = {
  row: ConversationSummary;
  active: boolean;
  onNavigate?: () => void;
};

export function ConversationListItem({ row, active, onNavigate }: ConversationListItemProps) {
  const time = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(row.lastMessageAt));

  return (
    <li>
      <Link
        href={`/app/conversations/${row.id}`}
        onClick={onNavigate}
        className={cn(
          "group flex gap-2.5 rounded-xl border px-2.5 py-2.5 transition md:px-3",
          active
            ? "border-blue-500/35 bg-blue-500/[0.07] shadow-[0_0_0_1px_rgba(59,130,246,0.12)]"
            : "border-transparent bg-transparent hover:border-white/[0.07] hover:bg-white/[0.03]"
        )}
      >
        <div className="relative shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold text-white/80">
            <UserRound className="h-4 w-4 text-white/35" aria-hidden />
          </span>
          {row.unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full border border-zinc-950 bg-blue-500 px-1 text-[10px] font-bold text-white">
              {row.unreadCount > 9 ? "9+" : row.unreadCount}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-white/90">{row.guestName}</p>
            <span className="shrink-0 text-[10px] tabular-nums text-white/30">{time}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
                PRIORITY_META[row.priority].className
              )}
              title="Operational priority"
            >
              {PRIORITY_META[row.priority].label}
            </span>
            <ChannelBadge channel={row.channel} compact />
            {row.reservationId ? (
              <span className="rounded border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-200/85">
                Res linked
              </span>
            ) : null}
            {row.escalationFlag ? (
              <span className="inline-flex items-center gap-0.5 rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-200/90">
                <Bell className="h-2.5 w-2.5" aria-hidden />
                AI flag
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/42">{row.lastMessagePreview}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-white/[0.06] bg-black/30 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/40">
              {STATUS_COPY[row.status]}
            </span>
            {row.assignedTo ? (
              <span className="text-[10px] text-white/35">→ {row.assignedTo}</span>
            ) : (
              <span className="text-[10px] text-white/28">Unassigned</span>
            )}
            <span
              className={cn(
                "ml-auto hidden text-white/25 transition group-hover:text-white/45 md:inline",
                active && "text-blue-300/80"
              )}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
