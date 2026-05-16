/**
 * Typed operational entities — UI/runtime layer ahead of Supabase projections.
 * Domain rows remain Drizzle-backed in @tugobo/db; these shapes mirror dashboard contracts.
 */

import type { AIActiveWorkflow } from "@/lib/types/ai-brain";
import type { AuditEvent } from "@/lib/types/ai-brain";
import type { Conversation } from "@/lib/types/conversations";
import type { Guest } from "@/lib/types/guests";
import type { Reservation } from "@/app/app/_types";

export type { Guest, Conversation, Reservation, AuditEvent, AIActiveWorkflow };

/** Canonical workflow handle used in overview panels (maps to AI Brain active workflows). */
export type Workflow = AIActiveWorkflow;

export type EscalationRef = {
  id: string;
  title: string;
  reason: string;
  severity: string;
  resolved: boolean;
};

/** Supervised runtime phases — surfaced alongside legacy runtime status chips. */
export const OPERATION_PHASE_STATES = [
  "AI_ACTIVE",
  "HUMAN_REVIEW",
  "ESCALATED",
  "PAYMENT_RISK",
  "VIP_FLOW",
  "OTA_RECOVERY",
  "WAITING_GUEST",
  "ACTION_BLOCKED",
  "CONFIRMED",
] as const;

export type OperationPhaseState = (typeof OPERATION_PHASE_STATES)[number];

export type OperationalAction = {
  id: string;
  label: string;
  runtimeEventType: string;
  outcome: "success" | "pending" | "blocked" | "propagated";
  createdAt: string;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
};

export type StaffAssignmentState = "unassigned" | "assigned" | "handoff" | "supervisor_routed";

export type StaffAssignment = {
  id: string;
  entityKey: string;
  staffName: string;
  role: "owner" | "collaborator" | "supervisor";
  state: StaffAssignmentState;
  /** Short operational note — handoff context */
  note?: string;
  updatedAt: string;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
};

export type StaffNoteEntry = {
  id: string;
  createdAt: string;
  author: string;
  body: string;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
};

export type InterventionLogEntry = {
  id: string;
  createdAt: string;
  label: string;
  actor: string;
  supervisorApproved?: boolean;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
};

/** Persistent AI memory facet per guest — influences orchestration weight client-side. */
export type GuestAiMemoryProfile = {
  guestId: string;
  memoryTags: string[];
  preferenceMemory: string[];
  stayHistoryMemory: string[];
  operationalNotes: string[];
  riskMemory: string[];
  loyaltyMemory: string[];
  upsellMemory: string[];
  /** 0–1 routing weight boost applied to confidence reconciliation */
  orchestrationWeight: number;
};
