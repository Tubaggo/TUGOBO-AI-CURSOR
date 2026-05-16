"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { useOperationsStore } from "@/store/operations-store";
import { LivePulsePlaceholder } from "./live-ui-placeholder";

/** Top-bar live pulse — rotates orchestration headlines so the console feels supervised. */
export function OperationalLivePulse({ className }: { className?: string }) {
  const mounted = useClientMounted();
  const hydrated = useOperationsStore((s) => s.hydrated);
  const operationalFocusLabel = useOperationsStore((s) => s.operationalFocusLabel);
  const liveEvents = useOperationsStore((s) => s.liveEvents);
  const auditEvents = useOperationsStore((s) => s.auditEvents);
  const escalations = useOperationsStore((s) => s.escalations);

  const ticker = useMemo(() => {
    if (!mounted || !hydrated) return [];
    const escOpen = escalations.filter((e) => !e.resolved).length;
    const heads = [
      ...liveEvents.map((e) => ({
        text: e.title,
        sub: e.story,
        severity: e.severity,
      })),
      ...auditEvents.slice(0, 8).map((a) => ({
        text: a.title,
        sub: a.rationale ?? a.explanation.slice(0, 96),
        severity:
          a.severity === "critical"
            ? ("critical" as const)
            : a.severity === "high"
              ? ("warning" as const)
              : ("info" as const),
      })),
      {
        text: `${escOpen} escalations open`,
        sub: "Supervisor mesh synchronized across audit + conversations.",
        severity: escOpen > 0 ? ("warning" as const) : ("info" as const),
      },
    ];
    return heads;
  }, [mounted, hydrated, liveEvents, auditEvents, escalations]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!mounted || !hydrated || ticker.length === 0) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % ticker.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [mounted, hydrated, ticker.length]);

  if (!mounted || !hydrated) {
    return <LivePulsePlaceholder className={className} />;
  }

  const row = ticker[idx] ?? {
    text: "Operational fabric idle",
    sub: "Awaiting supervised signals.",
    severity: "info" as const,
  };

  const borderGlow =
    row.severity === "critical"
      ? "border-rose-500/35 shadow-[0_0_28px_-12px_rgba(244,63,94,0.45)]"
      : row.severity === "warning"
        ? "border-amber-500/28 shadow-[0_0_26px_-12px_rgba(245,158,11,0.35)]"
        : "border-emerald-500/22 shadow-[0_0_24px_-10px_rgba(16,185,129,0.35)]";

  const dot =
    row.severity === "critical"
      ? "bg-rose-400"
      : row.severity === "warning"
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <div
      className={cn(
        "relative hidden max-w-[min(340px,46vw)] shrink flex-col gap-0.5 rounded-xl border px-2.5 py-1.5 text-right md:max-w-[380px] md:px-3 sm:flex",
        borderGlow,
        "bg-zinc-950/55 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center justify-end gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={cn(
              "absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-55",
              dot
            )}
          />
          <span className={cn("relative inline-flex h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]", dot)} />
        </span>
        <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-300/80" aria-hidden />
        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-emerald-100/95 md:text-[11px]">
          Live operational pulse
        </span>
      </div>
      <p className="w-full truncate text-[10px] font-semibold leading-snug text-white/78 animate-tick-fade md:text-[11px]">
        {row.text}
      </p>
      <p className="hidden w-full truncate text-[9px] font-medium leading-snug text-emerald-100/45 md:inline">
        {operationalFocusLabel}
      </p>
      <p className="hidden w-full truncate text-[9px] font-medium leading-snug text-white/32 lg:inline">
        {row.sub}
      </p>
    </div>
  );
}
