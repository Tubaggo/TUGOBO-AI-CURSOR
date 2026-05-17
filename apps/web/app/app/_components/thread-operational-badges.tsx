import type { ThreadOperationalFlags } from "@/lib/runtime/entities";
import { cn } from "@/lib/utils";

const BADGES: {
  key: keyof ThreadOperationalFlags;
  label: string;
  className: string;
}[] = [
  { key: "paymentRisk", label: "Payment risk", className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  { key: "recoveryActive", label: "Recovery active", className: "border-violet-500/25 bg-violet-500/10 text-violet-300" },
  { key: "humanTakeover", label: "Human takeover", className: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  { key: "vipEscalation", label: "VIP escalation", className: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  { key: "otaConversion", label: "OTA conversion", className: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300" },
  { key: "memoryAttached", label: "Memory attached", className: "border-violet-500/25 bg-violet-500/10 text-violet-300" },
  { key: "priorRiskDetected", label: "Prior risk", className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  { key: "vipHistory", label: "VIP history", className: "border-rose-500/25 bg-rose-500/10 text-rose-300" },
  { key: "directBookingCandidate", label: "Direct candidate", className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
];

export function ThreadOperationalBadges({ flags }: { flags: ThreadOperationalFlags }) {
  const active = BADGES.filter((b) => flags[b.key]);
  if (active.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {active.map((b) => (
        <span
          key={b.key}
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
            b.className
          )}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
