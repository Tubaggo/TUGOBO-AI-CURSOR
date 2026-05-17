"use client";

import type { PropagationCausalityStep } from "@/lib/runtime/conversation-runtime";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function PropagationCausalityStrip({ steps }: { steps: PropagationCausalityStep[] }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3">
      <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/28">
        How this unfolded
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((step, i) => (
          <span key={step.label} className="flex items-center gap-1">
            <span
              className={cn(
                "rounded border px-2 py-1 text-[9px] font-medium transition-colors",
                step.active
                  ? "border-cyan-500/25 bg-cyan-500/[0.08] text-cyan-200/90 runtime-causality-active"
                  : "border-white/[0.06] bg-transparent text-white/25"
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 ? (
              <ArrowRight className="h-3 w-3 shrink-0 text-cyan-500/30" aria-hidden />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
