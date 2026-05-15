/** Operational pipeline stages (kanban columns). */
export const RESERVATION_PIPELINE_STAGES = [
  "inquiry",
  "qualified",
  "offer_sent",
  "payment_pending",
  "confirmed",
  "checkin_ready",
  "checked_in",
] as const;

export type ReservationPipelineStage = (typeof RESERVATION_PIPELINE_STAGES)[number];

export const PAYMENT_STATUSES = [
  "awaiting_payment",
  "partially_paid",
  "payment_failed",
  "overdue",
  "paid",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const RESERVATION_SOURCES = [
  "whatsapp",
  "web_chat",
  "instagram",
  "booking_com",
  "expedia",
  "direct_web",
  "phone",
  "email",
] as const;

export type ReservationSource = (typeof RESERVATION_SOURCES)[number];

export const RESERVATION_AI_STATES = [
  "ai_qualifying",
  "ai_quoting",
  "ai_active",
  "human_active",
  "paused",
  "ai_complete",
] as const;

export type ReservationAiState = (typeof RESERVATION_AI_STATES)[number];

export const URGENCY_LEVELS = ["none", "low", "normal", "high", "critical"] as const;

export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const TIMELINE_ACTOR_TYPES = [
  "guest",
  "ai",
  "staff",
  "system",
  "payment_gateway",
] as const;

export type TimelineActorType = (typeof TIMELINE_ACTOR_TYPES)[number];

export const TIMELINE_EVENT_TYPES = [
  "inquiry_received",
  "ai_qualified",
  "quote_generated",
  "payment_link_sent",
  "guest_upgrade_request",
  "payment_failed",
  "ai_escalated",
  "human_takeover",
  "reservation_confirmed",
  "deposit_received",
  "ota_recovery_touch",
  "checkin_reminder",
  "checked_in",
  "note",
] as const;

export type ReservationTimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export type Reservation = {
  id: string;
  code: string;
  guestId: string;
  guestName: string;
  conversationId: string | null;
  conversationSummary: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalValue: number;
  currency: string;
  /** Pipeline column */
  status: ReservationPipelineStage;
  paymentStatus: PaymentStatus;
  source: ReservationSource;
  assignedTo: string | null;
  aiState: ReservationAiState;
  urgency: UrgencyLevel;
};

export type ReservationTimelineEvent = {
  id: string;
  reservationId: string;
  type: ReservationTimelineEventType;
  description: string;
  createdAt: string;
  actorType: TimelineActorType;
};

export type PaymentState = {
  status: PaymentStatus;
  amountPaid: number;
  remainingBalance: number;
  paymentLink: string | null;
  expiresAt: string | null;
};

export type AIReservationInsight = {
  confidence: number;
  cancellationRisk: "low" | "medium" | "high";
  upsellOpportunity: string | null;
  escalationSuggested: boolean;
  summary: string;
  /** Operational risk flags for revenue desk */
  riskFlags: string[];
};

export type GuestStayProfile = {
  guestId: string;
  displayName: string;
  emailMasked: string;
  nationality: string;
  tags: string[];
  returningGuest: boolean;
  totalStays: number;
  vipSignal: boolean;
};

export type ReservationDetailPayload = {
  reservation: Reservation;
  guest: GuestStayProfile;
  timeline: ReservationTimelineEvent[];
  payment: PaymentState;
  aiInsight: AIReservationInsight;
  upsellOpportunities: string[];
};

export type CreateReservationFromConversationInput = {
  conversationId: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalValue: number;
  currency?: string;
  source: ReservationSource;
};
