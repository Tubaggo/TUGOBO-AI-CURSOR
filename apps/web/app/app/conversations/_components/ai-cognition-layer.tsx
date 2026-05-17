"use client";

import type { ReactNode } from "react";
import type { CognitionSnapshot } from "@/lib/runtime/conversation-runtime";
import { formatEur } from "@/lib/operational/format";
import { cn } from "@/lib/utils";
import { Brain, Banknote, Shield, Target, ChevronRight } from "lucide-react";

export function AiCognitionLayer({
  cognition,
  pulseActive,
}: {
  cognition: CognitionSnapshot;
  pulseActive?: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-[320px] shrink-0 flex-col border-l border-white/[0.04] bg-zinc-950/70",
        pulseActive && "runtime-cognition-glow"
      )}
    >
      <div className="shrink-0 border-b border-white/[0.04] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Operations brief
        </p>
        <p className="mt-1 text-[11px] text-white/32">What matters now · revenue · next step</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto conv-scroll px-4 py-4 space-y-3">
        <BriefModule icon={Target} title="What we're seeing">
          <p className="text-[12px] leading-relaxed text-white/62">{cognition.interpretation}</p>
        </BriefModule>

        <BriefModule icon={Banknote} title="Revenue picture">
          <dl className="space-y-2 text-[11px]">
            <Row label="Booking value" value={formatEur(cognition.financial.directValueEur)} />
            <Row label="OTA retention" value={formatEur(cognition.financial.otaOpportunityEur)} />
            <Row
              label="Close confidence"
              value={`${cognition.financial.revenueConfidence}%`}
              highlight
            />
          </dl>
        </BriefModule>

        <BriefModule icon={Shield} title="Escalation check">
          <p className="text-[12px] text-white/58">
            {cognition.escalation.humanRequired
              ? "Staff is leading this conversation."
              : "No staff takeover needed yet."}
          </p>
          <dl className="mt-2 space-y-1.5 text-[11px]">
            <Row label="Recovery confidence" value={`${cognition.escalation.recoveryConfidence}%`} />
            <Row
              label="Escalation risk"
              value={cognition.escalation.escalationProbability}
              tone={
                cognition.escalation.escalationProbability === "Critical" ||
                cognition.escalation.escalationProbability === "High"
                  ? "risk"
                  : "default"
              }
            />
          </dl>
        </BriefModule>

        <BriefModule icon={Brain} title="Guest history">
          {cognition.memoryBullets.length > 0 ? (
            <ul className="space-y-1.5">
              {cognition.memoryBullets.map((b) => (
                <li key={b} className="flex gap-2 text-[11px] leading-relaxed text-white/48">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400/80" />
                  {b}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-white/35">No prior stay notes on file.</p>
          )}
        </BriefModule>

        <BriefModule icon={ChevronRight} title="Suggested next step" highlight>
          <p className="text-[12px] font-medium leading-relaxed text-cyan-100/85">
            {cognition.recommendedAction}
          </p>
        </BriefModule>
      </div>
    </aside>
  );
}

function BriefModule({
  icon: Icon,
  title,
  highlight,
  children,
}: {
  icon: typeof Brain;
  title: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3",
        highlight && "border-cyan-500/20 bg-cyan-500/[0.03]"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3 w-3 text-white/35" />
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/35">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  tone = "default",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "default" | "risk";
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-white/35">{label}</dt>
      <dd
        className={cn(
          "font-semibold tabular-nums",
          tone === "risk" ? "text-rose-300/90" : highlight ? "text-emerald-300/90" : "text-white/75"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
