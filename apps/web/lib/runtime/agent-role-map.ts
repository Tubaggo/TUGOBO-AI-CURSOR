import type { AIOperationalAgentRole } from "@/lib/types/ai-brain";
import type { RuntimeEventType } from "./runtime-events";

export const OPERATIONAL_AGENT_LABEL: Record<AIOperationalAgentRole, string> = {
  reservation_agent: "Reservation Agent",
  guest_memory_agent: "Guest Memory Agent",
  payment_recovery_agent: "Payment Recovery Agent",
  escalation_supervisor: "Escalation Supervisor",
  revenue_optimization_agent: "Revenue Optimization Agent",
};

/** Routes each runtime simulation to the owning operational agent (multi-agent UX layer). */
export function agentRoleForRuntimeEvent(type: RuntimeEventType): AIOperationalAgentRole {
  switch (type) {
    case "PAYMENT_LINK_SENT":
    case "PAYMENT_COMPLETED":
    case "PAYMENT_LINK_FAILED":
      return "payment_recovery_agent";
    case "NEGATIVE_SENTIMENT":
    case "VIP_GUEST_DETECTED":
      return "guest_memory_agent";
    case "OTA_RECOVERY_TRIGGERED":
      return "reservation_agent";
    case "UPGRADE_OFFERED":
      return "revenue_optimization_agent";
    case "LOW_CONFIDENCE_QUOTE":
      return "escalation_supervisor";
    case "HUMAN_TAKEOVER":
    case "ESCALATION_RESOLVED":
      return "escalation_supervisor";
    case "TRANSFER_DELAY_RISK":
      return "reservation_agent";
    case "WORKFLOW_RESUMED":
      return "reservation_agent";
    default:
      return "reservation_agent";
  }
}

export function agentRoleForEscalationReason(
  reason: import("@/lib/types/ai-brain").EscalationReason
): AIOperationalAgentRole {
  switch (reason) {
    case "payment_friction":
      return "payment_recovery_agent";
    case "sentiment_warning":
    case "vip_complaint_risk":
      return "guest_memory_agent";
    case "low_confidence_quote":
    case "human_takeover":
      return "escalation_supervisor";
    case "ota_conflict":
      return "revenue_optimization_agent";
    default:
      return "escalation_supervisor";
  }
}
