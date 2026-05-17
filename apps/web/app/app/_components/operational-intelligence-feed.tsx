"use client";

import type { OperationalAlert, OperationsFeedItem } from "@/lib/runtime/entities";
import { formatEur } from "@/lib/operational/format";
import { NODE_LABELS } from "@/lib/runtime/graph/propagation";
import { escalationLabel } from "@/lib/runtime/graph/reasoning";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

const SEVERITY_META = {
  critical: { icon: ShieldAlert, border: "border-l-rose-500/60", badge: "CRITICAL" },
  warning: { icon: AlertTriangle, border: "border-l-amber-500/50", badge: "WARNING" },
  info: { icon: Info, border: "border-l-cyan-500/40", badge: "INTEL" },
  success: { icon: CheckCircle2, border: "border-l-emerald-500/50", badge: "SECURED" },
} as const;

export function OperationalIntelligenceFeedItem({
  alert,
  onMarkRead,
  compact,
}: {
  alert: OperationalAlert;
  onMarkRead?: () => void;
  compact?: boolean;
}) {
  const meta = SEVERITY_META[alert.severity];
  const Icon = meta.icon;
  const className = cn(
    "flex w-full gap-3 border-l-2 px-4 py-3 text-left transition-colors",
    meta.border,
    onMarkRead && "hover:bg-white/[0.03]",
    !alert.read && "bg-white/[0.02]",
    compact && "px-3 py-2.5"
  );

  const body = (
    <>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold tracking-wider text-white/35">{meta.badge}</span>
          <span className="text-[10px] text-white/25">{alert.timestamp}</span>
        </div>
        <p className={cn("font-semibold text-white/90", compact ? "text-xs" : "text-sm")}>{alert.title}</p>
        {alert.reason ? (
          <p className="mt-0.5 text-[10px] font-medium text-cyan-300/80">{alert.reason}</p>
        ) : null}
        <p className="mt-1 text-[11px] leading-relaxed text-white/40">{alert.detail}</p>
        <AlertFeedMeta alert={alert} />
      </div>
    </>
  );

  if (onMarkRead) {
    return (
      <button type="button" onClick={onMarkRead} className={className}>
        {body}
      </button>
    );
  }

  return <article className={className}>{body}</article>;
}

function AlertFeedMeta({ alert }: { alert: OperationalAlert }) {
  return (
    <MotionRuntimeIntelligenceFeedMetaBlock>
      <div className="flex flex-wrap gap-2">
        {alert.financialEur ? (
          <span className="text-[10px] font-semibold tabular-nums text-emerald-400">
            Revenue exposure: {formatEur(alert.financialEur)}
          </span>
        ) : null}
        {alert.aiConfidence !== undefined ? (
          <span className="text-[10px] text-blue-300/90">AI Confidence: {alert.aiConfidence}%</span>
        ) : null}
      </div>
      {alert.affectedSystems && alert.affectedSystems.length > 0 ? (
        <p className="text-[10px] text-white/35">
          Propagation: {alert.affectedSystems.map((n) => NODE_LABELS[n]).join(" → ")}
        </p>
      ) : null}
      {alert.orchestrationStatus ? (
        <p className="text-[10px] text-white/35">
          Operational state:{" "}
          <span className="text-cyan-300/80 capitalize">{alert.orchestrationStatus.replace(/_/g, " ")}</span>
          {alert.escalationLevel && alert.escalationLevel !== "none"
            ? ` · ${escalationLabel(alert.escalationLevel)}`
            : null}
        </p>
      ) : null}
    </MotionRuntimeIntelligenceFeedMetaBlock>
  );
}

function MotionRuntimeIntelligenceFeedMetaBlock({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 space-y-1.5">{children}</div>;
}

export function OperationsFeedRuntimeItem({ item }: { item: OperationsFeedItem }) {
  return (
    <article className={cn("flex gap-3 border-l-2 px-4 py-3", item.tone)}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400/60" />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold tracking-wider text-cyan-400/60">OPERATIONS</p>
        <p className="text-xs font-semibold text-white/90">{item.title}</p>
        <p className="mt-0.5 text-[11px] text-white/38">{item.meta}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[10px] text-white/22">{item.time}</span>
          {item.financialEur ? (
            <span className="text-[10px] font-semibold tabular-nums text-emerald-400">
              {formatEur(item.financialEur)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
