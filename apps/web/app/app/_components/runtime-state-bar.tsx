"use client";

import { useTranslations } from "next-intl";
import {
  useOperationalRuntime,
  selectRevenueMetrics,
  selectMounted,
  selectConversations,
  selectReservations,
} from "@/stores/operational-runtime";
import { formatEur } from "@/lib/operational/format";
import { cn } from "@/lib/utils";
import { CalendarCheck, PiggyBank, Zap, ClipboardList, ShieldCheck } from "lucide-react";

export function RuntimeStateBar() {
  const t = useTranslations("runtimeBar");
  const mounted = useOperationalRuntime(selectMounted);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const conversations = useOperationalRuntime(selectConversations);
  const reservations = useOperationalRuntime(selectReservations);

  const activeOps = conversations.filter((c) => c.status !== "resolved").length;
  const pendingApprovals = reservations.filter(
    (r) =>
      r.currentStage === "payment_pending" ||
      r.currentStage === "payment_risk" ||
      r.currentStage === "quote"
  ).length;

  const kpis = [
    {
      icon: CalendarCheck,
      label: t("directRevenue"),
      value: mounted ? formatEur(metrics.aiInfluencedRevenue, true) : "—",
      color: "text-emerald-400",
    },
    {
      icon: PiggyBank,
      label: t("otaSavings"),
      value: mounted ? formatEur(metrics.otaCommissionAvoided) : "—",
      color: "text-amber-400",
    },
    {
      icon: Zap,
      label: t("avgResponse"),
      value: mounted ? "38 sn" : "—",
      color: "text-violet-400",
    },
    {
      icon: ClipboardList,
      label: t("activeOps"),
      value: mounted ? String(activeOps) : "—",
      color: "text-blue-400",
    },
    {
      icon: ShieldCheck,
      label: t("waitingApprovals"),
      value: mounted ? String(pendingApprovals) : "—",
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-white/[0.05] bg-zinc-950/92 px-5 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon className={cn("h-3.5 w-3.5 opacity-80", color)} />
            <div>
              <p className="text-[9px] font-medium uppercase tracking-wider text-white/28">{label}</p>
              <p className={cn("text-sm font-bold tabular-nums text-white/90", color)}>{value}</p>
            </div>
          </div>
        ))}
        {mounted ? (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {t("liveOperations")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
