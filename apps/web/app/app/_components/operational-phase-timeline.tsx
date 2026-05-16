"use client";

import { useMemo } from "react";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { RelativeTime } from "./relative-time";
import { Bot, RefreshCw, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types/conversations";
import {
  deriveOperationalTimeline,
  type OperationalTimelineLane,
  useAIRuntimeStore,
} from "@/lib/runtime";

const LANE_STYLE: Record<
  OperationalTimelineLane,
  { dot: string; label: string; icon: typeof Bot }
> = {
  ai: { dot: "bg-blue-400", label: "AI", icon: Bot },
  human: { dot: "bg-amber-400", label: "Human", icon: User },
  system: { dot: "bg-white/35", label: "System", icon: RefreshCw },
  recovery: { dot: "bg-emerald-400", label: "Recovery", icon: RefreshCw },
};

type OperationalPhaseTimelineProps = {
  conversation: Conversation;
  className?: string;
  limit?: number;
};

/** Operational memory — AI ↔ human transitions, escalation chronology, confidence shifts. */
export function OperationalPhaseTimeline({
  conversation,
  className,
  limit = 8,
}: OperationalPhaseTimelineProps) {
  const mounted = useClientMounted();
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const memory = useAIRuntimeStore((s) => s.aiActionMemory);
  const interventions = useAIRuntimeStore((s) => s.interventions);
  const staffAssignments = useAIRuntimeStore((s) => s.staffAssignments);
  const entries = useMemo(
    () =>
      deriveOperationalTimeline({
        conversation,
        memory,
        interventions,
        staffAssignments,
        limit,
      }),
    [conversation, memory, interventions, staffAssignments, limit]
  );

  if (!mounted || !hydrated || entries.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.07] bg-zinc-900/45 p-3",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        Operational phase timeline
      </p>
      <p className="mt-0.5 text-[10px] text-white/28">
        Stateful thread memory — handoffs, recovery, confidence propagation
      </p>
      <ol className="relative mt-3 space-y-0 border-l border-white/[0.08] pl-4">
        {entries.map((e, i) => {
          const lane = LANE_STYLE[e.lane];
          const Icon = lane.icon;
          return (
            <li
              key={e.id}
              className={cn(
                "relative pb-4 last:pb-0",
                i === 0 && "animate-tick-fade"
              )}
            >
              <span
                className={cn(
                  "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950",
                  lane.dot,
                  i === 0 && "animate-live-pulse"
                )}
                aria-hidden
              />
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3 w-3 shrink-0 text-white/35" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                      {lane.label}
                    </span>
                    <RelativeTime
                      iso={e.at}
                      className="text-[9px] tabular-nums text-white/28"
                    />
                    {e.confidenceHint ? (
                      <span className="rounded border border-white/[0.08] px-1 py-px text-[9px] text-cyan-200/55">
                        {e.confidenceHint}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-white/78">{e.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/38">{e.detail}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
