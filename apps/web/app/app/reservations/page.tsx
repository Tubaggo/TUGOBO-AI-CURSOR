"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { useOperationalRuntime, selectReservations, selectRevenueMetrics, selectMounted } from "@/stores/operational-runtime";
import { formatEur } from "@/lib/operational/format";
import { RevenueTimeline } from "../_components/revenue-timeline";
import { FinancialAttributionBadge } from "../_components/financial-attribution-badge";
import type { RevenueLifecycleStage } from "@/lib/operational/types";
import { cn } from "@/lib/utils";

const STAGE_TABS: { id: "all" | RevenueLifecycleStage; label: string }[] = [
  { id: "all", label: "All stages" },
  { id: "inquiry", label: "Inquiry" },
  { id: "quote", label: "Quote" },
  { id: "payment_pending", label: "Payment pending" },
  { id: "payment_risk", label: "Payment risk" },
  { id: "recovery", label: "Recovery" },
  { id: "confirmation", label: "Confirmed" },
  { id: "upsell", label: "Upsell" },
];

export default function ReservationsPage() {
  const mounted = useOperationalRuntime(selectMounted);
  const reservations = useOperationalRuntime(selectReservations);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const [tab, setTab] = useState<"all" | RevenueLifecycleStage>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(reservations[1]?.id ?? null);

  const filtered = reservations.filter((r) => {
    const matchTab = tab === "all" || r.currentStage === tab;
    const matchSearch =
      !search ||
      r.guest.toLowerCase().includes(search.toLowerCase()) ||
      r.room.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">Booking pipeline</p>
        <h1 className="text-xl font-semibold text-white">Revenue lifecycle operations</h1>
        <p className="mt-0.5 text-sm text-white/40">
          Inquiry → retention with financial impact, AI interventions, and human overrides at each stage
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard label="AI generated" value={mounted ? formatEur(metrics.aiGeneratedRevenue, true) : "—"} />
          <SummaryCard label="At risk" value={mounted ? formatEur(metrics.revenueAtRisk) : "—"} />
          <SummaryCard label="Recovered today" value={mounted ? formatEur(metrics.revenueRecoveredToday, true) : "—"} />
          <SummaryCard label="Direct conversion" value={mounted ? formatEur(metrics.directBookingConversionValue, true) : "—"} />
        </div>
        <div className="mt-7 overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900">
          <div className="flex flex-col gap-3 border-b border-white/[0.05] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {STAGE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    tab === t.id ? "bg-white/[0.08] text-white" : "text-white/40 hover:bg-white/[0.04]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-48 rounded-lg border border-white/[0.07] bg-white/[0.05] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>
          <MotionReservationsList
            filtered={filtered}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        </div>
        <p className="mt-4 text-center text-[11px] text-white/25">
          <Link href="/app/overview" className="text-blue-400 hover:text-blue-300">
            Revenue command
          </Link>
          {" · financial state propagates on every operational mutation"}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-4">
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/40">{label}</p>
    </div>
  );
}

function MotionReservationsList({
  filtered,
  expandedId,
  setExpandedId,
}: {
  filtered: ReturnType<typeof selectReservations>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  return (
    <div className="divide-y divide-white/[0.04]">
      {filtered.map((r) => (
        <div key={r.id}>
          <button
            type="button"
            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
            className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-white/25 transition-transform",
                  expandedId === r.id && "rotate-90"
                )}
              />
              <div>
                <p className="text-sm font-medium text-white/90">{r.guest}</p>
                <p className="text-xs text-white/40">
                  {r.room} · {r.checkIn} – {r.checkOut} · {r.channel}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-0">
              <StagePill stage={r.currentStage} />
              <span className="text-sm font-bold tabular-nums text-white">{formatEur(r.bookingValueEur)}</span>
              {r.revenueAtRiskEur > 0 ? (
                <span className="text-[10px] font-semibold text-amber-400">Risk {formatEur(r.revenueAtRiskEur)}</span>
              ) : null}
            </div>
          </button>
          {expandedId === r.id ? (
            <div className="border-t border-white/[0.04] bg-white/[0.01] px-5 py-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/28">
                Revenue timeline · financial deltas
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {r.attributions.map((a) => (
                  <FinancialAttributionBadge key={`${a.kind}-${a.label}`} attribution={a} />
                ))}
              </div>
              <RevenueTimeline events={r.timeline} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StagePill({ stage }: { stage: RevenueLifecycleStage }) {
  const colors: Partial<Record<RevenueLifecycleStage, string>> = {
    payment_risk: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    recovery: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    confirmation: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
        colors[stage] ?? "border-white/[0.08] bg-white/[0.05] text-white/50"
      )}
    >
      {stage.replace(/_/g, " ")}
    </span>
  );
}
