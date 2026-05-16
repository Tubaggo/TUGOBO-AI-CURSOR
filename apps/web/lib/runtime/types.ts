import type { AIBrainOverview, AIOperationalAgentRole } from "@/lib/types/ai-brain";
import type { AuditEvent, EscalationEvent } from "@/lib/types/ai-brain";
import type { Conversation, ConversationSummary } from "@/lib/types/conversations";
import type { Guest } from "@/lib/types/guests";
import type { Reservation } from "@/app/app/_types";
import type { LiveOperationalEvent } from "./live-events";

/** Shared operational status chips across modules. */
export const RUNTIME_OPERATIONAL_STATUSES = [
  "ai_active",
  "escalated",
  "human_active",
  "payment_risk",
  "confidence_low",
  "vip_flow",
  "workflow_blocked",
  "workflow_paused",
] as const;

export type RuntimeOperationalStatus = (typeof RUNTIME_OPERATIONAL_STATUSES)[number];

export type ConversationRuntimeMeta = {
  paymentFailureCount: number;
  lastEventAt: string | null;
  operationalStatuses: RuntimeOperationalStatus[];
};

export type AIActionMemoryKind =
  | "payment_link_sent"
  | "payment_failed"
  | "payment_success"
  | "upgrade_offered"
  | "human_takeover"
  | "reservation_confirmed"
  | "guest_risk_updated"
  | "escalation_opened"
  | "escalation_resolved"
  | "sentiment_shift"
  | "vip_signal"
  | "ota_recovery"
  | "low_confidence_gate"
  | "workflow_pause";

/** Durable simulated AI actions across modules (local runtime cap). */
export type AIActionMemoryEntry = {
  id: string;
  kind: AIActionMemoryKind;
  summary: string;
  agentRole: AIOperationalAgentRole;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  auditEventId?: string;
  escalationId?: string;
  createdAt: string;
};

export type AIRuntimeState = {
  hydrated: boolean;
  lastPulseAt: number;
  /** Short headline for global AI status / topbar focus */
  operationalFocusLabel: string;
  /** Unified cross-module operational event stream */
  liveEvents: LiveOperationalEvent[];
  conversations: Conversation[];
  conversationSummaries: ConversationSummary[];
  reservations: Reservation[];
  guests: Guest[];
  escalations: EscalationEvent[];
  auditEvents: AuditEvent[];
  aiActionMemory: AIActionMemoryEntry[];
  overview: AIBrainOverview;
  conversationMeta: Record<string, ConversationRuntimeMeta>;
  /** Entity → active runtime badges for quick lookup */
  entityStatuses: Record<string, RuntimeOperationalStatus[]>;
};

export type RuntimeEntityRef = {
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
};
