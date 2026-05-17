import type { Guest, GuestMemory, GuestIntelligence } from "../entities";
import type { OperationalEventType } from "../events/types";
import type { OperationalEventContext } from "../events/types";

export const GUEST_MEMORY_SEEDS: Record<string, { memory: GuestMemory; intelligence: GuestIntelligence }> = {
  g1: {
    memory: {
      operational: ["VIP segment · policy-sensitive", "Repeat high-LTV guest"],
      financial: ["€2,180 VIP rescue attributed", "Cancellation risk historically high on policy disputes"],
      orchestration: ["Human takeover succeeded Aug 12", "AI context preserved across handoff"],
      preferences: ["Instagram primary channel", "Russian language preference"],
      escalationHistory: ["VIP escalation Aug 12 · resolved by human override"],
      recoveryHistory: ["Payment friction not primary risk — policy edge cases"],
      aiNotes: ["Sensitive to cancellation policy wording", "Responds to empathetic tone + exception framing"],
    },
    intelligence: {
      orchestrationRiskLevel: "medium",
      aiConfidenceScore: 91,
      recoverySuccessRatio: 88,
      loyaltyProbability: 92,
      directBookingPotential: 74,
      operationalStatus: "Post-rescue · nurture",
      memoryAttached: true,
    },
  },
  g2: {
    memory: {
      operational: ["Active payment recovery · Triple Room Jun 28"],
      financial: ["€780 exposure on current quote", "Prior quotes completed via WhatsApp"],
      orchestration: ["Recovery workflow active", "Alternate link issued"],
      preferences: ["Prefers WhatsApp over email", "German language · direct channel"],
      escalationHistory: [],
      recoveryHistory: ["Previous recovery succeeded with split payment", "Card decline pattern detected"],
      aiNotes: ["High recovery probability when split deposit offered", "Responds within 15m on WhatsApp"],
    },
    intelligence: {
      orchestrationRiskLevel: "high",
      aiConfidenceScore: 84,
      recoverySuccessRatio: 71,
      loyaltyProbability: 68,
      directBookingPotential: 82,
      operationalStatus: "Recovery active",
      memoryAttached: true,
    },
  },
  g3: {
    memory: {
      operational: ["OTA-origin · direct conversion candidate"],
      financial: ["€212 commission avoided on last close", "Superior Double Aug 2–6"],
      orchestration: ["OTA → direct workflow completed"],
      preferences: ["Booking.com origin · prefers rate parity offers"],
      escalationHistory: [],
      recoveryHistory: ["OTA conversion workflow succeeded"],
      aiNotes: ["Repeat direct-booking candidate", "Loyalty perk increases close rate"],
    },
    intelligence: {
      orchestrationRiskLevel: "low",
      aiConfidenceScore: 87,
      recoverySuccessRatio: 79,
      loyaltyProbability: 85,
      directBookingPotential: 94,
      operationalStatus: "Direct nurture",
      memoryAttached: true,
    },
  },
  g4: {
    memory: {
      operational: ["Confirmed guest · upsell receptive"],
      financial: ["€95 ADR uplift post-confirmation", "Deluxe Suite Jun 15–20"],
      orchestration: ["Resolved thread · upsell bundle accepted"],
      preferences: ["Web channel · English", "Late checkout interest signaled"],
      escalationHistory: [],
      recoveryHistory: [],
      aiNotes: ["High upsell conversion probability", "Post-confirmation bundles perform well"],
    },
    intelligence: {
      orchestrationRiskLevel: "low",
      aiConfidenceScore: 93,
      recoverySuccessRatio: 95,
      loyaltyProbability: 88,
      directBookingPotential: 90,
      operationalStatus: "Confirmed · upsell",
      memoryAttached: true,
    },
  },
};

export function withGuestGraphDefaults(
  guest: Omit<Guest, "memory" | "intelligence">
): Guest {
  const seed = GUEST_MEMORY_SEEDS[guest.id];
  if (!seed) {
    return {
      ...guest,
      memory: emptyMemory(),
      intelligence: defaultIntelligence(),
    };
  }
  return { ...guest, memory: seed.memory, intelligence: seed.intelligence };
}

function emptyMemory(): GuestMemory {
  return {
    operational: [],
    financial: [],
    orchestration: [],
    preferences: [],
    escalationHistory: [],
    recoveryHistory: [],
    aiNotes: [],
  };
}

function defaultIntelligence(): GuestIntelligence {
  return {
    orchestrationRiskLevel: "low",
    aiConfidenceScore: 75,
    recoverySuccessRatio: 70,
    loyaltyProbability: 60,
    directBookingPotential: 50,
    operationalStatus: "Monitoring",
    memoryAttached: false,
  };
}

const MEMORY_DELTAS: Partial<
  Record<OperationalEventType, (m: GuestMemory, ctx: OperationalEventContext) => GuestMemory>
> = {
  PAYMENT_FAILED: (m, ctx) => ({
    ...m,
    operational: [`Payment risk · €${ctx.amountEur ?? 780} exposure`, ...m.operational].slice(0, 6),
    recoveryHistory: ["Payment failure detected — recovery pattern armed", ...m.recoveryHistory].slice(0, 5),
    aiNotes: ["Orchestration weighted toward alternate payment + split deposit", ...m.aiNotes].slice(0, 5),
  }),
  RECOVERY_SUCCESS: (m) => ({
    ...m,
    recoveryHistory: ["Recovery succeeded — pattern reinforced for future orchestration", ...m.recoveryHistory].slice(
      0,
      5
    ),
    financial: ["Exposure cleared · influenced revenue updated", ...m.financial].slice(0, 6),
  }),
  VIP_ESCALATION: (m, ctx) => ({
    ...m,
    escalationHistory: [
      `VIP escalation · exposure €${ctx.amountEur ?? 2180}`,
      ...m.escalationHistory,
    ].slice(0, 5),
    aiNotes: ["Human takeover pathway prioritized", ...m.aiNotes].slice(0, 5),
  }),
  UPSELL_ACCEPTED: (m, ctx) => ({
    ...m,
    financial: [`ADR uplift €${ctx.amountEur ?? 95} recorded`, ...m.financial].slice(0, 6),
  }),
  OTA_CONVERSION: (m) => ({
    ...m,
    orchestration: ["OTA → direct conversion completed", ...m.orchestration].slice(0, 5),
    aiNotes: ["Direct booking potential confirmed", ...m.aiNotes].slice(0, 5),
  }),
};

export function applyMemoryDelta(
  guest: Guest,
  type: OperationalEventType,
  ctx: OperationalEventContext
): Guest {
  const delta = MEMORY_DELTAS[type];
  const memory = delta ? delta(guest.memory, ctx) : guest.memory;
  const intelligence = applyIntelligenceDelta(guest.intelligence, type);
  return {
    ...guest,
    memory,
    intelligence: { ...intelligence, memoryAttached: true },
  };
}

function applyIntelligenceDelta(
  intel: GuestIntelligence,
  type: OperationalEventType
): GuestIntelligence {
  switch (type) {
    case "PAYMENT_FAILED":
      return {
        ...intel,
        orchestrationRiskLevel: "high",
        aiConfidenceScore: Math.max(70, intel.aiConfidenceScore - 4),
        operationalStatus: "Payment risk",
      };
    case "RECOVERY_SUCCESS":
      return {
        ...intel,
        orchestrationRiskLevel: "low",
        recoverySuccessRatio: Math.min(98, intel.recoverySuccessRatio + 6),
        aiConfidenceScore: Math.min(98, intel.aiConfidenceScore + 3),
        operationalStatus: "Recovered",
      };
    case "VIP_ESCALATION":
      return {
        ...intel,
        orchestrationRiskLevel: "critical",
        operationalStatus: "VIP escalation",
      };
    case "OTA_CONVERSION":
      return {
        ...intel,
        directBookingPotential: Math.min(99, intel.directBookingPotential + 5),
        loyaltyProbability: Math.min(99, intel.loyaltyProbability + 4),
      };
    case "UPSELL_ACCEPTED":
      return {
        ...intel,
        loyaltyProbability: Math.min(99, intel.loyaltyProbability + 3),
        aiConfidenceScore: Math.min(98, intel.aiConfidenceScore + 2),
      };
    default:
      return intel;
  }
}
