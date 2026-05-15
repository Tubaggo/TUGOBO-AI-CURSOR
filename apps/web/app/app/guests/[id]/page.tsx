import { notFound } from "next/navigation";
import {
  getGuestAIActions,
  getGuestById,
  getGuestInsights,
  getGuestLinkedConversations,
  getGuestLinkedReservations,
  getGuestOperationalSummary,
  getGuestPreferences,
  getGuestRevenueProfile,
  getGuestTimeline,
} from "@/lib/data/guests";
import { GuestProfile } from "../_components/guest-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GuestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const guest = getGuestById(id);
  if (!guest) {
    notFound();
  }

  const insight = getGuestInsights(id);
  const revenue = getGuestRevenueProfile(id);
  if (!insight || !revenue) {
    notFound();
  }

  const conversations = getGuestLinkedConversations(id);
  const primaryConversationId = conversations[0]?.id ?? null;

  return (
    <GuestProfile
      payload={{
        guest,
        timeline: getGuestTimeline(id),
        insight,
        revenue,
        preferences: getGuestPreferences(id),
        summary: getGuestOperationalSummary(id),
        reservations: getGuestLinkedReservations(id),
        conversations,
        actions: getGuestAIActions(),
        primaryConversationId,
      }}
    />
  );
}
