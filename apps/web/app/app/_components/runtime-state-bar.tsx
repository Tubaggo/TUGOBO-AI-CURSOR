"use client";

import {
  useOperationalRuntime,
  selectLastPropagation,
  selectRecoveryJourneys,
  selectConversations,
} from "@/stores/operational-runtime";
import { useMutationPulse } from "@/lib/runtime/hooks/use-mutation-pulse";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Radio, Sparkles } from "lucide-react";

type RuntimeBarMode = "orchestration" | "critical" | "idle";

function resolveBarMode(
  isLive: boolean,
  criticalJourney: boolean,
  hasPropagation: boolean
): RuntimeBarMode {
  if (criticalJourney) return "critical";
  if (isLive || hasPropagation) return "orchestration";
  return "idle";
}

export function RuntimeStateBar() {
  const propagation = useOperationalRuntime(selectLastPropagation);
  const journeys = useOperationalRuntime(selectRecoveryJourneys);
  const conversations = useOperationalRuntime(selectConversations);
  const isLive = useMutationPulse(5000);

  const criticalJourney =
    journeys.some(
      (j) => j.status === "active" && (j.kind === "escalation_cancellation" || j.kind === "takeover_rescue")
    ) || conversations.some((c) => c.flags.vipEscalation || c.status === "human_takeover");
  const activeRecovery = journeys.filter((j) => j.status === "active").length;
  const mode = resolveBarMode(isLive, criticalJourney, Boolean(propagation));

  const config = MODE_CONFIG[mode];

  return (
    <div
      className={cn(
        "sticky top-0 z-20 shrink-0 border-b px-5 py-2 backdrop-blur-md",
        config.barClass
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.dotClass)} />
          ) : (
            <config.icon className={cn("h-3.5 w-3.5", config.iconClass)} />
          )}
          <span className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", config.labelClass)}>
            {config.label}
          </span>
        </div>
        <span className="text-[11px] text-white/45">{config.detail(activeRecovery, propagation?.summary)}</span>
      </div>
    </div>
  );
}

const MODE_CONFIG = {
  orchestration: {
    icon: Activity,
    label: "Live orchestration active",
    barClass: "border-cyan-500/20 bg-cyan-500/[0.06]",
    dotClass: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]",
    iconClass: "text-cyan-400",
    labelClass: "text-cyan-300",
    detail: (active: number, summary?: string) =>
      active > 0
        ? `Recovery flow synchronized · ${active} active path${active > 1 ? "s" : ""}${summary ? ` · ${summary}` : ""}`
        : "Revenue → Pipeline → Guest Intel → Audit",
  },
  critical: {
    icon: AlertTriangle,
    label: "Critical path active",
    barClass: "border-rose-500/25 bg-rose-500/[0.08]",
    dotClass: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]",
    iconClass: "text-rose-400",
    labelClass: "text-rose-300",
    detail: () => "VIP escalation chain armed · Human takeover pending",
  },
  idle: {
    icon: Sparkles,
    label: "Runtime idle",
    barClass: "border-white/[0.04] bg-zinc-950/90",
    dotClass: "bg-white/30",
    iconClass: "text-white/35",
    labelClass: "text-white/40",
    detail: (_active: number, summary?: string) =>
      summary ? `Last propagation: ${summary}` : "Last propagation: ADR uplift recorded · graph stable",
  },
} as const;
