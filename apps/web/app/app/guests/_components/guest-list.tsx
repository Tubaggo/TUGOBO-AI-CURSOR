"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Crown,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guest, GuestIntelligenceMetrics, GuestIntelligenceSegment } from "@/lib/types/guests";
import { GUEST_INTELLIGENCE_SEGMENTS } from "@/lib/types/guests";
import { getGuests } from "@/lib/data/guests";
import { useAIRuntimeStore } from "@/lib/runtime";
import { GuestTable } from "./guest-table";

type GuestListProps = {
  initialGuests: Guest[];
  metrics: GuestIntelligenceMetrics;
};

const SEGMENT_LABELS: Record<GuestIntelligenceSegment, string> = {
  all: "All guests",
  vip: "VIP guests",
  high_spend: "High spend",
  returning: "Returning",
  ota_recovery: "OTA recovery",
  cancellation_risk: "Cancellation risk",
  upgrade_likely: "Upgrade likely",
  arabic_speaking: "Arabic speaking",
  long_stay: "Long stay",
  direct_loyalist: "Direct loyalists",
  late_responder: "Late responders",
  upsell_target: "Upsell targets",
};

export function GuestList({ initialGuests, metrics }: GuestListProps) {
  const [segment, setSegment] = useState<GuestIntelligenceSegment>("all");
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const storeGuests = useAIRuntimeStore((s) => s.guests);
  const lastPulse = useAIRuntimeStore((s) => s.lastPulseAt);
  const baseGuests = hydrated ? storeGuests : initialGuests;

  const guests = useMemo(() => {
    if (segment === "all") return baseGuests;
    return getGuests(segment).map((g) => baseGuests.find((b) => b.id === g.id) ?? g);
  }, [segment, baseGuests]);

  return (
    <div
      className="mx-auto flex max-w-[1600px] flex-col px-4 py-6 md:px-6 md:py-8"
      data-runtime-pulse={lastPulse > 0 ? String(lastPulse) : undefined}
    >
      <header className="mb-6 border-b border-white/[0.07] pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/85">
          Guest intelligence
        </p>
        <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
              Operational guest memory
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/42">
              AI-enriched guest graph — behavioral signals, revenue context, and reservation-aware
              segments. Not a contact list; living operational memory for every relationship.
            </p>
          </div>
          <p className="text-[11px] text-white/30">
            {metrics.totalGuests} profiles · as of{" "}
            {new Date(metrics.asOfIso).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Repeat guests"
          value={`${metrics.repeatGuestPct}%`}
          hint="Guests with 2+ completed stays"
          icon={RefreshCcw}
          tone="violet"
        />
        <MetricCard
          label="VIP guests"
          value={String(metrics.vipGuests)}
          hint="VIP tier or tagged"
          icon={Crown}
          tone="amber"
        />
        <MetricCard
          label="OTA recovery"
          value={String(metrics.otaRecoveryGuests)}
          hint="Active recovery playbooks"
          icon={TrendingUp}
          tone="emerald"
        />
        <MetricCard
          label="Upsell potential"
          value={String(metrics.highUpsellPotential)}
          hint="AI score ≥ 70% propensity"
          icon={Sparkles}
          tone="blue"
        />
        <MetricCard
          label="At-risk"
          value={String(metrics.atRiskGuests)}
          hint="Payment, cancellation, or stay risk"
          icon={AlertTriangle}
          tone="rose"
        />
      </section>

      <section className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-300/80" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Intelligence segments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GUEST_INTELLIGENCE_SEGMENTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSegment(s)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                segment === s
                  ? "border-violet-500/35 bg-violet-500/15 text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/[0.12] hover:text-white/70"
              )}
            >
              {SEGMENT_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-white/40" aria-hidden />
            <p className="text-sm font-semibold text-white/70">
              {guests.length} guest{guests.length === 1 ? "" : "s"}
              {segment !== "all" ? ` · ${SEGMENT_LABELS[segment]}` : ""}
            </p>
          </div>
        </div>
        <GuestTable guests={guests} />
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  tone: "violet" | "amber" | "emerald" | "blue" | "rose";
}) {
  const toneClasses = {
    violet: "border-white/[0.07] bg-gradient-to-br from-zinc-900/80 to-zinc-950/90",
    amber: "border-amber-500/20 bg-amber-500/[0.06] ring-amber-500/10",
    emerald: "border-emerald-500/20 bg-emerald-500/[0.06] ring-emerald-500/10",
    blue: "border-blue-500/20 bg-blue-500/[0.06] ring-blue-500/10",
    rose: "border-rose-500/20 bg-rose-500/[0.06] ring-rose-500/10",
  };
  const iconClasses = {
    violet: "text-violet-300/75",
    amber: "text-amber-300/80",
    emerald: "text-emerald-300/80",
    blue: "text-blue-300/85",
    rose: "text-rose-300/85",
  };
  return (
    <div className={cn("rounded-xl border p-4 ring-1 ring-white/[0.03]", toneClasses[tone])}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/38">{label}</p>
        <Icon className={cn("h-4 w-4", iconClasses[tone])} aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs text-white/36">{hint}</p>
    </div>
  );
}
