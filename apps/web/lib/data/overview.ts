import type {
  AiAttentionItem,
  OperationsFeedItem,
  Organization,
  OverviewStats,
  TodayArrival,
  User,
} from "@/app/app/_types";

/**
 * Stub organizations — replace with Supabase when wiring multi-tenant data.
 */
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "org_tugobo_resort",
    name: "Tugobo Resort",
    slug: "tugobo-resort",
    type: "resort",
    city: "Antalya",
    country: "TR",
    timezone: "Europe/Istanbul",
    defaultLanguage: "tr",
  },
  {
    id: "org_blue_coast",
    name: "Blue Coast Hotel",
    slug: "blue-coast-hotel",
    type: "hotel",
    city: "İzmir",
    country: "TR",
    timezone: "Europe/Istanbul",
    defaultLanguage: "tr",
  },
  {
    id: "org_mersin_marina",
    name: "Mersin Marina Suites",
    slug: "mersin-marina-suites",
    type: "suites",
    city: "Mersin",
    country: "TR",
    timezone: "Europe/Istanbul",
    defaultLanguage: "tr",
  },
];

const MOCK_USER: User = {
  id: "usr_demo_ops",
  name: "Ops Lead",
  email: "ops@tugobo.ai",
  role: "admin",
  avatarUrl: null,
  organizationId: MOCK_ORGANIZATIONS[0].id,
};

const MOCK_OPERATIONS_FEED: OperationsFeedItem[] = [
  {
    id: "feed_1",
    kind: "ai_qualification",
    headline: "AI qualified a WhatsApp inquiry",
    detail: "Family of four · sea view preference captured · intent: book within 48h",
    occurredAtIso: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "feed_2",
    kind: "payment",
    headline: "Payment link sent",
    detail: "Deposit for reservation #RK-2041 · link valid 24h",
    occurredAtIso: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "feed_3",
    kind: "guest_request",
    headline: "Guest requested sea view room",
    detail: "Thread linked to arrival 14 May · upsell offer drafted",
    occurredAtIso: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: "feed_4",
    kind: "reservation",
    headline: "Reservation awaiting confirmation",
    detail: "Direct booking · 3 nights deluxe · policy check pending",
    occurredAtIso: new Date(Date.now() - 51 * 60 * 1000).toISOString(),
  },
  {
    id: "feed_5",
    kind: "system",
    headline: "OTA rate parity check completed",
    detail: "No drift on primary room types for next 7 nights",
    occurredAtIso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_TODAY_ARRIVALS: TodayArrival[] = [
  {
    id: "arr_1",
    guestName: "Elena V.",
    roomType: "Deluxe sea view",
    checkInTime: "14:00",
    status: "confirmed",
  },
  {
    id: "arr_2",
    guestName: "Marcus & Jo K.",
    roomType: "Junior suite",
    checkInTime: "15:30",
    status: "in_transit",
  },
  {
    id: "arr_3",
    guestName: "Ayşe Yılmaz",
    roomType: "Standard twin",
    checkInTime: "16:00",
    status: "pending_docs",
  },
  {
    id: "arr_4",
    guestName: "Thomas B.",
    roomType: "Garden villa",
    checkInTime: "17:00",
    status: "confirmed",
  },
];

const MOCK_AI_ATTENTION: AiAttentionItem[] = [
  {
    id: "att_1",
    severity: "warning",
    title: "Low confidence response",
    detail: "Policy edge case on late checkout · model suggested human review",
  },
  {
    id: "att_2",
    severity: "critical",
    title: "Human takeover suggested",
    detail: "Guest escalated billing dispute · thread paused for staff",
  },
  {
    id: "att_3",
    severity: "info",
    title: "Payment pending",
    detail: "Invoice link opened twice · no capture yet",
  },
  {
    id: "att_4",
    severity: "warning",
    title: "Guest asked custom discount",
    detail: "Non-standard rate request · outside approved band",
  },
];

export function getOrganizations(): Organization[] {
  return MOCK_ORGANIZATIONS;
}

export function getCurrentOrganization(): Organization {
  const org = MOCK_ORGANIZATIONS.find((o) => o.id === MOCK_USER.organizationId);
  return org ?? MOCK_ORGANIZATIONS[0];
}

export function getCurrentUser(): User {
  return MOCK_USER;
}

export function getOverviewStats(): OverviewStats {
  return {
    asOf: new Date().toISOString(),
    stats: [
      { id: "checkins", label: "Today's Check-ins", value: "14", hint: "vs. 11 yesterday" },
      { id: "checkouts", label: "Today's Check-outs", value: "9", hint: "Departures on schedule" },
      { id: "conversations", label: "Active Conversations", value: "23", hint: "Across channels" },
      { id: "pending_res", label: "Pending Reservations", value: "7", hint: "Awaiting confirmation" },
      { id: "ai_revenue", label: "AI Generated Revenue", value: "€12.4k", hint: "30d attributed" },
      { id: "direct_booking", label: "Direct Booking Value", value: "€28.1k", hint: "30d direct" },
      { id: "avg_response", label: "Average Response Time", value: "1m 42s", hint: "Business hours" },
      { id: "ota_saved", label: "OTA Commission Saved", value: "€4.2k", hint: "Estimated 30d" },
    ],
  };
}

export function getOperationsFeed(): OperationsFeedItem[] {
  return MOCK_OPERATIONS_FEED;
}

export function getTodaysArrivalFocus(): TodayArrival[] {
  return MOCK_TODAY_ARRIVALS;
}

export function getAiAttentionItems(): AiAttentionItem[] {
  return MOCK_AI_ATTENTION;
}
