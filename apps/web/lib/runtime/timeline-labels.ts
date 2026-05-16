/** Shared operational timeline category labels across modules. */
export const OPERATIONAL_TIMELINE_CATEGORIES = [
  "payment",
  "reservation",
  "escalation",
  "human_override",
  "ai_action",
  "guest_memory",
  "policy_trigger",
] as const;

export type OperationalTimelineCategory = (typeof OPERATIONAL_TIMELINE_CATEGORIES)[number];

export const TIMELINE_CATEGORY_LABEL: Record<OperationalTimelineCategory, string> = {
  payment: "Payment",
  reservation: "Reservation",
  escalation: "Escalation",
  human_override: "Human override",
  ai_action: "AI action",
  guest_memory: "Guest memory",
  policy_trigger: "Policy trigger",
};

export const TIMELINE_CATEGORY_TONE: Record<OperationalTimelineCategory, string> = {
  payment: "border-amber-500/30 text-amber-200/90",
  reservation: "border-blue-500/30 text-blue-200/90",
  escalation: "border-rose-500/30 text-rose-200/90",
  human_override: "border-orange-500/30 text-orange-200/90",
  ai_action: "border-violet-500/30 text-violet-200/90",
  guest_memory: "border-cyan-500/30 text-cyan-200/90",
  policy_trigger: "border-zinc-500/35 text-zinc-200/80",
};

import type { AIActionMemoryEntry } from "./types";

export const MEMORY_KIND_CATEGORY: Record<AIActionMemoryEntry["kind"], OperationalTimelineCategory> = {
  payment_link_sent: "payment",
  payment_failed: "payment",
  payment_success: "payment",
  upgrade_offered: "ai_action",
  human_takeover: "human_override",
  reservation_confirmed: "reservation",
  guest_risk_updated: "guest_memory",
  escalation_opened: "escalation",
  escalation_resolved: "escalation",
  sentiment_shift: "guest_memory",
  vip_signal: "guest_memory",
  ota_recovery: "ai_action",
  low_confidence_gate: "policy_trigger",
  workflow_pause: "policy_trigger",
};
