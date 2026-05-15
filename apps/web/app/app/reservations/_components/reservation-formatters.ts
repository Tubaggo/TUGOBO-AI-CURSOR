import type { PaymentStatus, ReservationPipelineStage, ReservationSource } from "@/app/app/_types";

export function pipelineStageLabel(stage: ReservationPipelineStage): string {
  const labels: Record<ReservationPipelineStage, string> = {
    inquiry: "Inquiry",
    qualified: "Qualified",
    offer_sent: "Offer sent",
    payment_pending: "Payment pending",
    confirmed: "Confirmed",
    checkin_ready: "Check-in ready",
    checked_in: "Checked-in",
  };
  return labels[stage];
}

export function paymentStatusLabel(s: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    awaiting_payment: "Awaiting payment",
    partially_paid: "Partially paid",
    payment_failed: "Payment failed",
    overdue: "Overdue",
    paid: "Paid",
    refunded: "Refunded",
  };
  return labels[s];
}

export function sourceLabel(source: ReservationSource): string {
  const labels: Record<ReservationSource, string> = {
    whatsapp: "WhatsApp",
    web_chat: "Web chat",
    instagram: "Instagram",
    booking_com: "Booking.com",
    expedia: "Expedia",
    direct_web: "Direct web",
    phone: "Phone",
    email: "Email",
  };
  return labels[source];
}

export function formatMoney(value: number, currency: string): string {
  if (value === 0 && currency === "EUR") return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}
