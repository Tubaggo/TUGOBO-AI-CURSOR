/** Role values for hotel staff / org access (future RLS / authz). */
export const HOTEL_ROLES = [
  "owner",
  "admin",
  "manager",
  "staff",
  "viewer",
] as const;

export type HotelRole = (typeof HOTEL_ROLES)[number];

export const MEMBERSHIP_STATUSES = ["active", "invited", "suspended"] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const ORGANIZATION_TYPES = [
  "resort",
  "hotel",
  "suites",
  "boutique",
  "hostel",
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  city: string;
  country: string;
  timezone: string;
  defaultLanguage: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: HotelRole;
  avatarUrl: string | null;
  organizationId: string;
};

export type Membership = {
  id: string;
  userId: string;
  organizationId: string;
  role: HotelRole;
  status: MembershipStatus;
};

export type OverviewStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type OverviewStats = {
  stats: OverviewStat[];
  asOf: string;
};

export const OPERATIONS_FEED_KINDS = [
  "ai_qualification",
  "payment",
  "guest_request",
  "reservation",
  "system",
] as const;

export type OperationsFeedKind = (typeof OPERATIONS_FEED_KINDS)[number];

export type OperationsFeedItem = {
  id: string;
  kind: OperationsFeedKind;
  headline: string;
  detail: string;
  occurredAtIso: string;
};

export const ARRIVAL_STATUSES = ["confirmed", "in_transit", "pending_docs"] as const;

export type ArrivalStatus = (typeof ARRIVAL_STATUSES)[number];

export type TodayArrival = {
  id: string;
  guestName: string;
  roomType: string;
  checkInTime: string;
  status: ArrivalStatus;
};

export const AI_ATTENTION_SEVERITIES = ["info", "warning", "critical"] as const;

export type AiAttentionSeverity = (typeof AI_ATTENTION_SEVERITIES)[number];

export type AiAttentionItem = {
  id: string;
  severity: AiAttentionSeverity;
  title: string;
  detail: string;
};

export type {
  AIReservationInsight,
  CreateReservationFromConversationInput,
  GuestStayProfile,
  PaymentState,
  PaymentStatus,
  Reservation,
  ReservationAiState,
  ReservationDetailPayload,
  ReservationPipelineStage,
  ReservationSource,
  ReservationTimelineEvent,
  ReservationTimelineEventType,
  TimelineActorType,
  UrgencyLevel,
} from "./reservations";

export {
  PAYMENT_STATUSES,
  RESERVATION_AI_STATES,
  RESERVATION_PIPELINE_STAGES,
  RESERVATION_SOURCES,
  TIMELINE_ACTOR_TYPES,
  TIMELINE_EVENT_TYPES,
  URGENCY_LEVELS,
} from "./reservations";
