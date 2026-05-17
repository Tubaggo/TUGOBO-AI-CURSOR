import type { OperationalState } from "../entities";
import type { OperationalEventContext, OperationalEventType } from "../events/types";
import { applyMemoryDelta } from "./memory";
import { buildGraphPropagation } from "./propagation";
import { buildAIReasoning } from "./reasoning";
import type { OrchestrationStatus, UnifiedTimelineEntry } from "./types";

export function applyGraphLayer(
  state: OperationalState,
  type: OperationalEventType,
  ctx: OperationalEventContext
): OperationalState {
  const reasoning = buildAIReasoning(type, ctx);
  const propagation = buildGraphPropagation(type);
  const amount = ctx.amountEur;

  const timelineEntry: UnifiedTimelineEntry = {
    id: `tl-${Date.now()}`,
    kind: type,
    title: reasoning.headline,
    detail: propagation.summary,
    timestamp: "Just now",
    actor: type === "HUMAN_TAKEOVER" ? "human" : "ai",
    guestId: ctx.guestId,
    guestLabel: ctx.guestLabel,
    reservationId: ctx.reservationId,
    conversationId: ctx.conversationId,
    financialImpactEur: amount,
    propagationNodes: propagation.nodes,
  };

  const orchestrationStatus = mapOrchestrationStatus(type);

  const guests = state.guests.map((g) => {
    if (ctx.guestId && g.id === ctx.guestId) {
      return applyMemoryDelta(g, type, ctx);
    }
    return g;
  });

  const threads = state.threads.map((t) => {
    if (ctx.conversationId && t.id !== ctx.conversationId) return t;
    if (!ctx.conversationId) return t;
    return {
      ...t,
      flags: {
        ...t.flags,
        memoryAttached: true,
        priorRiskDetected:
          t.flags.priorRiskDetected ||
          type === "PAYMENT_FAILED" ||
          type === "VIP_ESCALATION",
        vipHistory: t.flags.vipHistory || type === "VIP_ESCALATION" || type === "HUMAN_TAKEOVER",
        directBookingCandidate:
          t.flags.directBookingCandidate ||
          type === "OTA_CONVERSION" ||
          type === "BOOKING_CONFIRMED",
      },
    };
  });

  const alerts = state.alerts.map((a, i) =>
    i === 0 && a.timestamp === "Just now"
      ? {
          ...a,
          reason: reasoning.headline,
          orchestrationStatus,
          aiConfidence: reasoning.confidence,
          escalationLevel: reasoning.escalationLevel,
          affectedSystems: propagation.nodes,
        }
      : a
  );

  const auditEvents = state.auditEvents.map((e, i) =>
    i === 0 && e.timestamp === "Just now"
      ? {
          ...e,
          reasoning,
          propagation,
          affectedSystems: propagation.nodes,
          orchestrationConsequence: propagation.summary,
        }
      : e
  );

  const aiActions = state.aiActions.map((a, i) =>
    i === 0 && a.timestamp === "Just now" ? { ...a, reasoning } : a
  );

  const activeRecoveries = state.activeRecoveries.map((r, i) =>
    i === 0 && r.status === "active" && type !== "RECOVERY_SUCCESS"
      ? { ...r, reasoning, aiRationale: reasoning.factors.join(" · ") }
      : r
  );

  return {
    ...state,
    guests,
    threads,
    alerts,
    auditEvents,
    aiActions,
    activeRecoveries,
    unifiedTimeline: [timelineEntry, ...state.unifiedTimeline].slice(0, 40),
    lastPropagation: propagation,
    mutationPulseAt: Date.now(),
  };
}

function mapOrchestrationStatus(type: OperationalEventType): OrchestrationStatus {
  const map: Record<OperationalEventType, OrchestrationStatus> = {
    PAYMENT_FAILED: "recovery_active",
    RECOVERY_STARTED: "recovery_active",
    RECOVERY_SUCCESS: "resolved",
    BOOKING_CONFIRMED: "resolved",
    UPSELL_ACCEPTED: "monitoring",
    VIP_ESCALATION: "escalated",
    OTA_CONVERSION: "monitoring",
    HUMAN_TAKEOVER: "human_assisted",
  };
  return map[type];
}
