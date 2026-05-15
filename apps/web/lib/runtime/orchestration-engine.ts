import type {
  AIActionFeedItem,
  AIBrainOverview,
  AIActiveWorkflow,
  AuditEvent,
  EscalationEvent,
  EscalationReason,
} from "@/lib/types/ai-brain";
import type { Conversation, ConversationSummary } from "@/lib/types/conversations";
import type { Guest, GuestRiskFlag, GuestSentiment } from "@/lib/types/guests";
import type { Reservation, ReservationPipelineStage, UrgencyLevel } from "@/app/app/_types";
import { recalculateConversationConfidence } from "./confidence-engine";
import { appendLiveEvent, createLiveEventFromRuntime } from "./live-events";
import type { RuntimeEvent } from "./runtime-events";
import type { AIRuntimeState, ConversationRuntimeMeta, RuntimeOperationalStatus } from "./types";

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

function appendAudit(
  events: AuditEvent[],
  partial: Omit<AuditEvent, "id" | "createdAt">
): AuditEvent[] {
  return [
    {
      id: newId("aud"),
      createdAt: isoNow(),
      ...partial,
    },
    ...events,
  ];
}

function appendEscalation(
  events: EscalationEvent[],
  partial: Omit<EscalationEvent, "id" | "createdAt" | "resolved" | "resolvedAt">
): EscalationEvent[] {
  return [
    {
      id: newId("esc"),
      createdAt: isoNow(),
      resolved: false,
      resolvedAt: null,
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

  switch (type) {
    case "PAYMENT_LINK_FAILED": {
      const failures = meta.paymentFailureCount + 1;
      const updatedMeta: ConversationRuntimeMeta = {
        ...meta,
        paymentFailureCount: failures,
        lastEventAt: isoNow(),
        operationalStatuses: [
          ...new Set([...meta.operationalStatuses, "payment_risk" as const]),
        ],
      };

      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => ({
            ...c,
            status: "awaiting_payment",
            aiState: "paused",
            escalationFlag: failures >= 2,
            aiInsight: {
              ...c.aiInsight,
              escalationSuggested: true,
              sentiment: c.aiInsight.sentiment === "positive" ? "mixed" : c.aiInsight.sentiment,
            },
          })),
          conversationMeta: { ...next.conversationMeta, [metaKey]: updatedMeta },
          entityStatuses: upsertStatuses(next.entityStatuses, conversationId, [
            "payment_risk",
            "workflow_paused",
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
          }),
        },
        auditEvents: appendAudit(next.auditEvents, {
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
        }),
      };

      if (failures >= 2) {
        next = {
          ...next,
          escalations: appendEscalation(next.escalations, {
            reason: "payment_friction" as EscalationReason,
            severity: "high",
            title: "Payment link stalled",
            guestImpact: "Guest cannot complete booking — revenue at risk",
            aiConfidenceBefore: conv?.aiInsight.confidence ?? 0.75,
            aiConfidenceAfter: null,
            explanation:
              "Two consecutive payment link failures. Supervisor review and alternate PSP path suggested.",
            conversationId,
            reservationId: res?.id,
            guestId,
          }),
          overview: {
            ...next.overview,
            escalationActivity: {
              ...next.overview.escalationActivity,
              active: next.overview.escalationActivity.active + 1,
              unresolved24h: next.overview.escalationActivity.unresolved24h + 1,
            },
            activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_payment_recovery", {
              status: "escalated",
            }),
          },
          entityStatuses: conversationId
            ? upsertStatuses(next.entityStatuses, conversationId, ["escalated"])
            : next.entityStatuses,
        };
      }
      break;
    }

    case "PAYMENT_COMPLETED": {
      if (conversationId) {
        next = {
          ...next,
          ...updateConversationInState(next, conversationId, (c) => {
            const reservation = findReservation(next.reservations, conversationId);
            const g = next.guests.find((x) => x.id === c.guestId) ?? null;
            const confidence = recalculateConversationConfidence(c, reservation ?? null, g, 0.12);
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

      next = {
        ...next,
        escalations: next.escalations.map((e) =>
          e.conversationId === conversationId &&
          e.reason === "payment_friction" &&
          !e.resolved
            ? { ...e, resolved: true, resolvedAt: isoNow(), aiConfidenceAfter: 0.88 }
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
          }),
          escalationActivity: {
            active: Math.max(0, next.escalations.filter((e) => !e.resolved).length),
            unresolved24h: next.escalations.filter(
              (e) => !e.resolved && Date.now() - new Date(e.createdAt).getTime() < 86_400_000
            ).length,
            resolvedToday: next.escalations.filter((e) => e.resolved).length,
          },
        },
        auditEvents: appendAudit(next.auditEvents, {
          type: "decision",
          title: "Reservation confirmed — payment captured",
          explanation:
            "Payment completed event propagated. Pipeline moved to confirmed; escalations cleared.",
          confidence: 0.91,
          knowledgeReferences: ["kn_payment_hold"],
          policyReferences: ["payment_capture_confirm"],
          humanOverride: false,
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
        }),
        auditEvents: appendAudit(next.auditEvents, {
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
        }),
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
          }),
        },
      };
      next.overview = {
        ...next.overview,
        escalationActivity: {
          active: next.escalations.filter((e) => !e.resolved).length,
          unresolved24h: next.escalations.filter(
            (e) => !e.resolved && Date.now() - new Date(e.createdAt).getTime() < 86_400_000
          ).length,
          resolvedToday: next.escalations.filter((e) => e.resolved).length,
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
        }),
        auditEvents: appendAudit(next.auditEvents, {
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
        }),
        overview: {
          ...next.overview,
          activeWorkflows: next.overview.activeWorkflows.map((w) =>
            w.linkedId === conversationId ? { ...w, status: "blocked", progressPct: w.progressPct } : w
          ),
        },
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
          }),
        },
        auditEvents: appendAudit(next.auditEvents, {
          type: "policy_trigger",
          title: "VIP flow activated",
          explanation: "VIP guest detected — lowered escalation threshold; concierge routing on.",
          confidence: 0.94,
          knowledgeReferences: ["kn_vip_transfer"],
          policyReferences: ["vip_concierge_routing"],
          humanOverride: false,
          guestId,
          conversationId,
        }),
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
          }),
        },
        auditEvents: appendAudit(next.auditEvents, {
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
          }),
        },
        auditEvents: appendAudit(next.auditEvents, {
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
        }),
        overview: {
          ...next.overview,
          activeWorkflows: patchWorkflows(next.overview.activeWorkflows, "wf_vip_transfer", {
            status: "blocked",
            progressPct: 55,
          }),
          runtime: { ...next.overview.runtime, status: "attention" },
        },
        auditEvents: appendAudit(next.auditEvents, {
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
        auditEvents: appendAudit(next.auditEvents, {
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
        }),
      };
      break;
    }

    case "ESCALATION_RESOLVED": {
      next = {
        ...next,
        escalations: next.escalations.map((e) =>
          !e.resolved &&
          (e.conversationId === conversationId || e.reservationId === reservationId)
            ? { ...e, resolved: true, resolvedAt: isoNow(), aiConfidenceAfter: 0.86 }
            : e
        ),
        overview: {
          ...next.overview,
          escalationActivity: {
            active: next.escalations.filter((e) => !e.resolved).length,
            unresolved24h: next.escalations.filter(
              (e) => !e.resolved && Date.now() - new Date(e.createdAt).getTime() < 86_400_000
            ).length,
            resolvedToday: next.escalations.filter((e) => e.resolved).length + 1,
          },
        },
      };
      break;
    }

    default:
      break;
  }

  next = {
    ...next,
    liveEvents: appendLiveEvent(
      next.liveEvents,
      createLiveEventFromRuntime(type, {
        conversationId,
        reservationId: res?.id ?? reservationId,
        guestId,
      })
    ),
  };

  // Recompute confidence distribution buckets from conversations
  next = {
    ...next,
    overview: {
      ...next.overview,
      asOfIso: isoNow(),
      confidenceDistribution: buildConfidenceBuckets(next.conversations),
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
