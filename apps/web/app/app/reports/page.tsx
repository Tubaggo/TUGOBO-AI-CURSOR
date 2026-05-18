"use client";

import Link from "next/link";
import {
  useOperationalRuntime,
  selectMounted,
  selectRevenueMetrics,
  selectAiImpact,
  selectOtaMetrics,
} from "@/stores/operational-runtime";
import { OperationalPageHeader } from "../_components/operational-page-header";
import { formatEur, formatPct } from "@/lib/operational/format";
import { BarChart3, TrendingUp, PiggyBank, Bot, CalendarCheck } from "lucide-react";

export default function ReportsPage() {
  const mounted = useOperationalRuntime(selectMounted);
  const m = useOperationalRuntime(selectRevenueMetrics);
  const ai = useOperationalRuntime(selectAiImpact);
  const ota = useOperationalRuntime(selectOtaMetrics);
  const dash = "—";

  const rows = [
    { label: "Direct revenue (AI-influenced)", value: mounted ? formatEur(m.aiInfluencedRevenue, true) : dash },
    { label: "Revenue recovered today", value: mounted ? formatEur(m.revenueRecoveredToday, true) : dash },
    { label: "OTA commission avoided", value: mounted ? formatEur(m.otaCommissionAvoided) : dash },
    { label: "Payment recovery revenue", value: mounted ? formatEur(m.paymentRecoveryRevenue) : dash },
    { label: "Upsell revenue", value: mounted ? formatEur(m.upsellRevenueGenerated) : dash },
    { label: "Revenue at risk", value: mounted ? formatEur(m.revenueAtRisk) : dash },
    { label: "Recovery success rate", value: mounted ? formatPct(m.recoverySuccessRate) : dash },
    { label: "AI close rate", value: mounted ? formatPct(ai.aiCloseRate) : dash },
    { label: "Autonomous resolution", value: mounted ? formatPct(ai.autonomousResolutionPct) : dash },
    { label: "Direct conversion rate", value: mounted ? formatPct(ota.directConversionRate) : dash },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-[900px] p-7">
        <OperationalPageHeader
          eyebrow="Reports"
          title="Operations & revenue reports"
          description="Weekly performance snapshot — direct bookings, AI contribution, and operational outcomes."
          accent="emerald"
          live={false}
          actions={
            <Link
              href="/app/overview"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/55 hover:text-white/80"
            >
              Full overview →
            </Link>
          }
        />

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <ReportTile icon={TrendingUp} label="Direct revenue" value={mounted ? formatEur(m.directBookingConversionValue, true) : dash} />
          <ReportTile icon={PiggyBank} label="OTA savings" value={mounted ? formatEur(m.otaCommissionAvoided) : dash} />
          <ReportTile icon={Bot} label="AI influenced" value={mounted ? formatEur(m.aiInfluencedRevenue, true) : dash} />
          <ReportTile icon={CalendarCheck} label="Recovery rate" value={mounted ? formatPct(m.recoverySuccessRate) : dash} />
        </div>

        <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-4">
            <BarChart3 className="h-4 w-4 text-emerald-400/80" />
            <h2 className="text-sm font-semibold text-white">Performance summary</h2>
          </div>
          <dl className="divide-y divide-white/[0.04]">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-sm text-white/45">{row.label}</dt>
                <dd className="text-sm font-bold tabular-nums text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

function ReportTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-4">
      <Icon className="mb-2 h-4 w-4 text-emerald-400/80" />
      <p className="text-xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-white/38">{label}</p>
    </div>
  );
}
