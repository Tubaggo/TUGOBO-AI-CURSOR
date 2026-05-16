import { getAIBrainOverview, getAuditEvents, getEscalations } from "@/lib/data/ai-brain";
import { getConversationById, getConversations } from "@/lib/data/conversations";
import { getGuests } from "@/lib/data/guests";
import { getReservations } from "@/lib/data/reservations";
import { createGuestMemorySeed } from "@/lib/ai/memory-influence";
import { buildSeedLiveEvents } from "./live-events";
import { buildSeedActionMemory } from "./seed-action-memory";
import type { AIRuntimeState } from "./types";

/** Build initial runtime snapshot from server mock getters. */
export function buildRuntimeSeed(): AIRuntimeState {
  const summaries = getConversations();
  const conversations = summaries
    .map((s) => getConversationById(s.id))
    .filter((c): c is NonNullable<typeof c> => c !== null);
  const guests = getGuests();

  return {
    hydrated: true,
    lastPulseAt: Date.now(),
    liveEvents: buildSeedLiveEvents(),
    conversations,
    conversationSummaries: summaries,
    reservations: getReservations(),
    guests,
    escalations: getEscalations("all"),
    auditEvents: getAuditEvents(50),
    operationalActions: [],
    aiActionMemory: buildSeedActionMemory(conversations),
    staffAssignments: [],
    staffNotes: [],
    interventions: [],
    guestAiMemory: Object.fromEntries(guests.map((g) => [g.id, createGuestMemorySeed(g)])),
    operationalFocusLabel: "Monitoring operational signals",
    overview: getAIBrainOverview(),
    conversationMeta: {},
    entityStatuses: {},
  };
}
