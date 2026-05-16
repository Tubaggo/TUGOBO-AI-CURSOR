import type { PaymentStatus, ReservationPipelineStage } from "@/app/app/_types";

export const RESERVATION_LIFECYCLE_STAGES = [
  "inquiry",
  "quote",
  "deposit_pending",
  "payment_risk",
  "escalated",
  "recovered",
  "confirmed",
  "post_stay",
] as const;

export type ReservationLifecycleStage = (typeof RESERVATION_LIFECYCLE_STAGES)[number];

export const LIFECYCLE_LABEL: Record<ReservationLifecycleStage, string> = {
  inquiry: "Inquiry",
  quote: "Quote",
  deposit_pending: "Deposit pending",
  payment_risk: "Payment risk",
  escalated: "Escalated",
  recovered: "Recovered",
  confirmed: "Confirmed",
  post_stay: "Post-stay",
};

/** Maps pipeline + payment into executive lifecycle vocabulary. */
export function deriveReservationLifecycleStage(args: {
  status: ReservationPipelineStage;
  paymentStatus: PaymentStatus;
  urgency: string;
  aiState: string;
}): ReservationLifecycleStage {
  const { status, paymentStatus, urgency, aiState } = args;

  if (status === "checked_in") return "post_stay";
  if (status === "confirmed" && paymentStatus === "paid") return "confirmed";
  if (paymentStatus === "payment_failed" || paymentStatus === "overdue") {
    return urgency === "high" || urgency === "critical" ? "escalated" : "payment_risk";
  }
  if (paymentStatus === "awaiting_payment" || paymentStatus === "partially_paid") {
    return "deposit_pending";
  }
  if (aiState === "paused" && urgency !== "none") return "escalated";
  if (status === "payment_pending") return "deposit_pending";
  if (status === "offer_sent" || status === "qualified") return "quote";
  if (status === "inquiry") return "inquiry";
  if (status === "checkin_ready") return "confirmed";
  return "recovered";
}

export function lifecycleStageIndex(stage: ReservationLifecycleStage): number {
  return RESERVATION_LIFECYCLE_STAGES.indexOf(stage);
}
