"use client";

import { useTranslations } from "next-intl";
import { useOperationalRuntime, selectAiImpact, selectMounted } from "@/stores/operational-runtime";
import { formatEur, formatPct } from "@/lib/operational/format";

type AiPercentKey =
  | "aiCloseRate"
  | "aiAssistedRecoveryRate"
  | "autonomousResolutionPct"
  | "humanTakeoverSuccessPct"
  | "escalationPreventionPct"
  | "guestRecoveryRate";

const METRIC_ROWS: { key: AiPercentKey; labelKey: string }[] = [
  { key: "aiCloseRate", labelKey: "aiCloseRate" },
  { key: "aiAssistedRecoveryRate", labelKey: "aiAssistedRecovery" },
  { key: "autonomousResolutionPct", labelKey: "autonomousResolution" },
  { key: "humanTakeoverSuccessPct", labelKey: "humanTakeoverSuccess" },
  { key: "escalationPreventionPct", labelKey: "interventionPrevention" },
  { key: "guestRecoveryRate", labelKey: "guestRecoveryRate" },
];

export function AiImpactPanel({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("aiImpact");
  const mounted = useOperationalRuntime(selectMounted);
  const ai = useOperationalRuntime(selectAiImpact);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-end justify-between gap-4">
        <MotionAiImpactHeader compact={compact} />
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/28">{t("revenueInfluenced")}</p>
          <p className="text-lg font-bold tabular-nums text-emerald-400">
            {mounted ? formatEur(ai.revenueInfluencedByAi, true) : "—"}
          </p>
        </div>
      </div>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
        {METRIC_ROWS.map(({ key, labelKey }) => (
          <div
            key={key}
            className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
          >
            <p className="text-[10px] text-white/35">{t(labelKey)}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
              {mounted ? `${ai[key]}%` : "—"}
            </p>
          </div>
        ))}
      </div>
      <MotionConfidenceTrend mounted={mounted} trend={ai.confidenceTrend} stability={ai.aiConfidenceStability} />
    </div>
  );
}

function MotionAiImpactHeader({ compact }: { compact: boolean }) {
  const t = useTranslations("aiImpact");
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
      {!compact ? <p className="text-[11px] text-white/35 mt-0.5">{t("subtitle")}</p> : null}
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
  const t = useTranslations("aiImpact");
  const max = Math.max(...trend, 1);
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-white/32 mb-2">
        <span>{t("confidenceStability")}</span>
        <span className="font-semibold tabular-nums text-white/55">
          {mounted ? formatPct(stability) : "—"}
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {trend.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-blue-500/40 transition-all"
            style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
          />
        ))}
      </div>
    </div>
  );
}
