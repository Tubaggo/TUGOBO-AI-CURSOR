import type { AuditEvent } from "@/lib/types/ai-brain";
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
        <li key={e.id} className={cn("relative pb-8", i === events.length - 1 && "pb-0")}>
          <span
            className="absolute -left-[25px] top-1 flex h-3 w-3 rounded-full border-2 border-cyan-400/60 bg-zinc-950 ring-4 ring-zinc-950"
            aria-hidden
          />
          <div className="rounded-xl border border-white/[0.07] bg-zinc-900/50 p-4">
            <header className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300/70">
                  {TYPE_LABEL[e.type]}
                  {e.humanOverride ? " · override" : ""}
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
            <AIExplanationCard compact explanation={e.explanation} confidence={e.confidence} />
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
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
