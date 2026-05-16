"use client";

import { useMemo, useState } from "react";
import type { AuditEvent, AuditSeverity } from "@/lib/types/ai-brain";
import { filterAuditPipeline, groupAuditTimeline } from "@/lib/runtime";
import { useAIRuntimeStore } from "@/lib/runtime";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { AuditTimeline } from "./audit-timeline";
import { AuditTrustSummary } from "./audit-trust-summary";

type AuditWorkspaceProps = {
  events: AuditEvent[];
};

const SEVERITY_FILTERS: Array<{ id: AuditSeverity | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "info", label: "Info" },
];

export function AuditWorkspace({ events: serverEvents }: AuditWorkspaceProps) {
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const storeEvents = useAIRuntimeStore((s) => s.auditEvents);
  const lastPulse = useAIRuntimeStore((s) => s.lastPulseAt);
  const events = hydrated ? storeEvents : serverEvents;

  const [severity, setSeverity] = useState<AuditSeverity | "all">("all");
  const [grouped, setGrouped] = useState(true);
  const [overrideOnly, setOverrideOnly] = useState(false);

  const filtered = useMemo(
    () =>
      filterAuditPipeline(events, {
        severity,
        humanOverrideOnly: overrideOnly,
      }),
    [events, severity, overrideOnly]
  );

  const groups = useMemo(() => groupAuditTimeline(filtered), [filtered]);

  return (
    <div
      className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8"
      data-runtime-pulse={lastPulse > 0 ? String(lastPulse) : undefined}
    >
      <AIBrainPageHeader
        eyebrow="AI Brain · Audit"
        title="AI operational trace system"
        description="Enterprise-grade trace — policy linkage, reasoning visibility, propagation chains, and human override authority on every operational mutation."
      />

      <AuditTrustSummary events={events} />

      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
          Severity
        </span>
        {SEVERITY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSeverity(f.id)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              severity === f.id
                ? "border-cyan-500/35 bg-cyan-500/15 text-cyan-100"
                : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:border-white/[0.12]"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-white/[0.08] sm:inline" aria-hidden />
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-white/45">
          <input
            type="checkbox"
            checked={grouped}
            onChange={(e) => setGrouped(e.target.checked)}
            className="rounded border-white/20 bg-black/40"
          />
          Grouped timelines
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-white/45">
          <input
            type="checkbox"
            checked={overrideOnly}
            onChange={(e) => setOverrideOnly(e.target.checked)}
            className="rounded border-white/20 bg-black/40"
          />
          Overrides only
        </label>
      </div>

      {grouped ? (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.dayKey}>
              <header className="mb-3 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-white/35">
                  {g.label}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] tabular-nums text-white/35">
                  {g.events.length} traces
                </span>
              </header>
              <AuditTimeline events={g.events} />
            </section>
          ))}
        </div>
      ) : (
        <AuditTimeline events={filtered} />
      )}
    </div>
  );
}
