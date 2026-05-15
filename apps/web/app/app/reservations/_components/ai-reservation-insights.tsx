import { AlertTriangle, Bot, Sparkles, TrendingDown } from "lucide-react";
import type { AIReservationInsight } from "@/app/app/_types";
import { cn } from "@/lib/utils";

type AiReservationInsightsProps = {
  insight: AIReservationInsight;
};

function riskColor(risk: AIReservationInsight["cancellationRisk"]): string {
  switch (risk) {
    case "high":
      return "text-rose-200/95";
    case "medium":
      return "text-amber-200/90";
    case "low":
      return "text-emerald-200/85";
    default: {
      const _r: never = risk;
      return _r;
    }
  }
}

export function AiReservationInsights({ insight }: AiReservationInsightsProps) {
  return (
    <section className="rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] to-zinc-950/60 p-4 ring-1 ring-violet-500/10">
      <header className="flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-violet-100/95">
          <Bot className="h-4 w-4 text-violet-300/90" aria-hidden />
          AI orchestration
        </h2>
        <span className="rounded-md border border-white/[0.08] bg-black/30 px-2 py-0.5 text-[11px] font-bold tabular-nums text-white/70">
          {Math.round(insight.confidence * 100)}% conf.
        </span>
      </header>
      <p className="mt-3 text-[12px] leading-relaxed text-white/55">{insight.summary}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-black/25 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">Cancellation</p>
          <p className={cn("mt-1 inline-flex items-center gap-1 text-sm font-semibold", riskColor(insight.cancellationRisk))}>
            <TrendingDown className="h-4 w-4 opacity-80" aria-hidden />
            {insight.cancellationRisk}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-black/25 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">Escalation</p>
          <p className="mt-1 text-sm font-semibold text-white/80">
            {insight.escalationSuggested ? "Suggested" : "Not required"}
          </p>
        </div>
      </div>
      {insight.upsellOpportunity ? (
        <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/8 p-2.5">
          <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/80">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Upsell signal
          </p>
          <p className="mt-1 text-[12px] leading-snug text-emerald-100/90">{insight.upsellOpportunity}</p>
        </div>
      ) : null}
      <ul className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3">
        {insight.riskFlags.map((flag) => (
          <li
            key={flag}
            className="flex items-start gap-2 text-[11px] leading-snug text-white/50"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden />
            {flag}
          </li>
        ))}
      </ul>
    </section>
  );
}
