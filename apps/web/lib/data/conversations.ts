import type {
  AIInsight,
  AssignConversationInput,
  Conversation,
  ConversationSummary,
  EscalateConversationInput,
  Guest,
  Message,
  ReservationContext,
  SendMessageInput,
} from "@/lib/types/conversations";

const HOTEL_ID = "org_tugobo_resort";

function iso(minsAgo: number): string {
  return new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
}

const guests: Record<string, Guest> = {
  g_marina: {
    id: "g_marina",
    name: "Marina Rossi",
    language: "it / en",
    nationality: "IT",
    tags: ["Sea view", "Late arrival", "Honeymoon"],
    returningGuest: true,
    totalStays: 3,
    preferredRoom: "Deluxe sea view",
  },
  g_ahmet: {
    id: "g_ahmet",
    name: "Ahmet Yılmaz",
    language: "tr",
    nationality: "TR",
    tags: ["Corporate", "Airport transfer"],
    returningGuest: false,
    totalStays: 0,
    preferredRoom: null,
  },
  g_james: {
    id: "g_james",
    name: "James Porter",
    language: "en",
    nationality: "GB",
    tags: ["Family 2+2", "High intent"],
    returningGuest: false,
    totalStays: 0,
    preferredRoom: "Connecting rooms",
  },
  g_elena: {
    id: "g_elena",
    name: "Elena Vogel",
    language: "de / en",
    nationality: "DE",
    tags: ["Accessibility", "Ground floor"],
    returningGuest: false,
    totalStays: 0,
    preferredRoom: "Accessible twin",
  },
  g_kaan: {
    id: "g_kaan",
    name: "Kaan Demir",
    language: "tr",
    nationality: "TR",
    tags: ["Local weekend", "Payment friction"],
    returningGuest: true,
    totalStays: 1,
    preferredRoom: "Standard garden",
  },
  g_sofia: {
    id: "g_sofia",
    name: "Sofia Andersson",
    language: "sv / en",
    nationality: "SE",
    tags: ["Influencer risk", "Instagram DM"],
    returningGuest: false,
    totalStays: 0,
    preferredRoom: null,
  },
};

function res(partial: Partial<ReservationContext> & Pick<ReservationContext, "checkIn" | "checkOut" | "roomType" | "paymentStatus" | "bookingValueEur" | "sourceChannel">): ReservationContext {
  return {
    id: partial.id ?? null,
    checkIn: partial.checkIn,
    checkOut: partial.checkOut,
    roomType: partial.roomType,
    paymentStatus: partial.paymentStatus,
    bookingValueEur: partial.bookingValueEur,
    sourceChannel: partial.sourceChannel,
  };
}

function insight(partial: AIInsight): AIInsight {
  return partial;
}

/**
 * Authoritative stub store — replace with Supabase queries + mutations.
 * In-memory updates support mocked actions during a single Node process (dev).
 */
let conversationStore: Conversation[] = [
  {
    id: "conv_sea_view_quote",
    hotelId: HOTEL_ID,
    guestId: guests.g_marina.id,
    channel: "whatsapp",
    status: "awaiting_payment",
    aiState: "ai_active",
    assignedTo: null,
    unreadCount: 2,
    priority: "high",
    reservationId: "res_88421",
    lastMessageAt: iso(6),
    lastMessagePreview: "Marina: Can you hold the sea view until I pay tonight?",
    escalationFlag: true,
    guest: guests.g_marina,
    messages: [
      {
        id: "m1",
        conversationId: "conv_sea_view_quote",
        authorType: "guest",
        content:
          "Buonasera — we arrive 23:40 from Rome. Is late check-in ok? And we really want sea view, higher floor if possible.",
        createdAt: iso(120),
      },
      {
        id: "m2",
        conversationId: "conv_sea_view_quote",
        authorType: "ai",
        content:
          "Merhaba Marina, late arrival is fine — front desk is 24h. I can quote Deluxe sea view, 7th floor, 18–25 May. Shall I send a secure deposit link?",
        createdAt: iso(118),
      },
      {
        id: "m3",
        conversationId: "conv_sea_view_quote",
        authorType: "guest",
        content: "Yes please. What is total in EUR with city tax?",
        createdAt: iso(90),
      },
      {
        id: "m4",
        conversationId: "conv_sea_view_quote",
        authorType: "ai",
        content:
          "Total stay €2,180 + approx. €42 city tax. Deposit 30% (€654) secures the room for 12 hours. Link valid once.",
        createdAt: iso(88),
      },
      {
        id: "m5",
        conversationId: "conv_sea_view_quote",
        authorType: "guest",
        content: "Can you hold the sea view until I pay tonight? I am on a flight now.",
        createdAt: iso(6),
      },
    ],
    aiInsight: insight({
      confidence: 0.84,
      sentiment: "positive",
      escalationSuggested: true,
      upsellOpportunity: "Airport Mercedes van (€65) — tight arrival window",
      summary:
        "Returning guest, strong fit for deluxe sea view. Payment timing risk; recommend short hold + deposit link resend if no payment in 3h.",
    }),
    reservation: res({
      id: "res_88421",
      checkIn: "2026-05-18",
      checkOut: "2026-05-25",
      roomType: "Deluxe sea view · 7th floor",
      paymentStatus: "deposit",
      bookingValueEur: 2180,
      sourceChannel: "whatsapp",
    }),
  },
  {
    id: "conv_airport_transfer",
    hotelId: HOTEL_ID,
    guestId: guests.g_ahmet.id,
    channel: "whatsapp",
    status: "ai_handling",
    aiState: "ai_active",
    assignedTo: "Ayşe K.",
    unreadCount: 0,
    priority: "normal",
    reservationId: null,
    lastMessageAt: iso(22),
    lastMessagePreview: "AI: VIP van 03:15 pickup confirmed — driver WhatsApp shared.",
    escalationFlag: false,
    guest: guests.g_ahmet,
    messages: [
      {
        id: "m10",
        conversationId: "conv_airport_transfer",
        authorType: "guest",
        content:
          "Yarın sabah 03:15'te AYT'den çıkıyorum. VIP transfer hâlâ mümkün mü? Uçuş TK2408.",
        createdAt: iso(45),
      },
      {
        id: "m11",
        conversationId: "conv_airport_transfer",
        authorType: "ai",
        content:
          "Tabii Ahmet Bey. 03:15 AYT karşılama + Mercedes Vito, plaka ve sürücü WhatsApp'ı check-in öncesi paylaşılır. Kişi başı içecek dahil.",
        createdAt: iso(44),
      },
      {
        id: "m12",
        conversationId: "conv_airport_transfer",
        authorType: "staff",
        content: "Ben Ayşe — sürücü Mehmet, +90 5xx xxx xx xx. Kapı D7 önünde olacak.",
        createdAt: iso(25),
      },
      {
        id: "m13",
        conversationId: "conv_airport_transfer",
        authorType: "ai",
        content: "VIP van 03:15 pickup confirmed — driver WhatsApp shared. Safe travels.",
        createdAt: iso(22),
      },
    ],
    aiInsight: insight({
      confidence: 0.91,
      sentiment: "neutral",
      escalationSuggested: false,
      upsellOpportunity: "Express check-in packet on arrival (€25)",
      summary:
        "Corporate guest, tight window. Ops already assigned driver; AI can handle confirmation copy unless flight changes.",
    }),
    reservation: res({
      id: null,
      checkIn: "2026-05-16",
      checkOut: "2026-05-19",
      roomType: "Executive city view (tentative)",
      paymentStatus: "unpaid",
      bookingValueEur: 0,
      sourceChannel: "whatsapp",
    }),
  },
  {
    id: "conv_family_quote",
    hotelId: HOTEL_ID,
    guestId: guests.g_james.id,
    channel: "web_chat",
    status: "reservation_pending",
    aiState: "human_active",
    assignedTo: "Mert D.",
    unreadCount: 1,
    priority: "high",
    reservationId: null,
    lastMessageAt: iso(14),
    lastMessagePreview: "James: If interconnecting isn't guaranteed we will book elsewhere.",
    escalationFlag: true,
    guest: guests.g_james,
    messages: [
      {
        id: "m20",
        conversationId: "conv_family_quote",
        authorType: "guest",
        content:
          "Hi — family of 4 (6 and 9). Do you have interconnecting rooms for 22–29 July? Sea view non-negotiable.",
        createdAt: iso(55),
      },
      {
        id: "m21",
        conversationId: "conv_family_quote",
        authorType: "ai",
        content:
          "Hello James. We can offer Deluxe interconnecting pair on floors 5–8 with sea view. I’ll have reservations confirm within 15 minutes.",
        createdAt: iso(54),
      },
      {
        id: "m22",
        conversationId: "conv_family_quote",
        authorType: "staff",
        content:
          "Mert here — interconnect confirmed on 6th floor. Total €3,940 half board. I can lock 2h if you want.",
        createdAt: iso(30),
      },
      {
        id: "m23",
        conversationId: "conv_family_quote",
        authorType: "guest",
        content: "If interconnecting isn't guaranteed we will book elsewhere. Need it in writing.",
        createdAt: iso(14),
      },
    ],
    aiInsight: insight({
      confidence: 0.62,
      sentiment: "negative",
      escalationSuggested: true,
      upsellOpportunity: "Kids club pack + babysitter intro",
      summary:
        "High-value family, trust-sensitive. Human already engaged — AI should stay quiet until written guarantee sent.",
    }),
    reservation: res({
      id: null,
      checkIn: "2026-07-22",
      checkOut: "2026-07-29",
      roomType: "Interconnecting deluxe sea (hold)",
      paymentStatus: "unpaid",
      bookingValueEur: 3940,
      sourceChannel: "web_chat",
    }),
  },
  {
    id: "conv_accessible_room",
    hotelId: HOTEL_ID,
    guestId: guests.g_elena.id,
    channel: "instagram",
    status: "human_takeover",
    aiState: "human_active",
    assignedTo: "Selin T.",
    unreadCount: 0,
    priority: "normal",
    reservationId: "res_77102",
    lastMessageAt: iso(40),
    lastMessagePreview: "Selin: Ground floor accessible twin blocked — DM email for written confirm.",
    escalationFlag: false,
    guest: guests.g_elena,
    messages: [
      {
        id: "m30",
        conversationId: "conv_accessible_room",
        authorType: "guest",
        content:
          "Hi from Berlin — I use a wheelchair (standard width). Is the accessible twin really next to the lift?",
        createdAt: iso(70),
      },
      {
        id: "m31",
        conversationId: "conv_accessible_room",
        authorType: "ai",
        content:
          "Hello Elena. Our accessible twins are within 8m of lifts with ramp access. I’m flagging our rooms controller to double-check your dates.",
        createdAt: iso(68),
      },
      {
        id: "m32",
        conversationId: "conv_accessible_room",
        authorType: "staff",
        content:
          "Selin — ground floor accessible twin blocked for your stay. Please DM email for written confirmation + door measurements PDF.",
        createdAt: iso(40),
      },
    ],
    aiInsight: insight({
      confidence: 0.77,
      sentiment: "positive",
      escalationSuggested: false,
      upsellOpportunity: "Spa wheelchair slot pre-book",
      summary:
        "Accessibility-sensitive thread — human ownership correct. AI limited to factual room logistics only.",
    }),
    reservation: res({
      id: "res_77102",
      checkIn: "2026-06-02",
      checkOut: "2026-06-09",
      roomType: "Accessible twin · ground floor",
      paymentStatus: "paid",
      bookingValueEur: 1640,
      sourceChannel: "instagram",
    }),
  },
  {
    id: "conv_payment_nudge",
    hotelId: HOTEL_ID,
    guestId: guests.g_kaan.id,
    channel: "whatsapp",
    status: "escalated",
    aiState: "paused",
    assignedTo: "Finance desk",
    unreadCount: 4,
    priority: "urgent",
    reservationId: "res_90211",
    lastMessageAt: iso(3),
    lastMessagePreview: "Kaan: Link açılmıyor, 3 kez denedim. Yarın giriş var.",
    escalationFlag: true,
    guest: guests.g_kaan,
    messages: [
      {
        id: "m40",
        conversationId: "conv_payment_nudge",
        authorType: "ai",
        content:
          "Merhaba Kaan Bey — hafta sonu konaklamanız için ön ödeme linki: geçerlilik 24 saat. Yardımcı olmamı ister misiniz?",
        createdAt: iso(180),
      },
      {
        id: "m41",
        conversationId: "conv_payment_nudge",
        authorType: "guest",
        content: "Link geldi ama 3D Secure'de takılıyor. Alternatif ödeme var mı?",
        createdAt: iso(45),
      },
      {
        id: "m42",
        conversationId: "conv_payment_nudge",
        authorType: "ai",
        content:
          "Mobil bankacılık ile QR veya property’de fiziksel POS ile ön provizyon alabiliriz. Hangisini tercih edersiniz?",
        createdAt: iso(44),
      },
      {
        id: "m43",
        conversationId: "conv_payment_nudge",
        authorType: "guest",
        content: "Link açılmıyor, 3 kez denedim. Yarın giriş var.",
        createdAt: iso(3),
      },
    ],
    aiInsight: insight({
      confidence: 0.48,
      sentiment: "negative",
      escalationSuggested: true,
      upsellOpportunity: null,
      summary:
        "Payment failure + same-day arrival — revenue at risk. Recommend manual POS / IBAN + waive city tax gesture if needed.",
    }),
    reservation: res({
      id: "res_90211",
      checkIn: "2026-05-16",
      checkOut: "2026-05-18",
      roomType: "Garden standard",
      paymentStatus: "overdue",
      bookingValueEur: 420,
      sourceChannel: "whatsapp",
    }),
  },
  {
    id: "conv_insta_collab",
    hotelId: HOTEL_ID,
    guestId: guests.g_sofia.id,
    channel: "instagram",
    status: "ai_handling",
    aiState: "ai_active",
    assignedTo: null,
    unreadCount: 1,
    priority: "low",
    reservationId: null,
    lastMessageAt: iso(8),
    lastMessagePreview: "Sofia: Media rate for 2 stories + reel?",
    escalationFlag: false,
    guest: guests.g_sofia,
    messages: [
      {
        id: "m50",
        conversationId: "conv_insta_collab",
        authorType: "guest",
        content: "Hej! Media rate for 2 stories + reel? 45k followers travel niche.",
        createdAt: iso(20),
      },
      {
        id: "m51",
        conversationId: "conv_insta_collab",
        authorType: "ai",
        content:
          "Hi Sofia — thanks for reaching out. Media stays are approved by marketing. May I have your dates + deliverables checklist?",
        createdAt: iso(19),
      },
      {
        id: "m52",
        conversationId: "conv_insta_collab",
        authorType: "guest",
        content: "June 5–8, reel + 2 stories + 1 carousel. Sea view required.",
        createdAt: iso(8),
      },
    ],
    aiInsight: insight({
      confidence: 0.72,
      sentiment: "neutral",
      escalationSuggested: false,
      upsellOpportunity: "F&B credit instead of rate discount",
      summary:
        "Influencer inbound — route to marketing workflow. AI should collect deliverables, not confirm comp.",
    }),
    reservation: res({
      id: null,
      checkIn: "2026-06-05",
      checkOut: "2026-06-08",
      roomType: "Media stay (pending approval)",
      paymentStatus: "unpaid",
      bookingValueEur: 0,
      sourceChannel: "instagram",
    }),
  },
];

function toSummary(c: Conversation): ConversationSummary {
  return {
    id: c.id,
    hotelId: c.hotelId,
    guestId: c.guestId,
    guestName: c.guest.name,
    channel: c.channel,
    status: c.status,
    aiState: c.aiState,
    assignedTo: c.assignedTo,
    unreadCount: c.unreadCount,
    priority: c.priority,
    reservationId: c.reservationId,
    lastMessageAt: c.lastMessageAt,
    lastMessagePreview: c.lastMessagePreview,
    escalationFlag: c.escalationFlag,
  };
}

/** List inbox rows — future: `from(conversations).where(eq(hotelId, …))` */
export function getConversations(hotelId: string = HOTEL_ID): ConversationSummary[] {
  return conversationStore
    .filter((c) => c.hotelId === hotelId)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    .map(toSummary);
}

/** Thread + sidebar payload — future: join guest, messages, insights. */
export function getConversationById(
  id: string,
  hotelId: string = HOTEL_ID
): Conversation | null {
  const c = conversationStore.find((row) => row.id === id && row.hotelId === hotelId);
  return c ? structuredClone(c) : null;
}

function bumpLastMessage(conv: Conversation, preview: string): void {
  conv.lastMessageAt = new Date().toISOString();
  conv.lastMessagePreview = preview;
}

/** Stub send — persists in dev memory only; replace with insert + realtime. */
export async function sendMessage(input: SendMessageInput): Promise<Message> {
  const conv = conversationStore.find((c) => c.id === input.conversationId);
  if (!conv) {
    throw new Error("Conversation not found");
  }
  const message: Message = {
    id: `msg_${Date.now()}`,
    conversationId: input.conversationId,
    authorType: input.authorType,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  conv.messages.push(message);
  const prefix =
    input.authorType === "guest" ? `${conv.guest.name.split(" ")[0]}: ` : input.authorType === "ai" ? "AI: " : "Staff: ";
  bumpLastMessage(conv, `${prefix}${input.content.slice(0, 80)}${input.content.length > 80 ? "…" : ""}`);
  if (input.authorType === "guest") {
    conv.unreadCount += 1;
  }
  return message;
}

export async function assignConversation(input: AssignConversationInput): Promise<Conversation | null> {
  const conv = conversationStore.find((c) => c.id === input.conversationId);
  if (!conv) return null;
  conv.assignedTo = input.staffName;
  conv.status = input.staffName ? "human_takeover" : "ai_handling";
  conv.aiState = input.staffName ? "human_active" : "ai_active";
  return structuredClone(conv);
}

export async function escalateConversation(input: EscalateConversationInput): Promise<Conversation | null> {
  const conv = conversationStore.find((c) => c.id === input.conversationId);
  if (!conv) return null;
  conv.status = "escalated";
  conv.escalationFlag = true;
  conv.aiInsight = {
    ...conv.aiInsight,
    escalationSuggested: true,
    summary: `${conv.aiInsight.summary} (Escalation noted: ${input.reason})`,
  };
  return structuredClone(conv);
}

export async function toggleAIHandling(conversationId: string): Promise<Conversation | null> {
  const conv = conversationStore.find((c) => c.id === conversationId);
  if (!conv) return null;
  if (conv.aiState === "ai_active") {
    conv.aiState = "paused";
    conv.status = "human_takeover";
  } else {
    conv.aiState = "ai_active";
    conv.status = "ai_handling";
  }
  return structuredClone(conv);
}
