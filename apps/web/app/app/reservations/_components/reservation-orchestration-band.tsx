"use client";

import { AiActionMemoryStrip } from "@/app/app/_components/ai-action-memory-strip";
import { useRuntimePulse } from "@/lib/runtime";

type ReservationOrchestrationBandProps = {
  reservationId: string;
  guestId: string;
  conversationId: string | null;
};

export function ReservationOrchestrationBand({
  reservationId,
  guestId,
  conversationId,
}: ReservationOrchestrationBandProps) {
  const pulse = useRuntimePulse();
  return (
    <section
      className="space-y-2"
      data-runtime-pulse={pulse > 0 ? String(pulse) : undefined}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        Runtime orchestration
      </p>
      <AiActionMemoryStrip
        reservationId={reservationId}
        guestId={guestId}
        conversationId={conversationId ?? undefined}
        title="Linked AI action memory"
        limit={10}
      />
    </section>
  );
}
