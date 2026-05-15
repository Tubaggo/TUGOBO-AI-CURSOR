import type { KnowledgeEntry } from "@/lib/types/ai-brain";
import { cn } from "@/lib/utils";
import { AIExplanationCard } from "./ai-explanation-card";
import { AIBrainLinkedRefs } from "./ai-brain-linked-refs";

const CATEGORY_LABEL: Record<KnowledgeEntry["category"], string> = {
  room_policies: "Room policies",
  transfers: "Transfers",
  cancellation: "Cancellation",
  breakfast: "Breakfast",
  spa: "Spa",
  pricing: "Pricing",
  upgrades: "Upgrades",
  seasonal_offers: "Seasonal offers",
  operational_sop: "Operational SOP",
};

const CRITICALITY_TONE: Record<KnowledgeEntry["criticality"], string> = {
  low: "border-white/10 text-white/45",
  medium: "border-amber-500/25 text-amber-200/80",
  high: "border-orange-500/30 text-orange-200/85",
  critical: "border-rose-500/35 text-rose-200/90",
};

type KnowledgeEntryCardProps = {
  entry: KnowledgeEntry;
};

export function KnowledgeEntryCard({ entry }: KnowledgeEntryCardProps) {
  return (
    <article className="flex flex-col rounded-xl border border-white/[0.07] bg-zinc-900/50 p-4 transition-colors hover:border-cyan-500/15">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300/70">
            {CATEGORY_LABEL[entry.category]}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-white">{entry.title}</h3>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
            CRITICALITY_TONE[entry.criticality]
          )}
        >
          {entry.criticality}
        </span>
      </header>
      <p className="mb-3 text-xs leading-relaxed text-white/48">{entry.summary}</p>
      <dl className="mb-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <Metric label="Confidence" value={`${Math.round(entry.confidence * 100)}%`} />
        <Metric label="Usage" value={String(entry.usageFrequency)} />
        <Metric label="Escalation impact" value={`${Math.round(entry.escalationImpact * 100)}%`} />
        <Metric
          label="Last AI use"
          value={new Date(entry.lastUsedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        />
      </dl>
      <p className="mb-3 text-[10px] text-white/30">Source · {entry.source.replace(/_/g, " ")}</p>
      <AIBrainLinkedRefs
        guestId={entry.linkedGuestIds?.[0]}
        reservationId={entry.linkedReservationIds?.[0]}
        compact
      />
      <div className="mt-3">
        <AIExplanationCard
          compact
          title="Operational grounding"
          explanation={`This memory was retrieved ${entry.usageFrequency} times with ${Math.round(entry.confidence * 100)}% grounding confidence. Escalation impact score reflects how often ambiguity here triggered human supervision.`}
          confidence={entry.confidence}
        />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
      <dt className="text-white/35">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-white/80">{value}</dd>
    </div>
  );
}
