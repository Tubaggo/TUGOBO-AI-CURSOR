"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare, UserCheck } from "lucide-react";
import type { EscalationEvent } from "@/lib/types/ai-brain";
import { OPERATIONAL_AGENT_LABEL } from "@/lib/runtime";
import { STAFF_ROSTER } from "@/lib/runtime/staff-roster";
import { useOperationsStore } from "@/store/operations-store";
import { cn } from "@/lib/utils";
import { AIExplanationCard } from "./ai-explanation-card";
import { AIBrainLinkedRefs } from "./ai-brain-linked-refs";
import { StaffWorkloadPanel } from "@/app/app/_components/staff-workload-panel";

const SEVERITY_TONE: Record<EscalationEvent["severity"], string> = {
  low: "border-white/15 text-white/50",
  medium: "border-amber-500/30 text-amber-200",
  high: "border-orange-500/35 text-orange-200",
  critical: "border-rose-500/40 text-rose-200",
};

const REASON_LABEL: Record<EscalationEvent["reason"], string> = {
  policy_ambiguity: "Policy ambiguity",
  vip_complaint_risk: "VIP complaint risk",
  payment_friction: "Payment friction",
  multilingual_misunderstanding: "Multilingual misunderstanding",
  low_confidence_quote: "Low-confidence quote",
  sentiment_warning: "Sentiment warning",
  ota_conflict: "OTA conflict",
  human_takeover: "Human takeover",
};

const MODULE_LABEL: Record<NonNullable<EscalationEvent["sourceModule"]>, string> = {
  conversations: "Conversations",
  reservations: "Reservations",
  guests: "Guests",
  "ai-brain": "AI Brain",
  escalations: "Escalations",
  audit: "Audit",
};

function slaRemaining(
  slaDueAt: string | undefined,
  nowMs: number
): { label: string; breached: boolean } {
  if (!slaDueAt) return { label: "SLA n/a", breached: false };
  const ms = new Date(slaDueAt).getTime() - nowMs;
  if (ms <= 0) {
    const over = Math.abs(ms);
    const mins = Math.floor(over / 60_000);
    return { label: `SLA breached ${mins}m`, breached: true };
  }
  const mins = Math.ceil(ms / 60_000);
  return { label: `${mins}m remaining`, breached: false };
}

type EscalationQueuePanelProps = {
  events: EscalationEvent[];
};

export function EscalationQueuePanel({ events }: EscalationQueuePanelProps) {
  const [now, setNow] = useState(0);
  const assignOwner = useOperationsStore((s) => s.assignEscalationOwner);
  const resolve = useOperationsStore((s) => s.resolveEscalation);
  const humanTakeover = useOperationsStore((s) => s.markEscalationHumanTakeover);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [events]
  );

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-12 text-center text-sm text-white/35">
        No escalations in this view.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <ul className="space-y-4 lg:col-span-8">
        {sorted.map((e) => {
          const sla = slaRemaining(e.slaDueAt, now || Date.now());
          return (
            <li
              key={e.id}
              id={`esc-${e.id}`}
              className={cn(
                "rounded-xl border bg-zinc-900/50 p-4",
                e.resolved ? "border-white/[0.06] opacity-80" : "border-rose-500/20"
              )}
            >
              <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    {REASON_LABEL[e.reason]}
                    {e.sourceModule ? (
                      <span className="ml-2 text-white/30">· {MODULE_LABEL[e.sourceModule]}</span>
                    ) : null}
                    {e.agentRole ? (
                      <span className="ml-2 rounded border border-white/[0.08] px-1.5 py-px text-[9px] font-medium text-white/35">
                        {OPERATIONAL_AGENT_LABEL[e.agentRole]}
                      </span>
                    ) : null}
                  </p>
                  <h3 className="text-sm font-semibold text-white">{e.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                      SEVERITY_TONE[e.severity]
                    )}
                  >
                    {e.severity}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                      e.resolved
                        ? "border-emerald-500/30 text-emerald-200/90"
                        : "border-rose-500/30 text-rose-200/90"
                    )}
                  >
                    {e.resolved ? "Resolved" : "Active"}
                  </span>
                </div>
              </header>
              <p className="mb-2 text-xs text-white/45">{e.guestImpact}</p>
              {e.suggestedAction ? (
                <p className="mb-2 rounded-md border border-white/[0.06] bg-black/30 px-2.5 py-2 text-[11px] text-white/55">
                  <span className="font-semibold text-white/70">Suggested: </span>
                  {e.suggestedAction}
                </p>
              ) : null}
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 tabular-nums",
                    sla.breached
                      ? "border-rose-500/35 bg-rose-500/10 text-rose-200/90"
                      : "border-white/[0.08] text-white/40"
                  )}
                >
                  <Clock className="h-3 w-3" aria-hidden />
                  {sla.label}
                </span>
                <span className="text-white/30">
                  Confidence {Math.round(e.aiConfidenceBefore * 100)}%
                  {e.aiConfidenceAfter !== null
                    ? ` → ${Math.round(e.aiConfidenceAfter * 100)}%`
                    : " · awaiting resolution"}
                </span>
                {e.assignedOwner ? (
                  <span className="rounded border border-white/[0.08] px-2 py-0.5 text-white/50">
                    Owner: {e.assignedOwner}
                  </span>
                ) : null}
                {e.humanTakeoverActive ? (
                  <span className="rounded border border-orange-500/30 px-2 py-0.5 text-orange-200/85">
                    Human takeover
                  </span>
                ) : null}
              </div>
              {!e.resolved ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  <select
                    className="rounded-lg border border-white/[0.1] bg-black/40 px-2 py-1.5 text-[11px] text-white/75"
                    defaultValue=""
                    onChange={(ev) => {
                      const v = ev.target.value;
                      if (v) assignOwner(e.id, v);
                      ev.target.value = "";
                    }}
                  >
                    <option value="">Assign owner…</option>
                    {STAFF_ROSTER.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => resolve(e.id)}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-100/90 hover:bg-emerald-500/15"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => humanTakeover(e.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-100/90"
                  >
                    <UserCheck className="h-3 w-3" aria-hidden />
                    Human takeover
                  </button>
                  {e.conversationId ? (
                    <Link
                      href={`/app/conversations/${e.conversationId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[11px] font-semibold text-blue-100/90"
                    >
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      Open thread
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <AIBrainLinkedRefs
                conversationId={e.conversationId}
                reservationId={e.reservationId}
                guestId={e.guestId}
                compact
              />
              <div className="mt-3">
                <AIExplanationCard compact explanation={e.explanation} confidence={e.aiConfidenceBefore} />
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="lg:col-span-4">
        <StaffWorkloadPanel />
      </aside>
    </div>
  );
}
