"use client";

import { Euro, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { useOperationsStore, useOrchestrationPulseMetrics } from "@/lib/runtime";

type ExecutiveSignalStripProps = {
  className?: string;
  compact?: boolean;
};

export function ExecutiveSignalStrip({ className, compact = false }: ExecutiveSignalStripProps) {
  const mounted = useClientMounted();
  const hydrated = useOperationsStore((s) => s.hydrated);
  const overview = useOperationsStore((s) => s.overview);
  const conversations = useOperationsStore((s) => s.conversations);
  const reservations = useOperationsStore((s) => s.reservations);
  const pulse = useOperationsStore((s) => s.lastPulseAt);
  const metrics = useOrchestrationPulseMetrics();

  if (!mounted || !hydrated) return null;

  const avgConfidence =
    conversations.length > 0
      ? conversations.reduce((s, c) => s + c.aiInsight.confidence, 0) / conversations.length
      : 0.82;

  const paymentRisk = reservations.filter(
    (r) => r.paymentStatus === "payment_failed" || r.paymentStatus === "overdue"
  ).length;

  const automationPct = Math.round((1 - overview.humanTakeoverRatio) * 100);

  const signals = [
    {
      icon: Gauge,
      label: "AI confidence",
      value: `${Math.round(avgConfidence * 100)}%`,
      hint: avgConfidence >= 0.8 ? "Supervised autonomy" : "Elevated review",
      tone:
        avgConfidence >= 0.8
          ? "border-emerald-500/22 bg-emerald-500/[0.06] text-emerald-100/90"
          : "border-amber-500/22 bg-amber-500/[0.06] text-amber-100/90",
    },
    {
      icon: Euro,
      label: "Revenue influence",
      value: `€${overview.aiRevenueInfluenceEur.toLocaleString("en-GB")}`,
      hint: `${Math.round(overview.aiRevenueInfluencePct * 100)}% of pipeline`,
      tone: "border-violet-500/22 bg-violet-500/[0.06] text-violet-100/90",
    },
    {
      icon: ShieldAlert,
      label: "Escalation pressure",
      value: String(metrics.escalationCount),
      hint: paymentRisk > 0 ? `${paymentRisk} payment risk` : "Within SOP band",
      tone:
        metrics.escalationCount > 2
          ? "border-rose-500/22 bg-rose-500/[0.06] text-rose-100/90"
          : "border-white/[0.08] bg-white/[0.03] text-white/72",
    },
    {
      icon: Sparkles,
      label: "Automation posture",
      value: `${automationPct}%`,
      hint: `${metrics.runningAutomations} workflows running`,
      tone: "border-cyan-500/22 bg-cyan-500/[0.06] text-cyan-100/90",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
        compact && "sm:grid-cols-4 lg:grid-cols-4",
        className
      )}
      data-runtime-pulse={pulse > 0 ? String(pulse) : undefined}
    >
      {signals.map((s) => (
        <article
          key={s.label}
          className={cn(
            "rounded-xl border px-3 transition-colors duration-500",
            compact ? "py-2" : "py-2.5",
            s.tone
          )}
        >
          <div className="flex items-start gap-2">
            <s.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden />
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-70">
                {s.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 font-semibold tabular-nums tracking-tight",
                  compact ? "text-sm" : "text-base"
                )}
              >
                {s.value}
              </p>
              <p className="mt-0.5 truncate text-[10px] opacity-55">{s.hint}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
