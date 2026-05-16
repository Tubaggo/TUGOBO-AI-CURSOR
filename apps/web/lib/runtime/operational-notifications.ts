import type { EscalationEvent } from "@/lib/types/ai-brain";
import type { Reservation } from "@/app/app/_types";
import type { RuntimeEvent } from "./runtime-events";
import type { AIRuntimeState } from "./types";

export const OPERATIONAL_NOTIFICATION_KINDS = [
  "escalation",
  "payment_failure",
  "human_takeover",
  "reservation_confirmation",
  "vip_arrival",
  "low_confidence",
  "payment_link",
  "policy_trigger",
] as const;

export type OperationalNotificationKind = (typeof OPERATIONAL_NOTIFICATION_KINDS)[number];

export const NOTIFICATION_SEVERITIES = ["info", "warning", "critical"] as const;

export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export type NotificationActionStatus = "open" | "in_progress" | "resolved" | "dismissed";

export type OperationalNotification = {
  id: string;
  kind: OperationalNotificationKind;
  severity: NotificationSeverity;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionStatus: NotificationActionStatus;
  assignedStaff: string | null;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  escalationId?: string;
  auditEventId?: string;
};

let notificationSeq = 0;

export function nextNotificationId(prefix: string): string {
  notificationSeq += 1;
  return `ntf_${prefix}_${notificationSeq}`;
}

export function resetNotificationIdSequence(): void {
  notificationSeq = 0;
}

function severityFromEscalation(severity: EscalationEvent["severity"]): NotificationSeverity {
  if (severity === "critical" || severity === "high") return "critical";
  if (severity === "medium") return "warning";
  return "info";
}

export function notificationFromEscalation(e: EscalationEvent): OperationalNotification {
  return {
    id: nextNotificationId(e.id),
    kind: e.reason === "human_takeover" ? "human_takeover" : "escalation",
    severity: severityFromEscalation(e.severity),
    title: e.title,
    body: e.guestImpact,
    createdAt: e.createdAt,
    read: false,
    actionStatus: e.resolved ? "resolved" : "open",
    assignedStaff: e.assignedOwner ?? null,
    conversationId: e.conversationId,
    reservationId: e.reservationId,
    guestId: e.guestId,
    escalationId: e.id,
  };
}

export function buildInitialNotifications(state: Pick<
  AIRuntimeState,
  "escalations" | "reservations" | "conversations"
>): OperationalNotification[] {
  const items: OperationalNotification[] = [];

  for (const e of state.escalations.filter((x) => !x.resolved)) {
    items.push(notificationFromEscalation(e));
  }

  for (const r of state.reservations) {
    if (r.paymentStatus === "payment_failed") {
      items.push({
        id: nextNotificationId("payfail"),
        kind: "payment_failure",
        severity: "critical",
        title: `Payment failed · ${r.code}`,
        body: `${r.guestName} — PSP hold requires desk intervention.`,
        createdAt: r.checkIn,
        read: false,
        actionStatus: "open",
        assignedStaff: r.assignedTo ?? null,
        reservationId: r.id,
        conversationId: r.conversationId ?? undefined,
        guestId: r.guestId,
      });
    }
    if (r.status === "confirmed" && r.paymentStatus === "paid") {
      items.push({
        id: nextNotificationId("resconf"),
        kind: "reservation_confirmation",
        severity: "info",
        title: `Reservation confirmed · ${r.code}`,
        body: `${r.guestName} — pipeline stage confirmed.`,
        createdAt: r.checkOut,
        read: true,
        actionStatus: "resolved",
        assignedStaff: r.assignedTo ?? null,
        reservationId: r.id,
        guestId: r.guestId,
      });
    }
  }

  for (const c of state.conversations) {
    if (c.aiInsight.confidence < 0.55) {
      items.push({
        id: nextNotificationId("lowconf"),
        kind: "low_confidence",
        severity: "warning",
        title: `Low AI confidence · ${c.guest.name}`,
        body: "Autonomous send restricted — human review suggested.",
        createdAt: c.lastMessageAt,
        read: false,
        actionStatus: "open",
        assignedStaff: c.assignedTo ?? null,
        conversationId: c.id,
        reservationId: c.reservationId ?? undefined,
        guestId: c.guestId,
      });
    }
    if (c.guest.tags.some((t) => /vip/i.test(t)) || c.priority === "urgent") {
      items.push({
        id: nextNotificationId("vip"),
        kind: "vip_arrival",
        severity: "info",
        title: `VIP thread active · ${c.guest.name}`,
        body: "Concierge routing threshold lowered for inbound messages.",
        createdAt: c.lastMessageAt,
        read: false,
        actionStatus: "open",
        assignedStaff: c.assignedTo ?? null,
        conversationId: c.id,
        guestId: c.guestId,
      });
    }
    if (c.aiState === "human_active") {
      items.push({
        id: nextNotificationId("takeover"),
        kind: "human_takeover",
        severity: "warning",
        title: `Human takeover · ${c.guest.name}`,
        body: "Staff assumed control — AI messaging paused.",
        createdAt: c.lastMessageAt,
        read: false,
        actionStatus: "in_progress",
        assignedStaff: c.assignedTo ?? null,
        conversationId: c.id,
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 48);
}

export function applyNotificationFromRuntimeEvent(
  notifications: OperationalNotification[],
  event: RuntimeEvent,
  state: AIRuntimeState
): OperationalNotification[] {
  const { type, payload } = event;
  const res = payload.reservationId
    ? state.reservations.find((r) => r.id === payload.reservationId)
    : undefined;
  const conv = payload.conversationId
    ? state.conversations.find((c) => c.id === payload.conversationId)
    : undefined;

  let next = [...notifications];

  const push = (n: Omit<OperationalNotification, "id"> & { id?: string }) => {
    next = [
      {
        id: n.id ?? nextNotificationId(type),
        ...n,
      } as OperationalNotification,
      ...next,
    ].slice(0, 48);
  };

  switch (type) {
    case "PAYMENT_LINK_SENT":
      push({
        kind: "payment_link",
        severity: "info",
        title: `Payment link sent · ${res?.code ?? "reservation"}`,
        body: "Guest notified — awaiting PSP capture.",
        createdAt: event.createdAt,
        read: false,
        actionStatus: "in_progress",
        assignedStaff: res?.assignedTo ?? null,
        reservationId: payload.reservationId,
        conversationId: payload.conversationId,
        guestId: payload.guestId,
      });
      break;
    case "PAYMENT_LINK_FAILED":
      push({
        kind: "payment_failure",
        severity: "critical",
        title: `Payment failed · ${res?.code ?? "reservation"}`,
        body: "PSP declined or timed out — escalation path opened.",
        createdAt: event.createdAt,
        read: false,
        actionStatus: "open",
        assignedStaff: res?.assignedTo ?? "Revenue Desk",
        reservationId: payload.reservationId,
        conversationId: payload.conversationId,
        guestId: payload.guestId,
      });
      break;
    case "PAYMENT_COMPLETED":
      next = next.map((n) =>
        n.reservationId === payload.reservationId && n.kind === "payment_failure"
          ? { ...n, actionStatus: "resolved" as const, read: true }
          : n
      );
      push({
        kind: "reservation_confirmation",
        severity: "info",
        title: `Payment captured · ${res?.code ?? "reservation"}`,
        body: "Deposit reconciled — confirmation workflow resumed.",
        createdAt: event.createdAt,
        read: false,
        actionStatus: "resolved",
        assignedStaff: res?.assignedTo ?? null,
        reservationId: payload.reservationId,
        conversationId: payload.conversationId,
      });
      break;
    case "HUMAN_TAKEOVER":
      push({
        kind: "human_takeover",
        severity: "warning",
        title: `Human takeover · ${conv?.guest.name ?? "thread"}`,
        body: "Supervisor bridge active — AI send queue paused.",
        createdAt: event.createdAt,
        read: false,
        actionStatus: "in_progress",
        assignedStaff: conv?.assignedTo ?? "Front Desk",
        conversationId: payload.conversationId,
        reservationId: payload.reservationId,
        guestId: payload.guestId,
      });
      break;
    case "LOW_CONFIDENCE_QUOTE":
      push({
        kind: "low_confidence",
        severity: "warning",
        title: `Confidence gate · ${conv?.guest.name ?? "thread"}`,
        body: "Quote held pending supervisor clearance.",
        createdAt: event.createdAt,
        read: false,
        actionStatus: "open",
        assignedStaff: null,
        conversationId: payload.conversationId,
      });
      break;
    case "VIP_GUEST_DETECTED":
      push({
        kind: "vip_arrival",
        severity: "info",
        title: `VIP signal · ${conv?.guest.name ?? "guest"}`,
        body: "White-glove routing engaged across modules.",
        createdAt: event.createdAt,
        read: false,
        actionStatus: "open",
        assignedStaff: conv?.assignedTo ?? null,
        conversationId: payload.conversationId,
        guestId: payload.guestId,
      });
      break;
    case "ESCALATION_RESOLVED":
      next = next.map((n) =>
        n.escalationId && state.escalations.find((e) => e.id === n.escalationId)?.resolved
          ? { ...n, actionStatus: "resolved" as const, read: true }
          : n.kind === "escalation" && n.conversationId === payload.conversationId
            ? { ...n, actionStatus: "resolved" as const }
            : n
      );
      break;
    default:
      break;
  }

  return next;
}

export function unreadNotificationCount(notifications: OperationalNotification[]): number {
  return notifications.filter((n) => !n.read && n.actionStatus !== "dismissed").length;
}
