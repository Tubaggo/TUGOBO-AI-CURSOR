"use client";

import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { useMutationPulse } from "@/lib/runtime/hooks/use-mutation-pulse";
import { cn } from "@/lib/utils";

type RevenueMetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  sub?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  variant?: "default" | "risk";
};

export function RevenueMetricCard({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  variant = "default",
}: RevenueMetricCardProps) {
  return (
    <MotionRevenueMetricCard
      label={label}
      value={value}
      delta={delta}
      sub={sub}
      icon={Icon}
      iconColor={iconColor}
      iconBg={iconBg}
      variant={variant}
    />
  );
}

function MotionRevenueMetricCard(props: RevenueMetricCardProps) {
  const { label, value, delta, sub, icon: Icon, iconColor, iconBg, variant = "default" } = props;
  const isLive = useMutationPulse(5000);
  return (
    <div
      className={cn(
        "rounded-xl border bg-zinc-900/80 p-5 transition-all hover:border-white/[0.10]",
        variant === "risk" ? "border-amber-500/20" : "border-white/[0.06]",
        isLive && "shadow-[0_0_24px_-12px_rgba(52,211,153,0.25)] ring-1 ring-emerald-500/10"
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        {delta ? (
          <MotionRevenueMetricDelta delta={delta} variant={variant} />
        ) : null}
      </div>
      <p className={cn("text-2xl font-bold tracking-tight text-white tabular-nums", isLive && "animate-tick-fade")}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-snug text-white/40">{label}</p>
      {sub ? <p className="mt-1 text-[10px] text-white/22">{sub}</p> : null}
    </div>
  );
}

function MotionRevenueMetricDelta({ delta, variant }: { delta: string; variant: "default" | "risk" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        variant === "risk" ? "text-amber-400" : "text-emerald-400"
      )}
    >
      <ArrowUpRight className="h-3 w-3" />
      {delta}
    </div>
  );
}
