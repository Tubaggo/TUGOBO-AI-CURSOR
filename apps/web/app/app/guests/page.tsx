"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useOperationalRuntime, selectGuests, selectMounted } from "@/stores/operational-runtime";
import { formatEur } from "@/lib/operational/format";
import { FinancialAttributionBadge } from "../_components/financial-attribution-badge";
import { AIMemoryPanel } from "../_components/ai-memory-panel";
import { GuestIntelligenceStrip } from "../_components/guest-intelligence-strip";
import type { Guest } from "@/lib/runtime/entities";

export default function GuestsPage() {
  const mounted = useOperationalRuntime(selectMounted);
  const guests = useOperationalRuntime(selectGuests);
  return <GuestsPageContent mounted={mounted} guests={guests} />;
}

function GuestsPageContent({
  mounted,
  guests,
}: {
  mounted: boolean;
  guests: ReturnType<typeof selectGuests>;
}) {
  const t = useTranslations("guests");

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-7 max-w-[1100px]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">{t("eyebrow")}</p>
        <h1 className="text-xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-0.5 text-sm text-white/40">{t("description")}</p>
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {guests.map((g) => (
            <GuestCard key={g.id} guest={g} mounted={mounted} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GuestCard({ guest: g, mounted }: { guest: Guest; mounted: boolean }) {
  const t = useTranslations("guests");

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5 transition-colors hover:border-white/[0.10]">
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
              {t(`segments.${g.segment}` as "segments.standard")}
            </span>
          </div>
          <GuestIntelligenceStrip intelligence={g.intelligence} />
          <GuestMetrics guest={g} mounted={mounted} />
          <div className="mt-3">
            <AIMemoryPanel memory={g.memory} intelligence={g.intelligence} compact />
          </div>
          {g.lastAttribution ? (
            <div className="mt-3">
              <FinancialAttributionBadge attribution={g.lastAttribution} />
            </div>
          ) : null}
          <Link href="/app/conversations" className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300">
            {t("openConversation")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function GuestMetrics({ guest: g, mounted }: { guest: Guest; mounted: boolean }) {
  const t = useTranslations("guests.metrics");

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <Metric label={t("ltv")} value={mounted ? formatEur(g.lifetimeValueEur, true) : "—"} />
      <Metric
        label={t("aiInfluenced")}
        value={mounted ? formatEur(g.aiInfluencedRevenueEur, true) : "—"}
        accent
      />
      <Metric label={t("recoveries")} value={mounted ? String(g.recoveryCount) : "—"} />
      <Metric label={t("vipRescues")} value={mounted ? String(g.vipRescueCount) : "—"} accentRose />
      <Metric label={t("otaConversions")} value={mounted ? String(g.otaConversionCount) : "—"} accentCyan />
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  accentRose,
  accentCyan,
}: {
  label: string;
  value: string;
  accent?: boolean;
  accentRose?: boolean;
  accentCyan?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-white/30">{label}</p>
      <p
        className={`text-sm font-bold tabular-nums ${
          accent ? "text-emerald-400" : accentRose ? "text-rose-300" : accentCyan ? "text-cyan-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
