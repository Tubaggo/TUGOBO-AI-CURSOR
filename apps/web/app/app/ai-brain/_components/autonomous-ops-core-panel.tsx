"use client";

import { Activity, GitBranch, Scale, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { useOperationsStore, useOrchestrationPulseMetrics } from "@/lib/runtime";

/** AI Brain operational intelligence core — not a generic analytics card. */
export function AutonomousOpsCorePanel({ className }: { className?: string }) {
  const mounted = useClientMounted();
  const overview = useOperationsStore((s) => s.overview);
  const hydrated = useOperationsStore((s) => s.hydrated);
  const metrics = useOrchestrationPulseMetrics();

  if (!mounted || !hydrated) return null;

  const loadPct = Math.min(
    100,
    Math.round(
      (metrics.activeOrchestrations / Math.max(overview.activeWorkflows.length, 1)) * 72 +
        metrics.escalationCount * 8
    )
  );

  const policyActive = overview.policyTriggers.filter((p) => p.count24h > 0).length;
  const blocked = overview.activeWorkflows.filter(
    (w) => w.status === "blocked" || w.status === "escalated"
  ).length;

  return (
    <article
      className={cn(
        "rounded-xl border border-cyan-500/15 bg-gradient-to-br from-cyan-950/25 via-zinc-900/55 to-zinc-950/80 p-4",
        className
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/75">
            Autonomous operations core
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white">
            Supervised orchestration fabric
          </h3>
          <p className="mt-1 max-w-md text-[11px] leading-relaxed text-white/38">
            Policy evaluations, confidence routing, and workflow health — operational load adjusts
            in real time as escalations propagate.
          </p>
        </div>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/30" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-400/90" />
        </span>
      </header>

      <dl className="grid gap-3 sm:grid-cols-2">
        <MetricRow
          icon={Activity}
          label="Operational load"
          value={`${loadPct}%`}
          hint={`${metrics.runningAutomations} automations · ${metrics.activeOrchestrations} supervised`}
          barPct={loadPct}
          barTone="cyan"
        />
        <MetricRow
          icon={Scale}
          label="Escalation pressure"
          value={String(metrics.escalationCount)}
          hint={blocked > 0 ? `${blocked} workflows gated` : "Within autonomy band"}
          barPct={Math.min(100, metrics.escalationCount * 22)}
          barTone={metrics.escalationCount > 2 ? "rose" : "emerald"}
        />
        <MetricRow
          icon={GitBranch}
          label="Policy evaluations (24h)"
          value={String(policyActive)}
          hint="Active guardrails scanning send queue"
          barPct={Math.min(100, policyActive * 18)}
          barTone="violet"
        />
        <MetricRow
          icon={Zap}
          label="Confidence routing"
          value={overview.runtime.status === "healthy" ? "Open" : "Restricted"}
          hint={`Runtime ${overview.runtime.status} · ${overview.runtime.uptimePct}% uptime`}
          barPct={overview.runtime.status === "healthy" ? 88 : 48}
          barTone={overview.runtime.status === "healthy" ? "emerald" : "amber"}
        />
      </dl>
    </article>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
  hint,
  barPct,
  barTone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint: string;
  barPct: number;
  barTone: "cyan" | "emerald" | "rose" | "amber" | "violet";
}) {
  const barColor = {
    cyan: "bg-cyan-500/70",
    emerald: "bg-emerald-500/70",
    rose: "bg-rose-500/70",
    amber: "bg-amber-500/55",
    violet: "bg-violet-500/65",
  }[barTone];

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-white/40" aria-hidden />
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/35">{label}</dt>
      </div>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-white/90">{value}</dd>
      <p className="mt-0.5 text-[10px] text-white/32">{hint}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}
