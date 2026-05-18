import { Bot, User, MessageCircle, Cog } from "lucide-react";
import type { LifecycleTimelineEvent } from "@/lib/operational/types";
import { formatEur } from "@/lib/operational/format";
import { lifecycleStageLabel } from "@/lib/i18n/operational-copy";
import { cn } from "@/lib/utils";

const ACTOR_ICONS = {
  ai: Bot,
  human: User,
  guest: MessageCircle,
  system: Cog,
} as const;

export function RevenueTimeline({ events }: { events: LifecycleTimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((ev, i) => (
        <TimelineRow key={`${ev.stage}-${ev.timestamp}-${i}`} event={ev} isLast={i === events.length - 1} />
      ))}
    </div>
  );
}

function TimelineRow({ event, isLast }: { event: LifecycleTimelineEvent; isLast: boolean }) {
  const Icon = ACTOR_ICONS[event.actor];
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
          <Icon className="h-3 w-3 text-white/40" />
        </div>
        {!isLast ? <div className="my-1 min-h-[16px] w-px flex-1 bg-white/[0.06]" /> : null}
      </div>
      <div className={cn("min-w-0 flex-1 pb-3", isLast && "pb-0")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/28">
            {lifecycleStageLabel(event.stage)}
          </span>
          <span className="text-[10px] text-white/25 tabular-nums">{event.timestamp}</span>
        </div>
        <p className="text-xs font-medium text-white/75">{event.label}</p>
        {event.note ? <p className="text-[10px] text-white/35 mt-0.5">{event.note}</p> : null}
        {event.financialImpactEur !== undefined ? (
          <p
            className={cn(
              "mt-1 text-[10px] font-semibold tabular-nums",
              event.financialImpactEur >= 0 ? "text-emerald-400/90" : "text-amber-400/90"
            )}
          >
            {event.financialImpactEur >= 0 ? "+" : "−"}
            {formatEur(Math.abs(event.financialImpactEur))}
          </p>
        ) : null}
      </div>
    </div>
  );
}
