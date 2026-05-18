import { graphNodeLabel } from "@/lib/i18n/operational-copy";
import type { OperationalEventType } from "../events/types";
import type { GraphPropagation, PropagationNode } from "./types";

const EVENT_NODES: Record<OperationalEventType, PropagationNode[]> = {
  PAYMENT_FAILED: [
    "revenue",
    "reservation",
    "thread",
    "guest",
    "recovery",
    "alert",
    "audit",
    "ai_action",
    "memory",
    "timeline",
  ],
  RECOVERY_STARTED: [
    "recovery",
    "reservation",
    "thread",
    "alert",
    "audit",
    "ai_action",
    "memory",
    "timeline",
  ],
  RECOVERY_SUCCESS: [
    "revenue",
    "reservation",
    "thread",
    "guest",
    "recovery",
    "alert",
    "audit",
    "memory",
    "timeline",
  ],
  BOOKING_CONFIRMED: ["reservation", "revenue", "guest", "timeline", "audit"],
  UPSELL_ACCEPTED: ["revenue", "reservation", "guest", "thread", "audit", "timeline"],
  VIP_ESCALATION: [
    "thread",
    "guest",
    "alert",
    "audit",
    "ai_action",
    "memory",
    "timeline",
    "recovery",
  ],
  OTA_CONVERSION: ["revenue", "guest", "recovery", "alert", "audit", "memory", "timeline"],
  HUMAN_TAKEOVER: ["thread", "guest", "revenue", "alert", "audit", "ai_action", "memory", "timeline"],
};

const EVENT_SUMMARY: Record<OperationalEventType, string> = {
  PAYMENT_FAILED: "Payment risk propagated across revenue, pipeline, guest memory, and recovery layer",
  RECOVERY_STARTED: "Recovery orchestration synchronized to reservation and conversation runtime",
  RECOVERY_SUCCESS: "Financial exposure cleared · guest intelligence and memory updated",
  BOOKING_CONFIRMED: "Booking confirmed · direct pipeline and timeline updated",
  UPSELL_ACCEPTED: "ADR uplift recorded · guest financial memory enriched",
  VIP_ESCALATION: "VIP escalation chain activated · human pathway armed",
  OTA_CONVERSION: "OTA conversion saved commission · loyalty graph updated",
  HUMAN_TAKEOVER: "Human takeover propagated with full AI context attachment",
};

export function buildGraphPropagation(type: OperationalEventType): GraphPropagation {
  return {
    id: `prop-${Date.now()}`,
    eventType: type,
    triggeredAt: Date.now(),
    nodes: EVENT_NODES[type],
    summary: EVENT_SUMMARY[type],
  };
}

export function nodeLabel(node: PropagationNode): string {
  return graphNodeLabel(node);
}

/** @deprecated Use nodeLabel() — kept for imports */
export const NODE_LABELS: Record<PropagationNode, string> = new Proxy({} as Record<PropagationNode, string>, {
  get: (_target, prop: string) => graphNodeLabel(prop),
});
