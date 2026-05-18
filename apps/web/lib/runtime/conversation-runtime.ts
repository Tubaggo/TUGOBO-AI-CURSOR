import type {
  ConversationThread,
  Guest,
  RecoveryFlow,
  ThreadOperationalFlags,
} from "./entities";
import type { AIReasoning } from "./graph/types";
import { buildAIReasoning } from "./graph/reasoning";
import type { OperationalEventType } from "./events/types";
import type { AIAction, UnifiedTimelineEntry } from "./entities";
import { op } from "@/lib/i18n/operationalTexts";

export type OperationalStatusLabel =
  | "PAYMENT FRICTION"
  | "RECOVERY ACTIVE"
  | "HIGH VALUE"
  | "DIRECT BOOKING"
  | "ESCALATION RISK"
  | "VIP GUEST"
  | "NEW INQUIRY"
  | "REVIEW RISK"
  | "MONITORING"
  | "STAFF ASSISTING";

export type GuestRuntimeSignals = {
  operationalStatuses: OperationalStatusLabel[];
  behavioral: string[];
  financial: string[];
  /** Operationally grounded state — not "AI runtime" jargon */
  situation: string[];
};

export type TimelineDisplayKind =
  | "guest_message"
  | "ai_interpretation"
  | "financial"
  | "orchestration"
  | "memory"
  | "propagation"
  | "outcome"
  | "system";

export type TimelinePriority = "high" | "medium" | "low";

export type OperationalTimelineEvent = {
  id: string;
  displayKind: TimelineDisplayKind;
  priority: TimelinePriority;
  timestamp: string;
  title: string;
  detail?: string;
  quote?: string;
  signals?: string[];
  financialEur?: number;
  recoveryProbability?: number;
  confidence?: number;
  affectedSystems?: string[];
  actions?: string[];
  isLive?: boolean;
};

export type CognitionSnapshot = {
  interpretation: string;
  financial: {
    directValueEur: number;
    otaOpportunityEur: number;
    revenueConfidence: number;
  };
  escalation: {
    humanRequired: boolean;
    recoveryConfidence: number;
    escalationProbability: "Low" | "Medium" | "High" | "Critical";
  };
  memoryBullets: string[];
  recommendedAction: string;
  reasoning?: AIReasoning;
};

export type PropagationCausalityStep = {
  label: string;
  active: boolean;
};

type ChronologyBeat = Omit<OperationalTimelineEvent, "priority"> & { priority?: TimelinePriority };

/** Guest-centered operational stories per thread — hybrid chronology source */
const THREAD_CHRONOLOGY: Record<string, ChronologyBeat[]> = {
  c2: [
    {
      id: "c2-g1",
      displayKind: "guest_message",
      timestamp: "11:02",
      title: "Guest message",
      quote: "Triple room Jun 28–Jul 3 looks good — sending payment now.",
      priority: "medium",
    },
    {
      id: "c2-g2",
      displayKind: "guest_message",
      timestamp: "11:14",
      title: "Guest message",
      quote: "I already tried the payment link twice. It keeps failing.",
      priority: "high",
    },
    {
      id: "c2-i1",
      displayKind: "ai_interpretation",
      timestamp: "11:15",
      title: "Payment hesitation detected",
      detail: "Abandonment risk increasing.",
      signals: ["Repeated payment retry", "Rising frustration in wording", "Booking still intent-positive"],
      priority: "high",
    },
    {
      id: "c2-f1",
      displayKind: "financial",
      timestamp: "11:15",
      title: "€780 booking exposure identified",
      detail: "Direct booking · Triple Room · 5 nights",
      financialEur: 780,
      recoveryProbability: 78,
      priority: "high",
    },
    {
      id: "c2-r1",
      displayKind: "orchestration",
      timestamp: "11:16",
      title: "Alternate payment recovery flow started",
      actions: ["Alternative payment route generated", "Simplified checkout enabled", "Duty manager on standby if idle 12m"],
      priority: "high",
    },
    {
      id: "c2-g3",
      displayKind: "guest_message",
      timestamp: "11:18",
      title: "Guest message",
      quote: "Okay, I'm trying the new link now.",
      priority: "medium",
    },
    {
      id: "c2-m1",
      displayKind: "memory",
      timestamp: "11:16",
      title: "Prior stay pattern applied",
      detail: "July 2024 — split deposit succeeded · WhatsApp preferred · no complaint history",
      priority: "low",
    },
  ],
  c3: [
    {
      id: "c3-g1",
      displayKind: "guest_message",
      timestamp: "08:38",
      title: "Guest message",
      quote: "Your policy says free cancellation until 7 days — I am inside that window.",
      priority: "high",
    },
    {
      id: "c3-i1",
      displayKind: "ai_interpretation",
      timestamp: "08:39",
      title: "Cancellation risk on VIP booking",
      detail: "Policy dispute · high emotional tone · €2,180 at stake.",
      signals: ["VIP segment", "Cancellation language explicit", "Policy edge case"],
      priority: "high",
    },
    {
      id: "c3-f1",
      displayKind: "financial",
      timestamp: "08:39",
      title: "€2,180 Deluxe Suite exposure",
      financialEur: 2180,
      recoveryProbability: 88,
      priority: "high",
    },
    {
      id: "c3-r1",
      displayKind: "orchestration",
      timestamp: "08:42",
      title: "Front desk takeover initiated",
      actions: ["Maria L. joined with full booking context", "Policy exception drafted", "Guest kept on Instagram thread"],
      priority: "high",
    },
    {
      id: "c3-g2",
      displayKind: "guest_message",
      timestamp: "08:48",
      title: "Guest message",
      quote: "Thank you — that works. Please confirm the suite for Aug 12.",
      priority: "medium",
    },
    {
      id: "c3-o1",
      displayKind: "outcome",
      timestamp: "08:52",
      title: "Booking secured",
      detail: "€2,180 recovered into direct pipeline · VIP retained",
      financialEur: 2180,
      priority: "high",
    },
  ],
  c4: [
    {
      id: "c4-g1",
      displayKind: "guest_message",
      timestamp: "09:41",
      title: "Guest message",
      quote: "Confirmed — see you Jun 15.",
      priority: "medium",
    },
    {
      id: "c4-i1",
      displayKind: "ai_interpretation",
      timestamp: "09:55",
      title: "Post-booking upsell window open",
      detail: "Guest previously accepts late checkout bundles.",
      priority: "medium",
    },
    {
      id: "c4-r1",
      displayKind: "orchestration",
      timestamp: "10:00",
      title: "Late checkout + breakfast bundle offered",
      actions: ["€95 ADR uplift quoted", "Aligned to prior stay preferences"],
      priority: "medium",
    },
    {
      id: "c4-g2",
      displayKind: "guest_message",
      timestamp: "10:02",
      title: "Guest message",
      quote: "Yes, add the late checkout — thank you.",
      priority: "medium",
    },
    {
      id: "c4-o1",
      displayKind: "outcome",
      timestamp: "10:02",
      title: "Upsell accepted",
      detail: "€95 additional revenue on confirmed stay",
      financialEur: 95,
      priority: "high",
    },
  ],
  c1: [
    {
      id: "c1-g1",
      displayKind: "guest_message",
      timestamp: "2m ago",
      title: "Guest message",
      quote: "15-20 Temmuz arası çift kişilik odanız müsait mi?",
      priority: "medium",
    },
    {
      id: "c1-i1",
      displayKind: "ai_interpretation",
      timestamp: "1m ago",
      title: "New date inquiry — direct channel",
      detail: "Availability check in progress · Turkish preferred.",
      priority: "medium",
    },
    {
      id: "c1-r1",
      displayKind: "orchestration",
      timestamp: "Now",
      title: "Quote preparation",
      actions: ["Checking Jul 15–20 double availability", "Rate for direct WhatsApp close"],
      priority: "medium",
    },
  ],
};

const STATUS_REMAP: Record<string, OperationalStatusLabel> = {
  "DIRECT CONVERSION": "DIRECT BOOKING",
  "VIP MEMORY": "VIP GUEST",
  "PRIORITY PIPELINE": "NEW INQUIRY",
  "RUNTIME STABLE": "MONITORING",
  "HUMAN ASSISTED": "STAFF ASSISTING",
};

export function deriveOperationalStatuses(
  conversation: ConversationThread,
  guest?: Guest,
  journey?: RecoveryFlow
): OperationalStatusLabel[] {
  const statuses: OperationalStatusLabel[] = [];
  const f = conversation.flags;

  if (f.paymentRisk) statuses.push("PAYMENT FRICTION");
  if (f.recoveryActive || journey?.status === "active") statuses.push("RECOVERY ACTIVE");
  if (guest?.segment === "vip" || f.vipEscalation || f.vipHistory) statuses.push("VIP GUEST");
  if (f.humanTakeover) statuses.push("STAFF ASSISTING");
  if (f.otaConversion) statuses.push("DIRECT BOOKING");
  if (f.directBookingCandidate) statuses.push("DIRECT BOOKING");
  if (conversation.revenueExposureEur >= 1500 || (guest?.lifetimeValueEur ?? 0) >= 3000) {
    statuses.push("HIGH VALUE");
  }
  if (f.priorRiskDetected && !f.recoveryActive) statuses.push("ESCALATION RISK");
  if (conversation.status === "ai_active" && conversation.unread > 0 && !f.paymentRisk) {
    statuses.push("NEW INQUIRY");
  }
  if (guest?.intelligence.orchestrationRiskLevel === "high") statuses.push("ESCALATION RISK");
  if (statuses.length === 0) statuses.push("MONITORING");

  return [...new Set(statuses)];
}

export function deriveGuestRuntimeSignals(
  conversation: ConversationThread,
  guest?: Guest,
  journey?: RecoveryFlow
): GuestRuntimeSignals {
  const intel = guest?.intelligence;
  const behavioral: string[] = [];

  if (conversation.flags.paymentRisk) {
    behavioral.push("Hesitation rising");
    behavioral.push("Asked about payment twice");
  }
  if (conversation.flags.recoveryActive) {
    behavioral.push("Waiting on new payment link");
    behavioral.push("Booking intent still positive");
  }
  if (conversation.flags.humanTakeover) {
    behavioral.push("Frustrated tone");
    behavioral.push("Policy dispute active");
  }
  if (conversation.unread > 0) {
    behavioral.push("Awaiting hotel reply");
  }
  if (intel && intel.orchestrationRiskLevel === "high") {
    behavioral.push("May abandon if unresolved");
  }
  if (behavioral.length === 0) {
    behavioral.push("Calm engagement");
    behavioral.push("Booking confidence steady");
  }

  const financial: string[] = [];
  if (conversation.revenueExposureEur > 0) {
    financial.push(`${formatCompactEur(conversation.revenueExposureEur)} at risk`);
  }
  if (guest?.segment === "ota_origin" || conversation.flags.otaConversion) {
    financial.push("€212 commission save possible");
  }
  if ((guest?.lifetimeValueEur ?? 0) >= 2500) {
    financial.push("High-value repeat guest");
  }
  if (intel && intel.directBookingPotential >= 80) {
    financial.push(`Strong direct-booking fit`);
  }
  if (conversation.attributions.some((a) => a.kind === "ai_upsell")) {
    financial.push("Upsell window open");
  }
  if (financial.length === 0 && guest) {
    financial.push(`${formatCompactEur(guest.aiInfluencedRevenueEur)} influenced revenue`);
  }

  const situation: string[] = [];
  if (conversation.flags.recoveryActive || journey?.status === "active") {
    situation.push("Recovery flow in progress");
  }
  if (conversation.flags.humanTakeover) {
    situation.push("Staff-led close");
  } else if (intel?.orchestrationRiskLevel === "low" && conversation.flags.paymentRisk) {
    situation.push("Escalation not required yet");
  }
  if (conversation.flags.memoryAttached && guest) {
    situation.push("Guest history available");
  }
  if (intel && conversation.flags.paymentRisk) {
    situation.push(`${intel.recoverySuccessRatio}% recovery likelihood`);
  }
  if (situation.length === 0) {
    situation.push("Standard booking flow");
  }

  return {
    operationalStatuses: deriveOperationalStatuses(conversation, guest, journey),
    behavioral: behavioral.slice(0, 3),
    financial: financial.slice(0, 3),
    situation: situation.slice(0, 3),
  };
}

export function buildPropagationCausality(
  conversation: ConversationThread,
  guest?: Guest
): PropagationCausalityStep[] {
  const steps: PropagationCausalityStep[] = [
    { label: "Payment failed", active: conversation.flags.paymentRisk },
    { label: "Guest hesitation", active: conversation.flags.paymentRisk || conversation.flags.priorRiskDetected },
    { label: "Booking at risk", active: conversation.flags.recoveryActive || conversation.revenueExposureEur > 0 },
    { label: "Revenue exposure", active: conversation.revenueExposureEur > 0 },
    { label: "Escalation risk", active: guest?.intelligence.orchestrationRiskLevel === "high" || conversation.flags.vipEscalation },
    { label: "Recovery in progress", active: conversation.flags.recoveryActive },
  ];
  if (!steps.some((s) => s.active)) {
    return [
      { label: "Guest inquiry", active: true },
      { label: "Quote / availability", active: true },
      { label: "Booking pipeline", active: true },
      { label: "Stable", active: true },
    ];
  }
  return steps;
}

function inferEventType(flags: ThreadOperationalFlags): OperationalEventType {
  if (flags.paymentRisk) return "PAYMENT_FAILED";
  if (flags.humanTakeover) return "HUMAN_TAKEOVER";
  if (flags.otaConversion) return "OTA_CONVERSION";
  if (flags.recoveryActive) return "RECOVERY_STARTED";
  if (flags.vipEscalation) return "VIP_ESCALATION";
  return "BOOKING_CONFIRMED";
}

export function buildCognitionSnapshot(
  conversation: ConversationThread,
  guest?: Guest,
  journey?: RecoveryFlow
): CognitionSnapshot {
  const intel = guest?.intelligence;
  const exposure = conversation.revenueExposureEur;
  const secured = conversation.attributions.reduce((s, a) => s + a.amountEur, 0);
  const directValue = exposure > 0 ? exposure : secured > 0 ? secured : journey?.bookingValueEur ?? 0;

  const eventType = inferEventType(conversation.flags);
  const reasoning = buildAIReasoning(eventType, {
    amountEur: directValue,
    guestLabel: conversation.guestName,
  });

  const amountLabel = `€${directValue.toLocaleString("tr-TR")}`;

  let interpretation = reasoning.headline;
  if (conversation.flags.paymentRisk) {
    interpretation = op("guestSummaryPaymentRisk");
  } else if (conversation.flags.humanTakeover) {
    interpretation = op("guestSummaryHumanTakeover");
  } else if (conversation.flags.recoveryActive) {
    interpretation = op("guestSummaryRecovery", "tr", { amount: amountLabel });
  } else if (conversation.status === "resolved") {
    interpretation = op("guestSummaryResolved");
  } else if (conversation.unread > 0) {
    interpretation = op("guestSummaryNewInquiry");
  } else {
    interpretation = op("guestSummaryDefault");
  }

  const otaOpportunity =
    guest?.segment === "ota_origin" || conversation.flags.otaConversion ? 212 : Math.round(directValue * 0.18);

  const recoveryConfidence =
    intel?.recoverySuccessRatio ?? (journey?.status === "recovered" ? 92 : 79);
  const humanRequired = conversation.flags.humanTakeover || conversation.flags.vipEscalation;
  const escProb: CognitionSnapshot["escalation"]["escalationProbability"] =
    intel?.orchestrationRiskLevel === "critical"
      ? "Critical"
      : intel?.orchestrationRiskLevel === "high"
        ? "High"
        : intel?.orchestrationRiskLevel === "medium"
          ? "Medium"
          : "Low";

  const memoryBullets = [
    ...(guest?.memory.preferences.slice(0, 2) ?? []),
    ...(guest?.memory.recoveryHistory.slice(0, 1) ?? []),
    ...(guest?.memory.financial.slice(0, 1) ?? []),
  ].slice(0, 4);

  let recommendedAction = op("suggestedMonitor");
  if (conversation.flags.paymentRisk) {
    recommendedAction = op("suggestedPaymentAction");
  } else if (conversation.flags.humanTakeover) {
    recommendedAction = op("suggestedHumanClose");
  } else if (conversation.flags.otaConversion) {
    recommendedAction = op("suggestedOtaConversion");
  } else if (conversation.status === "resolved" && guest) {
    recommendedAction = op("suggestedPostConfirm");
  } else if (conversation.unread > 0) {
    recommendedAction = op("suggestedAvailability");
  }

  return {
    interpretation,
    financial: {
      directValueEur: directValue,
      otaOpportunityEur: otaOpportunity,
      revenueConfidence: intel?.recoverySuccessRatio ?? intel?.aiConfidenceScore ?? reasoning.confidence,
    },
    escalation: {
      humanRequired,
      recoveryConfidence,
      escalationProbability: escProb,
    },
    memoryBullets,
    recommendedAction,
    reasoning,
  };
}

export function buildOperationalTimelineEvents(input: {
  conversation: ConversationThread;
  guest?: Guest;
  journeys: RecoveryFlow[];
  timeline: UnifiedTimelineEntry[];
  aiActions: AIAction[];
}): OperationalTimelineEvent[] {
  const { conversation, guest, journeys } = input;
  const journey = journeys.find((j) => j.conversationId === conversation.id);

  const scripted = THREAD_CHRONOLOGY[conversation.id];
  if (scripted) {
    return scripted.map((beat) => ({
      ...beat,
      priority: beat.priority ?? priorityForKind(beat.displayKind, conversation),
    }));
  }

  return buildFallbackChronology(conversation, guest, journey);
}

function buildFallbackChronology(
  conversation: ConversationThread,
  guest?: Guest,
  journey?: RecoveryFlow
): OperationalTimelineEvent[] {
  const events: OperationalTimelineEvent[] = [];

  if (conversation.lastMessage) {
    events.push({
      id: `guest-msg-${conversation.id}`,
      displayKind: "guest_message",
      priority: "high",
      timestamp: conversation.time.replace(" ago", "") || "Now",
      title: "Guest message",
      quote: conversation.lastMessage,
    });
  }

  if (journey) {
    for (const step of journey.steps) {
      const kind = phaseToDisplayKind(step.phase);
      if (kind === "propagation" || kind === "system") continue;

      events.push({
        id: `journey-${journey.id}-${step.id}`,
        displayKind: kind,
        priority: priorityForKind(kind, conversation),
        timestamp: step.timestamp,
        title: humanizeJourneyStep(step.title, step.phase),
        detail: step.detail,
        financialEur: step.revenueDeltaEur !== undefined ? Math.abs(step.revenueDeltaEur) : undefined,
        recoveryProbability:
          kind === "financial" ? guest?.intelligence.recoverySuccessRatio : undefined,
        actions: kind === "orchestration" ? [step.detail].filter(Boolean) as string[] : undefined,
      });
    }
  }

  if (events.length === 0) {
    events.push({
      id: `idle-${conversation.id}`,
      displayKind: "system",
      priority: "low",
      timestamp: conversation.time,
      title: "Monitoring booking thread",
      detail: "No active risk on this conversation.",
    });
  }

  return events;
}

function phaseToDisplayKind(phase: RecoveryFlow["steps"][number]["phase"]): TimelineDisplayKind {
  const map: Record<RecoveryFlow["steps"][number]["phase"], TimelineDisplayKind> = {
    risk: "financial",
    ai_intervention: "ai_interpretation",
    escalation: "orchestration",
    recovery: "orchestration",
    confirmation: "outcome",
  };
  return map[phase];
}

function humanizeJourneyStep(title: string, phase: RecoveryFlow["steps"][number]["phase"]): string {
  const replacements: [RegExp, string][] = [
    [/payment risk detected/i, "Payment failure on booking"],
    [/ai recovery sequence/i, "Alternate payment recovery flow started"],
    [/recovery workflow armed/i, "Alternate payment recovery flow started"],
    [/ops notified/i, "Duty manager notified"],
    [/human takeover/i, "Front desk takeover initiated"],
    [/booking rescued|revenue secured/i, "Booking secured"],
    [/vip escalation/i, "VIP incident — staff assist"],
  ];
  let out = title;
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(out)) return replacement;
  }
  if (phase === "ai_intervention") return title.replace(/^ai\s+/i, "");
  return out;
}

function priorityForKind(kind: TimelineDisplayKind, conversation: ConversationThread): TimelinePriority {
  if (kind === "guest_message" && conversation.flags.paymentRisk) return "high";
  if (kind === "guest_message") return "medium";
  if (kind === "financial" && conversation.revenueExposureEur > 0) return "high";
  if (kind === "ai_interpretation" && conversation.flags.paymentRisk) return "high";
  if (kind === "orchestration" && conversation.flags.recoveryActive) return "high";
  if (kind === "outcome") return "high";
  if (kind === "propagation" || kind === "system") return "low";
  if (kind === "memory") return "low";
  return "medium";
}

function formatCompactEur(value: number): string {
  return `€${value.toLocaleString("en-EU", { maximumFractionDigits: 0 })}`;
}

