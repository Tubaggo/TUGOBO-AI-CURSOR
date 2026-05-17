/**
 * Legacy type aliases — canonical models live in @/lib/runtime/entities
 */
import type {
  AIAction,
  AuditEvent,
  ConversationThread,
  FinancialAttribution,
  Guest,
  OtaMetricsSnapshot,
  RecoveryFlow,
  RecoveryJourneyStep,
  Reservation,
  ReservationPipelineStage,
  RevenueEvent,
  RevenueSnapshot,
  AiImpactSnapshot,
  OperationsFeedItem,
  AttributionKind,
  RecoveryFlowKind,
} from "@/lib/runtime/entities";

export type RevenueLifecycleStage = ReservationPipelineStage;

export type OperationalMutation =
  | "PAYMENT_FAILURE"
  | "PAYMENT_SUCCESS"
  | "HUMAN_TAKEOVER"
  | "OTA_RECOVERY"
  | "ESCALATION_PREVENTED"
  | "UPSELL_ACCEPTED";

export type RevenueMetrics = RevenueSnapshot;
export type AiImpactMetrics = AiImpactSnapshot;
export type OtaRecoveryMetrics = OtaMetricsSnapshot;
export type RecoveryJourney = RecoveryFlow;
export type RevenueStory = RevenueEvent;
export type OperationalReservation = Reservation;
export type OperationalGuest = Guest;
export type OperationalConversation = ConversationThread;
export type AuditEntry = AuditEvent;

export type {
  RecoveryJourneyStep,
  FinancialAttribution,
  LifecycleTimelineEvent,
  OperationsFeedItem,
} from "@/lib/runtime/entities";
export type { AttributionKind, RecoveryFlowKind };

export type OperationalRuntimeState = {
  mounted: boolean;
  metrics: RevenueMetrics;
  aiImpact: AiImpactMetrics;
  ota: OtaRecoveryMetrics;
  recoveryJourneys: RecoveryJourney[];
  revenueStories: RevenueStory[];
  reservations: OperationalReservation[];
  guests: OperationalGuest[];
  conversations: OperationalConversation[];
  auditLog: AuditEntry[];
  operationsFeed: OperationsFeedItem[];
  lastMutationAt: number | null;
};

export type { AIAction };
