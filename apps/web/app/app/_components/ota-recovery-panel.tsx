"use client";

import { useTranslations } from "next-intl";
import { ArrowRightLeft, Percent, Wallet, Users } from "lucide-react";
import { useOperationalRuntime, selectOtaMetrics, selectMounted } from "@/stores/operational-runtime";
import { formatEur, formatPct } from "@/lib/operational/format";

export function OtaRecoveryPanel() {
  const t = useTranslations("otaPanel");
  const mounted = useOperationalRuntime(selectMounted);
  const ota = useOperationalRuntime(selectOtaMetrics);

  const items = [
    {
      label: t("leakage"),
      value: mounted ? formatPct(ota.otaLeakagePct) : "—",
      sub: t("leakageSub"),
      icon: Percent,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: t("directRate"),
      value: mounted ? formatPct(ota.directConversionRate) : "—",
      sub: t("directRateSub"),
      icon: ArrowRightLeft,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: t("commissionRecovered"),
      value: mounted ? formatEur(ota.recoveredCommissionSavings, true) : "—",
      sub: t("commissionSub"),
      icon: Wallet,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: t("loyaltyConversions"),
      value: mounted ? String(ota.loyaltyConversions) : "—",
      sub: t("loyaltySub"),
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <OtaRecoveryHeader active={ota.activeRecoveryWorkflows} mounted={mounted} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="text-sm font-bold tabular-nums text-white">{item.value}</p>
            <p className="mt-0.5 text-[10px] text-white/40">{item.label}</p>
            <p className="text-[9px] text-white/22">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OtaRecoveryHeader({ active, mounted }: { active: number; mounted: boolean }) {
  const t = useTranslations("otaPanel");
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/28">{t("eyebrow")}</p>
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
      </div>
      {mounted && active > 0 ? (
        <span className="shrink-0 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
          {t("activeWorkflows", { count: active })}
        </span>
      ) : null}
    </div>
  );
}
