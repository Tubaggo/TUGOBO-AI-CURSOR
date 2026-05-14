import type {
  Organization,
  OverviewStats,
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
