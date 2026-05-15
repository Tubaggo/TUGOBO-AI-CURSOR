import type { AIBrainOverview } from "@/lib/types/ai-brain";
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

export type AIRuntimeState = {
  hydrated: boolean;
  lastPulseAt: number;
  /** Unified cross-module operational event stream */
  liveEvents: LiveOperationalEvent[];
  conversations: Conversation[];
  conversationSummaries: ConversationSummary[];
  reservations: Reservation[];
  guests: Guest[];
  escalations: EscalationEvent[];
  auditEvents: AuditEvent[];
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
