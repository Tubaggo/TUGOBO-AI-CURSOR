"use client";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  CreditCard,
  Crown,
  MessageSquare,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveEventSeverity, LiveOperationalEvent, OperationalModule } from "@/lib/runtime";
import { useLiveOperationalEvents, useRuntimePulse } from "@/lib/runtime";

const MODULE_LABEL: Record<OperationalModule, string> = {
  conversations: "Conversations",
  reservations: "Reservations",
  guests: "Guests",
  "ai-brain": "AI Brain",
  escalations: "Escalations",
  audit: "Audit",
};

const SEVERITY_ACCENT: Record<LiveEventSeverity, string> = {
  info: "border-l-sky-500/70",
  success: "border-l-emerald-500/75",
  warning: "border-l-amber-500/75",
  critical: "border-l-rose-500/80",
};

const SEVERITY_DOT: Record<LiveEventSeverity, string> = {
  info: "bg-sky-400/90",
  success: "bg-emerald-400/90",
  warning: "bg-amber-400/90",
  critical: "bg-rose-400/90",
};

const EVENT_ICONS: Record<string, LucideIcon> = {
  payment_failed: CreditCard,
  payment_success: CheckCircle2,
  sentiment_drop: AlertTriangle,
  confidence_low: Activity,
  vip_detected: Crown,
  ota_recovery: TrendingUp,
  human_takeover: UserCog,
  transfer_risk: AlertTriangle,
  workflow_resumed: Sparkles,
  escalation_resolved: CheckCircle2,
  reservation_created: Users,
  upsell_triggered: Sparkles,
  ai_active: Brain,
  payment_recovery: CreditCard,
};

const MODULE_ICONS: Record<OperationalModule, LucideIcon> = {
  conversations: MessageSquare,
  reservations: Users,
  guests: Crown,
  "ai-brain": Brain,
  escalations: AlertTriangle,
  audit: Activity,
};

function shortAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function EventIcon({ event }: { event: LiveOperationalEvent }) {
  const Icon = EVENT_ICONS[event.eventType] ?? MODULE_ICONS[event.module];
  return <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />;
}

type LiveOperationalEventFeedProps = {
  limit?: number;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  fallbackEvents?: LiveOperationalEvent[];
};

export function LiveOperationalEventFeed({
  limit = 8,
  compact = false,
  title = "Live operational stream",
  subtitle = "Cross-module orchestration events",
  className,
  fallbackEvents,
}: LiveOperationalEventFeedProps) {
  const pulse = useRuntimePulse();
  const storeEvents = useLiveOperationalEvents(limit);
  const events =
    storeEvents.length > 0 ? storeEvents : (fallbackEvents?.slice(0, limit) ?? []);

  return (
    <section className={cn("rounded-xl border border-white/[0.07] bg-zinc-900/45", className)}>
      <header
        className={cn(
          "flex items-baseline justify-between gap-2 border-b border-white/[0.06]",
          compact ? "px-3 py-2" : "px-4 py-3"
        )}
      >
        <div>
          <h2
            className={cn(
              "font-semibold tracking-tight text-white",
              compact ? "text-[12px]" : "text-sm"
            )}
          >
            {title}
          </h2>
          {!compact && subtitle ? (
            <p className="mt-0.5 text-[11px] text-white/35">{subtitle}</p>
          ) : null}
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
          </span>
          Live
        </span>
      </header>
      <ul
        key={pulse > 0 ? `pulse-${pulse}` : "static"}
        className={cn("divide-y divide-white/[0.05]", compact ? "p-1" : "p-2")}
      >
        {events.length === 0 ? (
          <li className="px-3 py-4 text-center text-[11px] text-white/35">
            Awaiting operational signals…
          </li>
        ) : (
          events.map((item) => (
            <li
              key={item.id}
              className={cn(
                "border-l-2 transition-colors duration-500",
                SEVERITY_ACCENT[item.severity],
                compact ? "mx-1 rounded-lg px-2.5 py-2" : "mx-2 rounded-lg px-3 py-2.5"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      SEVERITY_DOT[item.severity]
                    )}
                    aria-hidden
                  />
                  <span className="mt-0.5 text-white/50">
                    <EventIcon event={item} />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-medium text-white/88",
                        compact ? "text-[11px] leading-snug" : "text-[12px]"
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-white/30">
                      {MODULE_LABEL[item.module]}
                    </span>
                  </div>
                </div>
                <time
                  className="shrink-0 tabular-nums text-[10px] text-white/32"
                  dateTime={item.createdAt}
                >
                  {shortAgo(item.createdAt)}
                </time>
              </div>
              <p
                className={cn(
                  "mt-1.5 pl-[1.35rem] text-white/42",
                  compact ? "truncate text-[10px]" : "text-[11px] leading-relaxed"
                )}
              >
                {item.story}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
