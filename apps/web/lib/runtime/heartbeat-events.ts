import type { LiveOperationalEvent, OperationalModule } from "./live-events";
import { appendLiveEvent } from "./live-events";

/** Passive orchestration pulses — no entity mutation, executive-demo ambience. */
export const HEARTBEAT_EVENT_TEMPLATES: Omit<LiveOperationalEvent, "id" | "createdAt">[] = [
  {
    eventType: "orchestration_sync",
    title: "Orchestration heartbeat stable",
    story: "Cross-module context synchronized — reservation, guest, and thread fabric aligned.",
    module: "ai-brain",
    severity: "info",
    agentRole: "guest_memory_agent",
  },
  {
    eventType: "confidence_restored",
    title: "AI confidence restored",
    story: "Supervisor clearance propagated — autonomous messaging re-enabled above gate.",
    module: "ai-brain",
    severity: "success",
    agentRole: "escalation_supervisor",
  },
  {
    eventType: "payment_recovered",
    title: "Payment recovered",
    story: "Alternate PSP path cleared hold — deposit capture reconciled to ledger.",
    module: "reservations",
    severity: "success",
    agentRole: "payment_recovery_agent",
  },
  {
    eventType: "escalation_routed",
    title: "Escalation routed",
    story: "Supervisor mesh assigned owner — human bridge within SLA window.",
    module: "escalations",
    severity: "warning",
    agentRole: "escalation_supervisor",
  },
  {
    eventType: "vip_detected_pulse",
    title: "VIP guest detected",
    story: "Loyalty graph signal — concierge routing threshold lowered for inbound thread.",
    module: "guests",
    severity: "info",
    agentRole: "guest_memory_agent",
  },
  {
    eventType: "ota_recovery_pulse",
    title: "OTA recovery triggered",
    story: "Direct conversion band armed — rate parity check passed policy floor.",
    module: "reservations",
    severity: "info",
    agentRole: "revenue_optimization_agent",
  },
  {
    eventType: "reservation_confirmed_pulse",
    title: "Reservation confirmed",
    story: "Pipeline stage advanced — revenue recognized on influenced direct booking.",
    module: "reservations",
    severity: "success",
    agentRole: "reservation_agent",
  },
  {
    eventType: "policy_evaluated",
    title: "Policy evaluation complete",
    story: "Active guardrails scanned — no new blocks on autonomous send queue.",
    module: "audit",
    severity: "info",
    agentRole: "escalation_supervisor",
  },
  {
    eventType: "revenue_signal",
    title: "Revenue signal elevated",
    story: "Upsell corridor widened on high-intent guest — margin floor satisfied.",
    module: "conversations",
    severity: "info",
    agentRole: "revenue_optimization_agent",
  },
];

let heartbeatCursor = 0;

export function nextHeartbeatEvent(): LiveOperationalEvent {
  const template =
    HEARTBEAT_EVENT_TEMPLATES[heartbeatCursor % HEARTBEAT_EVENT_TEMPLATES.length]!;
  heartbeatCursor += 1;
  return {
    ...template,
    id: `hb_${Date.now()}_${heartbeatCursor}`,
    createdAt: new Date().toISOString(),
  };
}

export function applyHeartbeatToEvents(
  events: LiveOperationalEvent[],
  event: LiveOperationalEvent
): LiveOperationalEvent[] {
  return appendLiveEvent(events, event, 28);
}

export const MODULE_ROTATION: OperationalModule[] = [
  "conversations",
  "reservations",
  "guests",
  "ai-brain",
  "audit",
  "escalations",
];
