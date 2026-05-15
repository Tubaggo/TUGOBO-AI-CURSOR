import { Activity, Cpu, Database } from "lucide-react";
import type { AIBrainRuntimeHealth } from "@/lib/types/ai-brain";
import { cn } from "@/lib/utils";

type AIRuntimeCardProps = {
  runtime: AIBrainRuntimeHealth;
};

const STATUS_LABEL: Record<AIBrainRuntimeHealth["status"], string> = {
  healthy: "Operational",
  degraded: "Degraded",
  attention: "Needs attention",
};

export function AIRuntimeCard({ runtime }: AIRuntimeCardProps) {
  return (
    <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-300/80" aria-hidden />
          <h3 className="text-sm font-semibold text-white">AI runtime health</h3>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            runtime.status === "healthy" && "bg-emerald-500/15 text-emerald-200",
            runtime.status === "degraded" && "bg-amber-500/15 text-amber-200",
            runtime.status === "attention" && "bg-rose-500/15 text-rose-200"
          )}
        >
          {STATUS_LABEL[runtime.status]}
        </span>
      </header>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Uptime" value={`${runtime.uptimePct}%`} icon={Activity} />
        <Stat label="Avg response" value={`${runtime.avgResponseMs}ms`} icon={Cpu} />
        <Stat label="Active workflows" value={String(runtime.activeWorkflows)} icon={Activity} />
        <Stat label="Knowledge coverage" value={`${runtime.knowledgeCoveragePct}%`} icon={Database} />
      </dl>
      <p className="mt-3 text-[10px] text-white/30">
        Last check{" "}
        {new Date(runtime.lastHealthCheckAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </article>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-2">
      <dt className="flex items-center gap-1 text-[10px] text-white/35">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold tabular-nums text-white/88">{value}</dd>
    </div>
  );
}
