"use client";

import { ArrowRightLeft, Percent, Wallet, Users } from "lucide-react";
import { useOperationalRuntime, selectOtaMetrics, selectMounted } from "@/stores/operational-runtime";
import { formatEur, formatPct } from "@/lib/operational/format";

export function OtaRecoveryPanel() {
  const mounted = useOperationalRuntime(selectMounted);
  const ota = useOperationalRuntime(selectOtaMetrics);

  const items = [
    {
      label: "OTA leakage",
      value: mounted ? formatPct(ota.otaLeakagePct) : "—",
      sub: "bookings via OTA channel",
      icon: Percent,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Direct conversion rate",
      value: mounted ? formatPct(ota.directConversionRate) : "—",
      sub: "OTA guest → direct",
      icon: ArrowRightLeft,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Commission recovered",
      value: mounted ? formatEur(ota.recoveredCommissionSavings, true) : "—",
      sub: "rolling period",
      icon: Wallet,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Loyalty conversions",
      value: mounted ? String(ota.loyaltyConversions) : "—",
      sub: "post-recovery enrollments",
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
      <MotionOtaRecoveryHeader active={ota.activeRecoveryWorkflows} mounted={mounted} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="text-sm font-bold tabular-nums text-white">{item.value}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{item.label}</p>
            <p className="text-[9px] text-white/22">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MotionOtaRecoveryHeader({ active, mounted }: { active: number; mounted: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/28">OTA recovery intelligence</p>
        <h3 className="text-sm font-semibold text-white mt-0.5">Commission avoidance & direct shift</h3>
      </div>
      {mounted && active > 0 ? (
        <span className="shrink-0 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
          {active} active workflows
        </span>
      ) : null}
    </div>
  );
}
