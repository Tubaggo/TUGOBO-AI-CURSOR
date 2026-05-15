import { Brain, Sparkles } from "lucide-react";
import type { GuestAIInsight } from "@/lib/types/guests";

type GuestInsightsCardProps = {
  insight: GuestAIInsight;
};

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function GuestInsightsCard({ insight }: GuestInsightsCardProps) {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-zinc-900/60 p-4 ring-1 ring-violet-500/10">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-4 w-4 text-violet-300" aria-hidden />
        <h3 className="text-sm font-semibold text-white">AI behavioral analysis</h3>
      </div>
      <p className="text-xs leading-relaxed text-white/50">{insight.summary}</p>
      <ul className="mt-3 space-y-1.5">
        {insight.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-[12px] text-white/65">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-violet-300/70" aria-hidden />
            {h}
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <Metric label="Upsell probability" value={pct(insight.upsellProbability)} />
        <Metric label="Cancellation risk" value={pct(insight.cancellationRisk)} />
        <Metric label="Direct booking" value={pct(insight.directBookingProbability)} />
        <Metric label="Complaint risk" value={pct(insight.complaintRisk)} />
        <Metric label="Loyalty potential" value={pct(insight.loyaltyPotential)} />
        <Metric label="Price sensitivity" value={insight.priceSensitivity} />
      </dl>
    </div>
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
