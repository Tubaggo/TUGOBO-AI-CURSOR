import type {
  GuestLoyaltyTier,
  GuestReservationState,
  GuestSentiment,
} from "@/lib/types/guests";

export function formatMoney(value: number, currency = "EUR"): string {
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

export function loyaltyTierLabel(tier: GuestLoyaltyTier): string {
  const labels: Record<GuestLoyaltyTier, string> = {
    standard: "Standard",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
    vip: "VIP",
  };
  return labels[tier];
}

export function reservationStateLabel(state: GuestReservationState): string {
  const labels: Record<GuestReservationState, string> = {
    none: "No active stay",
    inquiry: "Inquiry",
    confirmed_upcoming: "Upcoming",
    in_house: "In house",
    checked_out: "Checked out",
    at_risk: "At risk",
  };
  return labels[state];
}

export function directOtaRatioLabel(ratio: number): string {
  const direct = Math.round(ratio * 100);
  return `${direct}% direct · ${100 - direct}% OTA`;
}

export function sentimentLabel(s: GuestSentiment): string {
  const labels: Record<GuestSentiment, string> = {
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    mixed: "Mixed",
  };
  return labels[s];
}

export function guestInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
