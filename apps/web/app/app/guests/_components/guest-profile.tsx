"use client";

import { useCallback, useState } from "react";
import type {
  Guest,
  GuestAIAction,
  GuestAIInsight,
  GuestOperationalSummary,
  GuestPreference,
  GuestRevenueProfile,
  GuestTimelineEvent,
  LinkedConversation,
  LinkedReservation,
} from "@/lib/types/guests";
import { createGuestNote } from "@/lib/data/guests";
import { GuestProfileHeader } from "./guest-profile-header";
import { GuestTimeline } from "./guest-timeline";
import { GuestLinkedSection } from "./guest-linked-section";
import { GuestPreferencesCard } from "./guest-preferences-card";
import { GuestRevenueCard } from "./guest-revenue-card";
import { GuestIntelligenceSidebar } from "./guest-intelligence-card";
import { AiActionMemoryStrip } from "@/app/app/_components/ai-action-memory-strip";

export type GuestProfilePayload = {
  guest: Guest;
  timeline: GuestTimelineEvent[];
  insight: GuestAIInsight;
  revenue: GuestRevenueProfile;
  preferences: GuestPreference[];
  summary: GuestOperationalSummary | null;
  reservations: LinkedReservation[];
  conversations: LinkedConversation[];
  actions: GuestAIAction[];
  primaryConversationId: string | null;
};

type GuestProfileProps = {
  payload: GuestProfilePayload;
};

export function GuestProfile({ payload }: GuestProfileProps) {
  const [timeline, setTimeline] = useState(payload.timeline);

  const onAddNote = useCallback(
    (body: string) => {
      const evt = createGuestNote(payload.guest.id, body);
      if (evt) {
        setTimeline((prev) => [evt, ...prev]);
      }
    },
    [payload.guest.id]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <GuestProfileHeader
        guest={payload.guest}
        summary={payload.summary}
        primaryConversationId={payload.primaryConversationId}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <AiActionMemoryStrip
            guestId={payload.guest.id}
            conversationId={payload.primaryConversationId ?? undefined}
            title="Guest-scoped AI action memory"
          />
          <GuestTimeline events={timeline} onAddNote={onAddNote} />
          <GuestLinkedSection
            reservations={payload.reservations}
            conversations={payload.conversations}
          />
          <GuestPreferencesCard preferences={payload.preferences} />
          <GuestRevenueCard profile={payload.revenue} />
        </div>
        <GuestIntelligenceSidebar
          guest={payload.guest}
          insight={payload.insight}
          actions={payload.actions}
          primaryConversationId={payload.primaryConversationId}
          primaryReservationId={payload.reservations[0]?.id ?? null}
        />
      </div>
    </div>
  );
}
