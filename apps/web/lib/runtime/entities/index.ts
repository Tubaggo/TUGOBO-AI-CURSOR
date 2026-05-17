/** Enterprise operational entity models — single source of truth for the runtime layer */

import type {
  AIReasoning,
  EscalationLevel,
  GraphPropagation,
  GuestIntelligence,
  GuestMemory,
  OrchestrationStatus,
  PropagationNode,
  UnifiedTimelineEntry,
} from "../graph/types";

export type {
  AIReasoning,
  EscalationLevel,
  GraphPropagation,
  GuestIntelligence,
  GuestMemory,
  OrchestrationStatus,
  PropagationNode,
  UnifiedTimelineEntry,
};

export type ReservationPipelineStage =
  | "inquiry"
  | "quote"
  | "payment_pending"
  | "payment_risk"
  | "escalation"
  | "recovery"
  | "confirmation"
  | "upsell"
  | "retention"
  | "review_recovery";

export type AttributionKind =
  | "payment_recovery"
  | "ai_upsell"
  | "vip_intervention"
  | "direct_conversion"
  | "takeover_rescue"
  | "ota_commission"
  | "escalation_prevention"
  | "abandoned_recovery";

export type RecoveryFlowKind =
  | "failed_payment"
  | "abandoned_booking"
  | "ota_to_direct"
  | "escalation_cancellation"
  | "takeover_rescue";

export type FinancialAttribution = {
  kind: AttributionKind;
  label: string;
  amountEur: number;
  aiContributed: boolean;
  detail?: string;
};

export type GuestSegment = "standard" | "vip" | "ota_origin";

export type Guest = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  segment: GuestSegment;
  lifetimeValueEur: number;
  aiInfluencedRevenueEur: number;
  recoveryCount: number;
  vipRescueCount: number;
  otaConversionCount: number;
  lastAttribution?: FinancialAttribution;
  conversationId: string;
  memory: GuestMemory;
  intelligence: GuestIntelligence;
};

export type LifecycleTimelineEvent = {
  stage: ReservationPipelineStage;
  label: string;
  timestamp: string;
  financialImpactEur?: number;
  actor: "ai" | "human" | "guest" | "system";
  note?: string;
};

export type Reservation = {
  id: string;
  guest: string;
  initials: string;
  room: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  currentStage: ReservationPipelineStage;
  bookingValueEur: number;
  revenueAtRiskEur: number;
  attributions: FinancialAttribution[];
  timeline: LifecycleTimelineEvent[];
  channel: string;
  conversationId?: string;
};

export type ThreadOperationalFlags = {
  paymentRisk: boolean;
  recoveryActive: boolean;
  humanTakeover: boolean;
  vipEscalation: boolean;
  otaConversion: boolean;
  memoryAttached: boolean;
  priorRiskDetected: boolean;
  vipHistory: boolean;
  directBookingCandidate: boolean;
};

export type ConversationThread = {
  id: string;
  guestName: string;
  initials: string;
  avatarColor: string;
  channel: string;
  language: string;
  status: "ai_active" | "human_takeover" | "resolved";
  lastMessage: string;
  time: string;
  unread: number;
  revenueExposureEur: number;
  attributions: FinancialAttribution[];
  flags: ThreadOperationalFlags;
  reservationId?: string;
  guestId?: string;
};

export type RevenueSnapshot = {
  revenueRecoveredToday: number;
  aiInfluencedRevenue: number;
  otaCommissionAvoided: number;
  upsellRevenueGenerated: number;
  paymentRecoveryRevenue: number;
  humanTakeoverSavedRevenue: number;
  revenueAtRisk: number;
  recoverySuccessRate: number;
  directBookingConversionValue: number;
  aiGeneratedRevenue: number;
  escalatedRevenueExposure: number;
  occupancyInfluencePct: number;
};

export type AiImpactSnapshot = {
  aiCloseRate: number;
  aiAssistedRecoveryRate: number;
  autonomousResolutionPct: number;
  humanTakeoverSuccessPct: number;
  escalationPreventionPct: number;
  revenueInfluencedByAi: number;
  aiConfidenceStability: number;
  guestRecoveryRate: number;
  confidenceTrend: number[];
};

export type OtaMetricsSnapshot = {
  otaLeakagePct: number;
  directConversionRate: number;
  recoveredCommissionSavings: number;
  loyaltyConversions: number;
  activeRecoveryWorkflows: number;
};

export type RevenueEvent = {
  id: string;
  headline: string;
  narrative: string;
  amountEur: number;
  attribution: AttributionKind;
  timestamp: string;
  conversationId?: string;
  reservationId?: string;
};

export type OperationalAlertSeverity = "critical" | "warning" | "info" | "success";

export type OperationalAlert = {
  id: string;
  title: string;
  detail: string;
  severity: OperationalAlertSeverity;
  timestamp: string;
  read: boolean;
  financialEur?: number;
  reservationId?: string;
  guestLabel?: string;
  reason?: string;
  orchestrationStatus?: OrchestrationStatus;
  aiConfidence?: number;
  escalationLevel?: EscalationLevel;
  affectedSystems?: PropagationNode[];
};

export type AIAction = {
  id: string;
  action: string;
  rationale: string;
  timestamp: string;
  financialImpactEur?: number;
  reservationId?: string;
  conversationId?: string;
  reasoning?: AIReasoning;
};

export type AuditEvent = {
  id: string;
  action: string;
  actor: "ai" | "human" | "system";
  rationale: string;
  timestamp: string;
  financialImpactEur?: number;
  attribution?: AttributionKind;
  reservationId?: string;
  reasoning?: AIReasoning;
  propagation?: GraphPropagation;
  affectedSystems?: PropagationNode[];
  orchestrationConsequence?: string;
};

export type RecoveryJourneyStep = {
  id: string;
  phase: "risk" | "ai_intervention" | "escalation" | "recovery" | "confirmation";
  title: string;
  detail: string;
  timestamp: string;
  revenueDeltaEur?: number;
};

export type RecoveryFlow = {
  id: string;
  kind: RecoveryFlowKind;
  guestLabel: string;
  roomLabel: string;
  status: "active" | "recovered" | "at_risk";
  bookingValueEur: number;
  revenueSavedEur: number;
  steps: RecoveryJourneyStep[];
  aiRationale?: string;
  reasoning?: AIReasoning;
  reservationId?: string;
  conversationId?: string;
};

export type OperationsFeedItem = {
  id: string;
  title: string;
  meta: string;
  time: string;
  tone: string;
  financialEur?: number;
  eventType?: string;
};

export type OperationalState = {
  mounted: boolean;
  revenue: RevenueSnapshot;
  aiImpact: AiImpactSnapshot;
  ota: OtaMetricsSnapshot;
  guests: Guest[];
  reservations: Reservation[];
  threads: ConversationThread[];
  activeRecoveries: RecoveryFlow[];
  revenueEvents: RevenueEvent[];
  alerts: OperationalAlert[];
  aiActions: AIAction[];
  auditEvents: AuditEvent[];
  operationsFeed: OperationsFeedItem[];
  unifiedTimeline: UnifiedTimelineEntry[];
  lastPropagation: GraphPropagation | null;
  mutationPulseAt: number | null;
  lastEventAt: number | null;
};
