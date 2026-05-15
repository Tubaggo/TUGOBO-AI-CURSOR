import type { RuntimeEventType } from "./runtime-events";

export const OPERATIONAL_MODULES = [
  "conversations",
  "reservations",
  "guests",
  "ai-brain",
  "escalations",
  "audit",
] as const;

export type OperationalModule = (typeof OPERATIONAL_MODULES)[number];

export type LiveEventSeverity = "info" | "success" | "warning" | "critical";

export type LiveOperationalEvent = {
  id: string;
  eventType: string;
  title: string;
  story: string;
  module: OperationalModule;
  severity: LiveEventSeverity;
  createdAt: string;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  runtimeEventType?: RuntimeEventType;
};

export type LiveEventCatalogEntry = {
  eventType: string;
  title: string;
  story: string;
  module: OperationalModule;
  severity: LiveEventSeverity;
};

export const LIVE_EVENT_CATALOG: Record<RuntimeEventType, LiveEventCatalogEntry> = {
  PAYMENT_LINK_FAILED: {
    eventType: "payment_failed",
    title: "Payment link failed",
    story: "AI paused autonomous replies due to payment friction. Reservation held; escalation path armed.",
    module: "conversations",
    severity: "warning",
  },
  PAYMENT_COMPLETED: {
    eventType: "payment_success",
    title: "Payment captured",
    story: "Payment cleared — reservation confirmed and confidence restored across the pipeline.",
    module: "reservations",
    severity: "success",
  },
  NEGATIVE_SENTIMENT: {
    eventType: "sentiment_drop",
    title: "Sentiment dropped",
    story: "Guest sentiment fell after second reminder. Supervisor queue opened; autonomous send gated.",
    module: "conversations",
    severity: "warning",
  },
  LOW_CONFIDENCE_QUOTE: {
    eventType: "confidence_low",
    title: "Low-confidence quote",
    story: "Escalation path opened due to confidence collapse on active rate quote.",
    module: "ai-brain",
    severity: "warning",
  },
  VIP_GUEST_DETECTED: {
    eventType: "vip_detected",
    title: "VIP detected",
    story: "VIP detected from loyalty graph — concierge routing and faster human threshold engaged.",
    module: "guests",
    severity: "info",
  },
  OTA_RECOVERY_TRIGGERED: {
    eventType: "ota_recovery",
    title: "OTA recovery started",
    story: "Resolving OTA conversion risk — direct recovery sequence initiated.",
    module: "reservations",
    severity: "info",
  },
  HUMAN_TAKEOVER: {
    eventType: "human_takeover",
    title: "Human takeover",
    story: "Staff assumed thread control. AI autonomous path paused pending clearance.",
    module: "conversations",
    severity: "info",
  },
  TRANSFER_DELAY_RISK: {
    eventType: "transfer_risk",
    title: "Transfer delay risk",
    story: "VIP arrival orchestration flagged — transfer SLA buffer below minimum.",
    module: "escalations",
    severity: "critical",
  },
  WORKFLOW_RESUMED: {
    eventType: "workflow_resumed",
    title: "Workflow resumed",
    story: "Operational clearance received — AI workflows running again.",
    module: "ai-brain",
    severity: "success",
  },
  ESCALATION_RESOLVED: {
    eventType: "escalation_resolved",
    title: "Escalation resolved",
    story: "Escalation supervision cleared — confidence recalculated for linked entities.",
    module: "escalations",
    severity: "success",
  },
};

const SEED_EVENTS: Omit<LiveOperationalEvent, "id" | "createdAt">[] = [
  {
    eventType: "reservation_created",
    title: "Reservation created",
    story: "AI qualified direct booking — deposit path armed.",
    module: "reservations",
    severity: "success",
  },
  {
    eventType: "upsell_triggered",
    title: "Upsell triggered",
    story: "Room upgrade offer sent based on stay pattern and availability band.",
    module: "conversations",
    severity: "info",
  },
  {
    eventType: "ai_active",
    title: "AI monitoring active",
    story: "Orchestration heartbeat stable — cross-module context in sync.",
    module: "ai-brain",
    severity: "info",
  },
  {
    eventType: "payment_recovery",
    title: "Monitoring payment recovery",
    story: "Payment recovery workflow supervising hold expiry and alternate PSP path.",
    module: "ai-brain",
    severity: "info",
  },
];

export function buildSeedLiveEvents(): LiveOperationalEvent[] {
  const now = Date.now();
  return SEED_EVENTS.map((e, i) => ({
    ...e,
    id: `live_seed_${i}`,
    createdAt: new Date(now - (i + 1) * 180_000).toISOString(),
  }));
}

export function createLiveEventFromRuntime(
  runtimeType: RuntimeEventType,
  refs: {
    conversationId?: string;
    reservationId?: string;
    guestId?: string;
  }
): LiveOperationalEvent {
  const catalog = LIVE_EVENT_CATALOG[runtimeType];
  return {
    id: `live_${runtimeType.toLowerCase()}_${Date.now()}`,
    ...catalog,
    createdAt: new Date().toISOString(),
    runtimeEventType: runtimeType,
    ...refs,
  };
}

export function appendLiveEvent(
  events: LiveOperationalEvent[],
  event: LiveOperationalEvent,
  max = 24
): LiveOperationalEvent[] {
  return [event, ...events].slice(0, max);
}
