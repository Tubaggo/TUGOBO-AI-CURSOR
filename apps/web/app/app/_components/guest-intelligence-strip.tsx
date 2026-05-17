import type { Guest, GuestIntelligence } from "@/lib/runtime/entities";
import { cn } from "@/lib/utils";

const RISK_COLORS: Record<GuestIntelligence["orchestrationRiskLevel"], string> = {
  low: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  medium: "text-amber-300 border-amber-500/25 bg-amber-500/10",
  high: "text-orange-300 border-orange-500/25 bg-orange-500/10",
  critical: "text-rose-300 border-rose-500/25 bg-rose-500/10",
};

export function GuestIntelligenceStrip({
  intelligence,
  compact = false,
}: {
  intelligence: GuestIntelligence;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact ? "mt-2" : "mt-3")}>
      <Chip
        label={`Risk · ${intelligence.orchestrationRiskLevel}`}
        className={RISK_COLORS[intelligence.orchestrationRiskLevel]}
      />
      <Chip label={`AI ${intelligence.aiConfidenceScore}%`} className="text-blue-300 border-blue-500/25 bg-blue-500/10" />
      <Chip
        label={`Recovery ${intelligence.recoverySuccessRatio}%`}
        className="text-violet-300 border-violet-500/25 bg-violet-500/10"
      />
      {intelligence.memoryAttached ? (
        <Chip label="Memory attached" className="text-violet-300 border-violet-500/25 bg-violet-500/10" />
      ) : null}
      {!compact ? (
        <>
          <Chip
            label={`Loyalty ${intelligence.loyaltyProbability}%`}
            className="text-white/50 border-white/10 bg-white/[0.04]"
          />
          <Chip
            label={`Direct ${intelligence.directBookingPotential}%`}
            className="text-cyan-300 border-cyan-500/25 bg-cyan-500/10"
          />
        </>
      ) : null}
      <span className="w-full text-[10px] text-white/35 sm:w-auto sm:ml-auto">
        {intelligence.operationalStatus}
      </span>
    </div>
  );
}

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        className
      )}
    >
      {label}
    </span>
  );
}

export function GuestIntelligenceStripFromGuest({ guest }: { guest: Guest }) {
  return <GuestIntelligenceStrip intelligence={guest.intelligence} />;
}
