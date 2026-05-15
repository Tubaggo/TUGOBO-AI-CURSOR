import { TrendingUp, Wallet } from "lucide-react";
import type { GuestRevenueProfile } from "@/lib/types/guests";
import { formatMoney } from "./guest-formatters";

type GuestRevenueCardProps = {
  profile: GuestRevenueProfile;
};

export function GuestRevenueCard({ profile }: GuestRevenueCardProps) {
  const directPct =
    profile.lifetimeValue > 0
      ? Math.round((profile.directSpend / profile.lifetimeValue) * 100)
      : 0;

  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <header className="mb-3 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-emerald-300/80" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Revenue intelligence</h3>
      </header>
      <p className="text-2xl font-semibold tabular-nums text-emerald-200/95">
        {formatMoney(profile.lifetimeValue)}
      </p>
      <p className="mt-0.5 text-[11px] text-white/40">Lifetime value · {directPct}% direct</p>
      <dl className="mt-4 space-y-2 text-[12px]">
        <Row label="Direct spend" value={formatMoney(profile.directSpend)} />
        <Row label="OTA spend" value={formatMoney(profile.otaSpend)} />
        <Row label="Upsell revenue" value={formatMoney(profile.upsellRevenue)} />
        <Row label="Avg booking" value={formatMoney(profile.averageBookingValue)} />
        <Row label="Seasonality" value={profile.seasonalFrequency} />
      </dl>
      <div className="mt-4 space-y-2 rounded-lg border border-white/[0.06] bg-black/20 p-3 text-[11px]">
        <p className="flex items-start gap-2 text-white/55">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/70" aria-hidden />
          <span>
            <span className="font-semibold text-white/70">Profitability: </span>
            {profile.profitabilityHint}
          </span>
        </p>
        <p className="text-white/45">
          <span className="font-semibold text-white/65">Retention: </span>
          {profile.retentionPotential}
        </p>
        {profile.recoveryOpportunity ? (
          <p className="text-amber-200/80">
            <span className="font-semibold">Recovery: </span>
            {profile.recoveryOpportunity}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-white/40">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-white/75">{value}</dd>
    </div>
  );
}
