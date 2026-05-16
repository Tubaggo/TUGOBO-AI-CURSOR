import { getAIBrainOverview, getAuditEvents, getEscalations } from "@/lib/data/ai-brain";
import { getConversationById, getConversations } from "@/lib/data/conversations";
import { getGuests } from "@/lib/data/guests";
import { getReservations } from "@/lib/data/reservations";
import { buildSeedLiveEvents } from "./live-events";
import type { AIRuntimeState } from "./types";

/** Build initial runtime snapshot from server mock getters. */
export function buildRuntimeSeed(): AIRuntimeState {
  const summaries = getConversations();
  const conversations = summaries
    .map((s) => getConversationById(s.id))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    hydrated: true,
    lastPulseAt: Date.now(),
    liveEvents: buildSeedLiveEvents(),
    conversations,
    conversationSummaries: summaries,
    reservations: getReservations(),
    guests: getGuests(),
    escalations: getEscalations("all"),
    auditEvents: getAuditEvents(50),
    aiActionMemory: [],
    operationalFocusLabel: "Monitoring operational signals",
    overview: getAIBrainOverview(),
    conversationMeta: {},
    entityStatuses: {},
  };
}
