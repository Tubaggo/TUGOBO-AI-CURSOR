"use client";

import { useOperationalRuntime, selectAiImpact, selectMounted } from "@/stores/operational-runtime";
import { formatEur, formatPct } from "@/lib/operational/format";

type AiPercentKey =
  | "aiCloseRate"
  | "aiAssistedRecoveryRate"
  | "autonomousResolutionPct"
  | "humanTakeoverSuccessPct"
  | "escalationPreventionPct"
  | "guestRecoveryRate";

const METRIC_ROWS: { key: AiPercentKey; label: string; suffix?: string }[] = [
  { key: "aiCloseRate", label: "AI close rate", suffix: "%" },
  { key: "aiAssistedRecoveryRate", label: "AI assisted recovery", suffix: "%" },
  { key: "autonomousResolutionPct", label: "Autonomous resolution", suffix: "%" },
  { key: "humanTakeoverSuccessPct", label: "Human takeover success", suffix: "%" },
  { key: "escalationPreventionPct", label: "Escalation prevention", suffix: "%" },
  { key: "guestRecoveryRate", label: "Guest recovery rate", suffix: "%" },
];

export function AiImpactPanel({ compact = false }: { compact?: boolean }) {
  const mounted = useOperationalRuntime(selectMounted);
  const ai = useOperationalRuntime(selectAiImpact);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-end justify-between gap-4">
        <MotionAiImpactHeader compact={compact} />
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/28">Revenue influenced</p>
          <p className="text-lg font-bold tabular-nums text-emerald-400">
            {mounted ? formatEur(ai.revenueInfluencedByAi, true) : "—"}
          </p>
        </div>
      </div>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
        {METRIC_ROWS.map(({ key, label, suffix }) => (
          <div
            key={key}
            className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
          >
            <p className="text-[10px] text-white/35">{label}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
              {mounted ? `${ai[key]}${suffix ?? ""}` : "—"}
            </p>
          </div>
        ))}
      </div>
      <MotionConfidenceTrend mounted={mounted} trend={ai.confidenceTrend} stability={ai.aiConfidenceStability} />
    </div>
  );
}

function MotionAiImpactHeader({ compact }: { compact: boolean }) {
  return (
    <div>
      <h3 className={compact ? "text-sm font-semibold text-white" : "text-sm font-semibold text-white"}>
        AI performance · operational health
      </h3>
      {!compact ? (
        <p className="text-[11px] text-white/35 mt-0.5">Close rate, recovery, and confidence stability</p>
      ) : null}
    </div>
  );
}

function MotionConfidenceTrend({
  mounted,
  trend,
  stability,
}: {
  mounted: boolean;
  trend: number[];
  stability: number;
}) {
  const max = Math.max(...trend, 1);
  return (
    <div>
      <MotionConfidenceTrendHeader mounted={mounted} stability={stability} />
      <div className="mt-2 flex h-10 items-end gap-1">
        {trend.map((v, i) => (
          <MotionConfidenceBar key={i} value={v} max={max} mounted={mounted} />
        ))}
      </div>
    </div>
  );
}

function MotionConfidenceTrendHeader({ mounted, stability }: { mounted: boolean; stability: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/45">AI confidence · 7d trend</span>
      <span className="text-[11px] font-semibold text-white/70">
        {mounted ? formatPct(stability) : "—"} stable
      </span>
    </div>
  );
}

function MotionConfidenceBar({ value, max, mounted }: { value: number; max: number; mounted: boolean }) {
  return (
    <MotionConfidenceBarInner
      style={{ height: mounted ? `${(value / max) * 100}%` : "20%" }}
    />
  );
}

function MotionConfidenceBarInner({ style }: { style: { height: string } }) {
  return (
    <div
      className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/40 to-emerald-500/50 min-h-[4px]"
      style={style}
    />
  );
}
