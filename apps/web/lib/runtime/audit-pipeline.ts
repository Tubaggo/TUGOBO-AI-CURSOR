import type {
  AuditEvent,
  AuditEventType,
  AuditPropagationModule,
  AuditSeverity,
} from "@/lib/types/ai-brain";

function isoNow(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function deriveSeverity(event: Omit<AuditEvent, "id" | "createdAt">): AuditSeverity {
  if (event.humanOverride) return "high";
  switch (event.actionOutcome) {
    case "blocked":
    case "escalated":
      return "high";
    case "pending":
      return "medium";
    case "success":
      return event.type === "override" ? "high" : "low";
    default:
      break;
  }
  switch (event.type as AuditEventType) {
    case "escalation":
      return "high";
    case "policy_trigger":
      return "medium";
    case "failed_action":
      return "critical";
    case "override":
      return "high";
    case "decision":
      return "medium";
    case "action":
      return "low";
    case "knowledge_use":
      return "info";
    default:
      return "info";
  }
}

function derivePropagation(event: Omit<AuditEvent, "id" | "createdAt">): AuditPropagationModule[] {
  const targets = new Set<AuditPropagationModule>(["audit", "ai-brain"]);
  if (event.conversationId) {
    targets.add("conversations");
  }
  if (event.reservationId) {
    targets.add("reservations");
  }
  if (event.guestId) {
    targets.add("guests");
  }
  if (event.type === "escalation" || event.escalationId) {
    targets.add("escalations");
  }
  return [...targets];
}

/**
 * Immutable audit append — enforces trace metadata (event id mirror, severity, propagation DAG).
 */
export function appendAuditPipeline(
  events: AuditEvent[],
  partial: Omit<AuditEvent, "id" | "createdAt">
): AuditEvent[] {
  const id = newId("aud");
  const createdAt = isoNow();
  const severity = partial.severity ?? deriveSeverity(partial);
  const propagationTargets = partial.propagationTargets ?? derivePropagation(partial);
  const row: AuditEvent = {
    ...partial,
    id,
    eventId: partial.eventId ?? id,
    createdAt,
    severity,
    propagationTargets,
  };
  return [row, ...events];
}

export type AuditTimelineGroup = {
  dayKey: string;
  label: string;
  events: AuditEvent[];
};

export function groupAuditTimeline(events: AuditEvent[]): AuditTimelineGroup[] {
  const map = new Map<string, AuditEvent[]>();
  for (const e of events) {
    const d = new Date(e.createdAt);
    const dayKey = d.toISOString().slice(0, 10);
    const prev = map.get(dayKey) ?? [];
    prev.push(e);
    map.set(dayKey, prev);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] > b[0] ? -1 : 1))
    .map(([dayKey, evs]) => ({
      dayKey,
      label: new Date(dayKey).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      events: evs.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    }));
}

export function filterAuditPipeline(
  events: AuditEvent[],
  filter: {
    severity?: AuditSeverity | "all";
    type?: AuditEvent["type"] | "all";
    humanOverrideOnly?: boolean;
  }
): AuditEvent[] {
  return events.filter((e) => {
    if (filter.severity && filter.severity !== "all" && e.severity !== filter.severity) {
      return false;
    }
    if (filter.type && filter.type !== "all" && e.type !== filter.type) {
      return false;
    }
    if (filter.humanOverrideOnly && !e.humanOverride) {
      return false;
    }
    return true;
  });
}
