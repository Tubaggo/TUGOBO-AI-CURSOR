import type { GuestAiMemoryProfile } from "@/lib/entities";
import type { Guest } from "@/lib/types/guests";

/** Bounded lift applied inside confidence reconciliation from persisted guest memory weight. */
export function memoryOrchestrationBoost(weight: number | undefined): number {
  if (weight === undefined || Number.isNaN(weight)) return 0;
  return Math.min(0.07, weight * 0.055);
}

export function createGuestMemorySeed(guest: Guest): GuestAiMemoryProfile {
  const risk = guest.riskFlags.filter((f) => f !== "none");
  return {
    guestId: guest.id,
    memoryTags: guest.tags.slice(0, 6),
    preferenceMemory: guest.preferredLanguage
      ? [`Preferred language signal · ${guest.preferredLanguage}`]
      : [],
    stayHistoryMemory: [`Indexed stays · ${guest.totalStays}`, guest.currentReservationLabel],
    operationalNotes: [],
    riskMemory: risk.map((r) => `Risk facet · ${r}`),
    loyaltyMemory: [`Loyalty tier · ${guest.loyaltyTier}`],
    upsellMemory:
      guest.upsellPotential > 0.58
        ? ["Upsell corridor open — revenue agent armed"]
        : [],
    orchestrationWeight: Math.min(1, guest.aiScore / 100 + guest.upsellPotential * 0.12),
  };
}

export function patchGuestAiMemory(
  map: Record<string, GuestAiMemoryProfile>,
  guestId: string,
  patch: (m: GuestAiMemoryProfile) => GuestAiMemoryProfile
): Record<string, GuestAiMemoryProfile> {
  const cur = map[guestId];
  if (!cur) return map;
  return { ...map, [guestId]: patch(cur) };
}
