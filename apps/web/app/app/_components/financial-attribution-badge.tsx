import { Bot, User, Sparkles } from "lucide-react";
import type { FinancialAttribution } from "@/lib/operational/types";
import { formatEur } from "@/lib/operational/format";
import { attributionKindLabel } from "@/lib/i18n/operational-copy";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<string, { ring: string; text: string }> = {
  payment_recovery: { ring: "border-amber-500/25 bg-amber-500/10", text: "text-amber-300" },
  ai_upsell: { ring: "border-violet-500/25 bg-violet-500/10", text: "text-violet-300" },
  vip_intervention: { ring: "border-rose-500/25 bg-rose-500/10", text: "text-rose-300" },
  direct_conversion: { ring: "border-emerald-500/25 bg-emerald-500/10", text: "text-emerald-300" },
  takeover_rescue: { ring: "border-blue-500/25 bg-blue-500/10", text: "text-blue-300" },
  ota_commission: { ring: "border-cyan-500/25 bg-cyan-500/10", text: "text-cyan-300" },
  escalation_prevention: { ring: "border-sky-500/25 bg-sky-500/10", text: "text-sky-300" },
  abandoned_recovery: { ring: "border-teal-500/25 bg-teal-500/10", text: "text-teal-300" },
};

export function FinancialAttributionBadge({
  attribution,
  compact = false,
}: {
  attribution: FinancialAttribution;
  compact?: boolean;
}) {
  const style = KIND_STYLES[attribution.kind] ?? KIND_STYLES.direct_conversion;
  const Icon = attribution.aiContributed ? Bot : attribution.kind === "takeover_rescue" ? User : Sparkles;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        style.ring,
        style.text,
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      )}
      title={attribution.detail}
    >
      <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      <span className="truncate max-w-[220px]">
        {attributionKindLabel(attribution.kind)} · {formatEur(attribution.amountEur)}
      </span>
    </span>
  );
}

export function RevenueImpactBadge({ amountEur, label }: { amountEur: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 tabular-nums">
      {label} {formatEur(amountEur)}
    </span>
  );
}
