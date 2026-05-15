"use client";

import { Play, Shield } from "lucide-react";
import type { AIAction } from "@/lib/types/ai-brain";
import { cn } from "@/lib/utils";
import { AIExplanationCard } from "./ai-explanation-card";

const RISK_TONE: Record<AIAction["riskLevel"], string> = {
  low: "bg-emerald-500/12 text-emerald-200 border-emerald-500/25",
  medium: "bg-amber-500/12 text-amber-200 border-amber-500/25",
  high: "bg-orange-500/12 text-orange-200 border-orange-500/30",
  critical: "bg-rose-500/12 text-rose-200 border-rose-500/35",
};

type AIActionCardProps = {
  action: AIAction;
  onSimulate: (id: string) => void;
  simulationExplanation?: string | null;
};

export function AIActionCard({ action, onSimulate, simulationExplanation }: AIActionCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border p-4",
        action.enabled
          ? "border-white/[0.07] bg-zinc-900/50"
          : "border-white/[0.05] bg-zinc-950/60 opacity-75"
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
            {action.category.replace(/_/g, " ")}
          </p>
          <h3 className="text-sm font-semibold text-white">{action.name}</h3>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
            RISK_TONE[action.riskLevel]
          )}
        >
          {action.riskLevel} risk
        </span>
      </header>
      <p className="mb-3 text-xs text-white/45">{action.description}</p>
      <dl className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
          <dt className="text-white/35">Approval</dt>
          <dd className="mt-0.5 font-medium capitalize text-white/75">
            {action.approvalMode.replace(/_/g, " ")}
          </dd>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
          <dt className="text-white/35">Confidence gate</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-white/80">
            ≥ {Math.round(action.confidenceThreshold * 100)}%
          </dd>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
          <dt className="text-white/35">Executions</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-white/80">{action.executionCount}</dd>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
          <dt className="text-white/35">Last run</dt>
          <dd className="mt-0.5 text-white/70">
            {action.lastExecutedAt
              ? new Date(action.lastExecutedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })
              : "—"}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSimulate(action.id)}
          disabled={!action.enabled}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[12px] font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          Simulate execution
        </button>
        {!action.enabled ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-white/35">
            <Shield className="h-3 w-3" aria-hidden />
            Disabled by policy
          </span>
        ) : null}
      </div>
      {simulationExplanation ? (
        <div className="mt-3">
          <AIExplanationCard compact title="Simulation result" explanation={simulationExplanation} />
        </div>
      ) : null}
    </article>
  );
}
