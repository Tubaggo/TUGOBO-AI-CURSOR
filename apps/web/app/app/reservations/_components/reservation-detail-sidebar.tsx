"use client";

import { useMemo, useState } from "react";
import type { AIReservationInsight, GuestStayProfile, Reservation } from "@/app/app/_types";
import { derivePaymentState } from "@/lib/data/reservations";
import { useOperationsStore } from "@/store/operations-store";
import { AiReservationInsights } from "./ai-reservation-insights";
import { GuestStayContext } from "./guest-stay-context";
import { PaymentStatusCard } from "./payment-status-card";
import { ReservationActions } from "./reservation-actions";

type ReservationDetailSidebarProps = {
  initialReservation: Reservation;
  guest: GuestStayProfile;
  aiInsight: AIReservationInsight;
  upsellOpportunities: string[];
};

export function ReservationDetailSidebar({
  initialReservation,
  guest,
  aiInsight,
  upsellOpportunities,
}: ReservationDetailSidebarProps) {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const storeReservation = useOperationsStore((s) =>
    s.reservations.find((r) => r.id === initialReservation.id)
  );
  const [localReservation, setLocalReservation] = useState(initialReservation);
  const reservation =
    hydrated && storeReservation ? storeReservation : localReservation;
  const payment = useMemo(() => derivePaymentState(reservation), [reservation]);

  return (
    <div className="space-y-4">
      <GuestStayContext guest={guest} reservation={reservation} />
      <PaymentStatusCard payment={payment} currency={reservation.currency} />
      <AiReservationInsights insight={aiInsight} />
      <section className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
        <h2 className="text-sm font-semibold text-emerald-100/95">Upsell opportunities</h2>
        <ul className="mt-3 space-y-2">
          {upsellOpportunities.map((u) => (
            <li
              key={u}
              className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2 text-[12px] leading-snug text-white/70"
            >
              {u}
            </li>
          ))}
        </ul>
      </section>
      <ReservationActions
        reservation={reservation}
        onReservationChange={setLocalReservation}
      />
    </div>
  );
}
