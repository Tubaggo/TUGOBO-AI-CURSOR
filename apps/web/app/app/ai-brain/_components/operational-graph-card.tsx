"use client";

import Link from "next/link";
import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

type GraphNodeProps = {
  label: string;
  href?: string;
  tone?: "cyan" | "violet" | "amber";
};

function GraphNode({ label, href, tone = "cyan" }: GraphNodeProps) {
  const toneCls =
    tone === "violet"
      ? "border-violet-500/30 bg-violet-500/10 text-violet-100/90"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-100/90"
        : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100/90";

  const inner = (
    <span
      className={cn(
        "flex min-h-[2.25rem] items-center justify-center rounded-lg border px-2 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide",
        toneCls
      )}
    >
      {label}
    </span>
  );

  return href ? (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      {inner}
    </Link>
  ) : (
    inner
  );
}

type OperationalGraphCardProps = {
  pulse?: number;
  className?: string;
};

/** Compact relationship map — conversations, ops entities, AI, and audit trail. */
export function OperationalGraphCard({ pulse, className }: OperationalGraphCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4 transition-[border-color] duration-700",
        pulse && pulse > 0 ? "border-cyan-500/20" : "",
        className
      )}
      data-runtime-pulse={pulse && pulse > 0 ? String(pulse) : undefined}
    >
      <header className="mb-3 flex items-center gap-2">
        <CircleDot className="h-4 w-4 text-cyan-300/75" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Operational graph</h3>
      </header>
      <p className="mb-4 text-[11px] leading-relaxed text-white/38">
        Runtime wiring across messaging, inventory, guests, settlements, supervision, policy, and trace —
        every simulated signal flows through this lattice (local orchestration).
      </p>

      <div className="relative grid grid-cols-3 gap-x-2 gap-y-3">
        <GraphNode label="Conversation" href="/app/conversations" />
        <GraphNode label="Reservation" href="/app/reservations" tone="violet" />
        <GraphNode label="Guest" href="/app/guests" tone="amber" />

        <GraphNode label="Payment" tone="cyan" />
        <GraphNode label="Escalation" href="/app/ai-brain/escalations" tone="violet" />
        <GraphNode label="AI action" href="/app/ai-brain/actions" tone="amber" />

        <GraphNode label="Knowledge / policy" href="/app/ai-brain/knowledge" />
        <GraphNode label="AI Brain" href="/app/ai-brain" tone="violet" />
        <GraphNode label="Audit" href="/app/ai-brain/audit" tone="amber" />
      </div>

      <p className="mt-4 text-[10px] text-white/28">
        Links open the operational modules where this mock runtime propagates shared state.
      </p>
    </article>
  );
}
