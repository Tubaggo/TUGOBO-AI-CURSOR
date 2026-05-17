import type { AIReasoning } from "@/lib/runtime/entities";
import { escalationLabel } from "@/lib/runtime/graph/reasoning";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIReasoningBlock({
  reasoning,
  compact = false,
}: {
  reasoning: AIReasoning;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-blue-500/15 bg-blue-500/[0.04]",
        compact ? "px-3 py-2.5" : "px-4 py-3"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
          <div className="min-w-0">
            <p className={cn("font-semibold text-blue-200/90", compact ? "text-[11px]" : "text-xs")}>
              {reasoning.headline}
            </p>
            {!compact ? (
              <p className="text-[10px] text-white/30 mt-0.5">Operational reasoning · explainable AI</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tabular-nums text-white/35">AI {reasoning.confidence}%</span>
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              reasoning.escalationLevel === "critical"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : reasoning.escalationLevel === "urgent"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : reasoning.escalationLevel === "watch"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-white/[0.03] text-white/40"
            )}
          >
            {escalationLabel(reasoning.escalationLevel)}
          </span>
        </div>
      </div>
      <ul className={cn("space-y-1.5", compact ? "mt-2" : "mt-3")}>
        {reasoning.factors.map((factor) => (
          <li key={factor} className="flex gap-2 text-[11px] leading-relaxed text-white/50">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400/80" />
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
