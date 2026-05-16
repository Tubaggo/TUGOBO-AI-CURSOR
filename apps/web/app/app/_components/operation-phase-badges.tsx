"use client";

import type { OperationPhaseState } from "@/lib/entities";
import { cn } from "@/lib/utils";

const PHASE_CONFIG: Record<
  OperationPhaseState,
  { label: string; className: string }
> = {
  AI_ACTIVE: {
    label: "AI active",
    className: "border-blue-500/35 bg-blue-500/10 text-blue-200/90",
  },
  HUMAN_REVIEW: {
    label: "Human review",
    className: "border-amber-500/35 bg-amber-500/10 text-amber-200/90",
  },
  ESCALATED: {
    label: "Escalated",
    className: "border-rose-500/35 bg-rose-500/10 text-rose-200/90",
  },
  PAYMENT_RISK: {
    label: "Payment risk",
    className: "border-orange-500/35 bg-orange-500/10 text-orange-200/90",
  },
  VIP_FLOW: {
    label: "VIP flow",
    className: "border-cyan-500/35 bg-cyan-500/10 text-cyan-200/90",
  },
  OTA_RECOVERY: {
    label: "OTA recovery",
    className: "border-indigo-500/35 bg-indigo-500/10 text-indigo-200/90",
  },
  WAITING_GUEST: {
    label: "Waiting guest",
    className: "border-white/18 bg-white/[0.05] text-white/48",
  },
  ACTION_BLOCKED: {
    label: "Action blocked",
    className: "border-white/22 bg-white/[0.06] text-white/52",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200/90",
  },
};

type OperationPhaseBadgeGroupProps = {
  phases: OperationPhaseState[];
  max?: number;
  className?: string;
};

export function OperationPhaseBadgeGroup({
  phases,
  max = 4,
  className,
}: OperationPhaseBadgeGroupProps) {
  const visible = phases.slice(0, max);
  if (visible.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visible.map((p) => {
        const cfg = PHASE_CONFIG[p];
        return (
          <span
            key={p}
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              cfg.className
            )}
          >
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}
