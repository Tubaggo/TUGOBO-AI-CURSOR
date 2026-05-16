import type { AuditEvent } from "@/lib/types/ai-brain";
import { OPERATIONAL_AGENT_LABEL } from "@/lib/runtime";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AIExplanationCard } from "./ai-explanation-card";
import { AIBrainLinkedRefs } from "./ai-brain-linked-refs";
import { PolicyReferenceCard } from "./policy-reference-card";

const TYPE_LABEL: Record<AuditEvent["type"], string> = {
  decision: "AI decision",
  action: "Action trace",
  escalation: "Escalation",
  override: "Human override",
  knowledge_use: "Knowledge use",
  policy_trigger: "Policy trigger",
  failed_action: "Failed action",
};

type AuditTimelineProps = {
  events: AuditEvent[];
};

export function AuditTimeline({ events }: AuditTimelineProps) {
  return (
    <ol className="relative space-y-0 border-l border-white/[0.08] pl-6">
      {events.map((e, i) => (
        <li
          key={e.id}
          className={cn(
            "relative pb-8 transition-colors duration-500",
            i === events.length - 1 && "pb-0",
            i === 0 && "rounded-r-lg pl-1"
          )}
        >
          <span
            className={cn(
              "absolute -left-[25px] top-1 flex h-3 w-3 rounded-full border-2 bg-zinc-950 ring-4 ring-zinc-950",
              i === 0 ? "border-cyan-400/80" : "border-cyan-400/50"
            )}
            aria-hidden
          />
          <div
            className={cn(
              "rounded-xl border border-white/[0.07] bg-zinc-900/50 p-4",
              i === 0 && "ring-1 ring-cyan-500/15"
            )}
          >
            <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300/70">
                  {TYPE_LABEL[e.type]}
                  {e.humanOverride ? " · override" : ""}
                  {e.agentRole ? (
                    <span className="ml-2 rounded border border-white/[0.1] px-1.5 py-px text-[9px] font-medium text-white/40">
                      {OPERATIONAL_AGENT_LABEL[e.agentRole]}
                    </span>
                  ) : null}
                </p>
                <h3 className="text-sm font-semibold text-white">{e.title}</h3>
              </div>
              <span className="text-[11px] tabular-nums text-white/35">
                {new Date(e.createdAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </header>
            <AIExplanationCard
              compact
              explanation={e.rationale ? `${e.explanation}\n\n${e.rationale}` : e.explanation}
              confidence={e.confidence}
            />
            {e.confidenceBefore !== undefined ? (
              <p className="mt-2 text-[10px] tabular-nums text-white/32">
                Confidence {Math.round(e.confidenceBefore * 100)}%
                {e.confidenceDelta !== undefined
                  ? ` → ${Math.round((e.confidenceBefore + e.confidenceDelta) * 100)}% (Δ ${e.confidenceDelta >= 0 ? "+" : ""}${Math.round(e.confidenceDelta * 100)} pts)`
                  : ` → ${Math.round(e.confidence * 100)}%`}
                {e.actionOutcome ? ` · outcome ${e.actionOutcome}` : null}
              </p>
            ) : null}
            <div className="mt-3 space-y-2">
              <PolicyReferenceCard
                references={e.policyReferences}
                knowledgeIds={e.knowledgeReferences}
              />
              <AIBrainLinkedRefs
                conversationId={e.conversationId}
                reservationId={e.reservationId}
                guestId={e.guestId}
                compact
              />
              {e.escalationId ? (
                <Link
                  href={`/app/ai-brain/escalations#esc-${e.escalationId}`}
                  className="inline-flex text-[10px] font-semibold text-rose-200/75 hover:text-rose-100"
                >
                  Linked escalation →
                </Link>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
