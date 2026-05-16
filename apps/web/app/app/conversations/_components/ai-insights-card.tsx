import { AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIInsight } from "@/lib/types/conversations";

type AiInsightsCardProps = {
  insight: AIInsight;
};

function sentimentLabel(s: AIInsight["sentiment"]): string {
  switch (s) {
    case "positive":
      return "Positive";
    case "negative":
      return "Negative";
    case "mixed":
      return "Mixed";
    default:
      return "Neutral";
  }
}

export function AiInsightsCard({ insight }: AiInsightsCardProps) {
  const pct = Math.round(insight.confidence * 100);
  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-3.5 shadow-inner shadow-black/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              AI operations
            </p>
            <p className="text-xs font-medium text-white/80">Live triage layer</p>
          </div>
        </div>
        {insight.escalationSuggested ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-200/95">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            Escalate
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/32">Confidence</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">{pct}%</p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-blue-500/80 to-emerald-400/80",
                pct < 55 && "from-amber-500/90 to-rose-500/80"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct < 65 ? (
            <p className="mt-1.5 text-[9px] leading-snug text-amber-200/70">
              Autonomous send restricted · human review suggested
            </p>
          ) : pct >= 85 ? (
            <p className="mt-1.5 text-[9px] text-emerald-200/55">Supervised autonomy active</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/32">Sentiment</p>
          <p className="mt-0.5 text-sm font-semibold text-white/88">{sentimentLabel(insight.sentiment)}</p>
          <p className="mt-1 text-[11px] leading-snug text-white/38">Ops signal for tone routing</p>
        </div>
      </div>

      {insight.upsellOpportunity ? (
        <div className="mt-2 flex gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-2.5 py-2">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/80" aria-hidden />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/65">
              Upsell window
            </p>
            <p className="text-[12px] leading-snug text-white/70">{insight.upsellOpportunity}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-2.5 border-t border-white/[0.06] pt-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/32">AI summary</p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/55">{insight.summary}</p>
      </div>
    </section>
  );
}
