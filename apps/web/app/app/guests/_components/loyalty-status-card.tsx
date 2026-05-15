import { Award } from "lucide-react";
import type { Guest } from "@/lib/types/guests";
import { loyaltyTierLabel } from "./guest-formatters";

type LoyaltyStatusCardProps = {
  guest: Guest;
};

export function LoyaltyStatusCard({ guest }: LoyaltyStatusCardProps) {
  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <header className="mb-3 flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-300/80" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Loyalty profile</h3>
      </header>
      <p className="text-lg font-semibold text-amber-100/95">{loyaltyTierLabel(guest.loyaltyTier)}</p>
      <dl className="mt-3 space-y-2 text-[12px]">
        <div className="flex justify-between">
          <dt className="text-white/40">Completed stays</dt>
          <dd className="font-semibold tabular-nums text-white/80">{guest.totalStays}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">Direct ratio</dt>
          <dd className="font-semibold tabular-nums text-emerald-200/90">
            {Math.round(guest.directBookingRatio * 100)}%
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/40">Upsell potential</dt>
          <dd className="font-semibold tabular-nums text-violet-200/90">
            {Math.round(guest.upsellPotential * 100)}%
          </dd>
        </div>
      </dl>
    </section>
  );
}
