"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  TrendingUp,
  Banknote,
  Clock,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import {
  TUGOBO_SALES_DEMO_EVENT,
  type SalesDemoMetricsDetail,
} from "./sales-demo-scenario-engine";

type HeroMetricRow = {
  key: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  color: string;
  value: string;
  label: string;
  trend: string;
};

const INITIAL_ROWS: HeroMetricRow[] = [
  {
    key: "res",
    icon: CalendarCheck,
    iconBg: "bg-emerald-500/[0.10]",
    iconColor: "text-emerald-400",
    color: "text-emerald-400",
    value: "12",
    label: "Günlük rezervasyon",
    trend: "+3 dünden",
  },
  {
    key: "rev",
    icon: TrendingUp,
    iconBg: "bg-blue-500/[0.10]",
    iconColor: "text-blue-400",
    color: "text-blue-400",
    value: "₺68.400",
    label: "Direkt gelir",
    trend: "+₺9.200",
  },
  {
    key: "ota",
    icon: Banknote,
    iconBg: "bg-amber-500/[0.10]",
    iconColor: "text-amber-400",
    color: "text-amber-400",
    value: "₺10.260",
    label: "OTA tasarrufu",
    trend: "+₺1.380",
  },
  {
    key: "lat",
    icon: Clock,
    iconBg: "bg-violet-500/[0.10]",
    iconColor: "text-violet-400",
    color: "text-violet-400",
    value: "38 sn",
    label: "Ort. yanıt süresi",
    trend: "↓ 12 sn",
  },
  {
    key: "pending",
    icon: ClipboardCheck,
    iconBg: "bg-rose-500/[0.10]",
    iconColor: "text-rose-400",
    color: "text-rose-400",
    value: "3",
    label: "Bekleyen onay",
    trend: "2 ödeme",
  },
];

function applyDetail(rows: HeroMetricRow[], d: SalesDemoMetricsDetail): HeroMetricRow[] {
  return rows.map((r) => {
    if (r.key === "res") {
      return { ...r, value: d.reservationsToday, trend: d.reservationsTrend };
    }
    if (r.key === "rev") {
      return { ...r, value: d.directRevenue, trend: d.directRevenueTrend };
    }
    if (r.key === "ota") {
      return { ...r, value: d.otaSaved, trend: d.otaSavedTrend };
    }
    return r;
  });
}

/** Live-updating hero KPI strip (listens to sales demo completion on `/`). */
export function LandingHeroMetrics() {
  const [rows, setRows] = useState<HeroMetricRow[]>(INITIAL_ROWS);

  const onDemoMetrics = useCallback((ev: Event) => {
    const ce = ev as CustomEvent<SalesDemoMetricsDetail>;
    const d = ce.detail;
    if (!d || typeof d.seq !== "number") return;
    setRows((prev) => applyDetail(prev, d));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener(TUGOBO_SALES_DEMO_EVENT, onDemoMetrics);
    return () => window.removeEventListener(TUGOBO_SALES_DEMO_EVENT, onDemoMetrics);
  }, [onDemoMetrics]);

  return (
    <div className="grid grid-cols-2 border-b border-white/[0.06] bg-gradient-to-b from-zinc-950/90 to-zinc-950/70 sm:grid-cols-5">
      {rows.map((m) => (
        <div
          key={m.key}
          className="flex items-center gap-2 border-b border-white/[0.04] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-3.5 sm:py-3 sm:last:border-r-0"
        >
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${m.iconBg}`}>
            <m.icon className={`h-3 w-3 ${m.iconColor}`} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1">
              <span
                className={`text-[13px] font-bold tabular-nums transition-colors duration-500 sm:text-[14px] ${m.color}`}
              >
                {m.value}
              </span>
              <span className="text-[8px] text-emerald-400/55 sm:text-[9px]">↑ {m.trend}</span>
            </div>
            <p className="truncate text-[8px] text-white/32 sm:text-[9px]">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
