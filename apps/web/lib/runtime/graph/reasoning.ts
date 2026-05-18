import type { OperationalEventContext, OperationalEventType } from "../events/types";
import type { AIReasoning, EscalationLevel } from "./types";

export function buildAIReasoning(
  type: OperationalEventType,
  ctx: OperationalEventContext
): AIReasoning {
  const amount = ctx.amountEur ?? 0;
  const guest = ctx.guestLabel ?? "Guest";

  const map: Record<OperationalEventType, AIReasoning> = {
    PAYMENT_FAILED: {
      headline: "Payment risk orchestration initiated",
      factors: [
        "Card authorization failed on active booking pipeline",
        `Estimated exposure ${amount ? `€${amount.toLocaleString()}` : "elevated"}`,
        "Guest profile indicates prior recovery tolerance — split payment available",
        "Recovery retry probability modeled at 71%",
        "Future orchestration weighted toward alternate payment link",
      ],
      confidence: 84,
      escalationLevel: "urgent",
    },
    RECOVERY_STARTED: {
      headline: "Recovery workflow orchestrated",
      factors: [
        `${guest} linked to active payment recovery journey`,
        "Multi-step recovery synchronized across reservation + thread",
        "AI memory: prior recovery succeeded with split payment",
        "Duty manager SLA armed if guest idle > 12m",
      ],
      confidence: 88,
      escalationLevel: "watch",
    },
    RECOVERY_SUCCESS: {
      headline: "Recovery completed — exposure neutralized",
      factors: [
        "Payment confirmed · revenue at risk cleared",
        "Guest memory updated with successful recovery pattern",
        "Influenced revenue recalculated across graph",
        "Orchestration returns to nurture mode",
      ],
      confidence: 92,
      escalationLevel: "none",
    },
    BOOKING_CONFIRMED: {
      headline: "Direct booking confirmed in pipeline",
      factors: [
        "Lifecycle stage advanced to confirmation",
        "Direct channel attribution locked",
        "Guest loyalty probability increased",
      ],
      confidence: 90,
      escalationLevel: "none",
    },
    UPSELL_ACCEPTED: {
      headline: "Post-confirmation upsell accepted",
      factors: [
        "ADR uplift window identified post-confirmation",
        "Guest memory: high upsell conversion probability",
        "Bundle matched to stay pattern",
      ],
      confidence: 86,
      escalationLevel: "none",
    },
    VIP_ESCALATION: {
      headline: "Human takeover recommended",
      factors: [
        "VIP guest segment detected",
        "Cancellation probability increased to 0.82",
        "Payment friction previously detected on related threads",
        `Estimated exposure €${amount.toLocaleString()}`,
        "Policy edge requires human judgment with AI context",
      ],
      confidence: 91,
      escalationLevel: "critical",
    },
    OTA_CONVERSION: {
      headline: "OTA → direct conversion workflow",
      factors: [
        "OTA-origin guest · commission leakage flagged",
        "Rate parity + loyalty perk surfaced",
        "Direct booking potential score elevated",
        "Commission avoidance path prioritized",
      ],
      confidence: 87,
      escalationLevel: "watch",
    },
    HUMAN_TAKEOVER: {
      headline: "Human takeover initiated with AI context",
      factors: [
        "Escalation threshold crossed for assisted close",
        "Full orchestration memory attached to thread",
        "AI confidence stable — human override preserves revenue",
        `Revenue rescue target €${amount.toLocaleString()}`,
      ],
      confidence: 89,
      escalationLevel: "urgent",
    },
  };

  return map[type];
}

export { escalationLabel } from "@/lib/i18n/runtime-copy";
