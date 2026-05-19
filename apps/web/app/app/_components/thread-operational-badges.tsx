"use client";

import { useTranslations } from "next-intl";
import type { ThreadOperationalFlags } from "@/lib/runtime/entities";
import { cn } from "@/lib/utils";

const BADGE_KEYS: {
  key: keyof ThreadOperationalFlags;
  labelKey:
    | "paymentRisk"
    | "recoveryActive"
    | "humanTakeover"
    | "vipEscalation"
    | "otaConversion"
    | "memoryAttached"
    | "priorRisk"
    | "vipHistory"
    | "directCandidate";
  className: string;
}[] = [
  { key: "paymentRisk", labelKey: "paymentRisk", className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  { key: "recoveryActive", labelKey: "recoveryActive", className: "border-violet-500/25 bg-violet-500/10 text-violet-300" },
  { key: "humanTakeover", labelKey: "humanTakeover", className: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  { key: "vipEscalation", labelKey: "vipEscalation", className: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  { key: "otaConversion", labelKey: "otaConversion", className: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300" },
  { key: "memoryAttached", labelKey: "memoryAttached", className: "border-violet-500/25 bg-violet-500/10 text-violet-300" },
  { key: "priorRiskDetected", labelKey: "priorRisk", className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  { key: "vipHistory", labelKey: "vipHistory", className: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  { key: "directBookingCandidate", labelKey: "directCandidate", className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
];

export function ThreadOperationalBadges({ flags }: { flags: ThreadOperationalFlags }) {
  const t = useTranslations("badges");
  const active = BADGE_KEYS.filter((b) => flags[b.key]);
  if (active.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {active.map((b) => (
        <span
          key={b.key}
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
            b.className
          )}
        >
          {t(b.labelKey)}
        </span>
      ))}
    </div>
  );
}
