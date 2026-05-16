import type { AIActionMemoryEntry } from "./types";
import type { InterventionLogEntry, StaffAssignment } from "@/lib/entities";
import type { Conversation } from "@/lib/types/conversations";
import {
  MEMORY_KIND_CATEGORY,
  type OperationalTimelineCategory,
} from "./timeline-labels";

export type OperationalTimelineLane = "ai" | "human" | "system" | "recovery";

export type OperationalTimelineEntry = {
  id: string;
  at: string;
  lane: OperationalTimelineLane;
  category: OperationalTimelineCategory;
  title: string;
  detail: string;
  confidenceHint?: string;
};

const KIND_LANE: Record<AIActionMemoryEntry["kind"], OperationalTimelineLane> = {
  payment_link_sent: "ai",
  payment_failed: "recovery",
  payment_success: "recovery",
  upgrade_offered: "ai",
  human_takeover: "human",
  reservation_confirmed: "system",
  guest_risk_updated: "system",
  escalation_opened: "human",
  escalation_resolved: "recovery",
  sentiment_shift: "system",
  vip_signal: "ai",
  ota_recovery: "ai",
  low_confidence_gate: "human",
  workflow_pause: "human",
};

const KIND_TITLE: Record<AIActionMemoryEntry["kind"], string> = {
  payment_link_sent: "AI dispatched payment path",
  payment_failed: "Payment friction detected",
  payment_success: "Payment captured",
  upgrade_offered: "Revenue offer orchestrated",
  human_takeover: "Human assumed control",
  reservation_confirmed: "Reservation confirmed",
  guest_risk_updated: "Guest risk posture updated",
  escalation_opened: "Escalation opened",
  escalation_resolved: "Escalation cleared",
  sentiment_shift: "Sentiment shift recorded",
  vip_signal: "VIP routing engaged",
  ota_recovery: "OTA recovery armed",
  low_confidence_gate: "Confidence gate — quote held",
  workflow_pause: "Autonomous workflow paused",
};

export function deriveOperationalTimeline(args: {
  conversation: Conversation;
  memory: AIActionMemoryEntry[];
  interventions: InterventionLogEntry[];
  staffAssignments: StaffAssignment[];
  limit?: number;
}): OperationalTimelineEntry[] {
  const { conversation, memory, interventions, staffAssignments, limit = 12 } = args;
  const rows: OperationalTimelineEntry[] = [];

  for (const m of memory) {
    if (m.conversationId !== conversation.id) continue;
    const lane = KIND_LANE[m.kind];
    rows.push({
      id: m.id,
      at: m.createdAt,
      lane,
      category: MEMORY_KIND_CATEGORY[m.kind],
      title: KIND_TITLE[m.kind],
      detail: m.summary,
      confidenceHint:
        m.kind === "low_confidence_gate" || m.kind === "payment_failed"
          ? "Confidence degraded"
          : m.kind === "payment_success" || m.kind === "escalation_resolved"
            ? "Confidence restored"
            : undefined,
    });
  }

  for (const i of interventions) {
    if (i.conversationId !== conversation.id) continue;
    rows.push({
      id: i.id,
      at: i.createdAt,
      lane: "human",
      category: "human_override",
      title: "Supervisor intervention",
      detail: i.label,
    });
  }

  for (const a of staffAssignments) {
    if (a.conversationId !== conversation.id) continue;
    rows.push({
      id: a.id,
      at: a.updatedAt,
      lane: a.state === "handoff" ? "human" : "system",
      category: "human_override",
      title: a.state === "handoff" ? "Handoff routed" : "Staff ownership assigned",
      detail: `${a.staffName} · ${a.role}${a.note ? ` — ${a.note}` : ""}`,
    });
  }

  rows.push({
    id: `tl_current_${conversation.id}`,
    at: conversation.lastMessageAt,
    lane:
      conversation.aiState === "human_active"
        ? "human"
        : conversation.aiState === "paused"
          ? "recovery"
          : "ai",
    category:
      conversation.aiInsight.confidence < 0.65
        ? "policy_trigger"
        : conversation.aiState === "human_active"
          ? "human_override"
          : "ai_action",
    title: "Current operational posture",
    detail: `${conversation.aiState.replace(/_/g, " ")} · ${Math.round(conversation.aiInsight.confidence * 100)}% confidence`,
    confidenceHint:
      conversation.aiInsight.confidence < 0.65
        ? "Below autonomous gate"
        : conversation.aiInsight.confidence >= 0.85
          ? "Supervised autonomy"
          : undefined,
  });

  return rows
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
