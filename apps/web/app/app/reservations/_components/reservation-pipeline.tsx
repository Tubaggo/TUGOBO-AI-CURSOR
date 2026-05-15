"use client";

import { useMemo } from "react";
import { Layers } from "lucide-react";
import type { Reservation, ReservationPipelineStage } from "@/app/app/_types";
import { RESERVATION_PIPELINE_STAGES } from "@/app/app/_types";
import { ReservationStageColumn } from "./reservation-stage-column";

type ReservationPipelineProps = {
  reservations: Reservation[];
  onStageChange: (reservationId: string, stage: ReservationPipelineStage) => void;
};

export function ReservationPipeline({ reservations, onStageChange }: ReservationPipelineProps) {
  const byStage = useMemo(() => {
    const map = new Map<ReservationPipelineStage, Reservation[]>();
    for (const s of RESERVATION_PIPELINE_STAGES) {
      map.set(s, []);
    }
    for (const r of reservations) {
      const list = map.get(r.status);
      if (list) list.push(r);
    }
    return map;
  }, [reservations]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-x-4 -top-3 h-8 bg-gradient-to-b from-zinc-950 to-transparent" />
      <div className="flex items-start gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
        <div className="flex shrink-0 items-center gap-2 pr-1 text-white/25">
          <Layers className="h-4 w-4" aria-hidden />
        </div>
        {RESERVATION_PIPELINE_STAGES.map((stage) => (
          <ReservationStageColumn
            key={stage}
            stage={stage}
            reservations={byStage.get(stage) ?? []}
            onDropReservation={onStageChange}
          />
        ))}
      </div>
    </div>
  );
}
