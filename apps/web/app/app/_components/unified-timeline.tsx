import type { UnifiedTimelineEntry } from "@/lib/runtime/entities";
import { NODE_LABELS } from "@/lib/runtime/graph/propagation";
import { formatEur } from "@/lib/operational/format";
import { cn } from "@/lib/utils";

export function UnifiedOperationalTimeline({
  entries,
  limit = 6,
  compact = false,
}: {
  entries: UnifiedTimelineEntry[];
  limit?: number;
  compact?: boolean;
}) {
  const slice = entries.slice(0, limit);
  if (slice.length === 0) return null;

  return (
    <div className="relative pl-1">
      {slice.map((entry, i) => (
        <TimelineRow key={entry.id} entry={entry} isLast={i === slice.length - 1} compact={compact} />
      ))}
    </div>
  );
}

function TimelineRow({
  entry,
  isLast,
  compact,
}: {
  entry: UnifiedTimelineEntry;
  isLast: boolean;
  compact: boolean;
}) {
  const dotColors: Record<UnifiedTimelineEntry["actor"], string> = {
    ai: "bg-blue-500/20 border-blue-500/30 shadow-[0_0_10px_-4px_rgba(96,165,250,0.4)]",
    human: "bg-rose-500/20 border-rose-500/30",
    guest: "bg-violet-500/20 border-violet-500/30",
    system: "bg-amber-500/15 border-amber-500/25",
  };

  return (
    <div className={cn("animate-tick-fade", !isLast && "group")}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={cn("h-2 w-2 shrink-0 rounded-full border", dotColors[entry.actor])} />
          {!isLast ? (
            <div
              className="runtime-causal-line my-1.5 min-h-[18px] w-px flex-1 animate-runtime-causal-pulse"
              aria-hidden
            />
          ) : null}
        </div>
        <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={cn("font-semibold text-white/85", compact ? "text-[11px]" : "text-xs")}>
              {entry.title}
            </p>
            <span className="text-[10px] tabular-nums text-white/25">{entry.timestamp}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/38">{entry.detail}</p>
          {entry.guestLabel ? <p className="mt-0.5 text-[10px] text-white/28">{entry.guestLabel}</p> : null}
          {entry.financialImpactEur !== undefined ? (
            <p className="mt-1 text-[10px] font-semibold tabular-nums text-emerald-400/90">
              {formatEur(Math.abs(entry.financialImpactEur))}
            </p>
          ) : null}
          {entry.propagationNodes.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {entry.propagationNodes.slice(0, 5).map((n) => (
                <span
                  key={n}
                  className="rounded border border-cyan-500/12 bg-cyan-500/[0.05] px-1 py-0.5 text-[8px] text-cyan-300/60"
                >
                  {NODE_LABELS[n]}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function motionRuntimeTimelineRow({
  isLast,
  children,
}: {
  isLast: boolean;
  children: React.ReactNode;
}) {
  return <div className={cn("animate-tick-fade", !isLast && "group")}>{children}</div>;
}

function motionRuntimeTimelineDot({ className }: { className: string }) {
  return <div className={cn("h-2 w-2 shrink-0 rounded-full border", className)} />;
}
