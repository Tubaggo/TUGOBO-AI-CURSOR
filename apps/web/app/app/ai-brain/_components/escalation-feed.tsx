import type { EscalationEvent } from "@/lib/types/ai-brain";
import Link from "next/link";
import { OPERATIONAL_AGENT_LABEL } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { AIExplanationCard } from "./ai-explanation-card";
import { AIBrainLinkedRefs } from "./ai-brain-linked-refs";

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

type EscalationFeedProps = {
  events: EscalationEvent[];
};

export function EscalationFeed({ events }: EscalationFeedProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-12 text-center text-sm text-white/35">
        No escalations in this view.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map((e) => (
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
          <p className="mb-3 text-[11px] tabular-nums text-white/30">
            Confidence {Math.round(e.aiConfidenceBefore * 100)}%
            {e.aiConfidenceAfter !== null
              ? ` → ${Math.round(e.aiConfidenceAfter * 100)}%`
              : " · awaiting resolution"}
            {" · "}
            {new Date(e.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AIBrainLinkedRefs
              conversationId={e.conversationId}
              reservationId={e.reservationId}
              guestId={e.guestId}
              compact
            />
            <Link
              href="/app/ai-brain/audit"
              className="inline-flex items-center text-[10px] font-semibold text-cyan-300/75 hover:text-cyan-200"
            >
              Audit trace →
            </Link>
          </div>
          <div className="mt-3">
            <AIExplanationCard compact explanation={e.explanation} confidence={e.aiConfidenceBefore} />
          </div>
        </li>
      ))}
    </ul>
  );
}
