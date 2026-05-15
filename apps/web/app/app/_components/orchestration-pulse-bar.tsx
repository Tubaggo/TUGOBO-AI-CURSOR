"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrchestrationPulseMetrics, useRuntimePulse } from "@/lib/runtime";

const STATUS_RING: Record<string, string> = {
  healthy: "border-emerald-500/25 bg-emerald-950/35 shadow-[0_0_20px_-6px_rgba(16,185,129,0.35)]",
  degraded: "border-amber-500/25 bg-amber-950/30 shadow-[0_0_18px_-6px_rgba(245,158,11,0.25)]",
  attention: "border-rose-500/25 bg-rose-950/30 shadow-[0_0_18px_-6px_rgba(244,63,94,0.22)]",
};

const STATUS_DOT: Record<string, string> = {
  healthy: "bg-emerald-400",
  degraded: "bg-amber-400",
  attention: "bg-rose-400",
};

const ROTATE_MS = 4200;

export function OrchestrationPulseBar() {
  const metrics = useOrchestrationPulseMetrics();
  const pulse = useRuntimePulse();
  const [focusIndex, setFocusIndex] = useState(0);

  const focusItems = metrics.focusItems;
  const currentFocus =
    focusItems[focusIndex % Math.max(focusItems.length, 1)]?.label ?? "Monitoring operations";

  useEffect(() => {
    if (focusItems.length <= 1) return;
    const id = window.setInterval(() => {
      setFocusIndex((i) => (i + 1) % focusItems.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [focusItems.length]);

  useEffect(() => {
    if (pulse > 0 && focusItems.length > 1) {
      setFocusIndex((i) => (i + 1) % focusItems.length);
    }
  }, [pulse, focusItems.length]);

  const ring = STATUS_RING[metrics.runtimeStatus] ?? STATUS_RING.healthy;
  const dot = STATUS_DOT[metrics.runtimeStatus] ?? STATUS_DOT.healthy;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span
        className={cn(
          "flex items-center gap-2 rounded-full border px-2.5 py-1.5 md:px-3",
          ring
        )}
        title="AI orchestration pulse"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-30",
              dot
            )}
          />
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", dot)} />
        </span>
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-300/90" aria-hidden />
        <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-emerald-100/95 sm:inline md:text-[11px]">
          AI Operations Live
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100/95 sm:hidden">
          AI live
        </span>
      </span>
      <span
        className="hidden max-w-[220px] flex-col gap-0.5 xl:flex 2xl:max-w-[280px]"
        key={`${focusIndex}-${pulse}`}
      >
        <span className="text-[9px] font-medium uppercase tracking-wider text-white/35">
          {metrics.activeOrchestrations} orchestrations · {metrics.escalationCount} escalations
        </span>
        <span className="truncate text-[10px] font-medium text-white/62 transition-opacity duration-500">
          {currentFocus}
        </span>
      </span>
    </div>
  );
}
