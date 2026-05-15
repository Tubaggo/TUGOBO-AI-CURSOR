import type { Reservation } from "@/app/app/_types";
import type {
  Guest,
  GuestAIAction,
  GuestAIInsight,
  GuestIntelligenceMetrics,
  GuestIntelligenceSegment,
  GuestOperationalSummary,
  GuestPreference,
  GuestRevenueProfile,
  GuestTimelineEvent,
  LinkedConversation,
  LinkedReservation,
} from "@/lib/types/guests";
import { getConversations } from "@/lib/data/conversations";
import { getReservations } from "@/lib/data/reservations";
import type { ReservationPipelineStage, ReservationSource } from "@/app/app/_types";

function pipelineStageLabel(stage: ReservationPipelineStage): string {
  const labels: Record<ReservationPipelineStage, string> = {
    inquiry: "Inquiry",
    qualified: "Qualified",
    offer_sent: "Offer sent",
    payment_pending: "Payment pending",
    confirmed: "Confirmed",
    checkin_ready: "Check-in ready",
    checked_in: "Checked-in",
  };
  return labels[stage];
}

function sourceLabel(source: ReservationSource): string {
  const labels: Record<ReservationSource, string> = {
    whatsapp: "WhatsApp",
    web_chat: "Web chat",
    instagram: "Instagram",
    booking_com: "Booking.com",
    expedia: "Expedia",
    direct_web: "Direct web",
    phone: "Phone",
    email: "Email",
  };
  return labels[source];
}

const HOTEL_ID = "org_tugobo_resort";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/** Core guest intelligence rows — replace with Drizzle + Supabase projections. */
const GUEST_SEED: Guest[] = [
  {
    id: "g_marina",
    name: "Marina Rossi",
    nationality: "IT",
    preferredLanguage: "it / en",
    loyaltyTier: "gold",
    totalStays: 3,
    lifetimeValue: 6840,
    directBookingRatio: 0.72,
    aiScore: 91,
    sentiment: "positive",
    tags: ["VIP", "Honeymoon", "Sea View Preference", "Returning Guest", "Upsell Target"],
    riskFlags: ["late_responder"],
    upsellPotential: 0.88,
    currentReservationState: "at_risk",
    currentReservationLabel: "Payment pending · deluxe sea hold",
    avatarUrl: null,
  },
  {
    id: "g_ahmet",
    name: "Ahmet Yılmaz",
    nationality: "TR",
    preferredLanguage: "tr / ar / en",
    loyaltyTier: "platinum",
    totalStays: 11,
    lifetimeValue: 28400,
    directBookingRatio: 0.81,
    aiScore: 94,
    sentiment: "positive",
    tags: ["VIP", "Arabic speaking", "High Spend", "Direct booking loyalist"],
    riskFlags: ["none"],
    upsellPotential: 0.42,
    currentReservationState: "confirmed_upcoming",
    currentReservationLabel: "Exec city view · VIP transfer locked",
    avatarUrl: null,
  },
  {
    id: "g_james",
    name: "James Porter",
    nationality: "GB",
    preferredLanguage: "en",
    loyaltyTier: "standard",
    totalStays: 0,
    lifetimeValue: 3940,
    directBookingRatio: 0.55,
    aiScore: 76,
    sentiment: "neutral",
    tags: ["Family", "Upsell Target", "Late Responder"],
    riskFlags: ["cancellation_risk"],
    upsellPotential: 0.71,
    currentReservationState: "confirmed_upcoming",
    currentReservationLabel: "Interconnecting pair · offer sent",
    avatarUrl: null,
  },
  {
    id: "g_elena",
    name: "Elena Vogel",
    nationality: "DE",
    preferredLanguage: "de / en",
    loyaltyTier: "silver",
    totalStays: 1,
    lifetimeValue: 1620,
    directBookingRatio: 0.38,
    aiScore: 72,
    sentiment: "neutral",
    tags: ["Accessibility", "Long stay"],
    riskFlags: ["none"],
    upsellPotential: 0.35,
    currentReservationState: "confirmed_upcoming",
    currentReservationLabel: "Ground-floor twin · confirmed",
    avatarUrl: null,
  },
  {
    id: "g_kaan",
    name: "Kaan Demir",
    nationality: "TR",
    preferredLanguage: "tr",
    loyaltyTier: "silver",
    totalStays: 2,
    lifetimeValue: 1180,
    directBookingRatio: 0.66,
    aiScore: 58,
    sentiment: "mixed",
    tags: ["Returning Guest", "Late-night responder", "Cancellation Risk"],
    riskFlags: ["payment_friction", "cancellation_risk", "late_responder"],
    upsellPotential: 0.22,
    currentReservationState: "at_risk",
    currentReservationLabel: "Same-day arrival · 3DS failures",
    avatarUrl: null,
  },
  {
    id: "g_sofia",
    name: "Sofia Andersson",
    nationality: "SE",
    preferredLanguage: "sv / en",
    loyaltyTier: "gold",
    totalStays: 1,
    lifetimeValue: 4280,
    directBookingRatio: 0.44,
    aiScore: 83,
    sentiment: "positive",
    tags: ["OTA Recovery", "Upsell Target", "High Spend"],
    riskFlags: ["ota_dependent"],
    upsellPotential: 0.79,
    currentReservationState: "inquiry",
    currentReservationLabel: "Junior suite inquiry · Instagram",
    avatarUrl: null,
  },
  {
    id: "g_yuki",
    name: "Yuki Tanaka",
    nationality: "JP",
    preferredLanguage: "ja / en",
    loyaltyTier: "vip",
    totalStays: 0,
    lifetimeValue: 5120,
    directBookingRatio: 0.61,
    aiScore: 89,
    sentiment: "positive",
    tags: ["VIP", "Honeymoon", "Upsell Target", "Spa upsell"],
    riskFlags: ["none"],
    upsellPotential: 0.92,
    currentReservationState: "confirmed_upcoming",
    currentReservationLabel: "Honeymoon suite · spa package",
    avatarUrl: null,
  },
  {
    id: "g_ota_anon",
    name: "Booking.com guest",
    nationality: "NL",
    preferredLanguage: "en",
    loyaltyTier: "standard",
    totalStays: 0,
    lifetimeValue: 890,
    directBookingRatio: 0.05,
    aiScore: 61,
    sentiment: "neutral",
    tags: ["OTA Recovery", "Cancellation Risk"],
    riskFlags: ["ota_dependent", "complaint_risk"],
    upsellPotential: 0.48,
    currentReservationState: "inquiry",
    currentReservationLabel: "OTA standard · direct incentive path",
    avatarUrl: null,
  },
  {
    id: "g_mehtap",
    name: "Mehtap Kılıç",
    nationality: "TR",
    preferredLanguage: "tr",
    loyaltyTier: "gold",
    totalStays: 3,
    lifetimeValue: 9420,
    directBookingRatio: 0.94,
    aiScore: 87,
    sentiment: "positive",
    tags: ["Direct booking loyalist", "Returning Guest", "High Spend"],
    riskFlags: ["none"],
    upsellPotential: 0.51,
    currentReservationState: "confirmed_upcoming",
    currentReservationLabel: "Deluxe partial sea · email thread",
    avatarUrl: null,
  },
  {
    id: "g_olivier",
    name: "Olivier Dubois",
    nationality: "FR",
    preferredLanguage: "fr / en",
    loyaltyTier: "standard",
    totalStays: 0,
    lifetimeValue: 1320,
    directBookingRatio: 0.12,
    aiScore: 74,
    sentiment: "positive",
    tags: ["Upsell Target", "OTA Recovery", "Upgrade-heavy traveler"],
    riskFlags: ["ota_dependent"],
    upsellPotential: 0.86,
    currentReservationState: "at_risk",
    currentReservationLabel: "Payment pending · Expedia base · junior suite upsell",
    avatarUrl: null,
  },
  {
    id: "g_lisa",
    name: "Lisa Chen",
    nationality: "SG",
    preferredLanguage: "en / zh",
    loyaltyTier: "vip",
    totalStays: 4,
    lifetimeValue: 22300,
    directBookingRatio: 0.77,
    aiScore: 96,
    sentiment: "positive",
    tags: ["VIP", "Returning Guest", "High Spend", "Club lounge"],
    riskFlags: ["none"],
    upsellPotential: 0.39,
    currentReservationState: "in_house",
    currentReservationLabel: "Checked-in · club floor",
    avatarUrl: null,
  },
  {
    id: "g_marcus",
    name: "Marcus Weber",
    nationality: "DE",
    preferredLanguage: "de / en",
    loyaltyTier: "standard",
    totalStays: 0,
    lifetimeValue: 1680,
    directBookingRatio: 0.22,
    aiScore: 69,
    sentiment: "neutral",
    tags: ["Family", "Late Responder"],
    riskFlags: ["none"],
    upsellPotential: 0.33,
    currentReservationState: "confirmed_upcoming",
    currentReservationLabel: "Twin + rollaway · early arrival",
    avatarUrl: null,
  },
  {
    id: "g_nina",
    name: "Nina Kovacs",
    nationality: "HU",
    preferredLanguage: "en",
    loyaltyTier: "silver",
    totalStays: 2,
    lifetimeValue: 11840,
    directBookingRatio: 0.68,
    aiScore: 81,
    sentiment: "positive",
    tags: ["Long stay", "Digital nomad", "Upsell Target"],
    riskFlags: ["none"],
    upsellPotential: 0.64,
    currentReservationState: "in_house",
    currentReservationLabel: "28-night bleisure · workspace suite",
    avatarUrl: null,
  },
];

const TIMELINE_SEED: Record<string, GuestTimelineEvent[]> = {
  g_marina: [
    {
      id: "tl_m_1",
      guestId: "g_marina",
      type: "conversation",
      description: "WhatsApp: requested sea-view upgrade + late arrival 23:40",
      createdAt: isoHoursAgo(2),
      actorType: "guest",
      conversationId: "conv_sea_view_quote",
      reservationId: "res_88421",
    },
    {
      id: "tl_m_2",
      guestId: "g_marina",
      type: "ai_escalation",
      description: "AI detected payment timing risk — suggested 12h hold + deposit resend",
      createdAt: isoHoursAgo(5),
      actorType: "ai",
      reservationId: "res_88421",
    },
    {
      id: "tl_m_3",
      guestId: "g_marina",
      type: "payment",
      description: "Partial deposit received (30%) — balance outstanding",
      createdAt: isoDaysAgo(1),
      actorType: "system",
      reservationId: "res_88421",
    },
    {
      id: "tl_m_4",
      guestId: "g_marina",
      type: "special_request",
      description: "Honeymoon amenity: prosecco + rose petals (ops confirmed)",
      createdAt: isoDaysAgo(2),
      actorType: "staff",
      reservationId: "res_88421",
    },
  ],
  g_ahmet: [
    {
      id: "tl_a_1",
      guestId: "g_ahmet",
      type: "special_request",
      description: "VIP airport transfer AYT 03:15 — driver WhatsApp distributed",
      createdAt: isoHoursAgo(1),
      actorType: "staff",
      conversationId: "conv_airport_transfer",
    },
    {
      id: "tl_a_2",
      guestId: "g_ahmet",
      type: "conversation",
      description: "Arabic/EN thread: confirmed Mercedes Vito + meet & greet",
      createdAt: isoHoursAgo(3),
      actorType: "ai",
      conversationId: "conv_airport_transfer",
    },
    {
      id: "tl_a_3",
      guestId: "g_ahmet",
      type: "reservation",
      description: "Executive city view block extended + lounge access",
      createdAt: isoDaysAgo(4),
      actorType: "staff",
      reservationId: "res_airport_exec",
    },
  ],
  g_james: [
    {
      id: "tl_j_1",
      guestId: "g_james",
      type: "conversation",
      description: "Family interconnecting guarantee — staff drafting written confirmation",
      createdAt: isoHoursAgo(8),
      actorType: "staff",
      conversationId: "conv_family_quote",
      reservationId: "res_family_hold",
    },
    {
      id: "tl_j_2",
      guestId: "g_james",
      type: "upgrade",
      description: "AI suggested kids club week pass — guest asked for pricing",
      createdAt: isoDaysAgo(1),
      actorType: "ai",
      reservationId: "res_family_hold",
    },
  ],
  g_kaan: [
    {
      id: "tl_k_1",
      guestId: "g_kaan",
      type: "payment",
      description: "3D Secure retry exhausted — Finance desk engaged",
      createdAt: isoHoursAgo(4),
      actorType: "system",
      conversationId: "conv_payment_nudge",
      reservationId: "res_90211",
    },
    {
      id: "tl_k_2",
      guestId: "g_kaan",
      type: "conversation",
      description: "Late-night WhatsApp: 'link still fails' — AI escalated",
      createdAt: isoHoursAgo(6),
      actorType: "guest",
      conversationId: "conv_payment_nudge",
    },
    {
      id: "tl_k_3",
      guestId: "g_kaan",
      type: "ai_escalation",
      description: "Critical path: same-day arrival + failed payment",
      createdAt: isoHoursAgo(7),
      actorType: "ai",
      reservationId: "res_90211",
    },
  ],
  g_sofia: [
    {
      id: "tl_s_1",
      guestId: "g_sofia",
      type: "recovery",
      description: "Recovered to direct booking path — media rate under commercial review",
      createdAt: isoDaysAgo(1),
      actorType: "ai",
      conversationId: "conv_insta_collab",
      reservationId: "res_ota_recovery_01",
    },
    {
      id: "tl_s_2",
      guestId: "g_sofia",
      type: "complaint",
      description: "Left negative OTA review (pre-stay) — ops flagged for welcome recovery",
      createdAt: isoDaysAgo(5),
      actorType: "ota",
    },
    {
      id: "tl_s_3",
      guestId: "g_sofia",
      type: "upgrade",
      description: "AI detected upsell: junior suite + content package",
      createdAt: isoDaysAgo(2),
      actorType: "ai",
      reservationId: "res_ota_recovery_01",
    },
  ],
  g_yuki: [
    {
      id: "tl_y_1",
      guestId: "g_yuki",
      type: "upgrade",
      description: "Honeymoon package accepted — spa thermal suite add-on",
      createdAt: isoDaysAgo(1),
      actorType: "guest",
      reservationId: "res_honeymoon_yuki",
    },
    {
      id: "tl_y_2",
      guestId: "g_yuki",
      type: "special_request",
      description: "Sakura-themed turndown + private onsen slot 21:00",
      createdAt: isoDaysAgo(3),
      actorType: "staff",
      reservationId: "res_honeymoon_yuki",
    },
  ],
  g_ota_anon: [
    {
      id: "tl_o_1",
      guestId: "g_ota_anon",
      type: "recovery",
      description: "AI outreach: −12% BAR vs OTA if pay link today",
      createdAt: isoHoursAgo(12),
      actorType: "ai",
      reservationId: "res_ota_anon_bc",
    },
    {
      id: "tl_o_2",
      guestId: "g_ota_anon",
      type: "conversation",
      description: "Guest asked about city tax — concise reply sent",
      createdAt: isoDaysAgo(1),
      actorType: "ai",
    },
  ],
  g_mehtap: [
    {
      id: "tl_me_1",
      guestId: "g_mehtap",
      type: "conversation",
      description: "Email: city tax clarification — direct incentive attached",
      createdAt: isoDaysAgo(2),
      actorType: "ai",
      reservationId: "res_mehtap_direct",
    },
    {
      id: "tl_me_2",
      guestId: "g_mehtap",
      type: "payment",
      description: "Payment delay resolved manually — ops applied loyalty code",
      createdAt: isoDaysAgo(14),
      actorType: "staff",
    },
  ],
  g_olivier: [
    {
      id: "tl_ol_1",
      guestId: "g_olivier",
      type: "upgrade",
      description: "Requested sea-view upgrade — payment link refreshed for suite delta",
      createdAt: isoHoursAgo(3),
      actorType: "guest",
      reservationId: "res_olivier_upgrade",
    },
    {
      id: "tl_ol_2",
      guestId: "g_olivier",
      type: "ai_escalation",
      description: "AI flagged upgrade probability 86% — revenue desk notified",
      createdAt: isoDaysAgo(1),
      actorType: "ai",
      reservationId: "res_olivier_upgrade",
    },
  ],
  g_lisa: [
    {
      id: "tl_li_1",
      guestId: "g_lisa",
      type: "check_in",
      description: "Mobile check-in complete — club keys issued at lounge",
      createdAt: isoHoursAgo(20),
      actorType: "system",
      reservationId: "res_checked_lisa",
    },
    {
      id: "tl_li_2",
      guestId: "g_lisa",
      type: "note",
      description: "VIP note: prefers east wing, low noise",
      createdAt: isoDaysAgo(2),
      actorType: "staff",
    },
  ],
  g_marcus: [
    {
      id: "tl_ma_1",
      guestId: "g_marcus",
      type: "special_request",
      description: "Early arrival 10:00 + twin + rollaway confirmed",
      createdAt: isoDaysAgo(1),
      actorType: "staff",
      reservationId: "res_marcus_early",
    },
  ],
  g_elena: [
    {
      id: "tl_e_1",
      guestId: "g_elena",
      type: "reservation",
      description: "Accessibility path: ground-floor twin locked",
      createdAt: isoDaysAgo(3),
      actorType: "ai",
      reservationId: "res_77102",
    },
  ],
  g_nina: [
    {
      id: "tl_n_1",
      guestId: "g_nina",
      type: "reservation",
      description: "28-night bleisure — workspace suite + laundry bundle",
      createdAt: isoDaysAgo(6),
      actorType: "staff",
    },
    {
      id: "tl_n_2",
      guestId: "g_nina",
      type: "conversation",
      description: "WhatsApp: asked for quieter floor + second monitor (concierge sourcing)",
      createdAt: isoHoursAgo(30),
      actorType: "guest",
    },
    {
      id: "tl_n_3",
      guestId: "g_nina",
      type: "upgrade",
      description: "Accepted weekly housekeeping upgrade + late checkout pool",
      createdAt: isoDaysAgo(2),
      actorType: "guest",
    },
  ],
};

const PREFERENCES: Record<string, GuestPreference[]> = {
  g_marina: [
    { category: "room", value: "Sea view only, higher floor", confidence: 0.94 },
    { category: "occasion", value: "Anniversary / honeymoon traveler", confidence: 0.98 },
    { category: "communication", value: "Prefers WhatsApp, concise totals in EUR", confidence: 0.88 },
    { category: "transfer", value: "Airport pickup requested often", confidence: 0.62 },
  ],
  g_ahmet: [
    { category: "communication", value: "Arabic first, business tone in EN secondary", confidence: 0.91 },
    { category: "transfer", value: "VIP van, night arrivals common", confidence: 0.95 },
    { category: "room", value: "Executive city view, away from pool noise", confidence: 0.79 },
  ],
  g_james: [
    { category: "room", value: "Interconnecting or adjacent guaranteed", confidence: 0.9 },
    { category: "dietary", value: "Kids menu + nut-free breakfast", confidence: 0.72 },
    { category: "communication", value: "Email for contracts, WhatsApp for day-of", confidence: 0.68 },
  ],
  g_kaan: [
    { category: "communication", value: "Late-night responder on WhatsApp", confidence: 0.87 },
    { category: "room", value: "Garden view acceptable if rate-sensitive", confidence: 0.55 },
  ],
  g_sofia: [
    { category: "communication", value: "Instagram-first, fast visual quotes", confidence: 0.84 },
    { category: "room", value: "Junior suite sea for content shoots", confidence: 0.8 },
  ],
  g_yuki: [
    { category: "occasion", value: "Honeymoon — onsen + quiet dining", confidence: 0.96 },
    { category: "dietary", value: "Pescatarian breakfast", confidence: 0.74 },
  ],
  g_ota_anon: [
    { category: "communication", value: "Short factual replies — avoid upsell walls", confidence: 0.7 },
  ],
  g_mehtap: [
    { category: "communication", value: "Prefers email with itemized city tax", confidence: 0.92 },
    { category: "dietary", value: "Vegetarian breakfast", confidence: 0.81 },
  ],
  g_olivier: [
    { category: "room", value: "Sea view upgrade history — sensitive to OTA price parity", confidence: 0.85 },
    { category: "communication", value: "FR/EN, concise bullet options", confidence: 0.77 },
  ],
  g_lisa: [
    { category: "room", value: "Club floor east wing, low corridor traffic", confidence: 0.93 },
    { category: "transfer", value: "Private car preferred for city meetings", confidence: 0.71 },
  ],
  g_marcus: [
    { category: "room", value: "Twin + rollaway, early check-in common", confidence: 0.88 },
  ],
  g_elena: [
    { category: "room", value: "Ground floor, accessible shower", confidence: 0.97 },
    { category: "communication", value: "DE/EN, step-by-step arrival instructions", confidence: 0.83 },
  ],
  g_nina: [
    { category: "room", value: "Dedicated desk + ergonomic chair", confidence: 0.9 },
    { category: "communication", value: "Async WhatsApp, long-stay weekly summaries", confidence: 0.86 },
    { category: "dietary", value: "Oat milk + light lunch delivery", confidence: 0.66 },
  ],
};

const INSIGHTS: Record<string, GuestAIInsight> = {
  g_marina: {
    priceSensitivity: "medium",
    upsellProbability: 0.88,
    cancellationRisk: 0.22,
    preferredTone: "warm",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.78,
    complaintRisk: 0.12,
    loyaltyPotential: 0.91,
    responseBehavior: "Replies in bursts after 21:00 CET",
    channelPreference: "Responds better to WhatsApp than email",
    summary:
      "Returning honeymoon guest with strong sea-view preference. Deposit friction is the main revenue risk; tone should stay warm and reassurance-heavy.",
    highlights: [
      "Frequently requests sea-view upgrades",
      "Books direct after initial WhatsApp discovery",
      "High probability for spa upsell post check-in",
    ],
  },
  g_ahmet: {
    priceSensitivity: "low",
    upsellProbability: 0.42,
    cancellationRisk: 0.08,
    preferredTone: "formal",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.89,
    complaintRisk: 0.06,
    loyaltyPotential: 0.94,
    responseBehavior: "Fast on operational confirmations",
    channelPreference: "VIP logistics flow best on WhatsApp with Arabic opener",
    summary:
      "High-value corporate VIP with multi-year stays. Prioritize transfer and lounge ops over discounting.",
    highlights: [
      "Airport pickup requested often",
      "Prefers concise communication for pricing, warm for logistics",
    ],
  },
  g_james: {
    priceSensitivity: "medium",
    upsellProbability: 0.71,
    cancellationRisk: 0.41,
    preferredTone: "warm",
    communicationPreference: "mixed",
    directBookingProbability: 0.62,
    complaintRisk: 0.28,
    loyaltyPotential: 0.58,
    responseBehavior: "Slow on written guarantees, fast on voice notes",
    channelPreference: "WhatsApp for day-of, email for contract language",
    summary:
      "Family lead with high upsell surface (kids club, interconnecting). Needs written interconnecting assurance to de-risk cancellation.",
    highlights: [
      "Upgrade-heavy on experiences, not room category",
      "Late responder on email threads",
    ],
  },
  g_elena: {
    priceSensitivity: "medium",
    upsellProbability: 0.35,
    cancellationRisk: 0.18,
    preferredTone: "formal",
    communicationPreference: "email",
    directBookingProbability: 0.45,
    complaintRisk: 0.15,
    loyaltyPotential: 0.72,
    responseBehavior: "Prefers structured bullet lists",
    channelPreference: "Email for accessibility confirmations",
    summary:
      "Accessibility-first guest — operational clarity beats promotional tone. Ground-floor lock is the loyalty anchor.",
    highlights: ["Prefers concise communication", "Longer reads before committing"],
  },
  g_kaan: {
    priceSensitivity: "high",
    upsellProbability: 0.22,
    cancellationRisk: 0.63,
    preferredTone: "concise",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.7,
    complaintRisk: 0.35,
    loyaltyPotential: 0.48,
    responseBehavior: "Late-night responder on payment links",
    channelPreference: "WhatsApp-only for payment recovery",
    summary:
      "Weekend leisure with payment UX sensitivity. Human finance touch reduces churn more than AI nudges now.",
    highlights: ["Payment friction is the dominant risk signal", "Same-day arrival compresses tolerance"],
  },
  g_sofia: {
    priceSensitivity: "medium",
    upsellProbability: 0.79,
    cancellationRisk: 0.27,
    preferredTone: "playful",
    communicationPreference: "instagram",
    directBookingProbability: 0.58,
    complaintRisk: 0.44,
    loyaltyPotential: 0.69,
    responseBehavior: "Visual-first decisions (carousel beats long text)",
    channelPreference: "Instagram for discovery, WhatsApp to close",
    summary:
      "OTA discovery with recovery trajectory. Pair rate integrity with tangible on-property perks to win direct.",
    highlights: [
      "Books direct after OTA discovery when incentive is clear",
      "Influencer risk — monitor comp expectations",
    ],
  },
  g_yuki: {
    priceSensitivity: "low",
    upsellProbability: 0.92,
    cancellationRisk: 0.11,
    preferredTone: "warm",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.72,
    complaintRisk: 0.09,
    loyaltyPotential: 0.88,
    responseBehavior: "High intent once spa bundle attached",
    channelPreference: "WhatsApp for itinerary tweaks",
    summary:
      "Honeymoon high spender — spa and experience bundles outperform room discounting.",
    highlights: ["Honeymoon package acceptance pattern", "Quiet dining preference"],
  },
  g_ota_anon: {
    priceSensitivity: "high",
    upsellProbability: 0.48,
    cancellationRisk: 0.52,
    preferredTone: "concise",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.34,
    complaintRisk: 0.48,
    loyaltyPotential: 0.32,
    responseBehavior: "Short questions, low patience for multi-step flows",
    channelPreference: "Neutral on channel — optimize for speed",
    summary:
      "OTA-acquired lead. Recovery play is transparent pricing + single-tap pay; avoid aggressive upsell pre-payment.",
    highlights: ["OTA dependency limits margin — recovery is strategic", "Complaint risk if tax surprises"],
  },
  g_mehtap: {
    priceSensitivity: "medium",
    upsellProbability: 0.51,
    cancellationRisk: 0.14,
    preferredTone: "warm",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.93,
    complaintRisk: 0.1,
    loyaltyPotential: 0.9,
    responseBehavior: "Reads detail — appreciates tax line items",
    channelPreference: "Email for policy, WhatsApp for reminders",
    summary:
      "Direct loyalist with high retention. Loyalty incentives should feel earned (room upgrade > cashback).",
    highlights: ["Direct booking loyalist", "Vegetarian breakfast preference stable"],
  },
  g_olivier: {
    priceSensitivity: "medium",
    upsellProbability: 0.86,
    cancellationRisk: 0.24,
    preferredTone: "concise",
    communicationPreference: "email",
    directBookingProbability: 0.41,
    complaintRisk: 0.22,
    loyaltyPotential: 0.61,
    responseBehavior: "Upgrade-heavy traveler — compares OTA vs direct delta",
    channelPreference: "Email for receipts, chat for upgrades",
    summary:
      "Upgrade-heavy OTA booker — win on suite delta clarity and immediate confirmation of sea view.",
    highlights: ["Frequently requests sea-view upgrades", "Late check-in common"],
  },
  g_lisa: {
    priceSensitivity: "low",
    upsellProbability: 0.39,
    cancellationRisk: 0.07,
    preferredTone: "formal",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.81,
    complaintRisk: 0.05,
    loyaltyPotential: 0.95,
    responseBehavior: "Predictable corporate rhythm",
    channelPreference: "WhatsApp for concierge, silent nights",
    summary:
      "In-house VIP — maintain lounge continuity and proactive noise management.",
    highlights: ["Returning guest with stable preferences", "Club lounge engagement"],
  },
  g_marcus: {
    priceSensitivity: "medium",
    upsellProbability: 0.33,
    cancellationRisk: 0.29,
    preferredTone: "warm",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.36,
    complaintRisk: 0.18,
    loyaltyPotential: 0.55,
    responseBehavior: "Late responder until arrival week",
    channelPreference: "Phone inquiry origin — follow on WhatsApp",
    summary:
      "Family twin configuration with early arrival stressor — ops confirmation reduces anxiety.",
    highlights: ["Early arrival common — pre-assign room early when possible"],
  },
  g_nina: {
    priceSensitivity: "low",
    upsellProbability: 0.64,
    cancellationRisk: 0.12,
    preferredTone: "concise",
    communicationPreference: "whatsapp",
    directBookingProbability: 0.74,
    complaintRisk: 0.11,
    loyaltyPotential: 0.84,
    responseBehavior: "Batch messages weekly + long-stay context",
    channelPreference: "WhatsApp for ops, email for invoices",
    summary:
      "Digital nomad on extended stay — productivity amenities drive satisfaction more than F&B discounts.",
    highlights: ["Long stay — housekeeping cadence matters", "Second monitor request is a loyalty hook"],
  },
};

const REVENUE: Record<string, GuestRevenueProfile> = {
  g_marina: {
    lifetimeValue: 6840,
    otaSpend: 1200,
    directSpend: 5640,
    upsellRevenue: 640,
    averageBookingValue: 2280,
    seasonalFrequency: "1.2 stays / year · May peak",
    profitabilityHint: "High after switch to direct WhatsApp path",
    retentionPotential: "Very high — wedding anniversary anchor",
    recoveryOpportunity: null,
  },
  g_ahmet: {
    lifetimeValue: 28400,
    otaSpend: 4200,
    directSpend: 24200,
    upsellRevenue: 3100,
    averageBookingValue: 2580,
    seasonalFrequency: "Quarterly corporate pattern",
    profitabilityHint: "Top decile — minimize OTA re-entry",
    retentionPotential: "Excellent with lounge + transfer continuity",
    recoveryOpportunity: null,
  },
  g_james: {
    lifetimeValue: 3940,
    otaSpend: 1760,
    directSpend: 2180,
    upsellRevenue: 280,
    averageBookingValue: 3940,
    seasonalFrequency: "First booking — July peak",
    profitabilityHint: "Neutral until repeat confirmed",
    retentionPotential: "Good if interconnecting promise delivered",
    recoveryOpportunity: "Kids club bundle to lift ARPA",
  },
  g_elena: {
    lifetimeValue: 1620,
    otaSpend: 980,
    directSpend: 640,
    upsellRevenue: 40,
    averageBookingValue: 1620,
    seasonalFrequency: "Single long weekend",
    profitabilityHint: "Moderate — accessibility ops cost",
    retentionPotential: "Medium-high with clear ground-floor guarantee",
    recoveryOpportunity: "Ground-floor upsell to suite rarely needed",
  },
  g_kaan: {
    lifetimeValue: 1180,
    otaSpend: 200,
    directSpend: 980,
    upsellRevenue: 60,
    averageBookingValue: 590,
    seasonalFrequency: "Weekend bursts",
    profitabilityHint: "At risk until payment completes",
    retentionPotential: "Volatile — save-streak sensitive",
    recoveryOpportunity: "Manual paylink + 3DS alternative",
  },
  g_sofia: {
    lifetimeValue: 4280,
    otaSpend: 2600,
    directSpend: 1680,
    upsellRevenue: 420,
    averageBookingValue: 2140,
    seasonalFrequency: "Event-driven",
    profitabilityHint: "Improving as Instagram direct deepens",
    retentionPotential: "High if media package structured",
    recoveryOpportunity: "Welcome amenity to offset OTA review",
  },
  g_yuki: {
    lifetimeValue: 5120,
    otaSpend: 900,
    directSpend: 4220,
    upsellRevenue: 890,
    averageBookingValue: 5120,
    seasonalFrequency: "Honeymoon seasonal",
    profitabilityHint: "Strong upsell margin on spa",
    retentionPotential: "High for anniversary return",
    recoveryOpportunity: null,
  },
  g_ota_anon: {
    lifetimeValue: 890,
    otaSpend: 820,
    directSpend: 70,
    upsellRevenue: 0,
    averageBookingValue: 890,
    seasonalFrequency: "Single short stay",
    profitabilityHint: "Low until converted off OTA",
    retentionPotential: "Binary — incentive acceptance decides",
    recoveryOpportunity: "Direct incentive −12% vs BAR",
  },
  g_mehtap: {
    lifetimeValue: 9420,
    otaSpend: 420,
    directSpend: 9000,
    upsellRevenue: 510,
    averageBookingValue: 3140,
    seasonalFrequency: "2–3 city breaks / year",
    profitabilityHint: "Excellent — OTA share minimal",
    retentionPotential: "Very high",
    recoveryOpportunity: null,
  },
  g_olivier: {
    lifetimeValue: 1320,
    otaSpend: 1100,
    directSpend: 220,
    upsellRevenue: 180,
    averageBookingValue: 1320,
    seasonalFrequency: "Summer leisure",
    profitabilityHint: "Upgrade delta improves margin",
    retentionPotential: "Medium — win on direct next trip",
    recoveryOpportunity: "Suite upgrade with clear sea-view wording",
  },
  g_lisa: {
    lifetimeValue: 22300,
    otaSpend: 4100,
    directSpend: 18200,
    upsellRevenue: 2400,
    averageBookingValue: 5575,
    seasonalFrequency: "Quarterly APAC travel",
    profitabilityHint: "VIP profitability strong",
    retentionPotential: "Anchor account",
    recoveryOpportunity: null,
  },
  g_marcus: {
    lifetimeValue: 1680,
    otaSpend: 1180,
    directSpend: 500,
    upsellRevenue: 90,
    averageBookingValue: 1680,
    seasonalFrequency: "Single trip",
    profitabilityHint: "Neutral",
    retentionPotential: "Medium after first stay quality",
    recoveryOpportunity: "Airport transfer bundle",
  },
  g_nina: {
    lifetimeValue: 11840,
    otaSpend: 2100,
    directSpend: 9740,
    upsellRevenue: 1320,
    averageBookingValue: 5920,
    seasonalFrequency: "Long bleisure blocks",
    profitabilityHint: "Strong on laundry + workspace upsell",
    retentionPotential: "High for extended-stay playbook",
    recoveryOpportunity: "Quarterly direct renewal offer",
  },
};

const OPERATIONAL_SUMMARY: Record<string, GuestOperationalSummary> = {
  g_marina: {
    headline: "Honeymoon revenue in flight — deposit timing is the bottleneck",
    detail:
      "AI is holding rate integrity while nudging payment completion. Guest is emotionally bought-in on sea view; operational risk is link expiry + late arrival handoff.",
    recoveryHistory: "2024 OTA discovery → 2025/26 repeat via WhatsApp direct",
  },
  g_ahmet: {
    headline: "VIP logistics excellence — room block is the remaining monetization step",
    detail:
      "Transfer path is controlled; finance should close deposit for exec room to avoid last-minute inventory bleed.",
    recoveryHistory: null,
  },
  g_james: {
    headline: "Family interconnecting promise is the trust contract",
    detail:
      "Staff confirmation letter requested. AI should pause aggressive upsell until written guarantee is delivered.",
    recoveryHistory: null,
  },
  g_kaan: {
    headline: "Payment UX crisis with same-day arrival compression",
    detail:
      "Finance + front desk should align on manual capture or alternate PSP. AI escalation already fired.",
    recoveryHistory: "Prior stay completed with late checkout comp",
  },
  g_sofia: {
    headline: "Reputation recovery + influencer economics",
    detail:
      "Pair junior suite narrative with measurable on-property perks. Legal/commercial should approve media package boundaries.",
    recoveryHistory: "Negative OTA review → Instagram recovery thread active",
  },
  g_yuki: {
    headline: "Honeymoon upsell stack performing",
    detail:
      "Spa thermal suite attached — maintain quiet dining slots and onsen timing precision.",
    recoveryHistory: null,
  },
  g_ota_anon: {
    headline: "OTA lead — compress steps to single-tap direct conversion",
    detail:
      "Guest is price-sensitive; clarity on city tax beats promotional fluff.",
    recoveryHistory: "AI incentive path opened 12h ago",
  },
  g_mehtap: {
    headline: "Direct loyalist — protect trust with transparent tax handling",
    detail:
      "Email thread is the source of truth; WhatsApp only for reminders.",
    recoveryHistory: "2025 payment delay manually resolved — loyalty code applied",
  },
  g_olivier: {
    headline: "Upgrade-heavy OTA booker — suite delta is the win",
    detail:
      "Keep parity language tight; emphasize confirmed sea-view wording vs 'subject to availability'.",
    recoveryHistory: "Prior Expedia stay upgraded at desk",
  },
  g_lisa: {
    headline: "In-house VIP — proactive noise + lounge continuity",
    detail:
      "Club keys issued; concierge should monitor east wing service levels.",
    recoveryHistory: null,
  },
  g_marcus: {
    headline: "Early arrival + twin config — ops pre-assign reduces desk friction",
    detail:
      "Phone inquiry origin; WhatsApp follow-ups should stay short and checklist-style.",
    recoveryHistory: null,
  },
  g_elena: {
    headline: "Accessibility assurance is the loyalty driver",
    detail:
      "Ground-floor twin locked — avoid last-minute room moves at all costs.",
    recoveryHistory: null,
  },
  g_nina: {
    headline: "Long-stay bleisure — productivity and cadence matter more than discounts",
    detail:
      "Weekly housekeeping upgrade accepted; monitor second monitor concierge task.",
    recoveryHistory: null,
  },
};

const AI_ACTIONS: GuestAIAction[] = [
  {
    id: "act_upgrade",
    label: "Offer upgrade",
    description: "Send differentiated suite delta with sea-view confirmation language",
    kind: "upgrade",
  },
  {
    id: "act_direct",
    label: "Invite to direct booking",
    description: "Trigger incentive template vs OTA BAR with single-tap pay",
    kind: "direct_booking",
  },
  {
    id: "act_loyalty",
    label: "Send loyalty incentive",
    description: "Earned upgrade or lounge pass — not blanket discount",
    kind: "loyalty",
  },
  {
    id: "act_human",
    label: "Trigger human follow-up",
    description: "Assign front office lead with SLA for VIP / at-risk",
    kind: "human_followup",
  },
  {
    id: "act_support",
    label: "Prioritize support",
    description: "Bump queue + attach payment recovery playbook",
    kind: "support_priority",
  },
  {
    id: "act_risk",
    label: "Flag operational risk",
    description: "Create cross-team incident for cancellation / complaint signals",
    kind: "risk_flag",
  },
];

let guestExtraTags: Record<string, string[]> = {};
const timelineAppended: Record<string, GuestTimelineEvent[]> = {};

function mergeTags(g: Guest): Guest {
  const extra = guestExtraTags[g.id];
  if (!extra?.length) return g;
  return { ...g, tags: [...new Set([...g.tags, ...extra])] };
}

function allGuestsMerged(): Guest[] {
  return GUEST_SEED.map(mergeTags);
}

function matchesSegment(g: Guest, segment: GuestIntelligenceSegment): boolean {
  if (segment === "all") return true;
  const tagsLower = g.tags.map((t) => t.toLowerCase());
  const has = (s: string) => tagsLower.some((t) => t.includes(s));
  switch (segment) {
    case "vip":
      return g.loyaltyTier === "vip" || has("vip");
    case "high_spend":
      return g.lifetimeValue >= 5000 || has("high spend");
    case "returning":
      return g.totalStays >= 2 || has("returning");
    case "ota_recovery":
      return has("ota recovery");
    case "cancellation_risk":
      return g.riskFlags.includes("cancellation_risk") || has("cancellation risk");
    case "upgrade_likely":
      return g.upsellPotential >= 0.65;
    case "arabic_speaking":
      return g.preferredLanguage.toLowerCase().includes("ar") || has("arabic");
    case "long_stay":
      return has("long stay");
    case "direct_loyalist":
      return g.directBookingRatio >= 0.85 || has("direct booking loyalist");
    case "late_responder":
      return g.riskFlags.includes("late_responder") || has("late responder") || has("late-night");
    case "upsell_target":
      return has("upsell target") || g.upsellPotential >= 0.7;
    default:
      return true;
  }
}

function mapReservationToLinked(r: Reservation): LinkedReservation {
  return {
    id: r.id,
    code: r.code,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    statusLabel: pipelineStageLabel(r.status),
    totalValue: r.totalValue,
    currency: r.currency,
    sourceLabel: sourceLabel(r.source),
  };
}

function mapConversationToLinked(row: {
  id: string;
  channel: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  status: string;
}): LinkedConversation {
  return {
    id: row.id,
    channel: row.channel,
    lastMessageAt: row.lastMessageAt,
    preview: row.lastMessagePreview,
    status: row.status.replace(/_/g, " "),
  };
}

export function getGuestIntelligenceMetrics(): GuestIntelligenceMetrics {
  const guests = allGuestsMerged();
  const returning = guests.filter((g) => g.totalStays >= 2).length;
  const repeatGuestPct = guests.length ? Math.round((returning / guests.length) * 100) : 0;
  const vipGuests = guests.filter((g) => g.loyaltyTier === "vip" || g.tags.some((t) => t.toLowerCase().includes("vip"))).length;
  const otaRecoveryGuests = guests.filter((g) => g.tags.some((t) => t.toLowerCase().includes("ota recovery"))).length;
  const highUpsellPotential = guests.filter((g) => g.upsellPotential >= 0.7).length;
  const atRiskGuests = guests.filter(
    (g) => g.riskFlags.includes("cancellation_risk") || g.riskFlags.includes("payment_friction") || g.currentReservationState === "at_risk"
  ).length;
  return {
    totalGuests: guests.length,
    repeatGuestPct,
    vipGuests,
    otaRecoveryGuests,
    highUpsellPotential,
    atRiskGuests,
    asOfIso: new Date().toISOString(),
  };
}

export function getGuests(segment: GuestIntelligenceSegment = "all"): Guest[] {
  const merged = allGuestsMerged();
  if (segment === "all") {
    return [...merged].sort((a, b) => b.aiScore - a.aiScore);
  }
  return merged.filter((g) => matchesSegment(g, segment)).sort((a, b) => b.lifetimeValue - a.lifetimeValue);
}

export function getGuestById(id: string): Guest | null {
  const base = GUEST_SEED.find((g) => g.id === id);
  if (!base) return null;
  return mergeTags(base);
}

export function getGuestTimeline(guestId: string): GuestTimelineEvent[] {
  const a = TIMELINE_SEED[guestId] ?? [];
  const b = timelineAppended[guestId] ?? [];
  return [...a, ...b].sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
}

export function getGuestInsights(guestId: string): GuestAIInsight | null {
  return INSIGHTS[guestId] ? { ...INSIGHTS[guestId] } : null;
}

export function getGuestRevenueProfile(guestId: string): GuestRevenueProfile | null {
  return REVENUE[guestId] ? { ...REVENUE[guestId] } : null;
}

export function getGuestPreferences(guestId: string): GuestPreference[] {
  return PREFERENCES[guestId] ? PREFERENCES[guestId].map((p) => ({ ...p })) : [];
}

export function getGuestOperationalSummary(guestId: string): GuestOperationalSummary | null {
  return OPERATIONAL_SUMMARY[guestId] ? { ...OPERATIONAL_SUMMARY[guestId] } : null;
}

export function getGuestLinkedReservations(guestId: string): LinkedReservation[] {
  return getReservations()
    .filter((r) => r.guestId === guestId)
    .map(mapReservationToLinked);
}

export function getGuestLinkedConversations(guestId: string): LinkedConversation[] {
  return getConversations(HOTEL_ID)
    .filter((c) => c.guestId === guestId)
    .map(mapConversationToLinked);
}

export function getGuestAIActions(): GuestAIAction[] {
  return AI_ACTIONS.map((a) => ({ ...a }));
}

export function assignGuestTag(guestId: string, tag: string): Guest | null {
  const base = GUEST_SEED.find((g) => g.id === guestId);
  if (!base) return null;
  const trimmed = tag.trim();
  if (!trimmed) return mergeTags(base);
  const existing = guestExtraTags[guestId] ?? [];
  if (!existing.includes(trimmed)) {
    guestExtraTags = { ...guestExtraTags, [guestId]: [...existing, trimmed] };
  }
  return mergeTags(base);
}

export function createGuestNote(guestId: string, body: string): GuestTimelineEvent | null {
  if (!GUEST_SEED.some((g) => g.id === guestId)) return null;
  const trimmed = body.trim();
  if (!trimmed) return null;
  const evt: GuestTimelineEvent = {
    id: `note_${guestId}_${Date.now()}`,
    guestId,
    type: "note",
    description: trimmed,
    createdAt: new Date().toISOString(),
    actorType: "staff",
  };
  const prev = timelineAppended[guestId] ?? [];
  timelineAppended[guestId] = [...prev, evt];
  return evt;
}
