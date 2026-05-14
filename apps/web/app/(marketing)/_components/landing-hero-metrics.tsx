"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  TrendingUp,
  Banknote,
  Clock,
  ShieldCheck,
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
    value: "47",
    label: "Bugün kapanan rezervasyon",
    trend: "+12 dünden",
  },
  {
    key: "rev",
    icon: TrendingUp,
    iconBg: "bg-blue-500/[0.10]",
    iconColor: "text-blue-400",
    color: "text-blue-400",
    value: "₺68.400",
    label: "Doğrudan kanal geliri",
    trend: "+₺9.200 geçen hafta",
  },
  {
    key: "ota",
    icon: Banknote,
    iconBg: "bg-amber-500/[0.10]",
    iconColor: "text-amber-400",
    color: "text-amber-400",
    value: "₺10.260",
    label: "OTA komisyonu önlendi",
    trend: "+₺1.380 bu hafta",
  },
  {
    key: "lat",
    icon: Clock,
    iconBg: "bg-violet-500/[0.10]",
    iconColor: "text-violet-400",
    color: "text-violet-400",
    value: "38s",
    label: "Ort. yanıt süresi",
    trend: "↓ 12sn hızlı",
  },
  {
    key: "loss",
    icon: ShieldCheck,
    iconBg: "bg-cyan-500/[0.10]",
    iconColor: "text-cyan-400",
    color: "text-cyan-400",
    value: "183",
    label: "Önlenen kayıp",
    trend: "100% yakalama",
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

/** Live-updating hero metrics strip (listens to sales demo completion on `/`). */
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
    <div className="grid grid-cols-5 border-b border-white/[0.06] bg-zinc-950/60">
      {rows.map((m) => (
        <div
          key={m.key}
          className="flex items-center gap-2.5 px-4 py-3 border-r border-white/[0.04] last:border-r-0"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.iconBg}`}>
            <m.icon className={`w-3 h-3 ${m.iconColor}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span
                className={`text-[14px] font-bold tabular-nums transition-colors duration-500 ${m.color}`}
              >
                {m.value}
              </span>
              <span className="text-[9px] text-emerald-400/50">↑ {m.trend}</span>
            </div>
            <p className="text-[9px] text-white/30 truncate">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
