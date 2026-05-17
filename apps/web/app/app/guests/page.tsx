"use client";

import Link from "next/link";
import { useOperationalRuntime, selectGuests, selectMounted } from "@/stores/operational-runtime";
import { formatEur } from "@/lib/operational/format";
import { FinancialAttributionBadge } from "../_components/financial-attribution-badge";
import { AIMemoryPanel } from "../_components/ai-memory-panel";
import { GuestIntelligenceStrip } from "../_components/guest-intelligence-strip";

const SEGMENT_LABELS = {
  standard: "Standard",
  vip: "VIP",
  ota_origin: "OTA origin",
} as const;

export default function GuestsPage() {
  const mounted = useOperationalRuntime(selectMounted);
  const guests = useOperationalRuntime(selectGuests);

  return (
    <MotionGuestsPage mounted={mounted} guests={guests} />
  );
}

function MotionGuestsPage({
  mounted,
  guests,
}: {
  mounted: boolean;
  guests: ReturnType<typeof selectGuests>;
}) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-7 max-w-[1100px]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">Guest intelligence</p>
        <h1 className="text-xl font-semibold text-white">Revenue-attributed guest profiles</h1>
        <p className="mt-0.5 text-sm text-white/40">
          AI memory, orchestration risk, and revenue intelligence per guest — connected operational graph
        </p>
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {guests.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5 hover:border-white/[0.10] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${g.avatarColor}`}
                >
                  {g.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">{g.name}</h2>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/45">
                      {SEGMENT_LABELS[g.segment]}
                    </span>
                  </div>
                  <GuestIntelligenceStrip intelligence={g.intelligence} />
                  <MotionGuestMetrics mounted={mounted} guest={g} />
                  <div className="mt-3">
                    <AIMemoryPanel memory={g.memory} intelligence={g.intelligence} compact />
                  </div>
                  {g.lastAttribution ? (
                    <MotionGuestAttribution attribution={g.lastAttribution} />
                  ) : null}
                  <Link
                    href="/app/conversations"
                    className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300"
                  >
                    Open orchestration →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MotionGuestMetrics({
  mounted,
  guest: g,
}: {
  mounted: boolean;
  guest: ReturnType<typeof selectGuests>[number];
}) {
  return (
    <MotionGuestMetricsGrid mounted={mounted} guest={g} />
  );
}

function MotionGuestMetricsGrid({
  mounted,
  guest: g,
}: {
  mounted: boolean;
  guest: ReturnType<typeof selectGuests>[number];
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div>
        <p className="text-[10px] text-white/30">LTV</p>
        <p className="text-sm font-bold tabular-nums text-white">
          {mounted ? formatEur(g.lifetimeValueEur, true) : "—"}
        </p>
      </div>
      <div>
        <p className="text-[10px] text-white/30">AI influenced</p>
        <p className="text-sm font-bold tabular-nums text-emerald-400">
          {mounted ? formatEur(g.aiInfluencedRevenueEur, true) : "—"}
        </p>
      </div>
      <div>
        <p className="text-[10px] text-white/30">Recoveries</p>
        <p className="text-sm font-bold tabular-nums text-white">{mounted ? g.recoveryCount : "—"}</p>
      </div>
      <div>
        <p className="text-[10px] text-white/30">VIP rescues</p>
        <p className="text-sm font-bold tabular-nums text-rose-300">{mounted ? g.vipRescueCount : "—"}</p>
      </div>
      <div>
        <p className="text-[10px] text-white/30">OTA conversions</p>
        <p className="text-sm font-bold tabular-nums text-cyan-300">{mounted ? g.otaConversionCount : "—"}</p>
      </div>
    </div>
  );
}

function MotionGuestAttribution({
  attribution,
}: {
  attribution: NonNullable<ReturnType<typeof selectGuests>[number]["lastAttribution"]>;
}) {
  return (
    <div className="mt-3">
      <FinancialAttributionBadge attribution={attribution} />
    </div>
  );
}
