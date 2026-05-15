"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Reservation, ReservationPipelineStage } from "@/app/app/_types";
import { pipelineStageLabel } from "./reservation-formatters";
import { ReservationCard, dragReservationMime } from "./reservation-card";

type ReservationStageColumnProps = {
  stage: ReservationPipelineStage;
  reservations: Reservation[];
  onDropReservation: (reservationId: string, stage: ReservationPipelineStage) => void;
  footer?: ReactNode;
};

export function ReservationStageColumn({
  stage,
  reservations,
  onDropReservation,
  footer,
}: ReservationStageColumnProps) {
  const mime = dragReservationMime();

  return (
    <section
      className="flex w-[272px] shrink-0 flex-col rounded-xl border border-white/[0.06] bg-zinc-950/40"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData(mime);
        if (id) onDropReservation(id, stage);
      }}
    >
      <header className="border-b border-white/[0.06] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[12px] font-semibold tracking-tight text-white/88">
            {pipelineStageLabel(stage)}
          </h3>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold tabular-nums text-white/55">
            {reservations.length}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-white/32">Drop cards to re-stage (mock)</p>
      </header>
      <div
        className={cn(
          "flex max-h-[min(62vh,560px)] flex-col gap-2 overflow-y-auto p-2.5",
          reservations.length === 0 && "min-h-[120px] items-center justify-center"
        )}
      >
        {reservations.length === 0 ? (
          <p className="px-2 text-center text-[11px] text-white/28">Empty lane</p>
        ) : (
          reservations.map((r) => <ReservationCard key={r.id} reservation={r} />)
        )}
      </div>
      {footer ? <div className="border-t border-white/[0.05] p-2">{footer}</div> : null}
    </section>
  );
}
