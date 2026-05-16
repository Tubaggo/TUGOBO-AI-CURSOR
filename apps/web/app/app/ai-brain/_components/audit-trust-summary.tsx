"use client";

import { FileSearch, Link2, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditEvent } from "@/lib/types/ai-brain";

type AuditTrustSummaryProps = {
  events: AuditEvent[];
  className?: string;
};

export function AuditTrustSummary({ events, className }: AuditTrustSummaryProps) {
  const overrides = events.filter((e) => e.humanOverride).length;
  const withPolicy = events.filter((e) => e.policyReferences.length > 0).length;
  const withChain = events.filter((e) => e.propagationTargets && e.propagationTargets.length > 0).length;
  const withRationale = events.filter((e) => e.rationale).length;

  const items = [
    {
      icon: Shield,
      label: "Policy-linked",
      value: withPolicy,
      hint: "Actions bound to guardrails",
    },
    {
      icon: Link2,
      label: "Propagation chains",
      value: withChain,
      hint: "Cross-module continuity",
    },
    {
      icon: FileSearch,
      label: "Reasoning visible",
      value: withRationale,
      hint: "Rationale on trace",
    },
    {
      icon: UserCog,
      label: "Human overrides",
      value: overrides,
      hint: "Supervisor authority logged",
    },
  ];

  return (
    <div className={cn("mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-xl border border-white/[0.07] bg-zinc-900/45 px-3 py-2.5 transition-colors hover:border-white/[0.1]"
        >
          <div className="flex items-center gap-2">
            <item.icon className="h-3.5 w-3.5 text-cyan-300/70" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/38">
              {item.label}
            </p>
          </div>
          <p className="mt-1 text-xl font-semibold tabular-nums text-white/88">{item.value}</p>
          <p className="mt-0.5 text-[10px] text-white/32">{item.hint}</p>
        </article>
      ))}
    </div>
  );
}
