"use client";

import { useOperationalRuntime, selectLastPropagation } from "@/stores/operational-runtime";
import { useMutationPulse } from "@/lib/runtime/hooks/use-mutation-pulse";

export function OperationalSyncBar() {
  const propagation = useOperationalRuntime(selectLastPropagation);
  const isLive = useMutationPulse(5000);

  if (!propagation && !isLive) return null;

  return (
    <div
      className={
        isLive
          ? "shrink-0 border-b border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-1.5"
          : "shrink-0 border-b border-white/[0.04] bg-zinc-900/80 px-4 py-1.5"
      }
    >
      <div className="flex items-center gap-2 text-[10px]">
        {isLive ? (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        ) : null}
        <span className={isLive ? "font-semibold text-emerald-400" : "text-white/40"}>
          {isLive ? "Operational graph sync" : "Runtime idle"}
        </span>
        {propagation ? (
          <span className="truncate text-white/35">· {propagation.summary}</span>
        ) : null}
      </div>
    </div>
  );
}
