"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/app/app/_types";
import {
  deriveReservationLifecycleStage,
  LIFECYCLE_LABEL,
  lifecycleStageIndex,
  RESERVATION_LIFECYCLE_STAGES,
  useAIRuntimeStore,
  useRuntimePulse,
} from "@/lib/runtime";

type ReservationLifecycleRailProps = {
  reservation: Reservation;
  className?: string;
};

/** Executive lifecycle continuity — inquiry through post-stay with orchestration feel. */
export function ReservationLifecycleRail({ reservation, className }: ReservationLifecycleRailProps) {
  const pulse = useRuntimePulse();
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const storeRes = useAIRuntimeStore((s) =>
    s.reservations.find((r) => r.id === reservation.id)
  );
  const r = hydrated && storeRes ? storeRes : reservation;
  const current = deriveReservationLifecycleStage({
    status: r.status,
    paymentStatus: r.paymentStatus,
    urgency: r.urgency,
    aiState: r.aiState,
  });
  const idx = lifecycleStageIndex(current);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4",
        className
      )}
      data-runtime-pulse={pulse > 0 ? String(pulse) : undefined}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Reservation lifecycle</h2>
          <p className="mt-0.5 text-[10px] text-white/32">
            Revenue orchestration · AI intervention history woven through stages
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
          <Radio className="h-3 w-3 text-emerald-400/80 animate-live-pulse" aria-hidden />
          Live
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1 conv-scroll">
        {RESERVATION_LIFECYCLE_STAGES.map((stage, i) => {
          const active = stage === current;
          const done = i < idx;
          const risk = stage === "payment_risk" || stage === "escalated";
          return (
            <div
              key={stage}
              className={cn(
                "flex min-w-[88px] flex-1 flex-col rounded-lg border px-2 py-2 text-[9px] font-semibold uppercase tracking-wide transition-all duration-500",
                active && !risk && "border-blue-500/40 bg-blue-500/15 text-blue-100/95 shadow-[0_0_16px_-8px_rgba(59,130,246,0.5)]",
                active && risk && "border-rose-500/35 bg-rose-500/12 text-rose-100/90",
                done && !active && "border-emerald-500/20 bg-emerald-500/8 text-emerald-100/70",
                !done && !active && "border-white/[0.06] bg-black/20 text-white/32"
              )}
            >
              <span className="leading-tight">{LIFECYCLE_LABEL[stage]}</span>
              {active ? (
                <span className="mt-1 text-[8px] font-medium normal-case tracking-normal text-white/40">
                  Current
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
