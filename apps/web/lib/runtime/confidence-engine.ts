import type { Conversation } from "@/lib/types/conversations";
import type { Guest } from "@/lib/types/guests";
import type { Reservation } from "@/app/app/_types";

export type ConfidenceFactors = {
  sentimentScore: number;
  ambiguityPenalty: number;
  paymentFriction: number;
  vipComplexity: number;
  otaEdgeCase: number;
  multiRoomComplexity: number;
};

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export function computeConfidenceFromFactors(factors: ConfidenceFactors): number {
  const base =
    0.92 -
    factors.ambiguityPenalty * 0.12 -
    factors.paymentFriction * 0.22 -
    factors.vipComplexity * 0.06 -
    factors.otaEdgeCase * 0.1 -
    factors.multiRoomComplexity * 0.08;

  const sentimentAdj = (factors.sentimentScore - 0.5) * 0.18;
  return clamp(base + sentimentAdj);
}

export function sentimentToScore(sentiment: Conversation["aiInsight"]["sentiment"]): number {
  switch (sentiment) {
    case "positive":
      return 0.85;
    case "neutral":
      return 0.55;
    case "mixed":
      return 0.45;
    case "negative":
      return 0.2;
    default:
      return 0.55;
  }
}

export function buildConfidenceFactors(
  conversation: Conversation | null,
  reservation: Reservation | null,
  guest: Guest | null
): ConfidenceFactors {
  const sentimentScore = conversation
    ? sentimentToScore(conversation.aiInsight.sentiment)
    : 0.55;

  let paymentFriction = 0;
  if (reservation?.paymentStatus === "payment_failed") paymentFriction = 0.9;
  else if (reservation?.paymentStatus === "awaiting_payment") paymentFriction = 0.35;
  else if (reservation?.paymentStatus === "overdue") paymentFriction = 0.75;

  const vipComplexity =
    guest?.loyaltyTier === "vip" || guest?.loyaltyTier === "platinum" ? 0.25 : 0;

  const otaEdgeCase =
    reservation?.source === "booking_com" || reservation?.source === "expedia" ? 0.3 : 0;

  const multiRoomComplexity =
    conversation?.guest.tags.some((t) => /family|2\+2|multi/i.test(t)) ? 0.2 : 0;

  const ambiguityPenalty = conversation?.aiInsight.escalationSuggested ? 0.35 : 0.1;

  return {
    sentimentScore,
    ambiguityPenalty,
    paymentFriction,
    vipComplexity,
    otaEdgeCase,
    multiRoomComplexity,
  };
}

export function recalculateConversationConfidence(
  conversation: Conversation,
  reservation: Reservation | null,
  guest: Guest | null,
  delta = 0
): number {
  const factors = buildConfidenceFactors(conversation, reservation, guest);
  return clamp(computeConfidenceFromFactors(factors) + delta);
}
