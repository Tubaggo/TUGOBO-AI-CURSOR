import type {
  AIActionFeedItem,
  AIBrainOverview,
  AIActiveWorkflow,
  EscalationEvent,
  EscalationReason,
} from "@/lib/types/ai-brain";
import type { Conversation, ConversationSummary } from "@/lib/types/conversations";
import type { Guest, GuestRiskFlag, GuestSentiment } from "@/lib/types/guests";
import type { Reservation, ReservationPipelineStage, UrgencyLevel } from "@/app/app/_types";
import { agentRoleForEscalationReason, agentRoleForRuntimeEvent } from "./agent-role-map";
import { recalculateConversationConfidence } from "./confidence-engine";
import { appendAuditPipeline } from "./audit-pipeline";
import { patchGuestAiMemory } from "@/lib/ai/memory-influence";
import { appendLiveEvent, createLiveEventFromRuntime, LIVE_EVENT_CATALOG } from "./live-events";
import type { RuntimeEvent } from "./runtime-events";
import type { AIRuntimeState, AIActionMemoryEntry, ConversationRuntimeMeta, RuntimeOperationalStatus } from "./types";
import { defaultOwnerForEscalation } from "./staff-roster";

function isoNow(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

function upsertStatuses(
  map: Record<string, RuntimeOperationalStatus[]>,
  key: string,
  statuses: RuntimeOperationalStatus[],
  replace = false
): Record<string, RuntimeOperationalStatus[]> {
  const existing = map[key] ?? [];
  const merged = replace ? statuses : [...new Set([...existing, ...statuses])];
  return { ...map, [key]: merged };
}

function removeStatuses(
  map: Record<string, RuntimeOperationalStatus[]>,
  key: string,
  toRemove: RuntimeOperationalStatus[]
): Record<string, RuntimeOperationalStatus[]> {
  const existing = map[key] ?? [];
  const next = existing.filter((s) => !toRemove.includes(s));
  if (next.length === 0) {
    const { [key]: _, ...rest } = map;
    return rest;
  }
  return { ...map, [key]: next };
}

function appendEscalation(
  events: EscalationEvent[],
  partial: Omit<EscalationEvent, "id" | "createdAt" | "resolved" | "resolvedAt">
): EscalationEvent[] {
  const createdAt = isoNow();
  const slaHours = partial.severity === "critical" ? 0.5 : partial.severity === "high" ? 1 : 2;
  return [
    {
      id: newId("esc"),
      createdAt,
      resolved: false,
      resolvedAt: null,
      assignedOwner: partial.assignedOwner ?? defaultOwnerForEscalation(partial.reason),
      sourceModule: partial.sourceModule ?? "ai-brain",
      suggestedAction:
        partial.suggestedAction ?? "Review linked thread and assign desk owner within SLA.",
      slaDueAt:
        partial.slaDueAt ??
        new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString(),
      ...partial,
    },
    ...events,
  ];
}

function appendFeed(
  feed: AIActionFeedItem[],
  item: Omit<AIActionFeedItem, "id" | "createdAt">
): AIActionFeedItem[] {
  return [{ id: newId("feed"), createdAt: isoNow(), ...item }, ...feed].slice(0, 12);
}

const MEMORY_CAP = 48;

function appendMemory(
  memory: AIActionMemoryEntry[],
  partial: Omit<AIActionMemoryEntry, "id" | "createdAt">
): AIActionMemoryEntry[] {
  return [{ id: newId("mem"), createdAt: isoNow(), ...partial }, ...memory].slice(0, MEMORY_CAP);
}

function escalationMetricsFrom(
  escalations: EscalationEvent[]
): AIBrainOverview["escalationActivity"] {
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const active = escalations.filter((e) => !e.resolved).length;
  const unresolved24h = escalations.filter(
    (e) => !e.resolved && now - new Date(e.createdAt).getTime() < 86_400_000
  ).length;
  const resolvedToday = escalations.filter(
    (e) =>
      e.resolved &&
      e.resolvedAt !== null &&
      new Date(e.resolvedAt).getTime() >= dayStart.getTime()
  ).length;
  return { active, unresolved24h, resolvedToday };
}

function patchWorkflows(
  workflows: AIActiveWorkflow[],
  id: string,
  patch: Partial<AIActiveWorkflow>
): AIActiveWorkflow[] {
  return workflows.map((w) => (w.id === id ? { ...w, ...patch } : w));
}

function findReservation(
  reservations: Reservation[],
  conversationId?: string,
  reservationId?: string
): Reservation | undefined {
  if (reservationId) return reservations.find((r) => r.id === reservationId);
  if (conversationId) return reservations.find((r) => r.conversationId === conversationId);
  return undefined;
}

function syncSummary(conv: Conversation): ConversationSummary {
  return {
    id: conv.id,
    hotelId: conv.hotelId,
    guestId: conv.guestId,
    channel: conv.channel,
    status: conv.status,
    aiState: conv.aiState,
    assignedTo: conv.assignedTo,
    unreadCount: conv.unreadCount,
    priority: conv.priority,
    reservationId: conv.reservationId,
    lastMessageAt: conv.lastMessageAt,
    lastMessagePreview: conv.lastMessagePreview,
    escalationFlag: conv.escalationFlag,
    guestName: conv.guest.name,
  };
}

function updateConversationInState(
  state: AIRuntimeState,
  conversationId: string,
  patch: (c: Conversation) => Conversation
): Pick<AIRuntimeState, "conversations" | "conversationSummaries"> {
  const conversations = state.conversations.map((c) =>
    c.id === conversationId ? patch(c) : c
  );
  const conversationSummaries = state.conversationSummaries.map((s) => {
    const updated = conversations.find((c) => c.id === s.id);
    return updated ? syncSummary(updated) : s;
  });
  return { conversations, conversationSummaries };
}

function bumpPolicyTrigger(overview: AIBrainOverview, label: string): AIBrainOverview {
  return {
    ...overview,
    policyTriggers: overview.policyTriggers.map((p) =>
      p.label === label ? { ...p, count24h: p.count24h + 1, lastTriggeredAt: isoNow() } : p
    ),
  };
}

export function applyRuntimeEvent(
  state: AIRuntimeState,
  event: RuntimeEvent
): AIRuntimeState {
  const { type, payload } = event;
  const conversationId = payload.conversationId;
  const reservationId = payload.reservationId;
  const guestId = payload.guestId;

  let next: AIRuntimeState = {
    ...state,
    lastPulseAt: Date.now(),
  };

  const conv = conversationId
    ? next.conversations.find((c) => c.id === conversationId)
    : undefined;
  const res = findReservation(next.reservations, conversationId, reservationId);
  const guest = guestId ? next.guests.find((g) => g.id === guestId) : undefined;

  const metaKey = conversationId ?? "";
  const meta: ConversationRuntimeMeta = next.conversationMeta[metaKey] ?? {
    paymentFailureCount: 0,
    lastEventAt: null,
    operationalStatuses: [],
  };

  const agent = agentRoleForRuntimeEvent(type);

  switch (type) {
    case "PAYMENT_LINK_SENT": {
      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => ({
            ...c,
            status: "awaiting_payment",
            aiInsight: { ...c.aiInsight, escalationSuggested: false },
          })),
          conversationMeta: {
            ...next.conversationMeta,
            [metaKey]: {
              ...meta,
              lastEventAt: isoNow(),
              operationalStatuses: meta.operationalStatuses,
            },
          },
        };
      }

      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id
              ? {
                  ...r,
                  status: "payment_pending" as ReservationPipelineStage,
                  paymentStatus: "awaiting_payment",
                  aiState: "ai_active",
                  urgency: "normal",
                }
              : r
          ),
        };
      }

      next = {
        ...next,
        overview: {
          ...next.overview,
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Send payment link",
            outcome: "success",
            confidence: 0.88,
            explanation:
              "Hosted checkout surfaced on-thread — PSP handshake armed with expiry watchdog.",
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "action",
          title: "Payment link dispatched",
          explanation:
            "Hosted checkout surfaced with reservation linkage intact — Payment Recovery Agent supervising capture.",
          confidence: 0.88,
          knowledgeReferences: ["kn_payment_hold"],
          policyReferences: ["psp_checkout_policy"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          confidenceBefore: conv?.aiInsight.confidence,
          rationale: "Guest qualified above gate — autonomous PSP send permitted.",
          actionOutcome: "success",
        }),
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "payment_link_sent",
          summary: "Payment link issued · PSP watchdog armed",
          agentRole: agent,
          conversationId,
          reservationId: res?.id,
          guestId,
        }),
      };
      break;
    }

    case "PAYMENT_LINK_FAILED": {
      const confidenceBeforeConv = conv?.aiInsight.confidence ?? 0.72;
      const failures = meta.paymentFailureCount + 1;
      const confidenceAfterConv = Math.max(0.35, confidenceBeforeConv - 0.06 * failures);
      const updatedMeta: ConversationRuntimeMeta = {
        ...meta,
        paymentFailureCount: failures,
        lastEventAt: isoNow(),
        operationalStatuses: [...new Set([...meta.operationalStatuses, "payment_risk" as const])],
      };

      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => ({
            ...c,
            status: "awaiting_payment",
            aiState: "paused",
            escalationFlag: true,
            aiInsight: {
              ...c.aiInsight,
              confidence: confidenceAfterConv,
              escalationSuggested: true,
              sentiment: c.aiInsight.sentiment === "positive" ? "mixed" : c.aiInsight.sentiment,
            },
          })),
          conversationMeta: { ...next.conversationMeta, [metaKey]: updatedMeta },
          entityStatuses: upsertStatuses(next.entityStatuses, conversationId, [
            "payment_risk",
            "workflow_paused",
            "escalated",
          ]),
        };
      }

      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id
              ? {
                  ...r,
                  status: "payment_pending" as ReservationPipelineStage,
                  paymentStatus: "payment_failed",
                  aiState: "paused",
                  urgency: (failures >= 2 ? "high" : "normal") as UrgencyLevel,
                }
              : r
          ),
          entityStatuses: upsertStatuses(next.entityStatuses, res.id, [
            "payment_risk",
            "workflow_paused",
          ]),
        };
      }

      if (guestId && guest) {
        next = {
          ...next,
          guests: next.guests.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  riskFlags: addRiskFlag(g.riskFlags, "payment_friction"),
                  sentiment: degradeSentiment(g.sentiment),
                  aiScore: Math.max(0, g.aiScore - 0.08),
                }
              : g
          ),
        };
      }

      const paymentSupervisor = agentRoleForEscalationReason("payment_friction");
      const existingPaymentEscIdx =
        conversationId != null
          ? next.escalations.findIndex(
              (e) =>
                !e.resolved &&
                e.reason === "payment_friction" &&
                e.conversationId === conversationId
            )
          : -1;

      if (conversationId && existingPaymentEscIdx >= 0) {
        next = {
          ...next,
          escalations: next.escalations.map((e, i) =>
            i === existingPaymentEscIdx
              ? {
                  ...e,
                  severity: failures >= 2 ? "high" : "medium",
                  title: failures >= 2 ? "Payment link stalled" : "Payment friction — recovery mode",
                  guestImpact:
                    failures >= 2
                      ? "Guest cannot complete booking — revenue at risk"
                      : "Checkout friction — assisted recovery recommended",
                  explanation:
                    failures >= 2
                      ? "Repeated PSP declines — supervisor loop engaged."
                      : "Checkout friction — alternate PSP path and human assist recommended.",
                  agentRole: paymentSupervisor,
                }
              : e
          ),
          overview: {
            ...bumpPolicyTrigger(next.overview, "Payment hold expiry"),
            activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_payment_recovery", {
              status: failures >= 2 ? "escalated" : "paused",
              progressPct: Math.max(0, 72 - failures * 8),
            }),
            runtime: {
              ...next.overview.runtime,
              status: failures >= 2 ? "attention" : "degraded",
            },
            actionFeed: appendFeed(next.overview.actionFeed, {
              actionName: "Payment link delivery",
              outcome: "blocked",
              confidence: 0.62,
              explanation: `Payment link failed (attempt ${failures}). Pipeline held; AI paused.`,
              conversationId,
              reservationId: res?.id,
              guestId,
              agentRole: agent,
            }),
          },
          auditEvents: appendAuditPipeline(next.auditEvents, {
            type: "policy_trigger",
            title: "Payment friction — hold extended",
            explanation: `Payment link failed ${failures}×. Reservation staged to payment pending; workflows paused.`,
            confidence: 0.71,
            knowledgeReferences: ["kn_payment_hold"],
            policyReferences: ["payment_hold_escalation"],
            humanOverride: false,
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
            confidenceBefore: confidenceBeforeConv,
            confidenceDelta: confidenceAfterConv - confidenceBeforeConv,
            actionOutcome: "blocked",
            rationale:
              "PSP friction breached policy threshold — autonomous path paused pending recovery.",
          }),
          aiActionMemory: appendMemory(next.aiActionMemory, {
            kind: "payment_failed",
            summary: `Payment capture failed · attempt ${failures}`,
            agentRole: agent,
            conversationId,
            reservationId: res?.id,
            guestId,
          }),
        };
      } else if (conversationId) {
        next = {
          ...next,
          escalations: appendEscalation(next.escalations, {
            reason: "payment_friction" as EscalationReason,
            severity: failures >= 2 ? "high" : "medium",
            title: failures >= 2 ? "Payment link stalled" : "Payment friction — recovery mode",
            guestImpact:
              failures >= 2
                ? "Guest cannot complete booking — revenue at risk"
                : "Checkout friction — assisted recovery recommended",
            aiConfidenceBefore: confidenceBeforeConv,
            aiConfidenceAfter: null,
            explanation:
              failures >= 2
                ? "Repeated PSP declines — supervisor loop engaged."
                : "Checkout friction — alternate PSP path and human assist recommended.",
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: paymentSupervisor,
          }),
          overview: {
            ...bumpPolicyTrigger(next.overview, "Payment hold expiry"),
            activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_payment_recovery", {
              status: failures >= 2 ? "escalated" : "paused",
              progressPct: Math.max(0, 72 - failures * 8),
            }),
            runtime: {
              ...next.overview.runtime,
              status: failures >= 2 ? "attention" : "degraded",
            },
            actionFeed: appendFeed(next.overview.actionFeed, {
              actionName: "Payment link delivery",
              outcome: "blocked",
              confidence: 0.62,
              explanation: `Payment link failed (attempt ${failures}). Pipeline held; AI paused.`,
              conversationId,
              reservationId: res?.id,
              guestId,
              agentRole: agent,
            }),
          },
          auditEvents: appendAuditPipeline(next.auditEvents, {
            type: "policy_trigger",
            title: "Payment friction — hold extended",
            explanation: `Payment link failed ${failures}×. Reservation staged to payment pending; workflows paused.`,
            confidence: 0.71,
            knowledgeReferences: ["kn_payment_hold"],
            policyReferences: ["payment_hold_escalation"],
            humanOverride: false,
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
            confidenceBefore: confidenceBeforeConv,
            confidenceDelta: confidenceAfterConv - confidenceBeforeConv,
            actionOutcome: "blocked",
            rationale:
              "PSP friction breached policy threshold — autonomous path paused pending recovery.",
          }),
          aiActionMemory: appendMemory(next.aiActionMemory, {
            kind: "payment_failed",
            summary: `Payment capture failed · attempt ${failures}`,
            agentRole: agent,
            conversationId,
            reservationId: res?.id,
            guestId,
          }),
        };
      } else {
        next = {
          ...next,
          overview: {
            ...bumpPolicyTrigger(next.overview, "Payment hold expiry"),
            activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_payment_recovery", {
              status: "paused",
              progressPct: Math.max(0, 72 - failures * 8),
            }),
            runtime: {
              ...next.overview.runtime,
              status: failures >= 2 ? "attention" : "degraded",
            },
            actionFeed: appendFeed(next.overview.actionFeed, {
              actionName: "Payment link delivery",
              outcome: "blocked",
              confidence: 0.62,
              explanation: `Payment link failed (attempt ${failures}). Pipeline held; AI paused.`,
              conversationId,
              reservationId: res?.id,
              guestId,
              agentRole: agent,
            }),
          },
          auditEvents: appendAuditPipeline(next.auditEvents, {
            type: "policy_trigger",
            title: "Payment friction — hold extended",
            explanation: `Payment link failed ${failures}×. Reservation staged to payment pending; workflows paused.`,
            confidence: 0.71,
            knowledgeReferences: ["kn_payment_hold"],
            policyReferences: ["payment_hold_escalation"],
            humanOverride: false,
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
            confidenceBefore: confidenceBeforeConv,
            confidenceDelta: confidenceAfterConv - confidenceBeforeConv,
            actionOutcome: "blocked",
            rationale:
              "PSP friction breached policy threshold — autonomous path paused pending recovery.",
          }),
          aiActionMemory: appendMemory(next.aiActionMemory, {
            kind: "payment_failed",
            summary: `Payment capture failed · attempt ${failures}`,
            agentRole: agent,
            conversationId,
            reservationId: res?.id,
            guestId,
          }),
        };
      }
      if (guestId) {
        next = {
          ...next,
          guestAiMemory: patchGuestAiMemory(next.guestAiMemory, guestId, (m) => ({
            ...m,
            riskMemory: [
              ...m.riskMemory,
              `Payment friction attempt ${failures} · PSP recovery armed`,
            ],
            orchestrationWeight: Math.max(0, m.orchestrationWeight - 0.04),
          })),
        };
      }
      break;
    }

    case "PAYMENT_COMPLETED": {
      const confBeforePay = conv?.aiInsight.confidence ?? 0.7;
      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => {
            const reservation = findReservation(next.reservations, conversationId);
            const g = next.guests.find((x) => x.id === c.guestId) ?? null;
            const memoryW = next.guestAiMemory[c.guestId]?.orchestrationWeight;
            const confidence = recalculateConversationConfidence(
              c,
              reservation ?? null,
              g,
              0.12,
              memoryW
            );
            return {
              ...c,
              status: "ai_handling",
              aiState: "ai_active",
              escalationFlag: false,
              aiInsight: {
                ...c.aiInsight,
                confidence,
                escalationSuggested: false,
                sentiment: "positive",
              },
            };
          }),
          conversationMeta: {
            ...next.conversationMeta,
            [metaKey]: {
              ...meta,
              paymentFailureCount: 0,
              lastEventAt: isoNow(),
              operationalStatuses: meta.operationalStatuses.filter(
                (s) => s !== "payment_risk" && s !== "workflow_paused"
              ),
            },
          },
          entityStatuses: conversationId
            ? removeStatuses(
                removeStatuses(next.entityStatuses, conversationId, [
                  "payment_risk",
                  "escalated",
                  "workflow_paused",
                ]),
                conversationId,
                ["confidence_low"]
              )
            : next.entityStatuses,
        };
      }

      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id
              ? {
                  ...r,
                  status: "confirmed",
                  paymentStatus: "paid",
                  aiState: "ai_complete",
                  urgency: "none",
                }
              : r
          ),
          entityStatuses: removeStatuses(
            removeStatuses(next.entityStatuses, res.id, ["payment_risk", "workflow_paused"]),
            res.id,
            ["escalated"]
          ),
        };
      }

      const postPayConv = conversationId
        ? next.conversations.find((c) => c.id === conversationId)
        : undefined;

      next = {
        ...next,
        escalations: next.escalations.map((e) =>
          e.conversationId === conversationId &&
          e.reason === "payment_friction" &&
          !e.resolved
            ? {
                ...e,
                resolved: true,
                resolvedAt: isoNow(),
                aiConfidenceAfter: 0.88,
                agentRole: agentRoleForEscalationReason("payment_friction"),
              }
            : e
        ),
        overview: {
          ...next.overview,
          activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_payment_recovery", {
            status: "resolved",
            progressPct: 100,
          }),
          runtime: { ...next.overview.runtime, status: "healthy" },
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Confirm reservation",
            outcome: "success",
            confidence: 0.91,
            explanation: "Payment captured — reservation auto-confirmed; confidence restored.",
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "decision",
          title: "Reservation confirmed — payment captured",
          explanation:
            "Payment completed event propagated. Pipeline moved to confirmed; payment escalations cleared.",
          confidence: 0.91,
          knowledgeReferences: ["kn_payment_hold"],
          policyReferences: ["payment_capture_confirm"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          confidenceBefore: confBeforePay,
          confidenceDelta: (postPayConv?.aiInsight.confidence ?? 0.91) - confBeforePay,
          actionOutcome: "success",
          rationale:
            "PSP settlement confirmed — Reservation Agent closed the workflow and released holds.",
        }),
        aiActionMemory: appendMemory(
          appendMemory(next.aiActionMemory, {
            kind: "payment_success",
            summary: "Payment captured · ledger reconciled",
            agentRole: agent,
            conversationId,
            reservationId: res?.id,
            guestId,
          }),
          {
            kind: "reservation_confirmed",
            summary: "Reservation confirmed post-capture",
            agentRole: "reservation_agent",
            conversationId,
            reservationId: res?.id,
            guestId,
          }
        ),
      };
      break;
    }

    case "UPGRADE_OFFERED": {
      if (guestId && guest) {
        next = {
          ...next,
          guests: next.guests.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  upsellPotential: Math.min(1, g.upsellPotential + 0.08),
                }
              : g
          ),
        };
      }

      next = {
        ...next,
        overview: {
          ...next.overview,
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Surface upgrade offer",
            outcome: "pending",
            confidence: 0.84,
            explanation:
              "Availability-aware upgrade packaged — acceptance tracked against guest risk posture.",
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "action",
          title: "Upgrade offer orchestrated",
          explanation:
            "Revenue Optimization Agent issued a bounded upsell within policy guardrails.",
          confidence: 0.84,
          knowledgeReferences: ["kn_upgrade_eligibility"],
          policyReferences: ["upsell_margin_floor"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          rationale: "Guest fit and inventory headroom exceeded upsell threshold.",
          actionOutcome: "pending",
        }),
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "upgrade_offered",
          summary: "Upgrade offer surfaced · revenue guardrails applied",
          agentRole: agent,
          conversationId,
          reservationId: res?.id,
          guestId,
        }),
      };
      break;
    }

    case "NEGATIVE_SENTIMENT": {
      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => ({
            ...c,
            status: c.status === "ai_handling" ? "escalated" : c.status,
            escalationFlag: true,
            priority: "high",
            aiInsight: {
              ...c.aiInsight,
              sentiment: "negative",
              escalationSuggested: true,
              confidence: Math.max(0.35, c.aiInsight.confidence - 0.18),
            },
          })),
          entityStatuses: upsertStatuses(next.entityStatuses, conversationId, [
            "escalated",
            "confidence_low",
          ]),
        };
      }

      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id ? { ...r, urgency: "high", aiState: "paused" } : r
          ),
        };
      }

      if (guestId && guest) {
        next = {
          ...next,
          guests: next.guests.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  sentiment: "negative",
                  riskFlags: addRiskFlag(g.riskFlags, "complaint_risk"),
                  aiScore: Math.max(0, g.aiScore - 0.12),
                }
              : g
          ),
        };
      }

      next = {
        ...next,
        overview: bumpPolicyTrigger(
          {
            ...next.overview,
            activeWorkflows: next.overview.activeWorkflows.map((w) =>
              w.linkedId === conversationId || w.linkedId === guestId
                ? { ...w, status: "escalated" as const }
                : w
            ),
          },
          "Sentiment guard"
        ),
        escalations: appendEscalation(next.escalations, {
          reason: "sentiment_warning",
          severity: "medium",
          title: "Negative sentiment spike",
          guestImpact: "Guest frustration detected — human review suggested",
          aiConfidenceBefore: conv?.aiInsight.confidence ?? 0.7,
          aiConfidenceAfter: null,
          explanation:
            "Sentiment model dropped below threshold. Autonomous messaging paused pending review.",
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agentRoleForEscalationReason("sentiment_warning"),
        }),
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "escalation",
          title: "Sentiment guard triggered",
          explanation: "Negative sentiment event — reservation flagged for human review.",
          confidence: conv?.aiInsight.confidence ?? 0.55,
          knowledgeReferences: [],
          policyReferences: ["guest_sentiment_guard"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          confidenceBefore: conv?.aiInsight.confidence ?? 0.72,
          rationale: "Guest tone collapsed below supervised messaging threshold.",
          actionOutcome: "escalated",
        }),
        aiActionMemory: appendMemory(
          appendMemory(next.aiActionMemory, {
            kind: "guest_risk_updated",
            summary: "Guest sentiment shifted negative · risk posture tightened",
            agentRole: agent,
            conversationId,
            reservationId: res?.id,
            guestId,
          }),
          {
            kind: "escalation_opened",
            summary: "Escalation supervisor engaged sentiment guard",
            agentRole: "escalation_supervisor",
            conversationId,
            reservationId: res?.id,
            guestId,
          }
        ),
      };
      next = {
        ...next,
        overview: {
          ...next.overview,
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Pause autonomous replies",
            outcome: "escalated",
            confidence: 0.58,
            explanation: "Sentiment below threshold — supervisor queue.",
            conversationId,
            guestId,
            reservationId: res?.id,
            agentRole: agent,
          }),
        },
      };
      break;
    }

    case "LOW_CONFIDENCE_QUOTE": {
      const delta = payload.confidenceDelta ?? -0.22;
      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => ({
            ...c,
            aiInsight: {
              ...c.aiInsight,
              confidence: Math.max(0.35, c.aiInsight.confidence + delta),
              escalationSuggested: true,
            },
          })),
          entityStatuses: upsertStatuses(next.entityStatuses, conversationId, ["confidence_low"]),
        };
      }

      next = {
        ...next,
        escalations: appendEscalation(next.escalations, {
          reason: "low_confidence_quote",
          severity: "medium",
          title: "Low-confidence quote",
          guestImpact: "Quote may be inaccurate — verify rate and policy",
          aiConfidenceBefore: conv?.aiInsight.confidence ?? 0.65,
          aiConfidenceAfter: null,
          explanation: "Model confidence dropped below 60% on active quote.",
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agentRoleForEscalationReason("low_confidence_quote"),
        }),
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "decision",
          title: "Low-confidence quote flagged",
          explanation: "Quote blocked from autonomous send — human verification required.",
          confidence: Math.max(0.35, (conv?.aiInsight.confidence ?? 0.6) + delta),
          knowledgeReferences: [],
          policyReferences: ["confidence_gate_v2"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          confidenceBefore: conv?.aiInsight.confidence ?? 0.65,
          confidenceDelta: delta,
          rationale: "Confidence gate suppresses autonomous pricing without supervisor clearance.",
          actionOutcome: "blocked",
        }),
        overview: {
          ...next.overview,
          activeWorkflows: next.overview.activeWorkflows.map((w) =>
            w.linkedId === conversationId ? { ...w, status: "blocked", progressPct: w.progressPct } : w
          ),
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Hold quote — confidence gate",
            outcome: "blocked",
            confidence: Math.max(0.35, (conv?.aiInsight.confidence ?? 0.65) + delta),
            explanation: "Low-confidence quote requires human verification.",
            conversationId,
            reservationId: res?.id,
            guestId,
            agentRole: agent,
          }),
        },
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "low_confidence_gate",
          summary: "Quote held · escalation supervisor invoked confidence gate",
          agentRole: agent,
          conversationId,
          reservationId: res?.id,
          guestId,
        }),
      };
      break;
    }

    case "VIP_GUEST_DETECTED": {
      if (guestId && guest) {
        next = {
          ...next,
          guests: next.guests.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  loyaltyTier: g.loyaltyTier === "standard" ? "vip" : g.loyaltyTier,
                  tags: [...new Set([...g.tags, "VIP concierge"])],
                  upsellPotential: Math.min(1, g.upsellPotential + 0.15),
                }
              : g
          ),
          entityStatuses: upsertStatuses(next.entityStatuses, guestId, ["vip_flow"]),
        };
      }

      next = {
        ...next,
        overview: {
          ...bumpPolicyTrigger(
            {
              ...next.overview,
              activeWorkflows: next.overview.activeWorkflows.map((w) =>
                w.linkedId === guestId
                  ? { ...w, status: "running", progressPct: Math.min(100, w.progressPct + 5) }
                  : w
              ),
            },
            "VIP escalation"
          ),
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Activate VIP concierge routing",
            outcome: "success",
            confidence: 0.94,
            explanation: "VIP signal — white-glove persona and faster human threshold.",
            guestId,
            conversationId,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "policy_trigger",
          title: "VIP flow activated",
          explanation: "VIP guest detected — lowered escalation threshold; concierge routing on.",
          confidence: 0.94,
          knowledgeReferences: ["kn_vip_transfer"],
          policyReferences: ["vip_concierge_routing"],
          humanOverride: false,
          guestId,
          conversationId,
          agentRole: agent,
          rationale: "Loyalty graph triggered VIP handling playbook.",
          actionOutcome: "success",
        }),
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "vip_signal",
          summary: "VIP concierge routing activated",
          agentRole: agent,
          guestId,
          conversationId,
        }),
        guestAiMemory: guestId
          ? patchGuestAiMemory(next.guestAiMemory, guestId, (m) => ({
              ...m,
              memoryTags: [...new Set([...m.memoryTags, "VIP concierge"])],
              loyaltyMemory: [
                ...m.loyaltyMemory,
                "VIP flow activated — supervised routing engaged",
              ],
              upsellMemory: [...m.upsellMemory, "Upsell corridor widened under VIP policy"],
              orchestrationWeight: Math.min(1, m.orchestrationWeight + 0.09),
            }))
          : next.guestAiMemory,
      };
      break;
    }

    case "OTA_RECOVERY_TRIGGERED": {
      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id
              ? { ...r, aiState: "ai_active", urgency: "normal", source: r.source }
              : r
          ),
        };
      }

      next = {
        ...next,
        overview: {
          ...bumpPolicyTrigger(next.overview, "OTA recovery band"),
          activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_ota_direct", {
            status: "running",
            progressPct: Math.min(100, 45 + 12),
          }),
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "OTA → direct recovery touch",
            outcome: "pending",
            confidence: 0.82,
            explanation: "Recovery messaging sequence initiated.",
            reservationId: res?.id,
            conversationId,
            guestId,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "action",
          title: "OTA recovery workflow started",
          explanation: "Direct conversion incentive path engaged per OTA recovery policy.",
          confidence: 0.82,
          knowledgeReferences: ["kn_ota_recovery"],
          policyReferences: ["ota_recovery_band"],
          humanOverride: false,
          reservationId: res?.id,
          guestId,
          conversationId,
          agentRole: agent,
          rationale: "OTA leakage risk exceeded routing threshold.",
          actionOutcome: "pending",
        }),
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "ota_recovery",
          summary: "OTA → direct recovery sequence armed",
          agentRole: agent,
          reservationId: res?.id,
          conversationId,
          guestId,
        }),
      };
      break;
    }

    case "HUMAN_TAKEOVER": {
      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => ({
            ...c,
            status: "human_takeover",
            aiState: "human_active",
            assignedTo: c.assignedTo ?? "Ops Lead",
          })),
          entityStatuses: upsertStatuses(next.entityStatuses, conversationId, ["human_active"], true),
        };
      }

      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id ? { ...r, aiState: "human_active", assignedTo: r.assignedTo ?? "Ops Lead" } : r
          ),
        };
      }

      next = {
        ...next,
        staffAssignments: [
          {
            id: newId("assign"),
            entityKey: conversationId ?? res?.id ?? guestId ?? "thread",
            staffName:
              (conversationId &&
                next.conversations.find((c) => c.id === conversationId)?.assignedTo) ??
              res?.assignedTo ??
              "Ops Lead",
            role: "owner" as const,
            state: "assigned" as const,
            note: "Authoritative thread control — automation paused",
            updatedAt: isoNow(),
            conversationId,
            reservationId: res?.id,
            guestId,
          },
          ...next.staffAssignments,
        ].slice(0, 48),
        interventions: [
          {
            id: newId("intr"),
            createdAt: isoNow(),
            label: "Human takeover · AI paused · escalation fabric notified",
            actor: "Staff operator",
            supervisorApproved: false,
            conversationId,
            reservationId: res?.id,
            guestId,
          },
          ...next.interventions,
        ].slice(0, 64),
        overview: {
          ...next.overview,
          humanTakeoverRatio: Math.min(0.45, next.overview.humanTakeoverRatio + 0.04),
          activeWorkflows: next.overview.activeWorkflows.map((w) =>
            w.linkedId === conversationId ? { ...w, status: "awaiting_human" } : w
          ),
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Human takeover",
            outcome: "success",
            confidence: 0.95,
            explanation: "Operational control transferred to staff.",
            conversationId,
            guestId,
            reservationId: res?.id,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "override",
          title: "Human takeover activated",
          explanation: "Staff assumed thread control — AI autonomous path paused.",
          confidence: 0.95,
          knowledgeReferences: [],
          policyReferences: ["human_takeover_sop"],
          humanOverride: true,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          rationale: "Human operator requested authoritative control over thread.",
          actionOutcome: "success",
        }),
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "human_takeover",
          summary: "Human operator assumed authoritative control",
          agentRole: agent,
          conversationId,
          reservationId: res?.id,
          guestId,
        }),
      };
      break;
    }

    case "TRANSFER_DELAY_RISK": {
      if (res) {
        next = {
          ...next,
          reservations: next.reservations.map((r) =>
            r.id === res.id ? { ...r, urgency: "critical", aiState: "paused" } : r
          ),
          entityStatuses: upsertStatuses(next.entityStatuses, res.id, ["workflow_blocked"]),
        };
      }

      next = {
        ...next,
        escalations: appendEscalation(next.escalations, {
          reason: "policy_ambiguity",
          severity: "high",
          title: "Transfer delay risk",
          guestImpact: "VIP transfer SLA may be missed — ops dispatch required",
          aiConfidenceBefore: 0.78,
          aiConfidenceAfter: null,
          explanation: "Flight change detected; transfer buffer below SOP minimum.",
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agentRoleForEscalationReason("policy_ambiguity"),
        }),
        overview: {
          ...next.overview,
          activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_vip_transfer", {
            status: "blocked",
            progressPct: 55,
          }),
          runtime: { ...next.overview.runtime, status: "attention" },
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "policy_trigger",
          title: "Transfer SLA risk",
          explanation: "Transfer delay risk event — workflow blocked pending dispatch.",
          confidence: 0.76,
          knowledgeReferences: ["kn_vip_transfer"],
          policyReferences: ["transfer_sla"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          rationale: "Transfer buffer breached minimum SOP guard.",
          actionOutcome: "blocked",
        }),
      };
      break;
    }

    case "WORKFLOW_RESUMED": {
      next = {
        ...next,
        overview: {
          ...next.overview,
          activeWorkflows: next.overview.activeWorkflows.map((w) =>
            w.status === "paused" || w.status === "blocked"
              ? { ...w, status: "running", progressPct: Math.min(100, w.progressPct + 8) }
              : w
          ),
          runtime: { ...next.overview.runtime, status: "healthy" },
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "action",
          title: "Workflow resumed",
          explanation: "Operational clearance — AI workflows running again.",
          confidence: 0.88,
          knowledgeReferences: [],
          policyReferences: [],
          humanOverride: false,
          conversationId,
          reservationId: res?.id,
          guestId,
          agentRole: agent,
          actionOutcome: "success",
          rationale: "Supervisor clearance received; automation re-enabled.",
        }),
      };
      break;
    }

    case "ESCALATION_RESOLVED": {
      const updatedEscalations = next.escalations.map((e) =>
        !e.resolved &&
        (e.conversationId === conversationId || e.reservationId === reservationId)
          ? { ...e, resolved: true, resolvedAt: isoNow(), aiConfidenceAfter: 0.86 }
          : e
      );
      next = {
        ...next,
        escalations: updatedEscalations,
        overview: {
          ...next.overview,
          actionFeed: appendFeed(next.overview.actionFeed, {
            actionName: "Escalation cleared",
            outcome: "success",
            confidence: 0.86,
            explanation:
              "Supervision loop released — linked entities recalibrated for autonomous mode.",
            conversationId,
            reservationId: res?.id ?? reservationId,
            guestId,
            agentRole: agent,
          }),
        },
        auditEvents: appendAuditPipeline(next.auditEvents, {
          type: "decision",
          title: "Escalation resolved — pipeline reopen",
          explanation:
            "Escalation supervisor closed the loop; confidence rebound applied to linked conversation context.",
          confidence: 0.86,
          knowledgeReferences: [],
          policyReferences: ["escalation_release_sop"],
          humanOverride: false,
          conversationId,
          reservationId: res?.id ?? reservationId,
          guestId,
          agentRole: agent,
          actionOutcome: "success",
          rationale: "Human sign-off satisfied policy requirements for reopening automation.",
        }),
        aiActionMemory: appendMemory(next.aiActionMemory, {
          kind: "escalation_resolved",
          summary: "Escalation cleared · automation path reopened",
          agentRole: agent,
          conversationId,
          reservationId: res?.id ?? reservationId,
          guestId,
        }),
      };
      break;
    }

    default:
      break;
  }

  next = {
    ...next,
    operationalFocusLabel: LIVE_EVENT_CATALOG[type].title,
    liveEvents: appendLiveEvent(
      next.liveEvents,
      createLiveEventFromRuntime(
        type,
        {
          conversationId,
          reservationId: res?.id ?? reservationId,
          guestId,
        },
        agent
      )
    ),
  };

  // Recompute confidence distribution buckets from conversations
  next = {
    ...next,
    overview: {
      ...next.overview,
      asOfIso: isoNow(),
      confidenceDistribution: buildConfidenceBuckets(next.conversations),
      escalationActivity: escalationMetricsFrom(next.escalations),
      runtime: {
        ...next.overview.runtime,
        activeWorkflows: next.overview.activeWorkflows.filter(
          (w) => w.status === "running" || w.status === "awaiting_human" || w.status === "escalated"
        ).length,
        lastHealthCheckAt: isoNow(),
      },
    },
  };

  return next;
}

function buildConfidenceBuckets(conversations: Conversation[]) {
  const scores = conversations.map((c) => c.aiInsight.confidence);
  const total = scores.length || 1;
  const buckets = [
    { label: "≥ 90%", min: 0.9, max: 1.01 },
    { label: "80–89%", min: 0.8, max: 0.9 },
    { label: "70–79%", min: 0.7, max: 0.8 },
    { label: "< 70%", min: 0, max: 0.7 },
  ];
  return buckets.map((b) => {
    const count = scores.filter((s) => s >= b.min && s < b.max).length;
    return { label: b.label, count, pct: Math.round((count / total) * 100) };
  });
}

function addRiskFlag(flags: GuestRiskFlag[], flag: GuestRiskFlag): GuestRiskFlag[] {
  if (flags.includes(flag)) return flags;
  return [...flags.filter((f) => f !== "none"), flag];
}

function degradeSentiment(s: GuestSentiment): GuestSentiment {
  if (s === "positive") return "mixed";
  if (s === "neutral" || s === "mixed") return "negative";
  return s;
}
