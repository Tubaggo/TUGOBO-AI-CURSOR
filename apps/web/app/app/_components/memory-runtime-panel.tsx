"use client";

import { useTranslations } from "next-intl";
import type { GuestIntelligence, GuestMemory } from "@/lib/runtime/entities";
import { memoryToRuntimeEvents } from "@/lib/runtime/graph/memory-events";
import { useMutationPulse } from "@/lib/runtime/hooks/use-mutation-pulse";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";

const VARIANT_STYLES = {
  updated: "border-violet-500/15 text-violet-300/90",
  pattern: "border-cyan-500/15 text-cyan-300/90",
  confidence: "border-blue-500/15 text-blue-300/90",
  escalation: "border-amber-500/15 text-amber-300/90",
  recovery: "border-emerald-500/15 text-emerald-300/90",
  preference: "border-white/10 text-white/55",
} as const;

export function MemoryRuntimePanel({
  memory,
  intelligence,
}: {
  memory: GuestMemory;
  intelligence: GuestIntelligence;
}) {
  const t = useTranslations("guests");
  const events = memoryToRuntimeEvents(memory, intelligence);
  const isLive = useMutationPulse(4000);

  if (events.length === 0) return null;

  return (
    <div
      className={cn(
        "border-t border-violet-500/10 pt-4",
        isLive && "shadow-[inset_0_1px_0_0_rgba(167,139,250,0.15)]"
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-violet-400" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-400/90">
          {t("memoryTitle")}
        </p>
        {isLive ? (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-violet-400">
            <span className="h-1 w-1 animate-pulse rounded-full bg-violet-400" />
            {t("memoryLive")}
          </span>
        ) : null}
      </div>
      <ul className="space-y-2">
        {events.map((ev) => (
          <li
            key={ev.id}
            className={cn(
              "rounded-md border bg-violet-500/[0.03] px-3 py-2 transition-colors",
              VARIANT_STYLES[ev.variant]
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{ev.label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{ev.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AIMemoryPanel({
  memory,
  intelligence,
  compact: _compact,
}: {
  memory: GuestMemory;
  intelligence?: GuestIntelligence;
  compact?: boolean;
}) {
  const intel =
    intelligence ??
    ({
      orchestrationRiskLevel: "low",
      aiConfidenceScore: 75,
      recoverySuccessRatio: 70,
      loyaltyProbability: 60,
      directBookingPotential: 50,
      operationalStatus: "İzleniyor",
      memoryAttached: true,
    } satisfies GuestIntelligence);

  return <MemoryRuntimePanel memory={memory} intelligence={intel} />;
}
