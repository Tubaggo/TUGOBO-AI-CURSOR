"use client";

import { cn } from "@/lib/utils";
import type { RuntimeOperationalStatus } from "@/lib/runtime/types";

const STATUS_CONFIG: Record<
  RuntimeOperationalStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  ai_active: {
    label: "AI active",
    className: "border-blue-500/35 bg-blue-500/10 text-blue-200/90",
    pulse: true,
  },
  escalated: {
    label: "Escalated",
    className: "border-rose-500/35 bg-rose-500/10 text-rose-200/95",
  },
  human_active: {
    label: "Human active",
    className: "border-amber-500/35 bg-amber-500/10 text-amber-200/90",
  },
  payment_risk: {
    label: "Payment risk",
    className: "border-orange-500/35 bg-orange-500/10 text-orange-200/90",
  },
  confidence_low: {
    label: "Confidence low",
    className: "border-violet-500/35 bg-violet-500/10 text-violet-200/90",
  },
  vip_flow: {
    label: "VIP flow",
    className: "border-cyan-500/35 bg-cyan-500/10 text-cyan-200/90",
  },
  workflow_blocked: {
    label: "Workflow blocked",
    className: "border-white/20 bg-white/[0.06] text-white/55",
  },
  workflow_paused: {
    label: "Workflow paused",
    className: "border-white/15 bg-white/[0.04] text-white/45",
  },
};

type RuntimeStatusBadgeProps = {
  status: RuntimeOperationalStatus;
  className?: string;
  animate?: boolean;
};

export function RuntimeStatusBadge({ status, className, animate = true }: RuntimeStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all duration-300",
        cfg.className,
        animate && cfg.pulse && "animate-pulse",
        className
      )}
    >
      {cfg.pulse && animate ? (
        <span className="h-1 w-1 rounded-full bg-current opacity-80" aria-hidden />
      ) : null}
      {cfg.label}
    </span>
  );
}

type RuntimeStatusBadgeGroupProps = {
  statuses: RuntimeOperationalStatus[];
  max?: number;
  className?: string;
};

export function RuntimeStatusBadgeGroup({
  statuses,
  max = 3,
  className,
}: RuntimeStatusBadgeGroupProps) {
  const visible = statuses.slice(0, max);
  if (visible.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visible.map((s) => (
        <RuntimeStatusBadge key={s} status={s} />
      ))}
    </div>
  );
}
