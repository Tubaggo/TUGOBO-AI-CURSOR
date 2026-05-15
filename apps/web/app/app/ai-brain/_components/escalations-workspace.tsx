"use client";

import { useState } from "react";
import type { EscalationEvent } from "@/lib/types/ai-brain";
import { useAIRuntimeStore } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { EscalationFeed } from "./escalation-feed";

type EscalationsWorkspaceProps = {
  all: EscalationEvent[];
};

type Filter = "all" | "active" | "unresolved";

export function EscalationsWorkspace({ all: serverAll }: EscalationsWorkspaceProps) {
  const [filter, setFilter] = useState<Filter>("active");
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const storeEscalations = useAIRuntimeStore((s) => s.escalations);
  const lastPulse = useAIRuntimeStore((s) => s.lastPulseAt);
  const all = hydrated ? storeEscalations : serverAll;

  const events = filter === "all" ? all : all.filter((e) => !e.resolved);

  return (
    <div
      className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8"
      data-runtime-pulse={lastPulse > 0 ? String(lastPulse) : undefined}
    >
      <AIBrainPageHeader
        eyebrow="AI Brain · Escalations"
        title="AI safety & operational supervision"
        description="Active escalations, confidence drops, payment conflicts, and human takeover logs — linked to conversations and reservations."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["active", "unresolved", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors",
              filter === f
                ? "border-rose-500/35 bg-rose-500/12 text-white"
                : "border-white/[0.08] text-white/45 hover:text-white/70"
            )}
          >
            {f === "unresolved" ? "Unresolved" : f}
          </button>
        ))}
      </div>
      <EscalationFeed events={events} />
    </div>
  );
}
