import type { RuntimeEntityRef } from "./types";

export const RUNTIME_EVENT_TYPES = [
  "PAYMENT_LINK_SENT",
  "PAYMENT_LINK_FAILED",
  "PAYMENT_COMPLETED",
  "UPGRADE_OFFERED",
  "NEGATIVE_SENTIMENT",
  "LOW_CONFIDENCE_QUOTE",
  "VIP_GUEST_DETECTED",
  "OTA_RECOVERY_TRIGGERED",
  "HUMAN_TAKEOVER",
  "TRANSFER_DELAY_RISK",
  "WORKFLOW_RESUMED",
  "ESCALATION_RESOLVED",
] as const;

export type RuntimeEventType = (typeof RUNTIME_EVENT_TYPES)[number];

export type RuntimeEventPayload = RuntimeEntityRef & {
  /** Optional human-readable trigger label for audit */
  triggerLabel?: string;
  /** Override confidence delta for simulations */
  confidenceDelta?: number;
};

export type RuntimeEvent = {
  id: string;
  type: RuntimeEventType;
  payload: RuntimeEventPayload;
  createdAt: string;
};

export function createRuntimeEvent(
  type: RuntimeEventType,
  payload: RuntimeEventPayload
): RuntimeEvent {
  return {
    id: `evt_${type.toLowerCase()}_${Date.now()}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
  };
}
