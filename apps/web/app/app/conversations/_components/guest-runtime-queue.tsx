"use client";

import type { ConversationThread, Guest, RecoveryFlow } from "@/lib/runtime/entities";
import { deriveGuestRuntimeSignals } from "@/lib/runtime/conversation-runtime";
import { cn } from "@/lib/utils";
import { Activity, ClipboardList, TrendingUp, Wallet } from "lucide-react";

const STATUS_TONE: Record<string, string> = {
  "PAYMENT FRICTION": "border-amber-500/30 bg-amber-500/10 text-amber-200",
  "RECOVERY ACTIVE": "border-violet-500/30 bg-violet-500/10 text-violet-200",
  "HIGH VALUE": "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  "DIRECT BOOKING": "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  "ESCALATION RISK": "border-rose-500/30 bg-rose-500/10 text-rose-200",
  "VIP GUEST": "border-rose-500/25 bg-rose-500/8 text-rose-200",
  "NEW INQUIRY": "border-blue-500/25 bg-blue-500/10 text-blue-200",
  "REVIEW RISK": "border-amber-500/25 bg-amber-500/8 text-amber-200",
  MONITORING: "border-white/10 bg-white/[0.03] text-white/45",
  "STAFF ASSISTING": "border-rose-500/25 bg-rose-500/10 text-rose-200",
};

type GuestRuntimeQueueProps = {
  conversations: ConversationThread[];
  guests: Guest[];
  journeys: RecoveryFlow[];
  selectedId?: string;
  onSelect: (id: string) => void;
  pulseActive?: boolean;
};

export function GuestRuntimeQueue({
  conversations,
  guests,
  journeys,
  selectedId,
  onSelect,
  pulseActive,
}: GuestRuntimeQueueProps) {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-white/[0.04] bg-zinc-950/60">
      <div className="shrink-0 border-b border-white/[0.04] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400/55">
          Active guests
        </p>
        <p className="mt-0.5 text-[11px] text-white/32">{conversations.length} conversations</p>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto conv-scroll",
          pulseActive && "runtime-queue-pulse"
        )}
      >
        {conversations.map((c) => {
          const guest = guests.find((g) => g.id === c.guestId);
          const journey = journeys.find((j) => j.conversationId === c.id);
          const signals = deriveGuestRuntimeSignals(c, guest, journey);
          const selected = c.id === selectedId;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "relative w-full border-b border-white/[0.03] px-4 py-3.5 text-left transition-all",
                selected
                  ? "bg-cyan-500/[0.05] shadow-[inset_2px_0_0_0_rgba(34,211,238,0.7)]"
                  : "hover:bg-white/[0.02]"
              )}
            >
              {selected ? (
                <span
                  className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-runtime-node-sync"
                  aria-hidden
                />
              ) : null}
              <div className="flex gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    c.avatarColor,
                    c.flags.recoveryActive && "ring-1 ring-violet-500/40"
                  )}
                >
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-white/92">{c.guestName}</span>
                    <span className="shrink-0 text-[10px] tabular-nums text-white/28">{c.time}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-white/38">{c.lastMessage}</p>
                  <SignalSection icon={Activity} label="Status" items={signals.operationalStatuses} tone="status" />
                  <SignalSection icon={TrendingUp} label="Guest" items={signals.behavioral} />
                  <SignalSection icon={Wallet} label="Revenue" items={signals.financial} tone="financial" />
                  <SignalSection icon={ClipboardList} label="Now" items={signals.situation} tone="situation" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function SignalSection({
  icon: Icon,
  label,
  items,
  tone = "default",
}: {
  icon: typeof Activity;
  label: string;
  items: string[];
  tone?: "status" | "financial" | "situation" | "default";
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-1.5">
      <div className="mb-0.5 flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-white/22" />
        <span className="text-[8px] font-semibold uppercase tracking-wider text-white/22">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[8px] font-medium leading-tight",
              tone === "status"
                ? STATUS_TONE[item] ?? "border-white/10 bg-white/[0.03] text-white/50"
                : tone === "financial"
                  ? "border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-300/80"
                  : tone === "situation"
                    ? "border-white/[0.08] bg-white/[0.03] text-white/48"
                    : "border-white/[0.06] bg-white/[0.02] text-white/42"
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
