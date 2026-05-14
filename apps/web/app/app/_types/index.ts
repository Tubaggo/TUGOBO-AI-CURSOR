/** Role values for hotel staff / org access (future RLS / authz). */
export const HOTEL_ROLES = [
  "owner",
  "admin",
  "manager",
  "staff",
  "viewer",
] as const;

export type HotelRole = (typeof HOTEL_ROLES)[number];

export const MEMBERSHIP_STATUSES = ["active", "invited", "suspended"] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const ORGANIZATION_TYPES = [
  "resort",
  "hotel",
  "suites",
  "boutique",
  "hostel",
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  city: string;
  country: string;
  timezone: string;
  defaultLanguage: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: HotelRole;
  avatarUrl: string | null;
  organizationId: string;
};

export type Membership = {
  id: string;
  userId: string;
  organizationId: string;
  role: HotelRole;
  status: MembershipStatus;
};

export type OverviewStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type OverviewStats = {
  stats: OverviewStat[];
  asOf: string;
};
