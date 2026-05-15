import type {
  AIReservationInsight,
  CreateReservationFromConversationInput,
  GuestStayProfile,
  PaymentState,
  Reservation,
  ReservationDetailPayload,
  ReservationPipelineStage,
  ReservationTimelineEvent,
} from "@/app/app/_types";

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Base mock link — replace with PSP-hosted URLs when wired. */
const MOCK_PAY_BASE = "https://pay.tugobo.ai/hold/";

const GUEST_PROFILES: Record<string, GuestStayProfile> = {
  g_marina: {
    guestId: "g_marina",
    displayName: "Marina Rossi",
    emailMasked: "ma••••@rossi.it",
    nationality: "IT",
    tags: ["Honeymoon", "Late arrival", "Sea view"],
    returningGuest: true,
    totalStays: 3,
    vipSignal: true,
  },
  g_ahmet: {
    guestId: "g_ahmet",
    displayName: "Ahmet Yılmaz",
    emailMasked: "ah••••@corp.tr",
    nationality: "TR",
    tags: ["Corporate", "Airport transfer", "Same-day"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
  g_james: {
    guestId: "g_james",
    displayName: "James Porter",
    emailMasked: "jp••••@me.com",
    nationality: "GB",
    tags: ["Family 2+2", "High intent", "Interconnecting"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
  g_elena: {
    guestId: "g_elena",
    displayName: "Elena Vogel",
    emailMasked: "el••••@posteo.de",
    nationality: "DE",
    tags: ["Accessibility", "Ground floor"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
  g_kaan: {
    guestId: "g_kaan",
    displayName: "Kaan Demir",
    emailMasked: "ka••••@gmail.com",
    nationality: "TR",
    tags: ["Weekend", "Payment friction"],
    returningGuest: true,
    totalStays: 1,
    vipSignal: false,
  },
  g_sofia: {
    guestId: "g_sofia",
    displayName: "Sofia Andersson",
    emailMasked: "so••••@outlook.se",
    nationality: "SE",
    tags: ["Influencer", "OTA recovery"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
  g_yuki: {
    guestId: "g_yuki",
    displayName: "Yuki Tanaka",
    emailMasked: "yu••••@travel.jp",
    nationality: "JP",
    tags: ["Honeymoon suite", "Spa package"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: true,
  },
  g_ota_anon: {
    guestId: "g_ota_anon",
    displayName: "Booking.com guest",
    emailMasked: "bc••••@guest.booking.com",
    nationality: "NL",
    tags: ["OTA", "Non-prepaid"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
  g_mehtap: {
    guestId: "g_mehtap",
    displayName: "Mehtap Kılıç",
    emailMasked: "me••••@icloud.com",
    nationality: "TR",
    tags: ["Direct incentive", "City tax question"],
    returningGuest: true,
    totalStays: 2,
    vipSignal: false,
  },
  g_olivier: {
    guestId: "g_olivier",
    displayName: "Olivier Dubois",
    emailMasked: "ol••••@orange.fr",
    nationality: "FR",
    tags: ["Late check-in", "Upgrade candidate"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
  g_lisa: {
    guestId: "g_lisa",
    displayName: "Lisa Chen",
    emailMasked: "li••••@corp.sg",
    nationality: "SG",
    tags: ["Checked-in", "Club lounge"],
    returningGuest: true,
    totalStays: 4,
    vipSignal: true,
  },
  g_marcus: {
    guestId: "g_marcus",
    displayName: "Marcus Weber",
    emailMasked: "mw••••@gmx.de",
    nationality: "DE",
    tags: ["Early arrival", "Twin + extra bed"],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  },
};

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "res_ota_recovery_01",
    code: "TGB-2026-51002",
    guestId: "g_sofia",
    guestName: "Sofia Andersson",
    conversationId: "conv_insta_collab",
    conversationSummary: "Media rate + deliverables — AI collecting dates before commercial approval.",
    roomType: "Junior suite · sea view",
    checkIn: isoDaysFromNow(12),
    checkOut: isoDaysFromNow(16),
    totalValue: 0,
    currency: "EUR",
    status: "inquiry",
    paymentStatus: "awaiting_payment",
    source: "instagram",
    assignedTo: null,
    aiState: "ai_qualifying",
    urgency: "low",
  },
  {
    id: "res_ota_anon_bc",
    code: "TGB-BC-77821",
    guestId: "g_ota_anon",
    guestName: "Booking.com guest",
    conversationId: null,
    conversationSummary: "OTA lead — AI outreach: direct book incentive −12% vs BAR if pay link today.",
    roomType: "Standard garden",
    checkIn: isoDaysFromNow(4),
    checkOut: isoDaysFromNow(7),
    totalValue: 890,
    currency: "EUR",
    status: "inquiry",
    paymentStatus: "awaiting_payment",
    source: "booking_com",
    assignedTo: "Revenue desk",
    aiState: "ai_active",
    urgency: "normal",
  },
  {
    id: "res_airport_exec",
    code: "TGB-2026-44190",
    guestId: "g_ahmet",
    guestName: "Ahmet Yılmaz",
    conversationId: "conv_airport_transfer",
    conversationSummary: "VIP AYT pickup 03:15 locked — room block pending deposit for exec city view.",
    roomType: "Executive city view",
    checkIn: isoDaysFromNow(0),
    checkOut: isoDaysFromNow(3),
    totalValue: 1240,
    currency: "EUR",
    status: "qualified",
    paymentStatus: "awaiting_payment",
    source: "whatsapp",
    assignedTo: "Ayşe K.",
    aiState: "human_active",
    urgency: "high",
  },
  {
    id: "res_marcus_early",
    code: "TGB-2026-33011",
    guestId: "g_marcus",
    guestName: "Marcus Weber",
    conversationId: null,
    conversationSummary: "Phone inquiry logged — twin + extra bed, early 10:00 arrival request.",
    roomType: "Deluxe twin + rollaway",
    checkIn: isoDaysFromNow(1),
    checkOut: isoDaysFromNow(5),
    totalValue: 1680,
    currency: "EUR",
    status: "qualified",
    paymentStatus: "awaiting_payment",
    source: "phone",
    assignedTo: null,
    aiState: "ai_quoting",
    urgency: "normal",
  },
  {
    id: "res_family_hold",
    code: "TGB-2026-22088",
    guestId: "g_james",
    guestName: "James Porter",
    conversationId: "conv_family_quote",
    conversationSummary: "Interconnecting guarantee requested in writing — staff drafting confirmation.",
    roomType: "Interconnecting deluxe sea (pair)",
    checkIn: "2026-07-22",
    checkOut: "2026-07-29",
    totalValue: 3940,
    currency: "EUR",
    status: "offer_sent",
    paymentStatus: "awaiting_payment",
    source: "web_chat",
    assignedTo: "Mert D.",
    aiState: "human_active",
    urgency: "high",
  },
  {
    id: "res_mehtap_direct",
    code: "TGB-2026-11903",
    guestId: "g_mehtap",
    guestName: "Mehtap Kılıç",
    conversationId: null,
    conversationSummary: "Email thread — city tax waiver ask; AI quoted net direct rate vs OTA.",
    roomType: "Deluxe partial sea",
    checkIn: isoDaysFromNow(8),
    checkOut: isoDaysFromNow(11),
    totalValue: 2150,
    currency: "EUR",
    status: "offer_sent",
    paymentStatus: "awaiting_payment",
    source: "email",
    assignedTo: null,
    aiState: "ai_quoting",
    urgency: "normal",
  },
  {
    id: "res_88421",
    code: "TGB-2026-88421",
    guestId: "g_marina",
    guestName: "Marina Rossi",
    conversationId: "conv_sea_view_quote",
    conversationSummary: "Honeymoon · deluxe sea 7th floor — deposit link sent; guest asked to hold until tonight.",
    roomType: "Deluxe sea view · 7th floor",
    checkIn: "2026-05-18",
    checkOut: "2026-05-25",
    totalValue: 2180,
    currency: "EUR",
    status: "payment_pending",
    paymentStatus: "partially_paid",
    source: "whatsapp",
    assignedTo: null,
    aiState: "ai_active",
    urgency: "high",
  },
  {
    id: "res_90211",
    code: "TGB-2026-90211",
    guestId: "g_kaan",
    guestName: "Kaan Demir",
    conversationId: "conv_payment_nudge",
    conversationSummary: "3D Secure friction + same-day arrival — escalated to Finance; link retries exhausted.",
    roomType: "Garden standard",
    checkIn: isoDaysFromNow(0),
    checkOut: isoDaysFromNow(2),
    totalValue: 420,
    currency: "EUR",
    status: "payment_pending",
    paymentStatus: "payment_failed",
    source: "whatsapp",
    assignedTo: "Finance desk",
    aiState: "paused",
    urgency: "critical",
  },
  {
    id: "res_olivier_upgrade",
    code: "TGB-2026-66104",
    guestId: "g_olivier",
    guestName: "Olivier Dubois",
    conversationId: null,
    conversationSummary: "Expedia book — AI detected upgrade opportunity to junior suite; payment link refreshed.",
    roomType: "Standard city (OTA)",
    checkIn: isoDaysFromNow(0),
    checkOut: isoDaysFromNow(4),
    totalValue: 1320,
    currency: "EUR",
    status: "payment_pending",
    paymentStatus: "overdue",
    source: "expedia",
    assignedTo: "Night manager",
    aiState: "ai_active",
    urgency: "high",
  },
  {
    id: "res_77102",
    code: "TGB-2026-77102",
    guestId: "g_elena",
    guestName: "Elena Vogel",
    conversationId: "conv_accessible_room",
    conversationSummary: "Accessible twin ground floor — written confirmation sent via Instagram DM.",
    roomType: "Accessible twin · ground floor",
    checkIn: "2026-06-02",
    checkOut: "2026-06-09",
    totalValue: 1640,
    currency: "EUR",
    status: "confirmed",
    paymentStatus: "paid",
    source: "instagram",
    assignedTo: "Selin T.",
    aiState: "human_active",
    urgency: "none",
  },
  {
    id: "res_honeymoon_yuki",
    code: "TGB-2026-55001",
    guestId: "g_yuki",
    guestName: "Yuki Tanaka",
    conversationId: null,
    conversationSummary: "Direct web — honeymoon suite + couples spa; full prepayment captured.",
    roomType: "Honeymoon suite · private terrace",
    checkIn: isoDaysFromNow(6),
    checkOut: isoDaysFromNow(10),
    totalValue: 4890,
    currency: "EUR",
    status: "confirmed",
    paymentStatus: "paid",
    source: "direct_web",
    assignedTo: "Spa desk",
    aiState: "ai_complete",
    urgency: "low",
  },
  {
    id: "res_arrival_floor",
    code: "TGB-2026-40012",
    guestId: "g_marina",
    guestName: "Marina Rossi",
    conversationId: "conv_sea_view_quote",
    conversationSummary: "Parallel hold — alternate dates if payment slips; airport Mercedes add-on offered.",
    roomType: "Deluxe sea view (alt hold)",
    checkIn: isoDaysFromNow(0),
    checkOut: isoDaysFromNow(5),
    totalValue: 1980,
    currency: "EUR",
    status: "checkin_ready",
    paymentStatus: "paid",
    source: "whatsapp",
    assignedTo: "Front desk",
    aiState: "ai_complete",
    urgency: "normal",
  },
  {
    id: "res_same_day_arrival",
    code: "TGB-2026-30090",
    guestId: "g_ahmet",
    guestName: "Ahmet Yılmaz",
    conversationId: "conv_airport_transfer",
    conversationSummary: "Same-day arrival bundle — room + transfer; keys ready, ID scan pending at kiosk.",
    roomType: "Executive city view",
    checkIn: isoDaysFromNow(0),
    checkOut: isoDaysFromNow(2),
    totalValue: 980,
    currency: "EUR",
    status: "checkin_ready",
    paymentStatus: "partially_paid",
    source: "whatsapp",
    assignedTo: "Ayşe K.",
    aiState: "human_active",
    urgency: "high",
  },
  {
    id: "res_checked_lisa",
    code: "TGB-2026-20001",
    guestId: "g_lisa",
    guestName: "Lisa Chen",
    conversationId: null,
    conversationSummary: "Returning corporate — club lounge upsell accepted; AI logged preferences.",
    roomType: "Club grand king",
    checkIn: isoDaysAgo(1),
    checkOut: isoDaysFromNow(3),
    totalValue: 3620,
    currency: "EUR",
    status: "checked_in",
    paymentStatus: "paid",
    source: "direct_web",
    assignedTo: "Club team",
    aiState: "ai_complete",
    urgency: "none",
  },
  {
    id: "res_checked_refund_case",
    code: "TGB-2026-18877",
    guestId: "g_ota_anon",
    guestName: "Expedia guest",
    conversationId: null,
    conversationSummary: "Shortened stay — partial refund processed via OTA messaging bridge.",
    roomType: "Standard twin",
    checkIn: isoDaysAgo(3),
    checkOut: isoDaysFromNow(1),
    totalValue: 410,
    currency: "EUR",
    status: "checked_in",
    paymentStatus: "refunded",
    source: "expedia",
    assignedTo: "Finance desk",
    aiState: "paused",
    urgency: "low",
  },
];

const MOCK_TIMELINES: Record<string, ReservationTimelineEvent[]> = {
  res_88421: [
    {
      id: "tl_88421_1",
      reservationId: "res_88421",
      type: "inquiry_received",
      description: "WhatsApp inquiry — late arrival 23:40 + sea view preference.",
      createdAt: isoHoursAgo(72),
      actorType: "guest",
    },
    {
      id: "tl_88421_2",
      reservationId: "res_88421",
      type: "ai_qualified",
      description: "AI qualified: honeymoon segment, budget aligned with deluxe sea BAR.",
      createdAt: isoHoursAgo(71),
      actorType: "ai",
    },
    {
      id: "tl_88421_3",
      reservationId: "res_88421",
      type: "quote_generated",
      description: "Dynamic quote €2,180 + city tax estimate; 30% deposit rule applied.",
      createdAt: isoHoursAgo(70),
      actorType: "ai",
    },
    {
      id: "tl_88421_4",
      reservationId: "res_88421",
      type: "payment_link_sent",
      description: "Stripe hold link issued — 12h validity, one-time use.",
      createdAt: isoHoursAgo(69),
      actorType: "system",
    },
    {
      id: "tl_88421_5",
      reservationId: "res_88421",
      type: "guest_upgrade_request",
      description: "Guest asked Mercedes van transfer (€65) — AI upsell draft ready.",
      createdAt: isoHoursAgo(8),
      actorType: "guest",
    },
    {
      id: "tl_88421_6",
      reservationId: "res_88421",
      type: "deposit_received",
      description: "Partial capture logged — balance due at check-in.",
      createdAt: isoHoursAgo(2),
      actorType: "payment_gateway",
    },
  ],
  res_90211: [
    {
      id: "tl_90211_1",
      reservationId: "res_90211",
      type: "inquiry_received",
      description: "Weekend stay inquiry on WhatsApp — fast response SLA met.",
      createdAt: isoHoursAgo(48),
      actorType: "guest",
    },
    {
      id: "tl_90211_2",
      reservationId: "res_90211",
      type: "payment_link_sent",
      description: "Deposit link sent — mobile-first checkout.",
      createdAt: isoHoursAgo(36),
      actorType: "system",
    },
    {
      id: "tl_90211_3",
      reservationId: "res_90211",
      type: "payment_failed",
      description: "3D Secure timeout — bank declined soft retry.",
      createdAt: isoHoursAgo(6),
      actorType: "payment_gateway",
    },
    {
      id: "tl_90211_4",
      reservationId: "res_90211",
      type: "ai_escalated",
      description: "AI escalated to Finance — same-day arrival, revenue protection mode.",
      createdAt: isoHoursAgo(1),
      actorType: "ai",
    },
  ],
  res_77102: [
    {
      id: "tl_77102_1",
      reservationId: "res_77102",
      type: "inquiry_received",
      description: "Instagram DM — wheelchair access + lift proximity.",
      createdAt: isoHoursAgo(120),
      actorType: "guest",
    },
    {
      id: "tl_77102_2",
      reservationId: "res_77102",
      type: "human_takeover",
      description: "Selin blocked accessible twin; factual AI mode only thereafter.",
      createdAt: isoHoursAgo(118),
      actorType: "staff",
    },
    {
      id: "tl_77102_3",
      reservationId: "res_77102",
      type: "reservation_confirmed",
      description: "Written confirmation + measurements PDF delivered.",
      createdAt: isoHoursAgo(40),
      actorType: "staff",
    },
    {
      id: "tl_77102_4",
      reservationId: "res_77102",
      type: "deposit_received",
      description: "Full prepayment captured — OTA parity waiver not needed.",
      createdAt: isoHoursAgo(38),
      actorType: "payment_gateway",
    },
  ],
};

function defaultTimeline(r: Reservation): ReservationTimelineEvent[] {
  const existing = MOCK_TIMELINES[r.id];
  if (existing) return existing;
  return [
    {
      id: `${r.id}_tl_1`,
      reservationId: r.id,
      type: "inquiry_received",
      description: `${r.source.replace("_", " ")} touchpoint — lead created in orchestration layer.`,
      createdAt: isoHoursAgo(96),
      actorType: "system",
    },
    {
      id: `${r.id}_tl_2`,
      reservationId: r.id,
      type: "ai_qualified",
      description: "AI scored intent and stay fit against live BAR / restrictions.",
      createdAt: isoHoursAgo(90),
      actorType: "ai",
    },
    {
      id: `${r.id}_tl_3`,
      reservationId: r.id,
      type: "quote_generated",
      description: `Quote issued for ${r.roomType} — total ${r.currency} ${r.totalValue.toLocaleString("en-GB")}.`,
      createdAt: isoHoursAgo(88),
      actorType: "ai",
    },
  ];
}

export function derivePaymentState(r: Reservation): PaymentState {
  const total = r.totalValue;
  let amountPaid = 0;
  if (r.paymentStatus === "paid") amountPaid = total;
  if (r.paymentStatus === "partially_paid") amountPaid = Math.round(total * 0.3);
  if (r.paymentStatus === "refunded") amountPaid = 0;
  if (r.paymentStatus === "payment_failed" || r.paymentStatus === "overdue") amountPaid = 0;
  const remaining = Math.max(0, total - amountPaid);
  const hasLink =
    r.paymentStatus === "awaiting_payment" ||
    r.paymentStatus === "partially_paid" ||
    r.paymentStatus === "payment_failed" ||
    r.paymentStatus === "overdue";
  return {
    status: r.paymentStatus,
    amountPaid,
    remainingBalance: remaining,
    paymentLink: hasLink && total > 0 ? `${MOCK_PAY_BASE}${r.code}` : null,
    expiresAt:
      hasLink && total > 0 ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
  };
}

function aiInsightFor(r: Reservation): AIReservationInsight {
  const flags: string[] = [];
  if (r.urgency === "critical") flags.push("Same-day payment failure");
  if (r.urgency === "high") flags.push("Delayed response risk");
  if (r.source === "booking_com" || r.source === "expedia") flags.push("OTA commission pressure");
  if (r.roomType.toLowerCase().includes("honeymoon"))
    flags.push("VIP guest signal");
  if (r.paymentStatus === "overdue") flags.push("Payment friction");
  if (r.status === "offer_sent") flags.push("Conversion window narrowing");

  let cancellationRisk: AIReservationInsight["cancellationRisk"] = "low";
  if (r.urgency === "critical" || r.paymentStatus === "payment_failed") cancellationRisk = "high";
  else if (r.urgency === "high" || r.aiState === "paused") cancellationRisk = "medium";

  let upsell: string | null = null;
  if (r.id === "res_88421") upsell = "Mercedes airport van €65 — tight FCO arrival";
  else if (r.id === "res_olivier_upgrade") upsell = "Junior suite + breakfast — +€140 net";
  else if (r.id === "res_honeymoon_yuki") upsell = "Private sunset dinner on terrace";
  else if (r.status === "checkin_ready") upsell = "Express check-in packet €25";

  const confidence =
    r.aiState === "ai_complete"
      ? 0.92
      : r.aiState === "paused"
        ? 0.45
        : r.aiState === "human_active"
          ? 0.72
          : 0.81;

  return {
    confidence,
    cancellationRisk,
    upsellOpportunity: upsell,
    escalationSuggested: r.urgency === "critical" || r.aiState === "paused",
    summary:
      r.conversationSummary ||
      "No linked thread summary — reservation sourced from channel or manual entry.",
    riskFlags: flags.length ? flags : ["No acute model flags"],
  };
}

function upsellsFor(r: Reservation): string[] {
  const base: string[] = [];
  const ai = aiInsightFor(r);
  if (ai.upsellOpportunity) base.push(ai.upsellOpportunity);
  if (r.roomType.toLowerCase().includes("standard")) base.push("Sea view upgrade ladder — AI priced");
  if (r.source === "booking_com") base.push("Direct rebook incentive −12% if pay today");
  if (r.guestId === "g_james") base.push("Kids club week pass + babysitter intro");
  return base.slice(0, 4);
}

export function getReservations(): Reservation[] {
  return MOCK_RESERVATIONS.map((x) => ({ ...x }));
}

export function getReservationById(id: string): ReservationDetailPayload | null {
  const r = MOCK_RESERVATIONS.find((x) => x.id === id);
  if (!r) return null;
  const guest = GUEST_PROFILES[r.guestId] ?? {
    guestId: r.guestId,
    displayName: r.guestName,
    emailMasked: "••••@redacted",
    nationality: "—",
    tags: [],
    returningGuest: false,
    totalStays: 0,
    vipSignal: false,
  };
  return {
    reservation: { ...r },
    guest,
    timeline: defaultTimeline(r).map((e) => ({ ...e })),
    payment: derivePaymentState(r),
    aiInsight: aiInsightFor(r),
    upsellOpportunities: upsellsFor(r),
  };
}

export function updateReservationStage(
  reservations: Reservation[],
  id: string,
  stage: ReservationPipelineStage
): Reservation[] {
  return reservations.map((x) => (x.id === id ? { ...x, status: stage } : x));
}

export function sendPaymentLink(reservation: Reservation): Reservation {
  return {
    ...reservation,
    paymentStatus:
      reservation.paymentStatus === "payment_failed"
        ? "awaiting_payment"
        : reservation.paymentStatus,
  };
}

export function assignReservation(
  reservations: Reservation[],
  id: string,
  staffDisplayName: string | null
): Reservation[] {
  return reservations.map((x) => (x.id === id ? { ...x, assignedTo: staffDisplayName } : x));
}

let draftCounter = 90000;

export function createReservationFromConversation(
  input: CreateReservationFromConversationInput
): Reservation {
  draftCounter += 1;
  const code = `TGB-DRAFT-${draftCounter}`;
  return {
    id: `res_draft_${draftCounter}`,
    code,
    guestId: `g_conv_${input.conversationId}`,
    guestName: input.guestName,
    conversationId: input.conversationId,
    conversationSummary: `Created from conversation ${input.conversationId} — awaiting ops review.`,
    roomType: input.roomType,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    totalValue: input.totalValue,
    currency: input.currency ?? "EUR",
    status: "qualified",
    paymentStatus: "awaiting_payment",
    source: input.source,
    assignedTo: null,
    aiState: "ai_quoting",
    urgency: "normal",
  };
}

export function getReservationOrchestrationMetrics(reservations: Reservation[]): {
  pipelineTotal: number;
  paymentAttention: number;
  paymentAttentionValue: number;
  aiActiveCount: number;
  criticalUrgency: number;
  weightedRevenue: number;
} {
  const paymentAttentionStatuses: Reservation["paymentStatus"][] = [
    "awaiting_payment",
    "payment_failed",
    "overdue",
    "partially_paid",
  ];
  let paymentAttention = 0;
  let paymentAttentionValue = 0;
  let aiActiveCount = 0;
  let criticalUrgency = 0;
  let weightedRevenue = 0;

  for (const r of reservations) {
    if (paymentAttentionStatuses.includes(r.paymentStatus)) {
      paymentAttention += 1;
      paymentAttentionValue += r.totalValue;
    }
    if (r.aiState === "ai_active" || r.aiState === "ai_qualifying" || r.aiState === "ai_quoting") {
      aiActiveCount += 1;
    }
    if (r.urgency === "critical") criticalUrgency += 1;
    if (
      r.status !== "inquiry" &&
      r.status !== "checked_in" &&
      r.paymentStatus !== "refunded"
    ) {
      weightedRevenue += r.totalValue;
    }
  }

  return {
    pipelineTotal: reservations.length,
    paymentAttention,
    paymentAttentionValue,
    aiActiveCount,
    criticalUrgency,
    weightedRevenue,
  };
}
