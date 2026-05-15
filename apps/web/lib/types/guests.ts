/** Loyalty tier for intelligence guest graph (future: sync with CRM / PMS). */
export const GUEST_LOYALTY_TIERS = ["standard", "silver", "gold", "platinum", "vip"] as const;

export type GuestLoyaltyTier = (typeof GUEST_LOYALTY_TIERS)[number];

export const GUEST_SENTIMENTS = ["positive", "neutral", "negative", "mixed"] as const;

export type GuestSentiment = (typeof GUEST_SENTIMENTS)[number];

/** Pipeline-aware stay state for inbox-style guest rows. */
export const GUEST_RESERVATION_STATES = [
  "none",
  "inquiry",
  "confirmed_upcoming",
  "in_house",
  "checked_out",
  "at_risk",
] as const;

export type GuestReservationState = (typeof GUEST_RESERVATION_STATES)[number];

/** Intelligence segment chips (AI-enhanced filters). */
export const GUEST_INTELLIGENCE_SEGMENTS = [
  "all",
  "vip",
  "high_spend",
  "returning",
  "ota_recovery",
  "cancellation_risk",
  "upgrade_likely",
  "arabic_speaking",
  "long_stay",
  "direct_loyalist",
  "late_responder",
  "upsell_target",
] as const;

export type GuestIntelligenceSegment = (typeof GUEST_INTELLIGENCE_SEGMENTS)[number];

export const GUEST_TIMELINE_EVENT_TYPES = [
  "conversation",
  "reservation",
  "payment",
  "upgrade",
  "complaint",
  "ai_escalation",
  "check_in",
  "special_request",
  "recovery",
  "note",
] as const;

export type GuestTimelineEventType = (typeof GUEST_TIMELINE_EVENT_TYPES)[number];

export const GUEST_TIMELINE_ACTOR_TYPES = ["guest", "staff", "ai", "system", "ota"] as const;

export type GuestTimelineActorType = (typeof GUEST_TIMELINE_ACTOR_TYPES)[number];

export type GuestRiskFlag =
  | "cancellation_risk"
  | "payment_friction"
  | "complaint_risk"
  | "ota_dependent"
  | "late_responder"
  | "none";

export type Guest = {
  id: string;
  name: string;
  nationality: string;
  preferredLanguage: string;
  loyaltyTier: GuestLoyaltyTier;
  totalStays: number;
  lifetimeValue: number;
  directBookingRatio: number;
  aiScore: number;
  sentiment: GuestSentiment;
  tags: string[];
  riskFlags: GuestRiskFlag[];
  /** 0–1 upgrade propensity surfaced in grid */
  upsellPotential: number;
  currentReservationState: GuestReservationState;
  currentReservationLabel: string;
  avatarUrl: string | null;
};

export type GuestTimelineEvent = {
  id: string;
  guestId: string;
  type: GuestTimelineEventType;
  description: string;
  createdAt: string;
  actorType: GuestTimelineActorType;
  conversationId?: string | null;
  reservationId?: string | null;
};

export type GuestPreferenceCategory =
  | "room"
  | "dietary"
  | "communication"
  | "occasion"
  | "transfer"
  | "other";

export type GuestPreference = {
  category: GuestPreferenceCategory;
  value: string;
  confidence: number;
};

export type GuestAIInsight = {
  priceSensitivity: "low" | "medium" | "high";
  upsellProbability: number;
  cancellationRisk: number;
  preferredTone: "warm" | "concise" | "formal" | "playful";
  communicationPreference: "whatsapp" | "email" | "instagram" | "mixed";
  directBookingProbability: number;
  complaintRisk: number;
  loyaltyPotential: number;
  responseBehavior: string;
  channelPreference: string;
  summary: string;
  highlights: string[];
};

export type GuestRevenueProfile = {
  lifetimeValue: number;
  otaSpend: number;
  directSpend: number;
  upsellRevenue: number;
  averageBookingValue: number;
  seasonalFrequency: string;
  profitabilityHint: string;
  retentionPotential: string;
  recoveryOpportunity: string | null;
};

export type GuestIntelligenceMetrics = {
  totalGuests: number;
  repeatGuestPct: number;
  vipGuests: number;
  otaRecoveryGuests: number;
  highUpsellPotential: number;
  atRiskGuests: number;
  asOfIso: string;
};

export type LinkedReservation = {
  id: string;
  code: string;
  checkIn: string;
  checkOut: string;
  statusLabel: string;
  totalValue: number;
  currency: string;
  sourceLabel: string;
};

export type LinkedConversation = {
  id: string;
  channel: string;
  lastMessageAt: string;
  preview: string;
  status: string;
};

export type GuestOperationalSummary = {
  headline: string;
  detail: string;
  recoveryHistory: string | null;
};

export type GuestAIAction = {
  id: string;
  label: string;
  description: string;
  kind: "upgrade" | "direct_booking" | "loyalty" | "human_followup" | "support_priority" | "risk_flag";
};
